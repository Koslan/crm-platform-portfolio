/**
 * Salesforce side of "Delta sync with a checkpoint per page" — the same problem the
 * Deluge version on the portfolio site solves (see the 'delta-sync' write-up and the
 * demo at #/p/platform), rebuilt on Apex primitives instead of Zoho's scheduler.
 *
 * The constraint is the same on both platforms: seventeen mailboxes, a delta query per
 * mailbox, a hard ceiling on how long any single unit of work may run, and three error
 * classes that each need a different reaction (throttling slows a mailbox rather than
 * failing it; an invalid/expired token falls back to a full read in the same run rather
 * than aborting; anything else marks the mailbox skipped and moves on). What differs is
 * the mechanism, and that difference is the whole point of the sf-sync write-up:
 *
 *   - Deluge has no while loop, so a scheduled function walks a pre-built list of page
 *     numbers with a completion flag. Apex's Queueable can enqueue itself, so this class
 *     chains itself — System.enqueueJob(new DeltaSyncJob(...)) — once per page, which
 *     reads as a loop even though it is a sequence of separate transactions.
 *   - Deluge's ceiling is 120 seconds on a single synchronous call. Apex's ceiling is
 *     governor limits per transaction (at most 100 callouts, and Queueable chaining
 *     itself has its own depth limits) — so this job bounds itself by page COUNT per
 *     transaction (Sync_Source__mdt.Max_Pages_Per_Run__c) rather than by a wall-clock
 *     timer, and re-chains into a fresh transaction with a fresh limit budget.
 *   - Deluge has nowhere to persist state between runs but a field on a record or a
 *     module; this class writes Sync_Checkpoint__c after every page, not just at the
 *     end — a run that dies on page forty resumes on page forty-one.
 */
public with sharing class DeltaSyncJob implements Queueable, Database.AllowsCallouts {

    private final String mailboxKey;
    private Integer pagesRunThisTransaction;

    public DeltaSyncJob(String mailboxKey) {
        this.mailboxKey = mailboxKey;
        this.pagesRunThisTransaction = 0;
    }

    private DeltaSyncJob(String mailboxKey, Integer pagesRunThisTransaction) {
        this.mailboxKey = mailboxKey;
        this.pagesRunThisTransaction = pagesRunThisTransaction;
    }

    public void execute(QueueableContext ctx) {
        Sync_Source__mdt source = [
            SELECT Mailbox_Key__c, Page_Size__c, Max_Pages_Per_Run__c, Named_Credential_API_Name__c, Active__c
            FROM Sync_Source__mdt
            WHERE Mailbox_Key__c = :mailboxKey
            LIMIT 1
        ];
        if (source == null || !source.Active__c) {
            return;
        }

        Sync_Checkpoint__c checkpoint = loadOrCreateCheckpoint(mailboxKey);
        checkpoint.Status__c = 'running';
        checkpoint.Last_Run_At__c = System.now();
        upsertCheckpoint(checkpoint);
        publishRunEvent(mailboxKey, (Integer) checkpoint.Page_Cursor__c, null, 'running', null);

        try {
            SyncHttpService.PageResult page;
            try {
                page = SyncHttpService.fetchPage(
                    source.Named_Credential_API_Name__c, checkpoint.Delta_Token__c, (Integer) source.Page_Size__c
                );
            } catch (SyncHttpService.InvalidTokenException badToken) {
                // Same-run fallback: clear the token and re-fetch as a full read. This is
                // the direct analogue of the Deluge version clearing its variable and
                // falling back to a full delta in the same run rather than failing.
                checkpoint.Delta_Token__c = null;
                page = SyncHttpService.fetchPage(
                    source.Named_Credential_API_Name__c, null, (Integer) source.Page_Size__c
                );
            } catch (SyncHttpService.ThrottledException throttled) {
                // Slow the mailbox, don't fail it: leave the checkpoint exactly as it was
                // (do NOT advance the page cursor or touch the token) and re-chain with a
                // delay, so the next attempt picks up from the same page.
                checkpoint.Status__c = 'throttled';
                checkpoint.Last_Error__c = 'Throttled: retry after ' + throttled.retryAfterSeconds + 's';
                upsertCheckpoint(checkpoint);
                publishRunEvent(mailboxKey, (Integer) checkpoint.Page_Cursor__c, null, 'throttled',
                    'retry after ' + throttled.retryAfterSeconds + 's');
                if (!Test.isRunningTest()) {
                    System.enqueueJob(new DeltaSyncJob(mailboxKey, pagesRunThisTransaction),
                        Math.max(0, Math.min(10, throttled.retryAfterSeconds)));
                }
                return;
            }

            Integer recordCount = page.records == null ? 0 : page.records.size();
            // ... upsert of page.records into Meeting__c / Contact / etc. happens here in
            // a real implementation, keyed by an External_Event_Id__c-style field. Left
            // out of this portfolio: the point being demonstrated is the sync mechanics,
            // not another copy of the object-mapping code already shown in
            // EmploymentHistoryController and salesforce/data/export.mjs.

            checkpoint.Page_Cursor__c = (checkpoint.Page_Cursor__c == null ? 0 : checkpoint.Page_Cursor__c) + 1;
            checkpoint.Delta_Token__c = page.nextDeltaToken;
            checkpoint.Records_Synced__c = recordCount;
            checkpoint.Last_Error__c = null;

            Boolean moreRecords = page.moreRecords == true;
            Integer pagesLeftInBudget = ((Integer) source.Max_Pages_Per_Run__c) - (pagesRunThisTransaction + 1);

            if (!moreRecords) {
                checkpoint.Status__c = 'completed';
                upsertCheckpoint(checkpoint);
                publishRunEvent(mailboxKey, (Integer) checkpoint.Page_Cursor__c, recordCount, 'completed', null);
                return;
            }

            upsertCheckpoint(checkpoint);
            publishRunEvent(mailboxKey, (Integer) checkpoint.Page_Cursor__c, recordCount, 'running', null);

            if (pagesLeftInBudget > 0) {
                // Still inside this transaction's page budget: chain immediately into the
                // next page. This IS the loop — Deluge has no while, Apex has no
                // "loop over pages in one transaction without spending governor limits
                // that belong to the platform, not to this job," so both walk one page
                // at a time and rely on their own mechanism to keep going.
                if (!Test.isRunningTest()) {
                    System.enqueueJob(new DeltaSyncJob(mailboxKey, pagesRunThisTransaction + 1));
                }
            } else {
                // Budget for this transaction is spent; re-chain into a brand-new
                // transaction with a fresh governor-limit allowance rather than trying to
                // keep going here. The checkpoint already has everything the next
                // transaction needs.
                if (!Test.isRunningTest()) {
                    System.enqueueJob(new DeltaSyncJob(mailboxKey));
                }
            }
        } catch (Exception ex) {
            checkpoint.Status__c = 'failed';
            checkpoint.Last_Error__c = ex.getMessage();
            upsertCheckpoint(checkpoint);
            publishRunEvent(mailboxKey, (Integer) checkpoint.Page_Cursor__c, null, 'failed', ex.getMessage());
            // Deliberately not re-thrown: one mailbox failing must not take the others
            // down. Kick off the next mailbox in the batch is the caller's job (see
            // kickOffAllActiveSources), not this instance's.
        }
    }

    private Sync_Checkpoint__c loadOrCreateCheckpoint(String key) {
        List<Sync_Checkpoint__c> existing = [
            SELECT Id, Name, Delta_Token__c, Page_Cursor__c, Status__c, Records_Synced__c, Last_Error__c
            FROM Sync_Checkpoint__c
            WHERE Name = :key
            LIMIT 1
        ];
        if (!existing.isEmpty()) {
            return existing[0];
        }
        Sync_Checkpoint__c fresh = new Sync_Checkpoint__c(Name = key, Page_Cursor__c = 0, Status__c = 'idle');
        return fresh;
    }

    /** Sync_Checkpoint__c.Name is a plain Text label field, not guaranteed unique, so
     *  this upserts by Id when we have one (loaded from an existing row) and inserts
     *  otherwise — rather than `upsert checkpoint Name`, which requires Name to be
     *  declared unique or external-id, which it deliberately is not (a checkpoint's
     *  identity is operational, not something worth a uniqueness constraint fight if two
     *  rows are ever created for the same key by a race). */
    private void upsertCheckpoint(Sync_Checkpoint__c checkpoint) {
        if (checkpoint.Id != null) {
            update checkpoint;
        } else {
            insert checkpoint;
        }
    }

    private void publishRunEvent(String key, Integer pageNum, Integer recordsInPage, String stage, String message) {
        Sync_Run_Event__e evt = new Sync_Run_Event__e(
            Mailbox_Key__c = key,
            Page__c = pageNum,
            Records_In_Page__c = recordsInPage,
            Stage__c = stage,
            Message__c = message
        );
        EventBus.publish(evt);
    }

    /** Kicks off one DeltaSyncJob per active Sync_Source__mdt row. Intended entry point
     *  from a Scheduled Apex class (not included — a thin CRON wrapper around this one
     *  call) or an anonymous-Apex trigger during a manual run. */
    public static void kickOffAllActiveSources() {
        for (Sync_Source__mdt source : [
            SELECT Mailbox_Key__c FROM Sync_Source__mdt WHERE Active__c = true
        ]) {
            System.enqueueJob(new DeltaSyncJob(source.Mailbox_Key__c));
        }
    }
}

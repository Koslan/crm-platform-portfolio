/**
 * Controller behind the employmentHistory LWC — the Salesforce port of the Zoho
 * "Employment history" widget (CRMWidgets2.History in src/widgets2.js).
 *
 * The whole point of the widget is one invariant: at most one Employment__c row per
 * Contact has Is_Main__c = true, and the row the Contact is "read as working at" is
 * whichever one that is. A checkbox that behaves like a radio button is easy to get
 * wrong. The naive version writes the new main row first; if the second write (clearing
 * the old rows) then fails, two rows are left claiming to be main. This controller does
 * it in the order that keeps the record honest under a failure: clear every other main
 * flag first, and only once that succeeds, set the new one. See setMainEmployment below —
 * the two DML statements are deliberately not combined into one updates() call, and the
 * order between them is the entire point of this class.
 */
public with sharing class EmploymentHistoryController {

    /** One row of Employment__c, shaped for the LWC. Field names mirror the Zoho
     *  Employment module columns 1:1 so the write-up's comparison table lines up. */
    public class EmploymentRow {
        @AuraEnabled public Id id;
        @AuraEnabled public String company;
        @AuraEnabled public String title;
        @AuraEnabled public String seniority;
        @AuraEnabled public String buyerRole;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public Boolean isMain;
        @AuraEnabled public String status;
        @AuraEnabled public String email;
        @AuraEnabled public String comment;

        public EmploymentRow(Employment__c e) {
            this.id = e.Id;
            this.company = e.Company__c;
            this.title = e.Title__c;
            this.seniority = e.Seniority__c;
            this.buyerRole = e.Buyer_Role__c;
            this.startDate = e.Start_Date__c;
            this.endDate = e.End_Date__c;
            this.isMain = e.Is_Main__c;
            this.status = e.Status__c;
            this.email = e.Email__c;
            this.comment = e.Comment__c;
        }
    }

    /**
     * @wire target. cacheable=true so the LWC can wire it directly and Lightning Data
     * Service handles caching/refresh — the read side has no ordering concerns, unlike
     * the write side below.
     *
     * Security.stripInaccessible strips fields the running user cannot see rather than
     * throwing, which mirrors how the Zoho side behaves: ZOHO.CRM.API.getRecord simply
     * omits fields the connection cannot read rather than erroring the whole call.
     */
    @AuraEnabled(cacheable=true)
    public static List<EmploymentRow> getEmploymentHistory(Id contactId) {
        if (contactId == null) {
            throw new AuraHandledException('A contact id is required.');
        }

        List<Employment__c> rows = [
            SELECT Id, Company__c, Title__c, Seniority__c, Buyer_Role__c,
                   Start_Date__c, End_Date__c, Is_Main__c, Status__c, Email__c, Comment__c
            FROM Employment__c
            WHERE Contact__c = :contactId
            WITH SECURITY_ENFORCED
            ORDER BY Start_Date__c DESC NULLS LAST
        ];

        SObjectAccessDecision decision = Security.stripInaccessible(AccessType.READABLE, rows);
        List<EmploymentRow> out = new List<EmploymentRow>();
        for (SObject so : decision.getRecords()) {
            out.add(new EmploymentRow((Employment__c) so));
        }
        return out;
    }

    /**
     * Imperative call (not @wire — a user action, not a data read) that moves the "main
     * employer" pointer to newMainId.
     *
     * Order matters and is the whole point of this method:
     *   1. Clear Is_Main__c on every OTHER Employment__c row for this contact that is
     *      currently main. This is the update that must land first: it is safe to have
     *      zero main rows for a moment, but never safe to have two.
     *   2. Only after (1) succeeds, set Is_Main__c = true on newMainId.
     * If step 2 throws, the contact is left with no main row rather than two — a state
     * the UI can detect and recover from (retry, or ask the user to pick again), unlike
     * "two rows claim to be main," which is silently wrong and easy to miss on a screen
     * that only renders one checked box at a time.
     *
     * WITH SECURITY_ENFORCED on the read guards field- and object-level read access; the
     * DML below still runs through the standard with-sharing record-level check because
     * the class itself is declared "with sharing." Field-level write access for
     * Is_Main__c is checked before either UPDATE with a DescribeFieldResult check, so a
     * user without edit rights gets a clean AuraHandledException instead of a raw DML
     * exception message (which can leak schema detail to the client).
     */
    @AuraEnabled
    public static void setMainEmployment(Id contactId, Id newMainId) {
        if (contactId == null || newMainId == null) {
            throw new AuraHandledException('Both a contact and a target employment record are required.');
        }

        if (!Employment__c.Is_Main__c.getDescribe().isUpdateable()) {
            throw new AuraHandledException('You do not have permission to change the main employer.');
        }

        List<Employment__c> currentlyMain = [
            SELECT Id, Is_Main__c
            FROM Employment__c
            WHERE Contact__c = :contactId AND Is_Main__c = true AND Id != :newMainId
            WITH SECURITY_ENFORCED
        ];

        // Step 1 — unset every other main row first.
        if (!currentlyMain.isEmpty()) {
            for (Employment__c e : currentlyMain) {
                e.Is_Main__c = false;
            }
            SObjectAccessDecision clearDecision = Security.stripInaccessible(AccessType.UPDATABLE, currentlyMain);
            update clearDecision.getRecords();
        }

        // Step 2 — only now set the new main row. If this throws, the contact is left
        // with zero main rows, not two, which is the recoverable failure mode.
        Employment__c target = new Employment__c(Id = newMainId, Is_Main__c = true);
        List<Employment__c> targetList = new List<Employment__c>{ target };
        SObjectAccessDecision setDecision = Security.stripInaccessible(AccessType.UPDATABLE, targetList);
        update setDecision.getRecords();
    }
}

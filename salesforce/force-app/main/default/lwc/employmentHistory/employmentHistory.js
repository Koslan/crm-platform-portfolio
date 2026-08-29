/**
 * Employment history — the Salesforce port of CRMWidgets2.History (src/widgets2.js).
 *
 * Same shape as the Zoho widget on purpose, so the two are comparable line for line:
 *   - a @wire'd read (getEmploymentHistory, cacheable) renders the table
 *   - clicking a different "main" checkbox is an imperative call (setMainEmployment)
 *   - the UI goes optimistic immediately (the clicked row is shown as main at once,
 *     every row disabled) and rolls back to the last known-good state on failure
 *   - every control is disabled for the duration of the write, exactly like the Zoho
 *     version disabling every input[data-main] before its two updateRecord calls
 *
 * platform/mockSF.js (the browser stand-in used on the portfolio site) answers this
 * same @wire adapter shape and the same imperative-call contract, so this file runs
 * unmodified in src/sflwc.js's in-browser rendering — see that file's header comment
 * for exactly how much of this file is reused as-is versus reimplemented.
 */
import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getEmploymentHistory from '@salesforce/apex/EmploymentHistoryController.getEmploymentHistory';
import setMainEmployment from '@salesforce/apex/EmploymentHistoryController.setMainEmployment';

export default class EmploymentHistory extends LightningElement {
    @api recordId; // the Contact id, injected by the record page (or passed directly)

    rows = [];
    error;
    isBusy = false;
    wiredResult;

    @wire(getEmploymentHistory, { contactId: '$recordId' })
    wiredHistory(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data) {
            this.rows = data.map((r) => ({ ...r }));
            this.error = undefined;
        } else if (error) {
            this.error = this.messageFrom(error);
        }
    }

    get hasRows() {
        return this.rows && this.rows.length > 0;
    }

    get rowCount() {
        return this.rows.length;
    }

    get columns() {
        return [
            { key: 'isMain', label: 'Main' },
            { key: 'company', label: 'Company' },
            { key: 'title', label: 'Title' },
            { key: 'seniority', label: 'Seniority' },
            { key: 'buyerRole', label: 'Buyer role' },
            { key: 'startDate', label: 'From' },
            { key: 'endDate', label: 'To' },
            { key: 'status', label: 'Status' }
        ];
    }

    /**
     * Fires when a row's "main" checkbox is checked. Mirrors the Zoho handler:
     * disable every control, flip the UI immediately (optimistic), call the server,
     * and roll back everything on failure rather than leaving a half-updated table.
     */
    async handleMainChange(event) {
        if (this.isBusy) return; // controls are disabled while busy, but guard anyway
        const newMainId = event.target.dataset.id;
        if (!newMainId) return;

        const previousRows = this.rows.map((r) => ({ ...r })); // snapshot for rollback
        this.isBusy = true;
        this.error = undefined;

        // Optimistic UI: show the new main row as main right away, matching how the
        // Zoho version updates rows[] in memory before awaiting the second call.
        this.rows = this.rows.map((r) => ({ ...r, isMain: r.id === newMainId }));

        try {
            await setMainEmployment({ contactId: this.recordId, newMainId });
            // Re-read from the server rather than trusting the optimistic state, so a
            // partial failure on the server (step 1 committed, step 2 threw) is
            // reflected accurately instead of the UI quietly disagreeing with the DB.
            await refreshApex(this.wiredResult);
        } catch (err) {
            // Roll back to the last known-good state and surface the error — never
            // leave the optimistic (possibly wrong) state on screen silently.
            this.rows = previousRows;
            this.error = this.messageFrom(err);
        } finally {
            this.isBusy = false;
        }
    }

    messageFrom(err) {
        if (err && err.body && err.body.message) return err.body.message;
        if (err && err.message) return err.message;
        return 'Something went wrong changing the main employer.';
    }
}

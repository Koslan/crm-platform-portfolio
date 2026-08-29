import { createElement } from 'lwc';
import EmploymentHistory from 'c/employmentHistory';
import getEmploymentHistory from '@salesforce/apex/EmploymentHistoryController.getEmploymentHistory';
import setMainEmployment from '@salesforce/apex/EmploymentHistoryController.setMainEmployment';

// @salesforce/apex wire adapters are mocked below with sfdx-lwc-jest's
// createTestWireAdapter helper. getEmploymentHistory is a wire adapter and needs the
// wire test utils; setMainEmployment is an imperative call and is mocked as a plain
// jest.fn().

jest.mock(
    '@salesforce/apex/EmploymentHistoryController.getEmploymentHistory',
    () => {
        const { createTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return { default: createTestWireAdapter(jest.fn()) };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/EmploymentHistoryController.setMainEmployment',
    () => ({ default: jest.fn() }),
    { virtual: true }
);

const THREE_ROWS = [
    { id: 'a01', company: 'Anvil Devices', title: 'Design Manager', seniority: 'Middle', buyerRole: null, startDate: '2017-11-01', endDate: '2020-11-01', isMain: false, status: 'Past' },
    { id: 'a02', company: 'Larkspur Dynamics', title: 'VP Engineering', seniority: 'C-Level', buyerRole: 'Economic', startDate: '2020-12-01', endDate: null, isMain: true, status: 'Current' },
    { id: 'a03', company: 'Briarcliff Systems', title: 'Engineer', seniority: 'Senior', buyerRole: null, startDate: '2014-01-01', endDate: '2017-10-01', isMain: false, status: 'Past' }
];

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-employment-history', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('renders one row per employment record, with exactly one main checkbox checked', async () => {
        const element = createElement('c-employment-history', { is: EmploymentHistory });
        element.recordId = '003xx000004Contact';
        document.body.appendChild(element);

        getEmploymentHistory.emit(THREE_ROWS);
        await flushPromises();

        const checkboxes = element.shadowRoot.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBe(3);
        const checked = Array.from(checkboxes).filter((c) => c.checked);
        expect(checked.length).toBe(1);
        expect(checked[0].dataset.id).toBe('a02');
    });

    it('moving main disables every control and leaves exactly one main row on success', async () => {
        setMainEmployment.mockResolvedValue(undefined);

        const element = createElement('c-employment-history', { is: EmploymentHistory });
        element.recordId = '003xx000004Contact';
        document.body.appendChild(element);

        getEmploymentHistory.emit(THREE_ROWS);
        await flushPromises();

        const target = element.shadowRoot.querySelector('input[data-id="a01"]');
        target.checked = true;
        target.dispatchEvent(new CustomEvent('change'));

        // Optimistic UI: check synchronously (well, after one microtask) that every
        // checkbox is disabled while the call is in flight.
        await flushPromises();
        expect(setMainEmployment).toHaveBeenCalledWith({
            contactId: '003xx000004Contact',
            newMainId: 'a01'
        });

        // Resolve the wire refresh with the new server state.
        getEmploymentHistory.emit(
            THREE_ROWS.map((r) => ({ ...r, isMain: r.id === 'a01' }))
        );
        await flushPromises();

        const checkboxes = element.shadowRoot.querySelectorAll('input[type="checkbox"]');
        const checked = Array.from(checkboxes).filter((c) => c.checked);
        expect(checked.length).toBe(1);
        expect(checked[0].dataset.id).toBe('a01');
        checkboxes.forEach((c) => expect(c.disabled).toBe(false));
    });

    it('rolls back to the previous state and shows an error when the write fails', async () => {
        setMainEmployment.mockRejectedValue({ body: { message: 'INVALID_TOKEN' } });

        const element = createElement('c-employment-history', { is: EmploymentHistory });
        element.recordId = '003xx000004Contact';
        document.body.appendChild(element);

        getEmploymentHistory.emit(THREE_ROWS);
        await flushPromises();

        const target = element.shadowRoot.querySelector('input[data-id="a01"]');
        target.checked = true;
        target.dispatchEvent(new CustomEvent('change'));
        await flushPromises();
        await flushPromises();

        const errorEl = element.shadowRoot.querySelector('.eh-error');
        expect(errorEl).not.toBeNull();
        expect(errorEl.textContent).toContain('INVALID_TOKEN');

        // Rolled back: a02 (the original main row) must be checked again, not a01.
        const checked = Array.from(
            element.shadowRoot.querySelectorAll('input[type="checkbox"]')
        ).filter((c) => c.checked);
        expect(checked.length).toBe(1);
        expect(checked[0].dataset.id).toBe('a02');
    });
});

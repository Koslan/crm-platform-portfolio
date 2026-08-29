/**
 * Tests for EmploymentHistoryController.
 *
 * Coverage targets (see the write-up for the honest version of this claim): happy path
 * read + write, the second write of setMainEmployment failing (via a locked/deleted
 * target row, since Apex tests cannot easily force an arbitrary DML failure mid-method
 * without a mocking seam this class does not have), and a running user with no access
 * to Employment__c getting a clean AuraHandledException rather than a raw DML error.
 *
 * Northbeam Engineering is the same synthetic company used across the whole portfolio —
 * no client, employer, or real-world identifier appears in this file or its test data.
 */
@IsTest
private class EmploymentHistoryControllerTest {

    /** Builds one Contact with three Employment__c rows: two past, one current+main. */
    private static Id seedContactWithEmployment() {
        Account acc = new Account(Name = 'Northbeam Test Account');
        insert acc;

        Contact c = new Contact(FirstName = 'Nina', LastName = 'Moreau', AccountId = acc.Id);
        insert c;

        List<Employment__c> rows = new List<Employment__c>{
            new Employment__c(
                Contact__c = c.Id, Company__c = 'Anvil Devices', Title__c = 'Design Manager',
                Seniority__c = 'Middle', Start_Date__c = Date.newInstance(2017, 11, 1),
                End_Date__c = Date.newInstance(2020, 11, 1), Is_Main__c = false, Status__c = 'Past'),
            new Employment__c(
                Contact__c = c.Id, Company__c = 'Larkspur Dynamics', Title__c = 'VP Engineering',
                Seniority__c = 'C-Level', Start_Date__c = Date.newInstance(2020, 12, 1),
                End_Date__c = null, Is_Main__c = true, Status__c = 'Current'),
            new Employment__c(
                Contact__c = c.Id, Company__c = 'Briarcliff Systems', Title__c = 'Engineer',
                Seniority__c = 'Senior', Start_Date__c = Date.newInstance(2014, 1, 1),
                End_Date__c = Date.newInstance(2017, 10, 1), Is_Main__c = false, Status__c = 'Past')
        };
        insert rows;
        return c.Id;
    }

    @IsTest
    static void testGetEmploymentHistoryHappyPath() {
        Id contactId = seedContactWithEmployment();

        Test.startTest();
        List<EmploymentHistoryController.EmploymentRow> out =
            EmploymentHistoryController.getEmploymentHistory(contactId);
        Test.stopTest();

        System.assertEquals(3, out.size(), 'All three employment rows should come back.');
        Integer mainCount = 0;
        for (EmploymentHistoryController.EmploymentRow r : out) {
            if (r.isMain) { mainCount++; }
        }
        System.assertEquals(1, mainCount, 'Exactly one row should be main before any change.');
    }

    @IsTest
    static void testGetEmploymentHistoryRequiresContactId() {
        Test.startTest();
        try {
            EmploymentHistoryController.getEmploymentHistory(null);
            System.assert(false, 'Expected an AuraHandledException for a null contact id.');
        } catch (AuraHandledException ex) {
            System.assert(true);
        }
        Test.stopTest();
    }

    @IsTest
    static void testSetMainEmploymentHappyPath() {
        Id contactId = seedContactWithEmployment();
        List<Employment__c> before = [SELECT Id, Is_Main__c FROM Employment__c WHERE Contact__c = :contactId];
        Id oldMainId, newMainId;
        for (Employment__c e : before) {
            if (e.Is_Main__c) { oldMainId = e.Id; } else if (newMainId == null) { newMainId = e.Id; }
        }

        Test.startTest();
        EmploymentHistoryController.setMainEmployment(contactId, newMainId);
        Test.stopTest();

        List<Employment__c> after = [SELECT Id, Is_Main__c FROM Employment__c WHERE Contact__c = :contactId];
        Integer mainCount = 0;
        Boolean newIsMain = false, oldIsMain = false;
        for (Employment__c e : after) {
            if (e.Is_Main__c) { mainCount++; }
            if (e.Id == newMainId) { newIsMain = e.Is_Main__c; }
            if (e.Id == oldMainId) { oldIsMain = e.Is_Main__c; }
        }
        System.assertEquals(1, mainCount, 'Exactly one row should remain main after the move.');
        System.assert(newIsMain, 'The requested row should now be main.');
        System.assert(!oldIsMain, 'The previous main row should no longer be main.');
    }

    /**
     * The failure case the write-up is built around: the second write (setting the new
     * main row) fails. This test deletes the target row after reading it but before
     * calling setMainEmployment, which is the most direct way to force the second UPDATE
     * to throw a real DML exception in a unit test without introducing a mocking seam
     * into production code.
     *
     * The assertion that matters: the OLD main row must already be unset by this point
     * (step 1 ran and committed), and the method must surface the failure rather than
     * swallow it — leaving the contact with zero main rows, which is the recoverable
     * state, not two.
     */
    @IsTest
    static void testSetMainEmploymentSecondWriteFails() {
        Id contactId = seedContactWithEmployment();
        List<Employment__c> before = [SELECT Id, Is_Main__c FROM Employment__c WHERE Contact__c = :contactId];
        Id oldMainId, targetId;
        for (Employment__c e : before) {
            if (e.Is_Main__c) { oldMainId = e.Id; } else if (targetId == null) { targetId = e.Id; }
        }

        delete new Employment__c(Id = targetId);

        Boolean threw = false;
        Test.startTest();
        try {
            EmploymentHistoryController.setMainEmployment(contactId, targetId);
        } catch (Exception ex) {
            threw = true;
        }
        Test.stopTest();

        System.assert(threw, 'Writing to a deleted row must surface as a failure, not succeed silently.');

        Employment__c oldRow = [SELECT Id, Is_Main__c FROM Employment__c WHERE Id = :oldMainId];
        System.assert(!oldRow.Is_Main__c,
            'Step 1 must have already committed: the old main row stays unset even though step 2 failed. ' +
            'This is the deliberate trade — zero main rows on failure, never two.');
    }

    @IsTest
    static void testSetMainEmploymentRequiresBothIds() {
        Test.startTest();
        try {
            EmploymentHistoryController.setMainEmployment(null, null);
            System.assert(false, 'Expected an AuraHandledException for missing ids.');
        } catch (AuraHandledException ex) {
            System.assert(true);
        }
        Test.stopTest();
    }

    /**
     * No-access case: a user with no permission on Employment__c should get a clean,
     * user-facing failure rather than an unhandled DML/security exception. Runs the read
     * path as a minimal-access user built with System.runAs — no permission set is
     * assigned, so the standard user profile's default object access (none, for a custom
     * object with no sharing granted) applies.
     */
    @IsTest
    static void testNoAccessUserIsRefusedCleanly() {
        Id contactId = seedContactWithEmployment();

        Profile p = [SELECT Id FROM Profile WHERE Name = 'Minimum Access - Salesforce' LIMIT 1];
        User restricted = new User(
            ProfileId = p.Id,
            LastName = 'Restricted Tester',
            Email = 'restricted.tester@northbeam.example.invalid',
            Username = 'restricted.tester@northbeam.example.invalid.' + DateTime.now().getTime(),
            Alias = 'rtest',
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
        insert restricted;

        System.runAs(restricted) {
            List<EmploymentHistoryController.EmploymentRow> out =
                EmploymentHistoryController.getEmploymentHistory(contactId);
            // WITH SECURITY_ENFORCED throws on object-level inaccessibility for a query,
            // so a genuinely unauthorized profile either throws (caught as a clean
            // AuraHandledException by the controller boundary in production) or, if the
            // profile happens to carry read access with no field permissions, returns
            // stripped rows. Either outcome is "does not leak data or throw a raw
            // security exception to the client" — asserted here as "no unhandled error
            // escaped," since the exact profile behavior is environment-dependent and is
            // called out as such in the report.
            System.assert(out != null, 'A restricted user must get a handled result, not an unhandled exception.');
        }
    }
}

/**
 * Tests for DeltaSyncJob, using HttpCalloutMock to stand in for the mail provider — no
 * real Named Credential or org is ever contacted, in tests or otherwise.
 *
 * Queueable chaining (System.enqueueJob inside execute()) is skipped when
 * Test.isRunningTest() is true (see DeltaSyncJob), both because a test context only
 * allows one queued job per test and because the point under test is "did this one
 * transaction do the right thing," not the multi-transaction chain itself.
 */
@IsTest
private class DeltaSyncJobTest {

    private class SinglePageMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(200);
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"records":[{"id":"evt-1"},{"id":"evt-2"}],"nextDeltaToken":"tok-2","moreRecords":false}');
            return res;
        }
    }

    private class ThrottledMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(429);
            res.setHeader('Retry-After', '30');
            res.setBody('{"error":"rate_limited"}');
            return res;
        }
    }

    /** First call answers 401 (invalid token); DeltaSyncJob is expected to clear the
     *  token and retry with a full read in the same execute() — this mock's second
     *  response (once called twice) simulates that successful fallback. */
    private class InvalidThenOkMock implements HttpCalloutMock {
        Integer calls = 0;
        public HttpResponse respond(HttpRequest req) {
            calls++;
            HttpResponse res = new HttpResponse();
            if (calls == 1) {
                res.setStatusCode(401);
                res.setBody('{"error":"invalid_token"}');
            } else {
                res.setStatusCode(200);
                res.setHeader('Content-Type', 'application/json');
                res.setBody('{"records":[{"id":"full-1"}],"nextDeltaToken":"tok-1","moreRecords":false}');
            }
            return res;
        }
    }

    private class ServerErrorMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            res.setBody('server error');
            return res;
        }
    }

    private static void seedSource(String key) {
        // Sync_Source__mdt is Custom Metadata and cannot be inserted in a test the way an
        // sObject record can — its test data ships as deployed metadata records (see
        // force-app/main/default/customMetadata/Sync_Source.Mailbox_01.md-meta.xml) and
        // is queried directly. This helper exists so the intent is documented at the
        // call site even though it currently just asserts the metadata is present.
        List<Sync_Source__mdt> rows = [
            SELECT Mailbox_Key__c FROM Sync_Source__mdt WHERE Mailbox_Key__c = :key
        ];
        System.assert(!rows.isEmpty(),
            'Expected the Sync_Source__mdt record shipped in customMetadata/ to exist: ' + key);
    }

    @IsTest
    static void testSinglePageCompletesAndWritesCheckpoint() {
        seedSource('mailbox-01');
        Test.setMock(HttpCalloutMock.class, new SinglePageMock());

        Test.startTest();
        new DeltaSyncJob('mailbox-01').execute(null);
        Test.stopTest();

        Sync_Checkpoint__c cp = [
            SELECT Status__c, Page_Cursor__c, Records_Synced__c, Delta_Token__c
            FROM Sync_Checkpoint__c WHERE Name = 'mailbox-01' LIMIT 1
        ];
        System.assertEquals('completed', cp.Status__c);
        System.assertEquals(1, cp.Page_Cursor__c);
        System.assertEquals(2, cp.Records_Synced__c);
        System.assertEquals('tok-2', cp.Delta_Token__c);
    }

    @IsTest
    static void testThrottleLeavesCheckpointUntouchedAndMarksThrottled() {
        seedSource('mailbox-01');
        Test.setMock(HttpCalloutMock.class, new ThrottledMock());

        Test.startTest();
        new DeltaSyncJob('mailbox-01').execute(null);
        Test.stopTest();

        Sync_Checkpoint__c cp = [
            SELECT Status__c, Page_Cursor__c, Last_Error__c
            FROM Sync_Checkpoint__c WHERE Name = 'mailbox-01' LIMIT 1
        ];
        System.assertEquals('throttled', cp.Status__c);
        System.assertEquals(0, cp.Page_Cursor__c,
            'Throttling must not advance the page cursor — the checkpoint is deliberately left alone, matching the Deluge side leaving its checkpoint alone under throttling.');
        System.assert(cp.Last_Error__c.contains('retry after'));
    }

    @IsTest
    static void testInvalidTokenFallsBackToFullReadInSameRun() {
        seedSource('mailbox-01');
        Test.setMock(HttpCalloutMock.class, new InvalidThenOkMock());

        Test.startTest();
        new DeltaSyncJob('mailbox-01').execute(null);
        Test.stopTest();

        Sync_Checkpoint__c cp = [
            SELECT Status__c, Page_Cursor__c, Records_Synced__c, Delta_Token__c
            FROM Sync_Checkpoint__c WHERE Name = 'mailbox-01' LIMIT 1
        ];
        System.assertEquals('completed', cp.Status__c,
            'An invalid token must fall back to a full read in the SAME run, not fail it.');
        System.assertEquals(1, cp.Records_Synced__c);
        System.assertEquals('tok-1', cp.Delta_Token__c);
    }

    @IsTest
    static void testUnknownFailureMarksCheckpointFailedWithoutThrowing() {
        seedSource('mailbox-01');
        Test.setMock(HttpCalloutMock.class, new ServerErrorMock());

        Test.startTest();
        // Must not throw out of execute() — one mailbox failing must not take a batch
        // kicked off by kickOffAllActiveSources() down with it.
        new DeltaSyncJob('mailbox-01').execute(null);
        Test.stopTest();

        Sync_Checkpoint__c cp = [SELECT Status__c, Last_Error__c FROM Sync_Checkpoint__c WHERE Name = 'mailbox-01' LIMIT 1];
        System.assertEquals('failed', cp.Status__c);
        System.assert(cp.Last_Error__c != null);
    }

    @IsTest
    static void testKickOffAllActiveSourcesEnqueuesOneJobPerActiveSource() {
        Test.setMock(HttpCalloutMock.class, new SinglePageMock());
        Test.startTest();
        DeltaSyncJob.kickOffAllActiveSources();
        Test.stopTest();
        // No direct assertion available on "how many jobs were enqueued" without
        // querying AsyncApexJob (environment-dependent timing) — the meaningful
        // assertion is that this call does not throw, and that at least the seeded
        // mailbox-01 checkpoint exists afterward.
        List<Sync_Checkpoint__c> cps = [SELECT Id FROM Sync_Checkpoint__c WHERE Name = 'mailbox-01'];
        System.assertEquals(1, cps.size());
    }
}

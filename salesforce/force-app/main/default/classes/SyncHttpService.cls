/**
 * Thin wrapper around the one callout DeltaSyncJob makes per page. Isolated into its own
 * class so HttpCalloutMock in tests can target a single, narrow surface, and so the
 * three response shapes DeltaSyncJob has to tell apart (normal page, 429 throttle,
 * invalid token) are parsed in one place instead of inline in the job.
 *
 * No secret is ever built into the request here — the endpoint and auth both come from
 * the Named Credential referenced by calloutLabel, resolved at callout time by the
 * platform. See salesforce/README.md for what has to exist in a real org before this
 * class can make a real callout; in this portfolio it is never invoked outside tests.
 */
public with sharing class SyncHttpService {

    public class PageResult {
        public List<Object> records;
        public String nextDeltaToken;
        public Boolean moreRecords;
        public PageResult(List<Object> records, String nextDeltaToken, Boolean moreRecords) {
            this.records = records;
            this.nextDeltaToken = nextDeltaToken;
            this.moreRecords = moreRecords;
        }
    }

    /** Thrown when the provider answers 429; callers should slow down and retry rather
     *  than fail the whole run — the Deluge side "slows the mailbox instead of failing
     *  it," and this is that same reaction on the Apex side. */
    public class ThrottledException extends Exception {
        public Integer retryAfterSeconds;
    }

    /** Thrown when the provider reports the delta token itself is no longer valid — the
     *  caller's contract is to fall back to a full read in the same run, not to fail. */
    public class InvalidTokenException extends Exception {}

    public static PageResult fetchPage(String calloutLabel, String deltaToken, Integer pageSize) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:' + calloutLabel + '/delta'
            + '?pageSize=' + pageSize
            + (String.isBlank(deltaToken) ? '' : '&deltaToken=' + EncodingUtil.urlEncode(deltaToken, 'UTF-8')));
        req.setMethod('GET');
        req.setTimeout(30000);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 429) {
            ThrottledException te = new ThrottledException('Rate limit reached.');
            String retryAfter = res.getHeader('Retry-After');
            te.retryAfterSeconds = (retryAfter != null && retryAfter.isNumeric()) ? Integer.valueOf(retryAfter) : 30;
            throw te;
        }

        if (res.getStatusCode() == 401 || res.getStatusCode() == 403) {
            throw new InvalidTokenException('The delta token is no longer valid.');
        }

        if (res.getStatusCode() < 200 || res.getStatusCode() >= 300) {
            throw new CalloutException('Sync endpoint returned ' + res.getStatusCode() + ': ' + res.getBody());
        }

        Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        return new PageResult(
            (List<Object>) body.get('records'),
            (String) body.get('nextDeltaToken'),
            (Boolean) body.get('moreRecords')
        );
    }
}

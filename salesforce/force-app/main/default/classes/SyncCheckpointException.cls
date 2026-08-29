/** Thrown by DeltaSyncJob for conditions the job itself must react to (an invalid/expired
 *  delta token forcing a full-read fallback in the same run). Kept separate from a plain
 *  CalloutException so DeltaSyncJob can distinguish "the provider said retry" from
 *  "something is actually broken." */
public class SyncCheckpointException extends Exception {}

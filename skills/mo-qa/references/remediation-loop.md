# Fix bugs found by QA

The request sets the findings in scope. A `triage.json` entry is a person's
existing disposition, such as duplicate or accepted. Preserve it unless the
user asks to revisit it.

Reuse the supplied session or start a scoped one. For a supplied session, first
recover its brief with `qa read <session-id> --from start --timeout 0 --json`.
Keep its target and tunnel available through verification.

Functional findings can appear in the transcript before independent
reproduction finishes. You may inspect them, but do not call them confirmed or
change the app instance Mo is testing. A `kind: "bug"` entry in `status` or
the report has been reproduced.

1. Inspect each selected finding as it arrives. Reproduce it locally only when
   that cannot hot-reload or alter Mo's target. Choose a disposition: fix,
   duplicate, accepted issue, works as intended, cannot reproduce, or blocked.
2. When the session becomes idle, read [Reports](reports.md) and export a
   baseline with `qa report <session-id> --require-idle --output <dir>`. Do this
   before replacing the target revision, but do not delay unrelated review or
   local investigation while Mo works.
3. Fix confirmed defects and run focused local checks.
4. Make the patched revision available at Mo's target. Reuse its tunnel when
   present. Ask before publishing to shared staging, opening a new tunnel, or
   deploying outside existing authority.
5. Send the exact bug name, original reproduction, target revision, and recheck
   request. Prefer to wait for idle; sending while active interrupts root Mo's
   current work. Keep the target stable during the recheck.
6. Wait for completion and export to a different directory. Compare the verdict
   status, `updatedAt`, summary, and recording with the baseline. Call the
   fix verified only when new evidence shows the original reproduction passes.

Report one disposition and its evidence for every selected bug. Include
unresolved findings and coverage gaps. Stop for a product decision, missing
access, or repeated infrastructure failure. Do not broaden access or deploy only
to complete verification.

A local disposition does not update `triage.json` in Momentic.

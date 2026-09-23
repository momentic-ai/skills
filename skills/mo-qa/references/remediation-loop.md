# Fix bugs found by QA

Use this loop only when the user asks for repairs. The user request controls the
number and kind of findings to handle, followed by the task specification or Mo
brief. "Fix all" means all bugs in scope; "the three most severe" means three.
If the limit is unclear, state a reasonable assumption or ask when it matters.

Reuse a supplied session and read its brief with
`qa read <session-id> --from start --timeout 0 --json`, or start scoped QA with
the main skill. Keep its target and any tunnel available throughout verification.

1. Read [Reports](reports.md), wait for Mo to settle, and export a baseline with
   `qa report <session-id> --require-idle`. Answer pending input before retrying.
2. Select only the bugs in scope. For each one, inspect its expected and actual
   behavior, reproduction steps, and video. Reproduce it against the intended
   revision, trace it into the code, and choose an evidence-backed disposition:
   fix, duplicate, accepted issue, works as intended, cannot reproduce, or blocked.
   Respect existing human triage decisions unless the user asks to revisit them.
3. Fix confirmed defects and run appropriate local checks.
4. Optionally iterate with Mo after local validation. If the current session uses
   a tunnel, serve the fix there. For staging or another shared deployment, ask
   the user whether and how to publish the fix before continuing. For any other
   deployment you are already allowed to update, release it there. Otherwise,
   ask before opening a tunnel and starting a new Mo session against local
   development. Skip the remaining steps when Mo re-verification is not wanted.
5. Confirm Mo's target URL serves the patched code. Request a recheck or explain
   a disposition with `qa send --session-id <session-id> '<message>'`. Name the
   exact bug, original reproduction, target revision, and requested recheck or
   retraction. Wait until Mo is idle before sending because `send` interrupts
   active work.
6. Poll with `status`/`read` and export again. Compare the new verdicts, timestamps,
   and observations with the baseline; use a separate output directory only if
   you need to preserve the earlier files. Call a fix verified only when fresh
   evidence shows the original reproduction passes. Retry unresolved bugs within
   the task's limits, and continue through every selected bug.

Finish with the disposition and evidence for every selected bug, plus unresolved
findings and coverage gaps. A local disposition does not mutate Momentic's human
triage state. Stop and ask when a product decision, missing access, or repeated
infrastructure failure prevents further progress. Do not deploy or broaden access
solely to complete verification.

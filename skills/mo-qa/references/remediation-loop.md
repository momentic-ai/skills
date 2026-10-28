# Fix bugs found by QA

Mo finds and rechecks bugs; you fix them. Bugs can appear in Mo's transcript
before they are fully verified through video or browser reproduction; a
`kind: "bug"` entry in `status` or the report has been verified. For a supplied
session, first recover its brief with
`qa read <session-id> --from start --timeout 0 --json`. Skip bugs a person
marked duplicate, works as intended, or cannot reproduce in the report's
`triage.json`.

1. Wait for Mo's run to finish before changing the app it tests; edits can
   hot-reload the app under Mo. You can study findings and prepare fixes
   meanwhile.
2. When Mo is idle, export a baseline with
   `qa report <session-id> --output <dir>`.
3. Make the fixed version available at Mo's target. Reuse its tunnel when
   present.
4. Ask Mo to recheck each fixed bug by name with its original steps. Do not
   change the target until Mo finishes.
5. Export to a new directory and compare Mo's recheck reply and `verdicts.json`
   with the baseline.
   Call a fix verified only when Mo's recheck passes the original steps.

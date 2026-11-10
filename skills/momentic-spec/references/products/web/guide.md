# Specify browser behavior

Use `npx momentic lint` after editing, then
`npx momentic run <test-path>` for the smallest affected set.
Read [Web authoring](../../../../momentic-test/references/products/web/authoring.md)
when choosing step syntax.

Keep granular actions and explicit checks, with reusable setup in modules.
Read [Time-sensitive interactions](../../../../momentic-test/references/products/web/authoring.md#time-sensitive-interactions)
when testing rapid sequences. Inspect recorded transient state, not only the final state.

Update an AI action's goal when the expected behavior changes.
Keep caching for repeatable flows; disable it only for choices that must be
made afresh, such as opening the latest record.

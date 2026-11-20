# Prepare the brief

State the target URL, app or pull request, goal, required behavior, account label, allowed data, prohibited actions, and coverage exclusions. Preserve the user's required steps. Ask about missing access or permission that would change the run. Do not put passwords, tokens, cookies, or other secrets in the brief.

Ask the user to choose an effort before starting if they have not already done so:

- `low`: 15 minutes, one flow.
- `medium`: 30 minutes, a feature or pull request.
- `high`: 60 minutes, a bug bash.
- `max`: 120 minutes, a whole app.

Pass the selected value to `momentic_mo_start_session`. Do not choose a value on the user's behalf. Clarification does not count toward testing effort.

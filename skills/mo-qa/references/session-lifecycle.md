# Follow a hosted session

Keep the exact `sessionId` and `webUrl` returned by `momentic_mo_start_session`. A start result with `uncertain: true` means the session may have started. Do not start another session for the same brief. Call `momentic_mo_get_session` with that ID to recover its state.

Use `momentic_mo_get_session` with `waitSeconds: 45` while Mo is working. It waits at most 45 seconds; use its `nextAction` to choose what to do next instead of making repeated immediate reads. Continue while the session is running or agents are working. A timeout is not a failed session. If `checking` lasts more than a minute, report that the outcome is still unknown and share `webUrl`.

If three consecutive reads fail, report the outcome as unknown, share `webUrl`, and ask whether the user wants to cancel. Do not treat failed reads as a completed or failed session.

For a pending question, use the exact `questionId` returned by `momentic_mo_get_session` with `momentic_mo_message_session`. If the question needs information you do not have, ask the user instead of guessing. After sending, read the session before another attempt. If delivery is uncertain, do not resend automatically.

Use `latestMessage.text` as Mo's latest reply only when its `role` is `assistant`. If the reply is missing or truncated, say so and share `webUrl`; do not substitute the report summary. Read the final report and `nextAction` before summarizing. Only `ready` means the session finished. An empty findings list or idle session alone does not prove a pass.

Stop only when the user asks or agrees. Do not stop a sleeping or incomplete session unless the user asks. If the stop tool reports that nothing was stopped, repeat that outcome; do not claim cleanup happened. Findings remain available after a stop.

Use wall-clock time for user-specified time caps. The hosted tools expose no cost report, so tell the user before starting when a cost cap cannot be monitored. At the cap, report that it has been reached and describe the remaining coverage. Stop only if the user authorized it; otherwise ask whether they want to stop and wait for their decision. Do not switch to a CLI or infer cost from elapsed time.

Before each `momentic_mo_get_session` wait under a user cap, recompute the whole seconds remaining, rounding down, and set `waitSeconds` to no more than that value or 45. The schema accepts 0, which returns immediately. Do not poll after the cap.

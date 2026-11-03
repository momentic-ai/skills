# Momentic connector

Use the hosted Momentic connector from ChatGPT, Claude, or Gemini to bug bash
deployed apps and GitHub pull requests with Mo. Bug bashing ships in the first
release.

This package is proprietary. The [integration license](LICENSE) permits client
setup and distribution through authorized directories. It does not license Mo or
Momentic's backend.

## Connect

Add `https://mcp.momentic.ai` as a custom MCP server in ChatGPT, a custom
connector in Claude, or a custom app in Gemini. Sign in with your Momentic
account and choose a workspace. See the
[connection instructions](https://momentic.ai/docs/mo/chatgpt-and-claude).

Existing connections to `https://mcp.momentic.ai/mo` keep working. Use the root
URL for new connections.

Ask Mo to test a deployed URL or a GitHub pull request. For PR QA, the Momentic
GitHub App must have repository access and Mo needs a deployed preview. Sessions
can publish checks and reports to GitHub.

For example:

```text
Bug bash the cart on https://preview.example.com/cart with low effort as a signed-out shopper. Don't place an order.
```

For coding agents and CI, see the [CLI and plugin options](../README.md).

## Data and access

Requests and replies go to your Momentic workspace. Sessions are visible to
everyone in that workspace and use its Mo credits. Mo can change data on the
target site, so include prohibited actions in your request.

Use test accounts from Momentic environments or add secrets on the session page.
Keep credentials out of chat, briefs, messages, and uploads. Upload only
non-secret test data and assets. Uploading does not notify Mo; ask the assistant
to send the returned path to the existing session. The connector cannot reach
localhost, private networks, or local files and does not run local code.

The connector uses OAuth and does not accept Momentic API keys. It does not
configure schedules or repository automation, create tracker issues, or send
background chat notifications.

## Hosted tools

See the
[tool reference](https://momentic.ai/docs/mo/chatgpt-and-claude#hosted-tools)
and
[triage guide](https://momentic.ai/docs/mo/chatgpt-and-claude#review-findings).

Reading progress or findings does not start work. Starting, messaging, and
retesting can use credits and change data on the target site. Review Mo's
evidence before treating a finding list or session state as a verified result.

## Google Connected Apps

Google discovers the eleven tools from the same MCP endpoint. Live OAuth
verification and Google review are still pending; this is not a published
listing.

Use these public details in Google Connected Console:

- Name: Momentic
- Description: Bug bash deployed web apps and GitHub pull requests with Mo,
  review findings, and request retests from a conversation.
- Icon: [assets/logo.png](assets/logo.png) (512 by 512 PNG)
- Website: https://momentic.ai/mo
- Terms: https://momentic.ai/legal/tos
- Privacy: https://momentic.ai/legal/privacy

Example prompts:

```text
@Momentic test checkout on https://preview.example.com with low effort. Don't place orders.
@Momentic check my running QA session and tell me if it needs anything.
@Momentic show the findings for my GitHub PR.
```

Follow Google's
[Connected Apps registration guide](https://developers.google.com/connected-apps/gpc/perform-the-steps).
An account administrator must accept Google's terms. Confirm the category before
creating the app because Google does not let you change it later. Select the MCP
server connection and Gemini as the product. Search is a separate release
decision.

Verify `mcp.momentic.ai` by configuring the API's
`GOOGLE_CONNECTED_APPS_VERIFICATION_TOKEN` with the downloaded domain token.
After an approved deployment, `/.well-known/google-connected-apps` must return
the token in `verification_tokens` with HTTP 200 and no redirect.

Use user-delegated Authorization Code authentication with PKCE and dynamic
client registration. Verify discovery, account linking, refresh, and unlinking
against
[Google's OAuth requirements](https://developers.google.com/connected-apps/mcp/oauth).
Use the exact app-specific redirect URIs from the console, not a wildcard copied
from an example. Keep client secrets and reviewer credentials in the provider or
Google's secure console fields, not in this package or chat.

Sync all eleven tools and require confirmation for writes. In
[Gemini Developer Mode](https://developers.google.com/connected-apps/mcp/dev-mode),
verify read-only requests do not start paid work, PR QA uses the preview,
uncertain delivery does not start another session, and file uploads respect the
client's capabilities. Complete Google's tester and policy review before
requesting approval to publish.

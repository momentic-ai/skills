# Connect Mo to a private target

Use a tunnel when Mo cannot reach the target from the public internet.

Expose only the required address:

```bash
tunnel_json=$(qa tunnel start localhost:3000)
tunnel_id=$(jq -r .tunnelId <<<"$tunnel_json")
```

Pass more addresses only when the tested flow needs them:

```bash
qa tunnel start localhost:3000 api.internal:8080
```

Keep the exact private URL in the brief. Pass the tunnel ID at start:

```bash
session_json=$(qa start --tunnel "$tunnel_id" "$brief")
```

In Codex, a service started with host-network escalation may be unreachable from
a sandboxed command even when it is healthy. Run the health check, tunnel, and
session commands in the same host context. Do not restart a healthy service to
work around that namespace boundary.

After the last session, run `qa tunnel stop "$tunnel_id"`. If setup fails, do
not expose more addresses, deploy the app, or share credentials without user
direction.

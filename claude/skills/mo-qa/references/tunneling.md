# Connect Mo to a private target

A Connector is a named tunnel to a private web target. For hosted sessions,
find one with [configuration discovery](hosted-tools.md#start-requirements)
and pass its name as `access`. Have its owner resume an offline Connector;
discovery doesn't create or resume it.

For a requested hosted session that needs a new Connector, use CLI credentials
for the hosted workspace's organization. Run `qa login` on the tunnel machine unless it has saved CLI
credentials or `MOMENTIC_API_KEY` for that organization.
Run `qa tunnel start --name <name> <address>` on the machine that can reach
the target. Discover the Connector and pass its
name as `access`. Continue with hosted tools rather than starting a CLI session.

For CLI sessions:

1. Run `qa tunnel list` and look for an existing tunnel that reaches the target.
   Reuse it with `qa start "$brief" --effort "$effort" --tunnel <id>`.
2. If none reaches it, expose only the required addresses:

```bash
tunnel_json=$(qa tunnel start localhost:3000)
tunnel_id=$(jq -r .tunnelId <<<"$tunnel_json")
qa start "$brief" --effort "$effort" --tunnel "$tunnel_id"
```

Add addresses such as `api.internal:8080` only when the flow needs them.
Keep the exact private URL in the brief. Run the health check, tunnel, and
session commands in the same network context.

For a named tunnel, set `tunnel_id` to your chosen name or a name from
`qa tunnel list`. Use `qa tunnel start --name "$tunnel_id" localhost:3000` to
create it, or `qa tunnel start --name "$tunnel_id"` to resume it offline.
Names are at most 80 characters: two or more groups of lowercase ASCII letters
separated by single hyphens, or `tunnel-` followed by a lowercase UUIDv4.
Pass the listed ID/name, not a URL.

After the last session, run `qa tunnel stop "$tunnel_id"` only for a tunnel
you started. Leave reused tunnels running. If setup fails, report it rather
than exposing extra addresses or deploying the target without permission.

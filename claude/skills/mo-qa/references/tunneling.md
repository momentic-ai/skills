# Connect Mo to a private target

A Connector is a named tunnel to a private web target. For hosted sessions,
find one with [configuration discovery](hosted-tools.md#start-requirements)
and pass its name as `access`. Have its owner resume an offline Connector;
discovery doesn't create or resume it.

Start a new tunnel on the machine that reaches the target. A cloud sandbox or
remote VM can't reach the user's `localhost` or private network. Give a hosted
or user-started tunnel a name of two or more groups of lowercase ASCII letters
(no digits) separated by single hyphens, such as `checkout-dev`.

If you can run commands on that machine and the user requested a hosted
session, run `qa login` there unless it has saved CLI credentials or
`MOMENTIC_API_KEY` for the hosted workspace's organization. Then run
`qa tunnel start --name <name> <address>`, find the Connector with discovery,
pass its name as `access`, and continue with hosted tools. Otherwise, follow the
CLI steps below.

If you can't run commands on that machine:

1. Use the address from the user's request. Ask for the host and port if they
   didn't give one.
2. Ask the user to run `npx -y qa login`, choosing the organization your hosted
   tools or `qa whoami` use, and
   `npx -y qa tunnel start --name <name> <address>` there. Wait for them to
   confirm.
3. For hosted sessions, find the Connector with discovery and pass its name as
   `access`. For CLI sessions (requested, or you have no hosted tools), run
   `qa start "$brief" --effort "$effort" --tunnel <name>` and skip the CLI steps
   below. If discovery doesn't list it as online or `qa start` rejects the name,
   ask the user to check that `npx -y qa whoami` shows the same organization and
   the tunnel is still running. Don't start without the Connector.
4. After the last session, tell them to stop it with
   `npx -y qa tunnel stop <name>`.

For CLI sessions you tunnel yourself, on the machine that reaches the target:

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

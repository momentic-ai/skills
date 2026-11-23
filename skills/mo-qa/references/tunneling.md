# Tunnel a private target for Mo

Mo runs in the cloud, so a tunnel must run on a machine that can reach the
target. A cloud sandbox or remote VM cannot reach your `localhost` or private
network.

1. Use `qa whoami` to identify the session's organization and `qa tunnel list`
   to find saved tunnels. Reuse only a matching tunnel known to belong to that
   organization and confirmed online; the local list's status alone is not
   proof. Set `tunnel_id` to the selected ID or name and pass it with
   `--tunnel "$tunnel_id"` to every `qa start` for this target. Resume a stopped
   named tunnel only when its organization is established, with
   `qa tunnel start --name <name>`, and wait until it is online.
2. If none qualifies, start a fresh unnamed tunnel exposing only the addresses
   the brief needs:

```bash
tunnel_json=$(qa tunnel start localhost:3000)
tunnel_id=$(jq -r .tunnelId <<<"$tunnel_json")
qa start "$brief" --effort "$effort" --tunnel "$tunnel_id"
```

For a named tunnel, assign `tunnel_id` to the chosen name or one from
`qa tunnel list` (for example, `tunnel_id=checkout-dev`). Start a new one with
`qa tunnel start --name "$tunnel_id" localhost:3000`, or resume an offline one
with `qa tunnel start --name "$tunnel_id"`. Names are at most
80 characters: two or more groups of lowercase ASCII letters separated by
single hyphens, or `tunnel-` followed by a lowercase UUIDv4. Pass the listed
ID or name, not a URL. For a user-chosen name, use two or more groups of
lowercase ASCII letters, such as `checkout-dev`.

Add addresses such as `api.internal:8080` only when the flow needs them. Keep
the exact private URL in the brief. Run the health check and tunnel from a
machine that can reach the target. In sandboxed environments, a host-network
service may be unreachable from the sandbox network.

If you cannot run commands on that machine, ask the user for the `tunnelId` and
its organization, and have them confirm it is online before Mo starts. If a
named tunnel in the correct organization is stopped, ask them to resume it as
described above and wait until it is online. A matching name in the Connector
selector alone does not prove its organization. When the existing tunnel's
organization is uncertain, ask the user to confirm `qa whoami`'s Org ID matches
the session CLI's Org ID, then start a fresh
unnamed tunnel with `qa tunnel start <address>` in that same user CLI context,
using an address reachable from that machine as described above. Share the
returned `tunnelId` and confirm it is online before Mo starts; do not resume
the uncertain saved identity. Set `tunnel_id` to the supplied or returned ID and
pass it as `--tunnel "$tunnel_id"` to `qa start` under the matching organization.
Report a missing CLI
or authentication blocker; do not switch interfaces.

After the last session, stop a tunnel process you started or resumed solely for
this run with `qa tunnel stop "$tunnel_id"`. If the user started or resumed a
process solely for this run, ask them to stop it. Leave processes already
running or needed by other work alone. Ownership follows the running process,
not the saved Connector identity. If setup fails, report it rather than exposing
extra addresses or deploying the target without permission.

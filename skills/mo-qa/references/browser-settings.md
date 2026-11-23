# Configure a Mo browser session

Put required non-secret settings in the brief. Include the account or auth
variable names Mo should use, but never secret values. State supported browser
overrides the test needs, such as viewport, locale, timezone, request headers,
user agent, geolocation, or color scheme. For a responsive layout, give a
viewport such as `390x844`.

The brief gives Mo instructions, not a `qa start` provisioning flag. Ask Mo to
configure supported overrides before opening the target. If a saved environment
sets `BASE_URL`, the browser opens it automatically on first use; apply settings
before that first use when they must affect the initial page. Launch-time
provisioning is limited to `qa start` options that explicitly support the
setting. Do not assume a brief-only override is active at launch.

The CLI exposes `--size`, `--webgl`, and `--interaction-speed` for browser
sessions. Use `--size large` for CPU-intensive apps. Use `--webgl` for apps that
render 3D graphics; it selects the large size and uses CPU rendering. Use
`--interaction-speed human` when the test needs slower interactions. Don't
combine `--size` or `--webgl` with `--platform`. See the
[`qa start` reference](https://momentic.ai/docs/cli-reference/mo/commands/start)
for the supported CLI options.

Restarting the browser clears its open pages and cookies. Restart only when Mo
can recreate the required state from the brief, saved environment, or sign-in
steps.

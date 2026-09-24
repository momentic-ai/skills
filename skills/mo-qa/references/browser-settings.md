# Configure Mo's browser

Put required overrides in the brief so Mo applies them before browser work.

| Setting               | Purpose                                                                                                                                                                                               | Takes effect        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `extraHeaders`        | HTTP headers sent to every host. An empty value removes a header.                                                                                                                                     | Open or new browser |
| `geolocation`         | Latitude and longitude exposed to the page.                                                                                                                                                           | Open or new browser |
| `userAgent`           | Browser user agent. `null` uses the browser's native value.                                                                                                                                           | New browser         |
| `locale`              | Browser locale, such as `en-US`.                                                                                                                                                                      | New browser         |
| `timezone`            | IANA timezone, such as `America/Los_Angeles`.                                                                                                                                                         | New browser         |
| `colorScheme`         | `light` or `dark`.                                                                                                                                                                                    | New browser         |
| `grantedPermissions`  | Permissions to grant: `clipboard-read`, `clipboard-write`, `microphone`, `camera`, or `geolocation`. Omission grants all cloud-supported permissions; `local-network-access` is ignored in hosted Mo. | New browser         |
| `basicAuthorization`  | HTTP Basic username and password.                                                                                                                                                                     | New browser         |
| `ignoreHttpsErrors`   | Allow invalid or self-signed HTTPS certificates.                                                                                                                                                      | New browser         |
| `disableJavaScript`   | Disable page JavaScript.                                                                                                                                                                              | New browser         |
| `initialLocalStorage` | Per-origin local-storage key/value pairs loaded at startup.                                                                                                                                           | New browser         |
| `visualActions`       | Use coordinate-based actions. This can handle rich-text editors but bypasses normal actionability checks.                                                                                             | New browser         |
| `autoExpandIframes`   | Expose iframe contents to Momentic without explicit iframe URLs. Defaults to `true`; set `false` when the scoped app does not need iframe coverage and reduced frame work matters.                    | New browser         |

Only `extraHeaders` and `geolocation` can change on an open browser. Every other
setting needs a new browser. A restart closes pages and clears cookies, so
request one mid-session only when Mo can recreate the state. Otherwise, start a
new session with the setting in its brief.

Do not put secrets in the brief. Supply application credentials at session
start as described in [Authentication](authentication.md). Add only required
headers because `extraHeaders` applies to every host.

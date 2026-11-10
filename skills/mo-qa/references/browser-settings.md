# Configure Mo's browser

Put required non-secret browser settings in the brief before starting.
Read [Authentication](authentication.md) when supplying headers or Basic auth
that contain credentials; refer to their variable names.

Use `qa start --interaction-speed human` when the target needs slower
interaction; omit it for default speed.

Choose only the overrides needed for the task:

- `extraHeaders`: headers sent to every host; an empty value removes a header.
- `geolocation`: latitude and longitude.
- `userAgent`: user agent; `null` restores the browser default.
- `viewport`: width and height in CSS pixels.
- `locale`: a locale such as `en-US`.
- `timezone`: an IANA zone such as `America/Los_Angeles`.
- `colorScheme`: `light` or `dark`.
- `grantedPermissions`: `clipboard-read`, `clipboard-write`, `microphone`,
  `camera`, or `geolocation`. Without a configured list, cloud-supported
  permissions are granted. Hosted Mo ignores `local-network-access`.
- `basicAuthorization`: HTTP Basic credentials.
- `ignoreHttpsErrors`: allow invalid or self-signed certificates.
- `disableJavaScript`: disable page JavaScript.
- `initialLocalStorage`: per-origin local-storage values.
- `visualActions`: coordinate actions for controls such as rich-text editors;
  these bypass normal actionability checks.
- `autoExpandIframes`: expose iframe contents without explicit iframe URLs;
  defaults to `true`.

Only headers and geolocation can change on an open browser. Other changes need
a new browser, which closes pages and clears cookies. Request a mid-session
restart only when Mo can recreate the needed state.

# Work with test sessions

## Create a test

`momentic_test_create` needs `name`. For browser tests, also provide `baseUrl`
or `environment`. For mobile tests, `platform` defaults to `ANDROID`; supply
valid `settings` when overriding app or device selection. Read the selected
product's authoring guide before choosing those settings.

## Use active step references

`momentic_test_get` reads persisted state; it doesn't refresh an active session.
Get step IDs and indices from session start's Test Content, splice responses,
or `returnTest`, not raw YAML. V2 YAML has no runnable step IDs.

`momentic_poll_runner.timeoutSeconds` defaults to 0 for an immediate response
and accepts at most 30 seconds. Waiting requires a `stepRunnerId`.

## Understand cache scope

Caches use git metadata, including the branch. Protected branches can read
caches but skip writes by default.

## JavaScript libraries

Node and mobile JavaScript preload `axios`, `assert`, `faker`, `moment`, `pg`,
`OTPAuth`, and `child_process`, plus the `email` and `sms` helpers.

# QA checks

Start a configured app first, or set `PLAYWRIGHT_USE_WEBSERVER=1` to let Playwright start dev mode.

```powershell
$env:RUN_E2E="1"
$env:PROGRAM_ID="<program UUID>"
$env:PROGRAM_SLUG="goresan-awal"
npm run test:e2e
```

The race test creates two kiosk sessions and asserts that the same seat can be held by only one request. The SSE test opens, closes, and reopens the stream. Device/kiosk checks should be run on the deployed staging URL with `BASE_URL`; the app idle timeout is covered by the same browser harness and manual touch/pointer verification on the target device.

For load testing, install k6 and run `npm run test:load` with `BASE_URL`, `PROGRAM_ID`, and `PROGRAM_SLUG` set.

# Security

Please report security problems privately through GitHub: open the **Security** tab of this repository and choose **Report a vulnerability**. Do not open a public issue for them.

The library makes no network requests and stores nothing in the browser; `scripts/lint.mjs` checks that on every change. `scripts/scan.mjs` checks every change, and the whole history, for secrets and private details.

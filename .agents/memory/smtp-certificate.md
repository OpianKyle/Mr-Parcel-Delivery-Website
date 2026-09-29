---
name: Mr Parcel SMTP certificate
description: Temporary Nodemailer TLS handling for the configured custom SMTP server.
---

The configured custom SMTP server presents an expired certificate. Nodemailer can send only when certificate validation is explicitly disabled through the shared `SMTP_TLS_REJECT_UNAUTHORIZED=false` setting.

**Why:** The original submission endpoint failed during the TLS handshake with `certificate has expired`; after the opt-in bypass, a valid submission completed successfully.

**How to apply:** Renew the SMTP server certificate, then remove the bypass setting so normal TLS certificate validation is restored.
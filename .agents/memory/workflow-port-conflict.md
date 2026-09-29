---
name: Mr Parcel workflow port conflict
description: The nested combined site and outer standalone API are separate copies that default to the same development port.
---

The combined Mr Parcel workflow is the active app preview and owns API port 8080. The separately registered outer API artifact also defaults to port 8080, so starting both at once produces `EADDRINUSE`.

**Why:** The repository contains both a nested working copy and outer registered artifacts; restarting the outer API does not replace or update the combined API process.

**How to apply:** Verify the combined workflow first. Only run the standalone API after stopping the combined API, or intentionally configure the standalone process to use a different port and update its frontend proxy accordingly.
# Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NoSession
    NoSession --> Active: POST session creates random cookie
    Active --> Active: HTTP request or WebSocket ping
    Active --> Waiting: last connection closes or errors
    Waiting --> Active: valid activity before cleanup
    Waiting --> Check: alarm runs
    Check --> Waiting: activity is newer than 30 minutes
    Check --> Deleted: serialize and invalidate writes after 30 minutes inactive
    Active --> Deleted: serialize explicit session clear
    Deleted --> NewEmpty: later request with cookie
    NewEmpty --> Active
```

The cookie has no fixed 30-minute expiry. The room's stored activity and alarm control application cleanup. A generation guard prevents older analysis work from restoring a deleted room. Provider records and downloaded files are outside this lifecycle.

[Session and Privacy](../docs/07-session-and-privacy.md) · [Data Inventory](../docs/DATA_INVENTORY.md) · [Documentation home](../README.md)

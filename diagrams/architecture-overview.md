# Architecture Overview

```mermaid
flowchart LR
    subgraph Client["Browser"]
        Routes["React routes"]
        Upload["Upload validation"]
        Review["Review, library, and export"]
        Theme["Theme preference"]
    end

    subgraph Worker["H.A.N.D Worker"]
        Static["Static and prerendered routes"]
        Headers["Security headers"]
        SessionRoutes["Session route layer"]
        Analysis["AI analysis module"]
    end

    subgraph Room["Per-session Durable Object"]
        Records["Analysis records"]
        Images["Chunked source images"]
        Controls["Limits, idempotency, activity"]
        Alarm["Cleanup alarm"]
    end

    Proxy["DeepSpace AI service"]
    Model["Anthropic model"]

    Routes --> Static
    Upload --> SessionRoutes
    Review --> SessionRoutes
    Theme --> Local["Browser local storage"]
    Static --> Headers
    SessionRoutes --> Records
    SessionRoutes --> Images
    SessionRoutes --> Controls
    Controls --> Alarm
    SessionRoutes --> Analysis
    Analysis --> Proxy
    Proxy --> Model
```

The browser never receives model credentials. The cookie-selected room is the record and file boundary.

[System Architecture](../docs/04-system-architecture.md) · [Request Sequence](request-sequence.md) · [Documentation home](../README.md)

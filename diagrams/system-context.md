# System Context

H.A.N.D runs as a browser application and worker-backed session service. The AI boundary is external to application-controlled session storage.

```mermaid
flowchart TB
    User["User with handwritten notes"]
    Browser["Browser and device storage"]

    subgraph Hand["H.A.N.D application"]
        Web["React interface"]
        Worker["Cloudflare Worker"]
        Session["Isolated session room"]
    end

    subgraph Providers["External processing"]
        DeepSpace["DeepSpace platform and AI service"]
        Anthropic["Anthropic model"]
    end

    User --> Browser
    Browser --> Web
    Web --> Worker
    Worker --> Session
    Worker --> DeepSpace
    DeepSpace --> Anthropic
```

H.A.N.D controls application validation, prompts, scoring, and session records. DeepSpace and Anthropic control their respective infrastructure and provider processing.

[Architecture chapter](../docs/04-system-architecture.md) · [Data Boundaries](data-boundaries.md) · [Documentation home](../README.md)

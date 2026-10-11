# Data Boundaries

```mermaid
flowchart TB
    subgraph Device["User device"]
        Files["Original note files"]
        Preview["Temporary previews"]
        Preference["Theme preference"]
        Export["Downloaded exports"]
    end

    subgraph App["H.A.N.D controlled application data"]
        Cookie["Random session cookie"]
        Router["Session route layer"]
        RoomA["Session room A"]
        RoomB["Session room B"]
    end

    subgraph Provider["Provider-controlled processing"]
        DeepSpace["DeepSpace infrastructure and AI service"]
        Anthropic["Anthropic model processing"]
        Logs["Possible network, safety, and operational records"]
    end

    Files --> Preview
    Files --> Router
    Cookie --> Router
    Router --> RoomA
    Router -.->|different cookie| RoomB
    RoomA --> DeepSpace
    DeepSpace --> Anthropic
    DeepSpace --> Logs
    RoomA --> Export
```

Application cleanup deletes the selected room's records. It does not delete user exports or prove deletion from provider-controlled records. Session A cannot select Session B using an analysis id alone.

[Data Inventory](../docs/DATA_INVENTORY.md) · [Privacy and Security Review](../docs/PRIVACY_SECURITY_REVIEW.md) · [Documentation home](../README.md)

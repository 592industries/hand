# Reference Comparison and Scoring

```mermaid
flowchart TD
    Inputs["Transcription plus user reference"] --> Length{"At least 50 characters and 8 words?"}
    Length -->|"No"| NoScore["Unsuitable: score unavailable"]
    Length -->|"Yes"| Model["Model checks relation and substance"]
    Model -->|"Unsuitable"| NoScore
    Model -->|"Suitable"| Candidate["Candidate dimensions and evidence findings"]
    Candidate --> Validate["Validate score ranges and reference evidence"]
    Validate --> Review["Move weak findings to human review"]
    Review --> Technical{"Technical fidelity applies?"}
    Technical -->|"Yes"| Full["Weights: 40 percent, 35 percent, 25 percent"]
    Technical -->|"No"| Reduced["Renormalize coverage and agreement"]
    Full --> Round["Round deterministic overall score"]
    Reduced --> Round
    Round --> Store["Store breakdown, findings, and explanation"]
    Store --> Edit{"Transcription edited later?"}
    Edit -->|"Yes"| Stale["Mark comparison stale until rerun"]
    Edit -->|"No"| Current["Comparison remains current"]
```

The score measures correspondence with the supplied reference only.

[Scoring and Comparison](../docs/06-scoring-and-comparison.md) · [AI Accuracy Notice](https://hand.592industries.com/ai-disclaimer) · [Documentation home](../README.md)

# 02 — User Guide

[Documentation home](../README.md) · [Previous: Overview](01-overview.md) · [Next: Product Requirements](03-product-requirements.md)

## Start an analysis

1. Open [H.A.N.D](https://hand.592industries.com/). The root route opens **New analysis**.
2. Drop note images into the upload area or select it to choose **Upload files** or **Take photo**.
3. Add a title. Subject and topic are optional.
4. Optionally paste reference material or upload a `.txt`, `.md`, or `.markdown` file.
5. Select **Start analysis** and keep the page open while processing finishes.

### Image requirements

- JPG, PNG, or WebP.
- Up to six images.
- Up to 4 MB each and 14 MB combined.
- Width and height between 64 and 12,000 pixels.
- The file content must match its declared image type.

The browser checks these rules first. The server repeats the security-relevant checks.

### Reference requirements

Reference material is optional. A file can be plain text or Markdown and no larger than 1 MB. Server input allows up to 120,000 normalized characters. A very short or unrelated reference can be judged unsuitable, in which case H.A.N.D returns no score.

## Read the result

The review page includes an editable transcription, equations, uncertain passages, source-page previews, and comparison evidence when a suitable reference exists. Findings are grouped as omissions, discrepancies, unsupported additions, correctly represented concepts, and items needing human review.

Always compare important output with the source image.

## Correct and rerun

Edit the transcription and select **Save**. The original model output remains stored separately. If a comparison already exists, editing the transcription marks it stale. Select **Rerun comparison** to compare the corrected text with the same reference. A rerun consumes one AI call.

## Library and export

The Library searches title, subject, topic, or transcription; filters by subject or status; sorts by created or updated time; and reopens analyses. On an analysis page, **Markdown** and **JSON** create local downloads. Exports remain on the device after session deletion.

## Themes and session controls

Use the moon or sun button to switch themes. The choice is stored locally. In Settings, **Clear Session Data** deletes H.A.N.D application data in the current session after confirmation. It does not remove downloaded files or establish immediate provider-log deletion.

## Failures and recovery

| Situation | What to do |
|---|---|
| Image rejected | Use a supported image, reduce its size, or check that its content matches the type |
| Reference rejected | Use text or Markdown under 1 MB |
| AI request limit | Wait a few minutes before another analysis or rerun |
| Session analysis limit | Delete an existing analysis |
| Analysis failed | Retry with a clear image; delete the failed item when no longer needed |
| Stale comparison | Save corrections and rerun the comparison |
| Analysis not found | It was deleted, expired, or belongs to another browser session |

There is no account recovery. Do not upload material you are not authorized to process. See the [Privacy Policy](https://hand.592industries.com/privacy).

## Related documents

[Analysis Pipeline](05-analysis-pipeline.md) · [Scoring](06-scoring-and-comparison.md) · [Session and Privacy](07-session-and-privacy.md)

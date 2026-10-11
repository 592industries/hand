# 02 — User Guide

[Documentation home](../README.md) · [Previous: Overview](01-overview.md) · [Next: Product Requirements](03-product-requirements.md)

## Start an analysis

1. Open [H.A.N.D](https://hand.592industries.com/). The root route opens **New analysis**.
2. Drop note images into the upload area or select it to choose **Upload files** or **Take photo**.
3. Add a title. Subject and topic are optional.
4. Optionally paste reference material or upload a `.txt`, `.md`, or `.markdown` file.
5. Select **Start analysis**. The progress view reports preparation, transcription, comparison, and finalization while the session-backed job runs.

### Image requirements

- HEIC, JPEG, PNG, or WebP source files.
- Up to six images.
- Up to 8 MB per normalized image and 30 MB combined.
- Source files can be up to 40 MB; oversized images are resized or compressed in the browser, with PNG preferred when it preserves text detail efficiently.
- Normalized width and height are at least 64 pixels; processing limits oversized or extreme source dimensions.
- The file content must match its declared image type.

The browser verifies and decodes the source, converts HEIC, and creates AI-compatible JPEG or PNG data when needed. The server repeats the security-relevant checks, parses the normalized image header, and confirms that its actual dimensions match the request metadata.

### Reference requirements

Reference material is optional. A file can be plain text or Markdown and no larger than 1 MB. Server input allows up to 120,000 normalized characters. A very short or unrelated reference can be judged unsuitable, in which case H.A.N.D returns no score.

## Read the result

The review page includes an editable transcription, equations, uncertain passages, source-page previews, and comparison evidence when a suitable reference exists. Findings are grouped as omissions, discrepancies, unsupported additions, correctly represented concepts, and items needing human review. Every findings section starts collapsed; expand only the section or evidence item you want to inspect. Transcription headings, paragraphs, and nested lists use the same interface typeface with consistent spacing.

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
| Image rejected | Use HEIC, JPEG, PNG, or WebP; check that the content matches the type and that the source is no larger than 40 MB |
| Reference rejected | Use text or Markdown under 1 MB |
| AI request limit | Wait a few minutes before another analysis or rerun |
| Session analysis limit | Delete an existing analysis |
| Analysis failed | Retry with a clear image; delete the failed item when no longer needed |
| Stale comparison | Save corrections and rerun the comparison |
| Analysis not found | It was deleted, expired, or belongs to another browser session |

There is no account recovery. Do not upload material you are not authorized to process. See the [Privacy Policy](https://hand.592industries.com/privacy).

## Related documents

[Analysis Pipeline](05-analysis-pipeline.md) · [Scoring](06-scoring-and-comparison.md) · [Session and Privacy](07-session-and-privacy.md)

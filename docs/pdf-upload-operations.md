# PDF uploads and Gemini billing

Both `/api/parse-resume` (`file`) and `/api/amplify/parse` (`resume`) authenticate the user, accept PDFs up to 5 MB, and use the same extraction function.

Selectable-text PDFs are parsed locally with `pdf-parse`. Pages without text are rendered locally to distinguish blank pages from scans. Blank pages do not trigger a paid request. Scanned or mixed documents use Gemini when needed; an unavailable OCR service returns a safe 503 response instead of incomplete resume text. Empty, damaged, and password-protected documents receive a 422 response.

## Depleted prepaid credits (HTTP 402)

The error `Your prepayment credits are depleted` comes from Gemini billing. Retrying the request or changing the Gemini model does not replenish the balance. The app does not retry this failure or expose the provider's raw diagnostic to the uploader.

The account owner must check the project associated with the deployed `GEMINI_API_KEY` in [AI Studio](https://ai.studio/projects), restore its prepaid balance, and consider auto-reload to prevent exhaustion. Do not rotate keys as a billing workaround: keys on the same billing account share its balance. See [Google's billing documentation](https://ai.google.dev/gemini-api/docs/billing#prepay).

Restoring credits is still necessary for scanned-PDF extraction and other AI features. Code changes cannot restore account credit.

## Verification and rollout

Run `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm run test:pdf-build` before deployment. The regression tests generate real PDFs and cover local extraction without a key, blank pages, mixed scans, invalid documents, cleanup failures, provider failures, and both upload routes under HTTP 402. Provider requests are mocked; tests do not spend API credits or upload resume data. The build check verifies the dynamically loaded PDF workers are included in both deployment manifests.

Deploy the tested source to the environment showing the error. Local changes do not update an existing deployment. Keep `pdf-parse`, `pdfjs-dist`, and `@napi-rs/canvas` external in `next.config.ts`, and preserve the explicit `outputFileTracingIncludes` worker entries. Without them, Next's deployment manifests omit the dynamically imported worker, causing local extraction to fail in serverless deployments and fall through to Gemini.

After deploying, upload a selectable-text PDF (including one with a blank page) through the optimizer and the coach attachment flow. Confirm text and page count are returned. Test a scanned PDF separately after billing is restored. If raw Google URLs or `GoogleGenerativeAI Error` still reach the UI, check that the intended deployment is serving both API routes.

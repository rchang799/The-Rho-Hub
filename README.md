<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/84d4109c-6e55-48ca-98c7-3461ad93782f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Railway (backend)

1. In the Railway service → **Variables**, add:
   - `RAILPACK_INSTALL_CMD` = `npm install` (so install uses npm install instead of npm ci)
   - `GEMINI_API_KEY` = your Gemini API key
2. Optional: set `NO_CACHE=1` once to force a clean build, then remove it.
3. Start command is set in `railpack.json` to `npm run server`.

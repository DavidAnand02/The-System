# The System v3

A Solo Leveling inspired RPG system for real-life productivity.

## Deployment Instructions

### GitHub Pages
1. Go to your repository settings on GitHub.
2. Navigate to **Secrets and variables** > **Actions**.
3. Add a new repository secret:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
4. The included GitHub Action will automatically build and deploy the app to the `gh-pages` branch whenever you push to `main`.
5. In **Settings** > **Pages**, ensure the source is set to "Deploy from a branch" and select `gh-pages`.

### Vercel
1. Import your repository into Vercel.
2. In the project settings, add the following environment variable:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Vercel will automatically detect the Vite project and deploy it.

## Technical Notes
- Built with React 19, Vite, and Tailwind CSS 4.
- Uses a Global Proxy to handle `fetch` read-only errors in restricted environments.
- Standardized `src/` directory structure for better compatibility with CI/CD pipelines.

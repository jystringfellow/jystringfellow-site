# Jacob Stringfellow's Personal Website

A modern, responsive personal website built with Next.js 14, TypeScript, and Material UI.

## Features

- ⚡ Built with Next.js 14 (App Router)
- 🎨 Material UI v5 with custom theming
- 🌓 Light/Dark mode toggle
- 📱 Fully responsive design
- 🎯 TypeScript for type safety
- ✨ ESLint and Prettier for code quality
- 🚀 Optimized for Cloudflare Pages deployment

## Pages

- **Home**: Landing page with quick navigation cards
- **About**: Information about background and skills
- **Projects**: Portfolio showcase with project cards
- **Contact**: Contact form with validation (API route included)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jystringfellow/jystringfellow-site.git
cd jystringfellow-site
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment to Cloudflare Pages

This site is configured for static export and can be easily deployed to Cloudflare Pages.

### Option 1: Deploy via Cloudflare Dashboard

1. Push your code to GitHub
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to **Pages** → **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
6. Click **Save and Deploy**

### Option 2: Deploy via Wrangler CLI

1. Install Wrangler:

```bash
npm install -g wrangler
```

2. Log in to Cloudflare:

```bash
wrangler login
```

3. Build the site:

```bash
npm run build
```

4. Deploy:

```bash
wrangler pages deploy out
```

### Environment Variables

If you need environment variables for production:

1. Go to your Cloudflare Pages project settings
2. Navigate to **Settings** → **Environment variables**
3. Add your variables for production and preview environments

## Project Structure

```
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── api/
│   │   └── contact/
│   │       └── route.ts
│   ├── contact/
│   │   └── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── theme.ts
├── components/
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── ThemeProvider.tsx
├── next.config.js
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

## Customization

### Changing Theme Colors

Edit `app/theme.ts` to customize the color palette:

```typescript
export const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change this
    },
    // ... other colors
  },
});
```

### Adding New Pages

1. Create a new directory under `app/`
2. Add a `page.tsx` file
3. Update the navigation in `components/Header.tsx`

## Technologies Used

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: Material UI v5
- **Styling**: Emotion (CSS-in-JS)
- **Icons**: Material UI Icons
- **Linting**: ESLint
- **Formatting**: Prettier

## License

See [LICENSE](LICENSE) file for details.

## Contact

Jacob Stringfellow - [GitHub](https://github.com/jystringfellow)

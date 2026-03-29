# Jacob Stringfellow's Personal Website

A modern, responsive personal website built with Next.js 14, TypeScript, and Material UI.

## Features

- ⚡ Built with Next.js 14 (App Router)
- 🎨 Material UI v5 with custom theming
- 🌓 Light/Dark mode toggle
- 📱 Fully responsive design
- 🎯 TypeScript for type safety
- ✨ ESLint and Prettier for code quality
- 🚀 Deployed on Vercel with automatic deploys on push to `main`

## Pages

- **Home**: Landing page with quick navigation cards
- **About**: Information about background and skills
- **Projects**: Portfolio showcase with project cards
- **Contact**: Contact form powered by Resend

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jystringfellow/jystringfellow-site.git
cd jystringfellow-site
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the project root:

```
RESEND_API_KEY=your_resend_api_key
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Deployment

This site is deployed on [Vercel](https://vercel.com). Every push to `main` triggers an automatic deployment.

### Environment Variables

Add the following environment variable in your Vercel project settings:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) for contact form emails |

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
- **Email**: Resend
- **Linting**: ESLint
- **Formatting**: Prettier

## License

See [LICENSE](LICENSE) file for details.

## Contact

Jacob Stringfellow - [GitHub](https://github.com/jystringfellow) · [LinkedIn](https://www.linkedin.com/in/jacob-y-stringfellow/) · [contact@jystringfellow.com](mailto:contact@jystringfellow.com)

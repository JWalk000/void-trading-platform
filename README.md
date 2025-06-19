# VOID Trading Platform

A modern, AI-powered trading automation platform built with Next.js, React, and Tailwind CSS.

## Features

- 🧠 AI-powered trading automation
- 📊 Real-time market monitoring
- 🛡️ Built-in risk management
- 📱 Responsive design
- ⚡ Fast performance

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   └── EtherLandingPage.tsx
├── lib/                  # Utility functions
│   └── utils.ts
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

The landing page is fully customizable through:
- Tailwind CSS classes for styling
- Component props for functionality
- CSS variables for theming

## Deployment

This project can be deployed to:
- Vercel (recommended)
- Netlify
- Any static hosting service

## License

MIT License 
# Clerk Authentication Setup

## Installation

Install the Clerk package:

```bash
npm install @clerk/nextjs
```

## Environment Variables

Fill in the following environment variables in `.env.local`:

1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your Clerk Publishable Key (starts with `pk_`)
2. **CLERK_SECRET_KEY**: Your Clerk Secret Key (starts with `sk_`)

You can find these in your [Clerk Dashboard](https://dashboard.clerk.com) under **API Keys**.

## Google OAuth Configuration

To enable Google authentication:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication** → **Social Connections**
3. Enable **Google** as a social connection
4. Configure your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Clerk (Clerk will provide these)
   - Copy the Client ID and Client Secret to Clerk

## How It Works

- **Middleware**: All routes are protected by default except `/sign-in`, `/sign-up`, and `/api/webhooks`
- **API Routes**: All API routes are automatically protected by the middleware
- **User Button**: A user button appears in the top-right corner for profile management and sign-out

## Routes

- `/sign-in` - Sign in page (public)
- `/sign-up` - Sign up page (public)
- `/` - Main app (protected, requires authentication)

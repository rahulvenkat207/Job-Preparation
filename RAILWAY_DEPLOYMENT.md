# Railway Deployment Guide

This guide will help you deploy this Next.js application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. All your API keys and secrets ready

## Step 1: Create a New Project on Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (recommended) or "Empty Project"

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL service
4. The `DATABASE_URL` environment variable will be automatically added to your project

## Step 3: Connect Your Repository

If you haven't already:
1. In your Railway project, click "New"
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will automatically detect it's a Next.js app

## Step 4: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Environment Variables

```bash
# Database (automatically provided by Railway PostgreSQL service)
DATABASE_URL=postgres://...  # Auto-provided by Railway

# Arcjet
ARCJET_KEY=your_arcjet_key

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/

# Hume AI
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### How to Add Environment Variables

1. Go to your service in Railway
2. Click on the "Variables" tab
3. Click "New Variable"
4. Add each variable name and value
5. Click "Add"

## Step 5: Run Database Migrations

After deployment, you'll need to run database migrations. You can do this by:

1. Using Railway's CLI:
   ```bash
   railway run npm run db:push
   ```

2. Or add a one-time service in Railway:
   - Create a new service
   - Use the same environment variables
   - Run command: `npm run db:push`
   - Delete the service after migration completes

## Step 6: Deploy

1. Railway will automatically deploy when you push to your connected branch
2. Or manually trigger a deployment from the Railway dashboard
3. Wait for the build to complete
4. Your app will be available at the generated Railway URL

## Step 7: Configure Custom Domain (Optional)

1. In your Railway service, go to "Settings"
2. Click "Generate Domain" or "Add Custom Domain"
3. Follow the instructions to configure your domain

## Troubleshooting

### Build Fails

- Check the build logs in Railway dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

### Database Connection Issues

- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` is correctly set
- Check database credentials

### Application Errors

- Check application logs in Railway dashboard
- Verify all API keys are correct
- Ensure environment variables are properly set

## Notes

- Railway automatically detects Next.js applications
- The `Procfile` and `railway.json` are included for explicit configuration
- Database migrations need to be run manually after first deployment
- Railway provides automatic HTTPS for your application

## Support

For Railway-specific issues, check:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)


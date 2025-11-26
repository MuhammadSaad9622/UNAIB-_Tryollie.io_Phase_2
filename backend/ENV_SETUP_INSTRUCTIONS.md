# Environment Setup Instructions

## Required Environment Variables

Create a `.env` file in the server directory with the following variables:

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/ai-sales-assistant
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sales-assistant
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### Server Configuration
```env
PORT=3002
NODE_ENV=development
```

### AI Services Configuration

#### OpenAI (Required for AI Suggestions)
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

#### Deepgram (Recommended for Speech-to-Text)
```env
DEEPGRAM_API_KEY=your-deepgram-api-key-here
DEEPGRAM_MODEL=nova-2
DEEPGRAM_LANGUAGE=en-US
```

#### AssemblyAI (Alternative Speech-to-Text)
```env
ASSEMBLYAI_API_KEY=your-assemblyai-api-key-here
```

### Transcription Configuration
```env
TRANSCRIPTION_PROVIDER=deepgram
TRANSCRIPTION_MODEL=deepgram
TRANSCRIPTION_LANGUAGE=en-US
AI_CONFIDENCE_THRESHOLD=0.8
AI_SUGGESTION_INTERVAL=30000
```

### Zoom SDK Configuration
```env
ZOOM_CLIENT_ID=your-zoom-client-id-here
ZOOM_CLIENT_SECRET=your-zoom-client-secret-here
ZOOM_SDK_KEY=your-zoom-sdk-key-here
ZOOM_SDK_SECRET=your-zoom-sdk-secret-here
ZOOM_WEBHOOK_SECRET=your-zoom-webhook-secret-here

# Zoom OAuth Scopes (optional)
# Leave empty to use app's default scopes configured in Zoom Marketplace
# Or specify space-separated scopes like: "meeting:write user:read"
ZOOM_OAUTH_SCOPES=
```

### Google Meet Configuration
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### Stripe Billing Configuration
```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Plan Prices (optional - defaults shown if not set)
PLAN_BASIC_PRICE=10
PLAN_STANDARD_PRICE=20
PLAN_PREMIUM_PRICE=30

# Plan Call Limits (optional - defaults shown if not set)
PLAN_BASIC_CALLS=15
PLAN_STANDARD_CALLS=25
PLAN_PREMIUM_CALLS=50

# Stripe Price IDs (create products in Stripe Dashboard, then copy Price IDs here)
# These are required for checkout to work
STRIPE_PRICE_ID_BASIC=price_your-basic-price-id-here
STRIPE_PRICE_ID_STANDARD=price_your-standard-price-id-here
STRIPE_PRICE_ID_PREMIUM=price_your-premium-price-id-here
```

### Frontend Configuration (Vite Environment Variables)
```env
# API Configuration
VITE_API_URL=http://localhost:3002

# Zoom SDK Configuration
VITE_ZOOM_SDK_KEY=your-zoom-sdk-key-here

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### Security & Performance
```env
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10000
```

## API Key Setup Instructions

### 1. OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add to your `.env` file

### 2. Deepgram API Key (Recommended)
1. Visit [Deepgram Console](https://console.deepgram.com/)
2. Create an account or sign in
3. Create a new project
4. Generate an API key
5. Copy the key and add to your `.env` file

### 3. Zoom OAuth App Setup (Required for User Account Connection)

**IMPORTANT:** You need to create a **regular OAuth app** (NOT Server-to-Server OAuth) for users to connect their accounts.

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click "Develop" → "Build App"
4. Choose **"OAuth"** type (NOT Server-to-Server OAuth)
5. Fill in app information:
   - App Name: Your app name
   - Company Name: Your company
   - Developer Contact: Your email
6. In **"Redirect URL for OAuth"**, add:
   - For development: `http://localhost:3002/api/zoom/callback`
   - For production: `https://your-domain.com/api/zoom/callback`
   - **CRITICAL:** The redirect URI must match EXACTLY (including http/https, port, and path)
7. Add required scopes (or leave empty to use app defaults):
   - `meeting:write` - Create and manage meetings
   - `user:read` - Read user information
8. **For Unpublished Apps:**
   - Go to "App Management" → "Development"
   - Add user emails to "Allowed Users" list (users must be added here to connect)
   - The app must be in "Development" status
9. Get your **Client ID** and **Client Secret** from the app credentials page
10. Add to your `.env` file:
    ```env
    ZOOM_CLIENT_ID=your-client-id-here
    ZOOM_CLIENT_SECRET=your-client-secret-here
    ```

**Troubleshooting:**
- If you get "app is not there" error: Make sure the user's email is added to "Allowed Users" in your Zoom app settings
- If you get "invalid_redirect_uri" error: The redirect URI in your Zoom app must match exactly: `http://localhost:3002/api/zoom/callback` (for dev) or `https://your-domain.com/api/zoom/callback` (for prod)
- If you get "unsupported_grant_type" error: You created a Server-to-Server OAuth app instead of a regular OAuth app. Create a new OAuth app.

### 4. Zoom SDK Setup (Optional - for RTMS transcription)
1. In the same Zoom Marketplace, you can also create an SDK App for RTMS features
2. Get your SDK Key and Secret
3. Add webhook endpoint: `http://your-domain.com/api/meetings/zoom/webhook`
4. Add credentials to your `.env` file:
   ```env
   ZOOM_SDK_KEY=your-sdk-key-here
   ZOOM_SDK_SECRET=your-sdk-secret-here
   ```

### 5. Google Meet Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3002/api/meetings/google/callback`
6. Add credentials to your `.env` file

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   - Copy the example above
   - Fill in your actual API keys
   - Save as `.env` in the server directory

3. **Start the Application**
   ```bash
   npm run dev
   ```

## Feature Configuration

### Transcription Provider Selection
The application supports multiple transcription providers:

- **Deepgram** (Recommended): Best accuracy and real-time performance
- **AssemblyAI**: Good accuracy with additional features
- **OpenAI Whisper**: Fallback option

Set `TRANSCRIPTION_PROVIDER=deepgram` in your `.env` file to use Deepgram.

### AI Suggestion Frequency
Control how often AI suggestions are generated:
```env
AI_SUGGESTION_INTERVAL=30000  # 30 seconds
```

### Confidence Threshold
Set the minimum confidence for AI suggestions:
```env
AI_CONFIDENCE_THRESHOLD=0.8  # 80% confidence
```

## Troubleshooting

### Common Issues

1. **"AI suggestions unavailable"**
   - Check your OpenAI API key is correct
   - Ensure you have sufficient OpenAI credits

2. **"Transcription failed"**
   - Verify your Deepgram API key
   - Check your internet connection
   - Ensure microphone permissions are granted

3. **"Zoom SDK not loaded"**
   - Check your Zoom SDK credentials
   - Ensure you're using HTTPS in production
   - Verify webhook endpoints are accessible

4. **"WebSocket connection failed"**
   - Check if the server is running on port 3002
   - Verify CORS settings
   - Check firewall settings

5. **"process is not defined" error**
   - Ensure you're using `VITE_` prefix for frontend environment variables
   - Check that `.env` file is in the server directory
   - Restart the development server after changing environment variables

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
VITE_ENABLE_DEBUG=true
```

## Production Deployment

For production deployment, ensure:

1. **HTTPS is enabled** (required for Zoom SDK)
2. **Environment variables are properly set**
3. **Database is accessible**
4. **Webhook endpoints are publicly accessible**
5. **Rate limiting is configured appropriately**

### Example Production .env
```env
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sales-assistant
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=sk-your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
ZOOM_SDK_KEY=your-zoom-sdk-key
ZOOM_SDK_SECRET=your-zoom-sdk-secret
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com
VITE_ZOOM_SDK_KEY=your-zoom-sdk-key
```

## File Location

**Important**: The `.env` file should be placed in the `server/` directory, not the root directory. This is where the backend server runs and where it will look for environment variables.

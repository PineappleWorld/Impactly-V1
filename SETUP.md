# Impactly Setup Guide

## ⚠️ CRITICAL: Database Setup Required FIRST

**MUST BE DONE BEFORE ANYTHING ELSE**

The application requires database tables to be created. Follow these steps exactly:

### Database Initialization

1. Go to [Your Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the ENTIRE contents of `/supabase/migrations/20251008000000_create_nonprofits_cache.sql`
6. Click **RUN** at the bottom right
7. Wait for "Success. No rows returned" message

**Without this step, the Partners page will show "Database not initialized" error.**

## Step 1: Access Admin Dashboard

1. Go to `/admin/login`
2. Create an admin account or login with existing credentials
3. Navigate to the Settings tab

## Step 2: Configure Reloadly (Gift Cards API)

**Required for marketplace to work**

1. Get Reloadly credentials:
   - Sign up at https://www.reloadly.com/
   - Go to Dashboard → API Settings
   - Copy your Client ID and Client Secret

2. In Admin Dashboard Settings, add:
   - Key: `reloadly_client_id` → Value: `your_client_id`
   - Key: `reloadly_client_secret` → Value: `your_client_secret`

**Without these, marketplace will show error: "Gift card provider credentials not configured"**

## Step 3: Configure Every.org (Nonprofits API)

**Required for partners page to work**

1. Get Every.org API key:
   - Sign up at https://www.every.org/
   - Contact them to get API access
   - Get your API key

2. In Admin Dashboard Settings, add:
   - Key: `every_org_api_key` → Value: `your_api_key`

**Without this, partners page will show error: "Every.org API key not configured"**

## Step 4: Configure Google OAuth (Optional)

**Required for "Sign in with Google" to work**

### Part A: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add Authorized redirect URI:
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   ```
8. Copy the **Client ID** and **Client Secret**

### Part B: Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and toggle it **Enabled**
5. Enter your Google Client ID
6. Enter your Google Client Secret
7. Click **Save**

### Part C: Add to Admin Settings

In Admin Dashboard Settings, add:
- Key: `google_oauth_client_id` → Value: `your_google_client_id`
- Key: `google_oauth_client_secret` → Value: `your_google_client_secret`

## Step 5: Configure Pricing & Profit Settings

In Admin Dashboard Settings, configure:

1. **Markup Percentage** (default: 5)
   - Key: `markup_percentage` → Value: `5`
   - This is the profit margin on gift cards

2. **Profit Split** (default: 50/50)
   - Key: `profit_split_company` → Value: `50`
   - Key: `profit_split_charity` → Value: `50`

3. **Impact Tickets Multiplier** (default: 10)
   - Key: `impact_tickets_multiplier` → Value: `10`
   - Users get this many tickets per dollar of charity contribution

## Troubleshooting

### Marketplace shows no products
- **Cause**: Reloadly credentials not configured
- **Fix**: Add `reloadly_client_id` and `reloadly_client_secret` in admin settings

### Partners page shows no nonprofits
- **Cause**: Every.org API key not configured
- **Fix**: Add `every_org_api_key` in admin settings

### Country filter is empty
- **Cause**: No products loaded (see above)
- **Fix**: Configure Reloadly credentials first

### Google sign-in gives 404 error
- **Cause 1**: Google OAuth not configured in Supabase dashboard
- **Cause 2**: Wrong redirect URI in Google Cloud Console
- **Fix**: Follow Step 4 exactly, especially the redirect URI

### "Purchase" button does nothing
- **Cause**: Purchase flow not implemented yet
- **Note**: This requires Stripe integration (separate setup needed)

## Testing the Setup

After configuration:

1. **Test Marketplace**:
   - Go to `/marketplace`
   - Should see hundreds/thousands of gift cards
   - Search for "Starbucks" should find results
   - Country dropdown should show many countries

2. **Test Partners**:
   - Go to `/charities`
   - Should see 100+ nonprofit organizations
   - Category filter should work
   - Search should find organizations

3. **Test Google OAuth**:
   - Go to `/auth`
   - Click "Continue with Google"
   - Should redirect to Google sign-in (not 404)

## Support

If you continue to see errors after following this guide:
1. Check browser console for specific error messages
2. Check that all settings keys are spelled exactly as shown
3. Verify API credentials are valid (not expired/revoked)
4. Contact support with the specific error message

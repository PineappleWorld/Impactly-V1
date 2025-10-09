# Database Setup - REQUIRED STEPS

## Step 1: Add Service Role Key to .env (CRITICAL)

The application needs your Supabase service role key to create database tables and sync data.

### Get Your Service Role Key

1. Go to https://supabase.com/dashboard/project/avbgyrhcixcyplqtysht/settings/api
2. Scroll down to "Project API keys" section
3. Find the **service_role** key (secret, NOT the anon public key)
4. Click the copy icon to copy it

### Add to .env File

1. Open your `.env` file in the project root
2. Find the line: `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`
3. Replace `your_service_role_key_here` with your actual key:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_long_key
   ```
4. Save the file
5. Restart your development server

## Step 2: Run Database Sync

Once the service role key is added:

1. Go to `/admin/dashboard` in your browser
2. Click the **"Data Sync"** tab
3. Click **"Start Full Sync"** button
4. Wait 5-10 minutes for the sync to complete

The sync will:
- Automatically create the required database tables
- Download all nonprofit organizations from Every.org
- Store them in your local database for fast access

## Step 3: Verify

After sync completes:
- Go to `/charities` page
- Should load instantly with all organizations
- Try filtering by category
- Try searching for organizations

## Troubleshooting

### "Database not initialized" error
- Add the service role key to .env first (Step 1)
- Make sure you copied the **service_role** key, not the anon key
- Restart your server after adding the key

### "Failed to sync" error
- Check that Every.org API key is configured in admin settings
- Verify the API key is valid at https://www.every.org

### Still having issues?
- Check browser console for errors
- Verify .env file has no extra spaces or line breaks
- Make sure you saved the .env file after editing

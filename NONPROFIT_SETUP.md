# Nonprofit Partners Setup Guide

## Overview
This guide will help you populate the nonprofit partners page with organizations from Every.org.

## Problem Resolved
The partners page was showing no organizations because the database cache was empty. This has been fixed with:
- Enhanced sync process with better error handling
- Live API fallback when cache is empty
- Test endpoint to validate API configuration
- Improved error messages and user guidance

## Quick Start

### Step 1: Verify API Connection
1. Navigate to `/admin/login` and log in to the admin dashboard
2. Go to the "Nonprofit Database Sync" section
3. Click **"Test API Connection"** button
4. Review the test results:
   - ✅ All checks should pass
   - If cache is empty, you'll see a recommendation to sync

### Step 2: Run Initial Sync
1. After successful test, click **"Start Full Sync"**
2. Wait for the sync to complete (may take 2-5 minutes)
3. You'll see progress by category:
   - animals
   - culture
   - education
   - environment
   - health
   - humans
   - research

### Step 3: Verify Data
1. Navigate to `/charities` to see the partners page
2. Organizations should now be displayed
3. You can filter by category and search by name

## API Endpoints

### Test Endpoint
```
GET /api/nonprofits/test
```
Tests the Every.org API connection and validates configuration.

### Sync Endpoint
```
POST /api/nonprofits/sync
```
Fetches all nonprofits from Every.org and stores them in the database cache.

### Nonprofits Endpoint
```
GET /api/nonprofits?cause={category}&page=1&perPage=100000
```
Retrieves nonprofits from cache. If cache is empty, falls back to live API.

## Troubleshooting

### "Forbidden" Error
- Check that the Every.org API key is valid
- Ensure the API key has proper permissions
- Verify the key is stored correctly in `app_settings` table with key `every_org_api_key`

### Empty Cache
- The page will show a helpful error message with setup instructions
- Live API fallback will attempt to load data automatically
- Follow the setup instructions to populate the cache

### Sync Failures
- Check the category results in sync response
- Some categories may fail while others succeed
- Review console logs for detailed error messages
- Ensure database has proper permissions for upsert operations

## Database Tables

### nonprofits_cache
Stores cached nonprofit data for fast access:
- `nonprofit_slug` - Unique identifier
- `name` - Organization name
- `description` - Organization description
- `category` - Category (animals, culture, education, etc.)
- `logo_url`, `cover_image_url` - Images
- `location_address` - Physical address

### sync_status
Tracks sync operations:
- `sync_type` - Type of sync (nonprofits_full)
- `status` - in_progress, completed, failed
- `total_records` - Number of records synced
- `error_message` - Error if sync failed

## Features Added

1. **API Test Endpoint**: Validates configuration before sync
2. **Enhanced Logging**: Detailed console logs for debugging
3. **Live API Fallback**: Automatic fallback when cache is empty
4. **Better Error Messages**: User-friendly guidance for setup
5. **Category Tracking**: See which categories succeeded/failed
6. **Partial Success**: Sync continues even if some categories fail

## Maintenance

### Regular Sync
Run the sync process weekly or monthly to keep data fresh:
```bash
POST /api/nonprofits/sync
```

### Cache Status
Check cache status anytime:
```bash
GET /api/nonprofits/test
```

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Review server logs for sync process details
3. Use the test endpoint to diagnose API issues
4. Ensure all database migrations are applied
5. Verify environment variables are set correctly

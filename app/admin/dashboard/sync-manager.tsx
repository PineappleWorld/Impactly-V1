'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function SyncManager() {
  const [syncing, setSyncing] = useState(false);
  const [testSyncing, setTestSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
    totalSynced?: number;
    details?: string;
    migrationNeeded?: boolean;
    categoryResults?: any[];
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/nonprofits/test');
      const data = await response.json();
      setTestResults(data);
    } catch (error: any) {
      setTestResults({
        overall: 'error',
        message: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSimpleSync = async () => {
    setTestSyncing(true);
    setSyncStatus(null);

    try {
      const response = await fetch('/api/nonprofits/sync-simple', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus({
          success: true,
          message: data.message || 'Simple sync completed',
          totalSynced: data.recordCount,
          details: `Category: ${data.category}, Time: ${data.elapsed}`,
        });
      } else {
        setSyncStatus({
          success: false,
          message: data.error || 'Simple sync failed',
          details: data.details || `Status: ${response.status}`,
        });
      }
    } catch (error: any) {
      setSyncStatus({
        success: false,
        message: 'Simple sync failed',
        details: error.message || 'Network error',
      });
    } finally {
      setTestSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch('/api/nonprofits/sync?force=true', {
        method: 'POST',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${errorText}` };
        }

        setSyncStatus({
          success: false,
          message: errorData.error || 'Failed to sync',
          details: errorData.details || errorData.suggestion || `Status: ${response.status}`,
          migrationNeeded: errorData.migrationNeeded,
        });
        return;
      }

      const data = await response.json();

      setSyncStatus({
        success: true,
        message: data.message,
        totalSynced: data.totalSynced,
        categoryResults: data.categoryResults,
      });

    } catch (error: any) {
      console.error('Sync error:', error);

      let errorMessage = 'Failed to sync';
      let errorDetails = '';

      if (error.name === 'AbortError') {
        errorMessage = 'Sync request timed out after 5 minutes';
        errorDetails = 'The sync is taking too long. This might be due to network issues or a large amount of data. Try again or check server logs.';
      } else if (error.message === 'Failed to fetch') {
        errorMessage = 'Network error';
        errorDetails = 'Could not connect to the sync endpoint. Check your internet connection and ensure the server is running.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
        errorDetails = error.stack || '';
      }

      setSyncStatus({
        success: false,
        message: errorMessage,
        details: errorDetails,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Nonprofit Database Sync
        </CardTitle>
        <CardDescription>
          Sync all nonprofit organizations from Every.org to the local database cache.
          This improves page load performance by storing data locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleTest}
            disabled={testing || syncing || testSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Test API
              </>
            )}
          </Button>

          <Button
            onClick={handleSimpleSync}
            disabled={syncing || testing || testSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {testSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Quick Test (10 records)
              </>
            )}
          </Button>

          <Button
            onClick={handleSync}
            disabled={syncing || testing || testSyncing}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Full Sync (All Categories)
              </>
            )}
          </Button>

          {(syncing || testSyncing) && (
            <p className="text-sm text-slate-600">
              {syncing ? 'This may take several minutes. Please wait...' : 'Testing sync with 10 records...'}
            </p>
          )}
        </div>

        {testResults && (
          <div
            className={`p-4 rounded-lg border ${
              testResults.overall === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {testResults.overall === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p
                className={`font-medium ${
                  testResults.overall === 'success' ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {testResults.overall === 'success' ? 'API Connection Test Passed' : 'API Connection Test Failed'}
              </p>
            </div>
            {testResults.message && (
              <p className="text-sm mb-2">{testResults.message}</p>
            )}
            {testResults.recommendation && (
              <p className="text-sm font-medium text-orange-800 bg-orange-50 p-2 rounded mt-2">
                {testResults.recommendation}
              </p>
            )}
            {testResults.steps && (
              <div className="mt-3 space-y-2">
                {testResults.steps.map((step: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium">Step {step.step}:</span>{' '}
                    <span className={step.status === 'error' ? 'text-red-700' : 'text-green-700'}>
                      {step.message || step.description}
                    </span>
                    {step.cachedRecords !== undefined && (
                      <span className="ml-2 text-slate-600">({step.cachedRecords} records in cache)</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {syncStatus && (
          <div
            className={`p-4 rounded-lg border ${
              syncStatus.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {syncStatus.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <p
                className={`font-medium ${
                  syncStatus.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {syncStatus.success ? 'Success' : 'Error'}
              </p>
            </div>
            <p
              className={`text-sm ${
                syncStatus.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {syncStatus.message}
            </p>
            {syncStatus.details && (
              <p className="text-sm text-red-700 mt-2 font-mono bg-red-100 p-2 rounded">
                {syncStatus.details}
              </p>
            )}
            {syncStatus.totalSynced && (
              <p className="text-sm text-green-700 mt-1">
                Total organizations synced: {syncStatus.totalSynced.toLocaleString()}
              </p>
            )}
            {syncStatus.categoryResults && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-green-800">Category Results:</p>
                {syncStatus.categoryResults.map((cat: any, idx: number) => (
                  <div key={idx} className="text-xs text-green-700 ml-3">
                    {cat.category}: {cat.status === 'success' ? `✅ ${cat.recordsSynced} records` : `❌ ${cat.error}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <h4 className="font-medium text-sm text-blue-900 mb-2">📋 Setup Instructions:</h4>
          <p className="text-sm text-blue-800 mb-3">
            Copy this SQL and run it in your Supabase SQL Editor:
          </p>
          <div className="bg-white p-3 rounded border border-blue-200 mb-3 max-h-48 overflow-auto">
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">
{`CREATE TABLE IF NOT EXISTS nonprofits_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonprofit_slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  cover_image_url text DEFAULT '',
  website_url text DEFAULT '',
  ein text DEFAULT '',
  primary_slug text DEFAULT '',
  location_address text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  data_source text DEFAULT 'everyorg'
);

CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_category ON nonprofits_cache(category);
CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_slug ON nonprofits_cache(nonprofit_slug);
CREATE INDEX IF NOT EXISTS idx_nonprofits_cache_name ON nonprofits_cache(name);

CREATE TABLE IF NOT EXISTS sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type text NOT NULL,
  category text,
  status text DEFAULT 'in_progress',
  total_records integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_sync_status_type ON sync_status(sync_type, started_at DESC);

ALTER TABLE nonprofits_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nonprofits"
  ON nonprofits_cache FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert nonprofits"
  ON nonprofits_cache FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update nonprofits"
  ON nonprofits_cache FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete nonprofits"
  ON nonprofits_cache FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read sync status"
  ON sync_status FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sync status"
  ON sync_status FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );`}
            </pre>
          </div>
          <Button
            onClick={() => {
              const sql = document.querySelector('pre')?.textContent || '';
              navigator.clipboard.writeText(sql);
              alert('SQL copied to clipboard!');
            }}
            variant="outline"
            size="sm"
            className="mb-2"
          >
            Copy SQL to Clipboard
          </Button>
          <p className="text-xs text-blue-700">
            Then paste and run in: Database → SQL Editor (in your Supabase dashboard sidebar)
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-sm text-slate-900 mb-2">How it works:</h4>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Fetches all nonprofits from Every.org API across all categories</li>
            <li>Stores data in local Supabase database for fast access</li>
            <li>Automatically skips if data was synced within 24 hours</li>
            <li>Use force sync to update data regardless of last sync time</li>
            <li>Recommended: Run sync weekly or when you need fresh data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

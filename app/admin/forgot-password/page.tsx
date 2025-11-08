'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRateLimitError(false);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Check if user is an admin before sending reset email
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setError('An error occurred. Please try again later.');
        setLoading(false);
        return;
      }

      if (!adminData) {
        // Don't reveal if email doesn't exist for security
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Use Supabase's built-in password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        
        // Check for rate limiting
        if (resetError.message.includes('rate limit') || resetError.message.includes('too many')) {
          setRateLimitError(true);
          setError('Too many password reset requests. Please try again in a few minutes.');
        } else {
          setError('Failed to send password reset email. Please try again later.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Sparkles className="w-10 h-10 text-emerald-600" />
          <span className="text-3xl font-bold text-slate-900 tracking-tight">Impactly</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-emerald-600" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your admin email address and we&apos;ll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <Mail className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Check Your Email</h3>
                <p className="text-slate-600 mb-6">
                  If an admin account exists with this email, we&apos;ve sent a password reset link. 
                  Please check your inbox and follow the instructions.
                </p>
                <div className="space-y-3">
                  <Link href="/admin/login" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    Send Another Reset Email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@impactly.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className={`text-sm ${rateLimitError ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'} p-3 rounded-lg`}>
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <Link href="/admin/login" className="block">
                  <Button variant="ghost" className="w-full" disabled={loading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

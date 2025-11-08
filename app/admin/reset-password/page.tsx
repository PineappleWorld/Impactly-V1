'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setTokenValid(false);
          setValidatingToken(false);
          return;
        }

        setTokenValid(true);
      } catch (err) {
        console.error('Error validating session:', err);
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateSession();
  }, []);

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(`Password must contain: ${passwordValidation.errors.join(', ')}`);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError('Failed to reset password. Please try again or request a new reset link.');
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);
  const passwordStrength = password.length > 0 ? (
    <div className="space-y-1 mt-2">
      <div className="text-xs text-slate-600">Password strength:</div>
      <div className="space-y-1">
        {[
          { label: 'At least 8 characters', valid: password.length >= 8 },
          { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
          { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
          { label: 'One number', valid: /[0-9]/.test(password) },
        ].map((req, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${req.valid ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className={req.valid ? 'text-emerald-600' : 'text-slate-500'}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

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
              <Lock className="w-6 h-6 text-emerald-600" />
              Set New Password
            </CardTitle>
            <CardDescription>
              Choose a strong password for your admin account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validatingToken ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
                <p className="text-slate-600">Validating reset link...</p>
              </div>
            ) : !tokenValid ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Invalid or Expired Link</h3>
                <p className="text-slate-600 mb-6">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link href="/admin/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Password Reset Successful!</h3>
                <p className="text-slate-600 mb-6">
                  Your password has been successfully reset. Redirecting to sign in...
                </p>
                <Link href="/admin/login">
                  <Button className="w-full">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordStrength}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading || !passwordValidation.valid}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

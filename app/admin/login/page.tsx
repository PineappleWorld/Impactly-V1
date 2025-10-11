'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader as Loader2, UserPlus, CircleCheck as CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkIfAdminExists();
  }, []);

  const checkIfAdminExists = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setAdminExists(true);
      }
    } catch (err) {
      console.error('Error checking admin users:', err);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError('Failed to sign in');
        setLoading(false);
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error('Admin check error:', adminError);
        setError(`Error verifying admin status: ${adminError.message}`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!adminData) {
        setError('You do not have admin privileges');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setSignupError(null);
  setSignupLoading(true);

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });

    if (signUpError) {
      setSignupError(signUpError.message);
      setSignupLoading(false);
      return;
    }

    if (!signUpData.user) {
      setSignupError('Failed to create user account');
      setSignupLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: signUpData.user.id,
        email: signupEmail,
        role: 'superadmin'
      });

    if (insertError) {
      console.error('Admin insert error:', insertError);
      setSignupError(`Failed to set admin role. Error: ${insertError.message}`);
      setSignupLoading(false);
      return;
    }

    await supabase.auth.signInWithPassword({
      email: signupEmail,
      password: signupPassword,
    });

    setSignupSuccess(true);
    setAdminExists(true);

    setTimeout(() => {
      setEmail(signupEmail);
      setPassword(signupPassword);
      setSignupSuccess(false);
    }, 3000);

  } catch (err) {
    console.error('Signup error:', err);
    setSignupError('An unexpected error occurred during signup');
  } finally {
    setSignupLoading(false);
  }
};
    } catch (err) {
      setSignupError('An unexpected error occurred');
      console.error(err);
    } finally {
      setSignupLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 hover:opacity-80 transition-opacity">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Impactly</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Sign in to manage your Impactly platform</p>
        </div>

        {!adminExists && (
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <UserPlus className="w-5 h-5" />
                First Time Setup
              </CardTitle>
              <CardDescription className="text-green-800">
                No admin exists yet. Create your first admin account below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signupSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-900 font-semibold mb-2">Admin account created!</p>
                  <p className="text-sm text-green-800">You can now login with your credentials below.</p>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Admin Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Admin Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      className="rounded-xl"
                    />
                    <p className="text-xs text-green-700">Minimum 6 characters</p>
                  </div>

                  {signupError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {signupError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating admin account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@impactly.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { auth } from '@/app/lib/firebase/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { db } from '@/app/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (!user) throw new Error('No user after sign in');

      // 🔎 Get role from Firestore: members/{uid}
      const ref = doc(db, 'members', user.uid);
      const snap = await getDoc(ref);
      const role = snap.exists() ? snap.data().role || 'member' : 'member';

      // 🍪 Set cookies for middleware
      document.cookie = `logged_in=true; path=/;`;
      document.cookie = `role=${role}; path=/;`;

      // 🔁 Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push(`/member/profile/${user.uid}`);
      }
    } catch (err) {
      console.error(err);
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Invalid email or password.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (providerName) => {
    setError('');
    setLoading(true);

    try {
      const provider =
        providerName === 'google'
          ? new GoogleAuthProvider()
          : new GithubAuthProvider();

      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔎 Get role from Firestore
      const ref = doc(db, 'members', user.uid);
      const snap = await getDoc(ref);
      const role = snap.exists() ? snap.data().role || 'member' : 'member';

      // 🍪 Set cookies for middleware
      document.cookie = `logged_in=true; path=/;`;
      document.cookie = `role=${role}; path=/;`;

      // 🔁 Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push(`/member/profile/${user.uid}`);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center mt-15">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-primary/20 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute w-96 h-96 top-1/4 -right-48 bg-accent/20 rounded-full blur-3xl animate-float-gentle [animation-delay:2s]" />
        <div className="absolute w-96 h-96 -bottom-48 left-1/3 bg-secondary/20 rounded-full blur-3xl animate-float-gentle [animation-delay:4s]" />
      </div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(to right, oklch(0.68 0.24 192) 1px, transparent 1px),
                           linear-gradient(to bottom, oklch(0.68 0.24 192) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-8 text-foreground/70 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-primary via-accent to-secondary rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">HQ</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your HQCC account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@hofstra.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border accent-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-accent transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-primary via-accent to-secondary hover:opacity-90 text-white font-medium text-base transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?
            </span>{' '}
            <Link
              href="/signup"
              className="text-primary hover:text-accent font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

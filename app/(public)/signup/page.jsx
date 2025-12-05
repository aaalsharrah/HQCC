'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { auth, db } from '@/app/lib/firebase/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createProfileDoc = async (user, name) => {
    const username =
      user.email
        ?.split('@')[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'member';

    await setDoc(doc(db, 'profiles', user.uid), {
      uid: user.uid,
      name: name || username,
      email: user.email,
      username,
      bio: '',
      location: '',
      website: '',
      avatar: user.photoURL || null,
      coverImage: null,
      createdAt: serverTimestamp(),
    });
  };

  const createMemberDoc = async (user, name) => {
    const username =
      user.email
        ?.split('@')[0]
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'member';

    await setDoc(doc(db, 'members', user.uid), {
      uid: user.uid,
      name: name || username,
      email: user.email,
      role: 'member', // 🔥 default role
      createdAt: serverTimestamp(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { email, password, name } = formData;

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCred.user, {
        displayName: name,
      });

      // 🔹 Create both profile + member docs
      await createProfileDoc(userCred.user, name);
      await createMemberDoc(userCred.user, name);

      // 🔹 Set cookies so middleware considers them logged in
      document.cookie = `logged_in=true; path=/;`;
      document.cookie = `role=member; path=/;`;

      // 🔁 Redirect to their profile or timeline
      router.push(`/member/profile/${userCred.user.uid}`);
      // or: router.push('/member/timeline');
    } catch (err) {
      console.error(err);

      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Try signing in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignUp = async (providerName) => {
    setError('');
    setLoading(true);

    try {
      const provider =
        providerName === 'google'
          ? new GoogleAuthProvider()
          : new GithubAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create docs if they don't exist
      await createProfileDoc(user, user.displayName);
      await createMemberDoc(user, user.displayName);

      // Set cookies for middleware
      document.cookie = `logged_in=true; path=/;`;
      document.cookie = `role=member; path=/;`;

      router.push(`/member/profile/${user.uid}`);
      // or: router.push('/member/timeline');
    } catch (err) {
      console.error(err);
      setError('Failed to sign up with provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center mt-15 py-12">
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
              Join HQCC
            </h1>
            <p className="text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

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
                  name="email"
                  type="email"
                  placeholder="your.email@hofstra.edu"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm Password
              </Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border focus:border-primary transition-colors"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-border accent-primary"
                required
              />
              <label className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a
                  href="#"
                  className="text-primary hover:text-accent transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#"
                  className="text-primary hover:text-accent transition-colors"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-primary via-accent to-secondary hover:opacity-90 text-white font-medium text-base transition-all disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link
              href="/signin"
              className="text-primary hover:text-accent font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

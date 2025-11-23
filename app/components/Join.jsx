'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  QrCode,
  Users,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';

import { useAuth } from '@/lib/firebase/auth-context';
import { saveMemberProfile } from '@/lib/firebase/db';

export function Join() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    year: '',
    major: '',
  });
  const [mode, setMode] = useState('signup');
  const [status, setStatus] = useState({ type: null, message: '', flow: null });
  const { user, loading, error, signUp, signIn } = useAuth();

  const isSignup = mode === 'signup';
  const displayedError = status.type === 'error' ? status.message : error;
  const showSuccess = status.type === 'success';

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: '', flow: null });

    try {
      if (isSignup) {
        // Validate email domain for sign-up
        const allowedDomain = '@pride.hofstra.edu';
        if (!form.email.toLowerCase().endsWith(allowedDomain.toLowerCase())) {
          setStatus({
            type: 'error',
            message: `Sign-ups are restricted to ${allowedDomain} email addresses only.`,
            flow: 'signup',
          });
          return;
        }

        // Validate name
        if (!form.name || form.name.trim().length === 0) {
          setStatus({
            type: 'error',
            message: 'Full name is required. Please enter your name.',
            flow: 'signup',
          });
          return;
        }

        // Validate password
        if (!form.password || form.password.trim().length === 0) {
          setStatus({
            type: 'error',
            message: 'Password is required. Please enter a password.',
            flow: 'signup',
          });
          return;
        }

        if (form.password.length < 6) {
          setStatus({
            type: 'error',
            message: 'Password must be at least 6 characters long.',
            flow: 'signup',
          });
          return;
        }

        const firebaseUser = await signUp(form.email, form.password, {
          displayName: form.name,
          year: form.year,
          major: form.major,
        });

        if (firebaseUser) {
          await saveMemberProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? form.email,
            name: form.name,
            year: form.year,
            major: form.major,
          });
        }

        setStatus({
          type: 'success',
          message: "Thanks for joining! We'll be in touch soon with club updates.",
          flow: 'signup',
        });
      } else {
        // Validate login fields
        if (!form.email || form.email.trim().length === 0) {
          setStatus({
            type: 'error',
            message: 'Email is required. Please enter your email address.',
            flow: 'login',
          });
          return;
        }

        if (!form.password || form.password.trim().length === 0) {
          setStatus({
            type: 'error',
            message: 'Password is required. Please enter your password.',
            flow: 'login',
          });
          return;
        }

        await signIn(form.email, form.password);
        setStatus({
          type: 'success',
          message: 'Welcome back! You are now signed in.',
          flow: 'login',
        });
      }

      setForm((prev) => ({
        ...prev,
        password: '',
        ...(isSignup
          ? {
              name: '',
              email: '',
              year: '',
              major: '',
            }
          : {}),
      }));
    } catch (submitError) {
      let errorMessage = 'Unable to process your request right now.';
      
      if (submitError?.code) {
        // Firebase Auth error codes
        switch (submitError.code) {
          case 'auth/missing-password':
            errorMessage = 'Password is required. Please enter a password.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password (at least 6 characters).';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please sign in instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address. Please check your email and try again.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please sign up first.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          default:
            errorMessage = submitError?.message ?? errorMessage;
        }
      } else if (submitError?.message) {
        errorMessage = submitError.message;
      }

      setStatus({
        type: 'error',
        message: errorMessage,
        flow: mode,
      });
    }
  };

  const resetStatus = () => setStatus({ type: null, message: '', flow: null });

  return (
    <section
      id="join"
      className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-card/20 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Join the Quantum Revolution
          </h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Become part of Hofstra&apos;s quantum computing community and shape
            the future of technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {!user && (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-6">
                Sign Up for Updates
              </h3>

            <div className="flex gap-3 mb-6">
              <Button
                type="button"
                variant={isSignup ? 'default' : 'outline'}
                onClick={() => {
                  setMode('signup');
                  resetStatus();
                }}
                className="flex-1 py-4 text-base"
              >
                Create account
              </Button>
              <Button
                type="button"
                variant={isSignup ? 'outline' : 'default'}
                onClick={() => {
                  setMode('login');
                  resetStatus();
                }}
                className="flex-1 py-4 text-base"
              >
                Log in
              </Button>
            </div>


            {displayedError && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{displayedError}</span>
              </div>
            )}

            {showSuccess ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  {status.flow === 'signup' ? (
                    <Mail className="w-8 h-8 text-primary" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {status.flow === 'signup' ? 'Thanks for joining!' : 'Signed in successfully!'}
                </h4>
                <p className="text-foreground/60 mb-6">{status.message}</p>
                <Button variant="outline" onClick={resetStatus}>
                  Submit another response
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignup && (
                  <div>
                    <Label htmlFor="name" className="text-foreground mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleFieldChange('name')}
                      required
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 block">
                    Email Address
                    {isSignup && (
                      <span className="text-xs font-normal text-foreground/50 ml-2">
                        (@pride.hofstra.edu only)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isSignup ? "your.name@pride.hofstra.edu" : "your.email@hofstra.edu"}
                    value={form.email}
                    onChange={handleFieldChange('email')}
                    className="bg-background/50 border-border focus:border-primary"
                  />
                  {isSignup && form.email && !form.email.toLowerCase().endsWith('@pride.hofstra.edu') && (
                    <p className="text-xs text-destructive mt-1">
                      Only @pride.hofstra.edu email addresses are allowed for sign-up.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground mb-2 block">
                    Password
                    {isSignup && (
                      <span className="text-xs font-normal text-foreground/50 ml-2">
                        (min. 6 characters)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Choose a secure password"
                    value={form.password}
                    onChange={handleFieldChange('password')}
                    required
                    minLength={isSignup ? 6 : undefined}
                    className="bg-background/50 border-border focus:border-primary"
                  />
                  {isSignup && form.password && form.password.length > 0 && form.password.length < 6 && (
                    <p className="text-xs text-destructive mt-1">
                      Password must be at least 6 characters long.
                    </p>
                  )}
                  {isSignup && form.password && form.password.length >= 6 && (
                    <p className="text-xs text-primary mt-1">
                      ✓ Password meets requirements
                    </p>
                  )}
                </div>

                {isSignup && (
                  <>
                    <div>
                      <Label htmlFor="year" className="text-foreground mb-2 block">
                        Year
                      </Label>
                      <Input
                        id="year"
                        placeholder="Freshman, Sophomore, etc."
                        value={form.year}
                        onChange={handleFieldChange('year')}
                        className="bg-background/50 border-border focus:border-primary"
                      />
                    </div>

                    <div>
                      <Label htmlFor="major" className="text-foreground mb-2 block">
                        Major
                      </Label>
                      <Input
                        id="major"
                        placeholder="Computer Science, Physics, etc."
                        value={form.major}
                        onChange={handleFieldChange('major')}
                        className="bg-background/50 border-border focus:border-primary"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isSignup ? (
                    'Join Interest List'
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>
            )}
            </div>
          )}

          <div className="space-y-6">
            <a
              href="https://discord.gg/dfsP9tP8XY"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center hover:bg-card hover:scale-105 transition-all duration-300 cursor-pointer no-underline"
              style={{ textDecoration: 'none' }}
            >
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Discord Community
              </h3>
              <div className="bg-primary/10 rounded-xl p-6 inline-block mb-4">
                <MessageCircle className="w-24 h-24 text-primary mx-auto" />
              </div>
              <p className="text-foreground/60">
                Join our active online community on Discord
              </p>
            </a>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Users,
                  title: 'No Experience Required',
                  description: 'Open to all majors and skill levels',
                },
                {
                  icon: Calendar,
                  title: 'Weekly Meetings',
                  description: 'Every Thursday at 6:00 PM',
                },
              ].map((item, index) => {
                const Icon = item.icon;
                const CardContent = (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-sm text-foreground/60">
                        {item.description}
                      </p>
                    </div>
                  </>
                );

                if (item.url) {
                  return (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="block bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 flex items-center gap-4 hover:bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer no-underline"
                      style={{ pointerEvents: 'auto', textDecoration: 'none' }}
                    >
                      {CardContent}
                    </a>
                  );
                }

                return (
                  <div
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 flex items-center gap-4 hover:bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    {CardContent}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-24 text-center">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 inline-block">
          <p className="text-foreground/60 mb-2">
            © 2025 Hofstra Quantum Computing Club
          </p>
          <p className="text-foreground/50 text-sm">
            Shaping the future, one qubit at a time
          </p>
        </div>
      </footer>
    </section>
  );
}

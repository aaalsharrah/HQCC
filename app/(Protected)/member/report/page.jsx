'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { db } from '@/app/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';

export default function ReportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = details.trim();
    if (!trimmed) {
      alert('Please describe the issue you noticed.');
      return;
    }

    if (!user) {
      alert('You must be logged in to submit a report.');
      router.push('/signin');
      return;
    }

    try {
      setSubmitting(true);
      const emailPayload = {
        name: user.displayName || '',
        email: user.email || '',
        message: trimmed,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
      };

      const emailRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (!emailRes.ok) {
        const errorData = await emailRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Email send failed');
      }

      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || '',
        details: trimmed,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setDetails('');
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert('Failed to submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-20">
        <Card className="p-6 bg-card/60 backdrop-blur-xl border-border/60">
          <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Let us know if something looks wrong or isn’t working as expected.
          </p>

          {submitted && (
            <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              Thanks! Your report has been submitted.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-details">What happened?</Label>
              <Textarea
                id="report-details"
                placeholder="Describe the issue, where it happened, and any steps to reproduce..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={6}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={submitting || !details.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}

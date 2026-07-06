'use client';

import { useTranslations } from 'next-intl';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ticketApi } from '@/lib/api/endpoints';

interface Ticket {
  id: number;
  subject: string;
  status: string;
  createdAt?: string;
}

export default function SupportPage() {
  const nav = useTranslations('nav');
  const c = useTranslations('common');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    ticketApi
      .list()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : ((data as { items?: Ticket[] })?.items ?? []);
        setTickets(list);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await ticketApi.create({ subject, message });
      setSubject('');
      setMessage('');
      load();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{nav('support')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Create support ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? c('loading') : c('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 rounded-lg" />
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="divide-y">
              {tickets.map(ticket => (
                <li key={ticket.id} className="py-3 flex justify-between text-sm">
                  <span className="font-medium">{ticket.subject}</span>
                  <span className="text-muted-foreground">{ticket.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, Filter, Eye, Edit, Trash2, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';

export default function EventsTab({
  loading,
  events,
  editingEventId,
  form,
  onFormChange,
  onCreateEvent,
  onResetForm,
  onStartEditingEvent,
  onDeleteEvent,
}) {
  return (
    <TabsContent value="events" className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {editingEventId ? 'Edit Event' : 'Create New Event'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Event Title</label>
            <Input
              placeholder="Quantum Computing Workshop"
              className="bg-background/50 border-border"
              value={form.title}
              onChange={onFormChange('title')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            <Input
              placeholder="Workshop, Lecture, Hackathon..."
              className="bg-background/50 border-border"
              value={form.category}
              onChange={onFormChange('category')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <Input
              type="date"
              className="bg-background/50 border-border"
              value={form.date}
              onChange={onFormChange('date')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Time</label>
            <Input
              placeholder="6:00 PM - 8:00 PM"
              className="bg-background/50 border-border"
              value={form.time}
              onChange={onFormChange('time')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Input
              placeholder="Engineering Lab 201"
              className="bg-background/50 border-border"
              value={form.location}
              onChange={onFormChange('location')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Total Spots</label>
            <Input
              type="number"
              placeholder="50"
              className="bg-background/50 border-border"
              value={form.spots}
              onChange={onFormChange('spots')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">
              Event Image URL
            </label>
            <Input
              placeholder="/quantum-computing-workshop.jpg"
              className="bg-background/50 border-border"
              value={form.image}
              onChange={onFormChange('image')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Description</label>
            <textarea
              placeholder="Describe the event..."
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              rows={3}
              value={form.description}
              onChange={onFormChange('description')}
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-border/60">
            <h4 className="text-sm font-semibold mb-2">Organizer Details</h4>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Organizer Name
            </label>
            <Input
              placeholder="Abdallah Aisharrah"
              className="bg-background/50 border-border"
              value={form.organizerName}
              onChange={onFormChange('organizerName')}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Organizer Role
            </label>
            <Input
              placeholder="Founder & President"
              className="bg-background/50 border-border"
              value={form.organizerRole}
              onChange={onFormChange('organizerRole')}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">
              Organizer Avatar URL
            </label>
            <Input
              placeholder="/professional-man.jpg"
              className="bg-background/50 border-border"
              value={form.organizerAvatar}
              onChange={onFormChange('organizerAvatar')}
            />
          </div>

          <div className="md:col-span-2 pt-2 border-t border-border/60">
            <h4 className="text-sm font-semibold mb-2">Agenda</h4>
            <p className="text-xs text-muted-foreground mb-1">
              One item per line using{' '}
              <span className="font-mono">time | title | duration</span> format.
              Example:
            </p>
            <pre className="text-xs font-mono bg-background/60 border border-dashed border-border rounded-md p-2 mb-2">
              {`6:00 PM | Welcome & Introduction | 15 min
6:15 PM | Quantum Basics Overview | 30 min`}
            </pre>
            <textarea
              placeholder="6:00 PM | Welcome & Introduction | 15 min"
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              rows={4}
              value={form.agendaText}
              onChange={onFormChange('agendaText')}
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold mb-2">Requirements</h4>
            <p className="text-xs text-muted-foreground mb-1">
              One requirement per line (shown under &quot;What to Bring&quot;).
            </p>
            <textarea
              placeholder={'Laptop with Python installed\nBasic programming knowledge'}
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              rows={3}
              value={form.requirementsText}
              onChange={onFormChange('requirementsText')}
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold mb-2">Who&apos;s Coming</h4>
            <p className="text-xs text-muted-foreground mb-1">
              One attendee per line using{' '}
              <span className="font-mono">name | role | avatarUrl</span> format.
              Example:
            </p>
            <pre className="text-xs font-mono bg-background/60 border border-dashed border-border rounded-md p-2 mb-2">
              {`Abdallah Aisharrah | Founder & President | /professional-man.jpg
Jane Doe | VP, Events | /team-member-2.jpg`}
            </pre>
            <textarea
              placeholder="Abdallah Aisharrah | Founder & President | /professional-man.jpg"
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              rows={3}
              value={form.whosComingText}
              onChange={onFormChange('whosComingText')}
            />
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onCreateEvent}
            >
              {editingEventId ? 'Update Event' : 'Create Event'}
            </Button>
            <Button variant="outline" type="button" onClick={onResetForm}>
              {editingEventId ? 'Cancel Edit' : 'Clear Form'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Scheduled Events</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No events found. Create your first event above!
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="p-4 bg-background/50 border-border hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{event.title}</h4>
                      <Badge
                        variant={event.status === 'Scheduled' ? 'default' : 'secondary'}
                      >
                        {event.status}
                      </Badge>
                      {event.category && (
                        <Badge variant="outline">{event.category}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </span>
                      <span>{event.location}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/member/events/${event.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <Link href={`/admin/events/${event.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                      >
                        <Users className="h-4 w-4" />
                        Registrations
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 bg-transparent"
                      onClick={() => onStartEditingEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 hover:text-destructive hover:border-destructive bg-transparent"
                      onClick={() => onDeleteEvent(event.id, event.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </TabsContent>
  );
}

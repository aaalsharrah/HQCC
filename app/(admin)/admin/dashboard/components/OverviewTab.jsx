'use client';

import {
  Users,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';

export default function OverviewTab({ loading, analytics, users, events }) {
  return (
    <TabsContent value="overview" className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />+{analytics.newUsersThisMonth}
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              analytics.totalUsers
            )}
          </div>
          <div className="text-sm text-foreground/60">Total Members</div>
          <div className="mt-2 text-xs text-primary">
            {analytics.activeUsers} active
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-accent/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {analytics.upcomingEvents}
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            ) : (
              analytics.totalEvents
            )}
          </div>
          <div className="text-sm text-foreground/60">Total Events</div>
          <div className="mt-2 text-xs text-accent">
            {analytics.upcomingEvents} upcoming
          </div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-secondary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <Badge variant="secondary">Avg</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            ) : (
              analytics.avgAttendance
            )}
          </div>
          <div className="text-sm text-foreground/60">Avg Attendance</div>
          <div className="mt-2 text-xs text-secondary">per event</div>
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {analytics.engagementRate > 0 ? '+' : ''}
              {analytics.engagementRate}%
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-1">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              `${analytics.engagementRate}%`
            )}
          </div>
          <div className="text-sm text-foreground/60">Engagement Rate</div>
          <div className="mt-2 text-xs text-primary">last 30 days</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Recent Members
          </h3>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No members found.
            </div>
          ) : (
            <div className="space-y-4">
              {users.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-foreground/60">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      user.status === 'Active'
                        ? 'default'
                        : user.status === 'Pending'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Upcoming Events
          </h3>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : (
            (() => {
              const now = new Date();
              const upcoming = events
                .filter((event) => {
                  if (!event.originalDate) {
                    if (!event.date) return false;
                    const d = new Date(event.date);
                    return !isNaN(d.getTime()) && d >= now;
                  }
                  return event.originalDate >= now;
                })
                .sort((a, b) => {
                  const aDate = a.originalDate || (a.date ? new Date(a.date) : null);
                  const bDate = b.originalDate || (b.date ? new Date(b.date) : null);
                  if (!aDate || !bDate) return 0;
                  return aDate - bDate;
                })
                .slice(0, 3);

              if (upcoming.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming events
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {upcoming.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                    >
                      <div>
                        <div className="font-medium mb-1">{event.title}</div>
                        <div className="text-xs text-foreground/60 flex items-center gap-3">
                          <span>{event.date}</span>
                          {event.time && (
                            <>
                              <span>•</span>
                              <span>{event.time}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{event.attendees} RSVPs</Badge>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </Card>
      </div>
    </TabsContent>
  );
}

'use client';

import { useState } from 'react';
import {
  Users,
  Calendar,
  BarChart3,
  Settings,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics data
  const analytics = {
    totalUsers: 45,
    activeUsers: 38,
    newUsersThisMonth: 12,
    totalEvents: 28,
    upcomingEvents: 5,
    completedEvents: 23,
    avgAttendance: 32,
    engagementRate: 84,
  };

  // Sample user data
  const users = [
    {
      id: 1,
      name: 'Abdallah Aisharrah',
      email: 'abdallah@hqcc.org',
      role: 'President',
      status: 'Active',
      joinDate: 'Jan 2024',
      posts: 45,
      events: 28,
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah@hqcc.org',
      role: 'Vice President',
      status: 'Active',
      joinDate: 'Feb 2024',
      posts: 32,
      events: 24,
    },
    {
      id: 3,
      name: 'Marcus Rodriguez',
      email: 'marcus@hqcc.org',
      role: 'Member',
      status: 'Active',
      joinDate: 'Mar 2024',
      posts: 28,
      events: 18,
    },
    {
      id: 4,
      name: 'Emily Thompson',
      email: 'emily@hqcc.org',
      role: 'Member',
      status: 'Pending',
      joinDate: 'Dec 2024',
      posts: 5,
      events: 2,
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'david@hqcc.org',
      role: 'Member',
      status: 'Inactive',
      joinDate: 'Sep 2024',
      posts: 12,
      events: 8,
    },
  ];

  // Sample event data
  const events = [
    {
      id: 1,
      title: 'Quantum Computing Workshop',
      date: '2024-01-15',
      time: '2:00 PM',
      location: 'Tech Lab 204',
      attendees: 35,
      status: 'Scheduled',
    },
    {
      id: 2,
      title: 'Industry Speaker Series',
      date: '2024-01-22',
      time: '4:00 PM',
      location: 'Auditorium A',
      attendees: 42,
      status: 'Scheduled',
    },
    {
      id: 3,
      title: 'Hackathon Kickoff',
      date: '2024-02-05',
      time: '10:00 AM',
      location: 'Student Center',
      attendees: 28,
      status: 'Draft',
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-foreground/60">
                Manage your quantum computing club
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="bg-card/50 backdrop-blur-xl border border-border p-1">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {analytics.totalUsers}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Total Members
                  </div>
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
                      <Clock className="h-3 w-3" />5
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {analytics.totalEvents}
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
                    {analytics.avgAttendance}
                  </div>
                  <div className="text-sm text-foreground/60">
                    Avg Attendance
                  </div>
                  <div className="mt-2 text-xs text-secondary">per event</div>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +8%
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {analytics.engagementRate}%
                  </div>
                  <div className="text-sm text-foreground/60">
                    Engagement Rate
                  </div>
                  <div className="mt-2 text-xs text-primary">last 30 days</div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Recent Members
                  </h3>
                  <div className="space-y-4">
                    {users.slice(0, 4).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
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
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                      >
                        <div>
                          <div className="font-medium mb-1">{event.title}</div>
                          <div className="text-xs text-foreground/60 flex items-center gap-3">
                            <span>{event.date}</span>
                            <span>•</span>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {event.attendees} RSVPs
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Search and Filter */}
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50 border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Users Table */}
              <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold">
                          Member
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Role
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Joined
                        </th>
                        <th className="text-left p-4 text-sm font-semibold">
                          Activity
                        </th>
                        <th className="text-right p-4 text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border hover:bg-background/50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
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
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                user.status === 'Active'
                                  ? 'default'
                                  : user.status === 'Pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="gap-1"
                            >
                              {user.status === 'Active' && (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {user.status === 'Inactive' && (
                                <XCircle className="h-3 w-3" />
                              )}
                              {user.status === 'Pending' && (
                                <Clock className="h-3 w-3" />
                              )}
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-foreground/60">
                            {user.joinDate}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>{user.posts} posts</div>
                              <div className="text-xs text-foreground/60">
                                {user.events} events
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-primary"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-accent"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-primary"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              {/* Event Creation */}
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Create New Event
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Event Title"
                    className="bg-background/50 border-border"
                  />
                  <Input
                    type="date"
                    className="bg-background/50 border-border"
                  />
                  <Input
                    type="time"
                    className="bg-background/50 border-border"
                  />
                  <Input
                    placeholder="Location"
                    className="bg-background/50 border-border"
                  />
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Description"
                      className="bg-background/50 border-border"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create Event
                    </Button>
                    <Button variant="outline">Save as Draft</Button>
                  </div>
                </div>
              </Card>

              {/* Events List */}
              <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Scheduled Events</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="p-4 bg-background/50 border-border hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">
                              {event.title}
                            </h4>
                            <Badge
                              variant={
                                event.status === 'Scheduled'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {event.status}
                            </Badge>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-transparent"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 hover:text-destructive hover:border-destructive bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

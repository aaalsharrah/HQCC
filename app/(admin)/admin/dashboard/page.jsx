'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, BarChart3 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { db } from '@/app/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

import AdminHeader from './components/AdminHeader';
import OverviewTab from './components/OverviewTab';
import UsersTab from './components/UsersTab';
import EventsTab from './components/EventsTab';
import useAdminDashboardData from './hooks/useAdminDashboardData';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const {
    analytics,
    events,
    users,
    loading,
    form,
    editingEventId,
    updatingRoleId,
    fetchData,
    handleFormChange,
    handleRoleChange,
    handleCreateEvent,
    handleDeleteEvent,
    handleDeleteUser,
    startEditingEvent,
    resetForm,
  } = useAdminDashboardData({
    user,
    onEditStart: () => setActiveTab('events'),
  });

  // ✅ REPLACEMENT: auth guard using AuthContext (NO onAuthStateChanged)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // wait until AuthProvider finishes initializing
      if (authLoading) return;

      // not signed in -> send to signin
      if (!user) {
        // handled in hook fetchData
        router.replace('/signin');
        return;
      }

      try {
        // check role
        const userDocRef = doc(db, 'members', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          router.replace('/member');
          return;
        }

        const userData = userDocSnap.data();
        if (userData.role !== 'admin') {
          router.replace('/member');
          return;
        }

        // load admin dashboard data
        await fetchData();
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <AdminHeader />

      {/* Main */}
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

            <OverviewTab
              loading={loading}
              analytics={analytics}
              users={users}
              events={events}
            />
            <UsersTab
              loading={loading}
              users={users}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              onRoleChange={handleRoleChange}
              onDeleteUser={handleDeleteUser}
              updatingRoleId={updatingRoleId}
              currentUserId={user?.uid}
            />
            <EventsTab
              loading={loading}
              events={events}
              editingEventId={editingEventId}
              form={form}
              onFormChange={handleFormChange}
              onCreateEvent={handleCreateEvent}
              onResetForm={resetForm}
              onStartEditingEvent={startEditingEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </Tabs>
        </div>
      </section>
    </div>
  );
}

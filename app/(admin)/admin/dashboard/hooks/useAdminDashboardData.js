'use client';

import { useCallback, useState } from 'react';

import { db } from '@/app/lib/firebase/firebase';
import {
  collection,
  collectionGroup,
  getDocs,
  doc,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

import { createNotification } from '@/app/lib/firebase/notifications';

const emptyAnalytics = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersThisMonth: 0,
  totalEvents: 0,
  upcomingEvents: 0,
  completedEvents: 0,
  avgAttendance: 0,
  engagementRate: 0,
};

const emptyForm = {
  title: '',
  category: '',
  date: '',
  time: '',
  location: '',
  spots: '',
  image: '',
  description: '',
  organizerName: '',
  organizerRole: '',
  organizerAvatar: '',
  agendaText: '',
  requirementsText: '',
  whosComingText: '',
};

export default function useAdminDashboardData({ user, onEditStart }) {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date =
      timestamp instanceof Timestamp
        ? timestamp.toDate()
        : timestamp?.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const parseEventDate = (dateField) => {
    if (!dateField) return null;
    if (dateField instanceof Timestamp) return dateField.toDate();
    if (dateField?.toDate) return dateField.toDate();
    if (typeof dateField === 'string') return new Date(dateField);
    return null;
  };

  const formatEventDate = (eventDate) => {
    if (!eventDate) return '';
    const year = eventDate.getUTCFullYear();
    const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const membersRef = collection(db, 'members');
      const membersSnapshot = await getDocs(membersRef);
      const membersData = membersSnapshot.docs
        .map((d) => ({
        id: d.id,
        uid: d.id,
        ...d.data(),
        }))
        .filter((m) => !m.deleted);

      const postsRef = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      const postsData = postsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const eventsData = eventsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const allRegistrations = [];
      for (const eventDoc of eventsSnapshot.docs) {
        try {
          const regsRef = collection(db, 'events', eventDoc.id, 'registrations');
          const regsSnap = await getDocs(regsRef);
          regsSnap.docs.forEach((regDoc) => {
            allRegistrations.push({
              id: regDoc.id,
              eventId: eventDoc.id,
              ...regDoc.data(),
            });
          });
        } catch (e) {
          console.error(
            'Error loading registrations subcollection for event',
            eventDoc.id,
            e
          );
        }
      }

      const totalUsers = membersData.length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPosts = postsData.filter((post) => {
        if (!post.createdAt) return false;
        const postDate =
          post.createdAt instanceof Timestamp
            ? post.createdAt.toDate()
            : post.createdAt?.toDate
            ? post.createdAt.toDate()
            : new Date(post.createdAt);
        return postDate >= thirtyDaysAgo;
      });

      const activeUserIds = new Set(recentPosts.map((p) => p.authorId));
      const activeUsers = membersData.filter((m) =>
        activeUserIds.has(m.uid || m.id)
      ).length;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersThisMonth = membersData.filter((m) => {
        const createdAt = m.createdAt || m.joinedAt;
        if (!createdAt) return false;
        const createdDate =
          createdAt instanceof Timestamp
            ? createdAt.toDate()
            : createdAt?.toDate
            ? createdAt.toDate()
            : new Date(createdAt);
        return createdDate >= monthStart;
      }).length;

      const totalEvents = eventsData.length;
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const upcomingEvents = eventsData.filter((e) => {
        const eventDate = parseEventDate(e.date);
        return eventDate && eventDate >= todayMidnight;
      }).length;

      const attendanceValues = eventsData
        .map((e) => {
          const fromDoc =
            typeof e.attendees === 'number'
              ? e.attendees
              : typeof e.attendeeCount === 'number'
              ? e.attendeeCount
              : null;
          if (fromDoc !== null) return fromDoc;
          return allRegistrations.filter((r) => r.eventId === e.id).length;
        })
        .filter((n) => typeof n === 'number' && !isNaN(n));

      const avgAttendance =
        attendanceValues.length > 0
          ? Math.round(
              attendanceValues.reduce((sum, val) => sum + val, 0) /
                attendanceValues.length
            )
          : 0;

      const engagedUserIds = new Set();
      recentPosts.forEach((post) => {
        if (post.authorId) engagedUserIds.add(post.authorId);
      });

      for (const post of postsData) {
        try {
          const repliesRef = collection(db, 'posts', post.id, 'replies');
          const repliesSnapshot = await getDocs(repliesRef);
          repliesSnapshot.docs.forEach((replyDoc) => {
            const replyData = replyDoc.data();
            if (replyData.authorId) {
              const replyDate =
                replyData.createdAt instanceof Timestamp
                  ? replyData.createdAt.toDate()
                  : replyData.createdAt?.toDate
                  ? replyData.createdAt.toDate()
                  : new Date(replyData.createdAt);
              if (replyDate >= thirtyDaysAgo) {
                engagedUserIds.add(replyData.authorId);
              }
            }
          });
        } catch {
          // ignore
        }
      }

      for (const post of postsData) {
        try {
          const likesRef = collection(db, 'posts', post.id, 'likes');
          const likesSnapshot = await getDocs(likesRef);
          likesSnapshot.docs.forEach((likeDoc) => {
            const likeData = likeDoc.data();
            if (likeData.userId) {
              const likeDate =
                likeData.createdAt instanceof Timestamp
                  ? likeData.createdAt.toDate()
                  : likeData.createdAt?.toDate
                  ? likeData.createdAt.toDate()
                  : new Date(likeData.createdAt);
              if (likeDate >= thirtyDaysAgo) {
                engagedUserIds.add(likeData.userId);
              }
            }
          });
        } catch {
          // ignore
        }
      }

      const engagementRate =
        totalUsers > 0 ? Math.round((engagedUserIds.size / totalUsers) * 100) : 0;

      setAnalytics({
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalEvents,
        upcomingEvents,
        completedEvents: totalEvents - upcomingEvents,
        avgAttendance,
        engagementRate,
      });

      const processedMembers = await Promise.all(
        membersData.map(async (member) => {
          const memberId = member.uid || member.id;

          const memberPosts = postsData.filter((p) => p.authorId === memberId).length;

          const memberRegistrations = allRegistrations.filter(
            (r) => r.userId === memberId || r.uid === memberId
          ).length;

          const hasRecentPost = recentPosts.some((p) => p.authorId === memberId);
          const status = hasRecentPost ? 'Active' : 'Inactive';

          return {
            id: memberId,
            name: member.name || 'Member',
            email: member.email || '',
            role: (member.role || 'member').toLowerCase(),
            status,
            joinDate: formatDate(member.createdAt || member.joinedAt),
            posts: memberPosts,
            events: memberRegistrations,
          };
        })
      );

      processedMembers.sort((a, b) => {
        const memberA = membersData.find((m) => (m.uid || m.id) === a.id);
        const memberB = membersData.find((m) => (m.uid || m.id) === b.id);
        const aDate = memberA?.createdAt || memberA?.joinedAt;
        const bDate = memberB?.createdAt || memberB?.joinedAt;

        if (aDate && bDate) {
          const aDateObj =
            aDate instanceof Timestamp
              ? aDate.toDate()
              : aDate?.toDate
              ? aDate.toDate()
              : new Date(aDate);
          const bDateObj =
            bDate instanceof Timestamp
              ? bDate.toDate()
              : bDate?.toDate
              ? bDate.toDate()
              : new Date(bDate);
          return bDateObj - aDateObj;
        }
        if (aDate && !bDate) return -1;
        if (!aDate && bDate) return 1;
        return 0;
      });

      setUsers(processedMembers);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedEvents = eventsData.map((event) => {
        const eventDate = parseEventDate(event.date);

        const attendees = allRegistrations.filter(
          (r) => r.eventId === event.id
        ).length;

        let dateDisplay = '';
        if (eventDate) {
          dateDisplay = formatEventDate(eventDate);
        } else if (event.date && typeof event.date === 'string') {
          dateDisplay = event.date.split('T')[0];
        }

        return {
          id: event.id,
          title: event.title || 'Untitled Event',
          date: dateDisplay,
          originalDate: eventDate || null,
          time: event.time || '',
          location: event.location || '',
          attendees,
          status: eventDate && eventDate >= today ? 'Scheduled' : 'Completed',
          category: event.category || 'Event',
          description: event.description || '',
          image: event.image || '/placeholder.svg',
          spots: event.spots || 0,
          organizer: event.organizer || {
            name: 'HQCC Team',
            role: 'Organizer',
            avatar: '/professional-man.jpg',
          },
          agenda: event.agenda || [],
          requirements: event.requirements || [],
          attendeesList: event.attendeesList || [],
        };
      });

      processedEvents.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        return bDate - aDate;
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error);
      setUsers([]);
      setEvents([]);
      setAnalytics(emptyAnalytics);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFormChange = useCallback(
    (field) => (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const startEditingEvent = useCallback(
    (event) => {
      setEditingEventId(event.id);
      setForm({
        title: event.title || '',
        category: event.category || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        spots: event.spots ? String(event.spots) : '',
        image: event.image || '',
        description: event.description || '',
        organizerName: event.organizer?.name || '',
        organizerRole: event.organizer?.role || '',
        organizerAvatar: event.organizer?.avatar || '',
        agendaText: (event.agenda || [])
          .map((item) =>
            `${item.time || ''} | ${item.title || ''} | ${item.duration || ''}`.trim()
          )
          .join('\n'),
        requirementsText: (event.requirements || []).join('\n'),
        whosComingText: (event.attendeesList || [])
          .map((att) =>
            `${att.name || ''} | ${att.role || ''} | ${att.avatar || ''}`.trim()
          )
          .join('\n'),
      });
      if (onEditStart) onEditStart();
    },
    [onEditStart]
  );

  const resetForm = useCallback(() => {
    setEditingEventId(null);
    setForm(emptyForm);
  }, []);

  const handleDeleteEvent = useCallback(async (eventId, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the event "${title}"?\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  }, []);

  const handleRoleChange = useCallback(
    async (memberId, nextRole) => {
      if (!memberId) return;
      if (memberId === user?.uid) {
        alert("You can't change your own role.");
        return;
      }

      try {
        setUpdatingRoleId(memberId);
        const memberRef = doc(db, 'members', memberId);
        await updateDoc(memberRef, { role: nextRole });
        setUsers((prev) =>
          prev.map((u) => (u.id === memberId ? { ...u, role: nextRole } : u))
        );
      } catch (err) {
        console.error('Failed to update role:', err);
        alert('Failed to update role. Please try again.');
      } finally {
        setUpdatingRoleId(null);
      }
    },
    [user?.uid]
  );

  const handleDeleteUser = useCallback(
    async (memberId) => {
      if (!memberId) return;
      if (memberId === user?.uid) {
        alert("You can't delete your own account here.");
        return;
      }

      try {
        const deleteDocsInBatches = async (docs) => {
          let batch = writeBatch(db);
          let count = 0;

          for (const snap of docs) {
            batch.delete(snap.ref);
            count += 1;
            if (count >= 450) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }

          if (count > 0) {
            await batch.commit();
          }
        };

        // Remove registrations by user (events subcollection + legacy top-level)
        const registrationsSnap = await getDocs(
          query(
            collectionGroup(db, 'registrations'),
            where('userId', '==', memberId)
          )
        );
        await deleteDocsInBatches(registrationsSnap.docs);

        // Remove user from attendeesList across events
        const eventsSnap = await getDocs(collection(db, 'events'));
        for (const eventDoc of eventsSnap.docs) {
          const data = eventDoc.data();
          if (!Array.isArray(data.attendeesList)) continue;
          const nextList = data.attendeesList.filter(
            (att) => att?.userId !== memberId
          );
          if (nextList.length !== data.attendeesList.length) {
            await updateDoc(eventDoc.ref, { attendeesList: nextList });
          }
        }

        // Mark posts/replies as deleted user (keep content)
        const postsSnap = await getDocs(
          query(collection(db, 'posts'), where('authorId', '==', memberId))
        );
        for (const postDoc of postsSnap.docs) {
          await updateDoc(postDoc.ref, {
            authorName: 'User deleted',
            authorEmail: '',
            authorAvatar: null,
          });
        }

        const repliesSnap = await getDocs(
          query(collectionGroup(db, 'replies'), where('authorId', '==', memberId))
        );
        for (const replyDoc of repliesSnap.docs) {
          await updateDoc(replyDoc.ref, {
            authorName: 'User deleted',
            authorEmail: '',
            authorAvatar: null,
          });
        }

        // Mark member as deleted (keep doc for display)
        await updateDoc(doc(db, 'members', memberId), {
          deleted: true,
          name: 'User deleted',
          email: '',
          avatar: null,
          deletedAt: Timestamp.now(),
        });
        setUsers((prev) => prev.filter((u) => u.id !== memberId));
      } catch (err) {
        console.error('Failed to delete user:', err);
        alert('Failed to delete user. Please try again.');
      }
    },
    [user?.uid]
  );

  const handleCreateEvent = useCallback(async () => {
    if (!form.title || !form.date || !form.time || !form.location) {
      alert('Please fill in at least Title, Date, Time, and Location.');
      return;
    }

    try {
      const agenda =
        form.agendaText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [time, title, duration] = line.split('|').map((s) => s.trim());
            return {
              time: time || '',
              title: title || '',
              duration: duration || '',
            };
          }) || [];

      const requirements =
        form.requirementsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean) || [];

      const whosComing =
        form.whosComingText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, role, avatar] = line.split('|').map((s) => s.trim());
            return {
              name: name || '',
              role: role || '',
              avatar: avatar || '/professional-man.jpg',
            };
          }) || [];

      let dateTimestamp;
      if (form.date) {
        const [year, month, day] = form.date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        dateTimestamp = Timestamp.fromDate(utcDate);
      } else {
        dateTimestamp = Timestamp.now();
      }

      const eventPayload = {
        title: form.title,
        date: dateTimestamp,
        time: form.time,
        location: form.location,
        category: form.category || 'Event',
        description: form.description,
        image: form.image || '/placeholder.svg',
        spots: Number(form.spots) || 0,
        organizer: {
          name: form.organizerName || 'HQCC Team',
          role: form.organizerRole || 'Organizer',
          avatar: form.organizerAvatar || '/professional-man.jpg',
        },
        agenda,
        requirements,
        attendeesList: whosComing,
      };

      let eventDocRef;

      if (editingEventId) {
        eventDocRef = doc(db, 'events', editingEventId);
        await updateDoc(eventDocRef, {
          ...eventPayload,
          updatedAt: Timestamp.now(),
        });
      } else {
        const eventsRef = collection(db, 'events');
        eventDocRef = await addDoc(eventsRef, {
          ...eventPayload,
          attendees: 0,
          createdAt: Timestamp.now(),
        });

        try {
          const membersRef = collection(db, 'members');
          const membersSnapshot = await getDocs(membersRef);
          const notificationPromises = membersSnapshot.docs.map(async (memberDoc) => {
            const memberId = memberDoc.id;
            if (memberId === user?.uid) return;

            await createNotification({
              userId: memberId,
              type: 'event',
              actorId: user?.uid || 'system',
              actorName: 'HQCC Events',
              actorAvatar: '/quantum-computing-logo.jpg',
              postId: eventDocRef.id,
              postContent: `${form.title} - ${form.date} at ${form.time}`,
            });
          });
          await Promise.all(notificationPromises);
        } catch (error) {
          console.error('Error creating event notifications:', error);
        }
      }

      resetForm();

      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const allRegistrations = [];
      for (const eventDoc of eventsSnapshot.docs) {
        try {
          const regsRef = collection(db, 'events', eventDoc.id, 'registrations');
          const regsSnap = await getDocs(regsRef);
          regsSnap.docs.forEach((regDoc) => {
            allRegistrations.push({
              id: regDoc.id,
              eventId: eventDoc.id,
              ...regDoc.data(),
            });
          });
        } catch {
          // ignore
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processedEvents = eventsData.map((event) => {
        const eventDate = parseEventDate(event.date);

        const attendees = allRegistrations.filter(
          (r) => r.eventId === event.id
        ).length;

        let dateDisplay = '';
        if (eventDate) {
          dateDisplay = formatEventDate(eventDate);
        } else if (event.date && typeof event.date === 'string') {
          dateDisplay = event.date.split('T')[0];
        }

        return {
          id: event.id,
          title: event.title || 'Untitled Event',
          date: dateDisplay,
          originalDate: eventDate || null,
          time: event.time || '',
          location: event.location || '',
          attendees,
          status: eventDate && eventDate >= today ? 'Scheduled' : 'Completed',
          category: event.category || 'Event',
          description: event.description || '',
          image: event.image || '/placeholder.svg',
          spots: event.spots || 0,
          organizer: event.organizer || {
            name: 'HQCC Team',
            role: 'Organizer',
            avatar: '/professional-man.jpg',
          },
          agenda: event.agenda || [],
          requirements: event.requirements || [],
          attendeesList: event.attendeesList || [],
        };
      });

      processedEvents.sort((a, b) => {
        const aDate = a.date ? new Date(a.date) : new Date(0);
        const bDate = b.date ? new Date(b.date) : new Date(0);
        return bDate - aDate;
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error creating/updating event:', error);
      alert('Failed to save event. Please try again.');
    }
  }, [editingEventId, form, resetForm, user?.uid]);

  return {
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
  };
}

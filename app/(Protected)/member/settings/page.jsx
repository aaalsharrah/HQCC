'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Lock,
  Shield,
  Bell,
  Palette,
  Camera,
  Mail,
  Globe,
  Save,
  Trash2,
} from 'lucide-react';


// 🔥 Firebase imports
import { auth, db } from '@/app/lib/firebase/firebase';
import { onAuthStateChanged, updateProfile, updateEmail } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function SettingsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);

  // 🔹 Profile info (synced with Firestore `members/{uid}`)
  const [profile, setProfile] = useState(null);

  // 🔹 Other preferences (also stored on `members/{uid}`)
  const [privacy, setPrivacy] = useState({
    privateProfile: false,
    showEmail: false,
    showLocation: true,
    allowTags: true,
    allowDMs: true,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postLikes: true,
    postComments: true,
    newFollowers: true,
    mentions: true,
    eventReminders: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'dark',
    fontSize: 'medium',
    colorScheme: 'quantum',
  });

  // 🔁 Load user + member profile from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      setCurrentUser(user);

      try {
        const ref = doc(db, 'members', user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // First-time user → create a default member doc
          const fallbackName =
            user.displayName || user.email?.split('@')[0] || 'HQCC Member';
          const username =
            user.email
              ?.split('@')[0]
              ?.toLowerCase()
              .replace(/[^a-z0-9]/g, '') || 'member';

          const defaultData = {
            uid: user.uid,
            name: fallbackName,
            username, // ✅ this is the key
            email: user.email,
            bio: 'HQCC member | Quantum & Computing Enthusiast',
            location: 'Hempstead, NY',
            website: 'hqcc.hofstra.edu',
            avatar: user.photoURL || '/quantum-computing-student.jpg',
            createdAt: serverTimestamp(),

            // default preferences
            privacy: {
              privateProfile: false,
              showEmail: false,
              showLocation: true,
              allowTags: true,
              allowDMs: true,
            },
            notifications: {
              emailNotifications: true,
              pushNotifications: true,
              postLikes: true,
              postComments: true,
              newFollowers: true,
              mentions: true,
              eventReminders: true,
            },
            appearance: {
              theme: 'dark',
              fontSize: 'medium',
              colorScheme: 'quantum',
            },
          };

          await setDoc(ref, defaultData);

          setProfile({
            name: defaultData.name,
            username: defaultData.username,
            email: defaultData.email,
            bio: defaultData.bio,
            location: defaultData.location,
            website: defaultData.website,
            avatar: defaultData.avatar,
          });
          setPrivacy(defaultData.privacy);
          setNotifications(defaultData.notifications);
          setAppearance(defaultData.appearance);
        } else {
          const data = snap.data();

          setProfile({
            name: data.name || 'HQCC Member',
            username: data.username || 'member',
            email: data.email || user.email || '',
            bio: data.bio || 'HQCC member | Quantum & Computing Enthusiast',
            location: data.location || '',
            website: data.website || '',
            avatar:
              data.avatar || user.photoURL || '/quantum-computing-student.jpg',
          });

          setPrivacy({
            privateProfile: data.privacy?.privateProfile ?? false,
            showEmail: data.privacy?.showEmail ?? false,
            showLocation: data.privacy?.showLocation ?? true,
            allowTags: data.privacy?.allowTags ?? true,
            allowDMs: data.privacy?.allowDMs ?? true,
          });

          setNotifications({
            emailNotifications: data.notifications?.emailNotifications ?? true,
            pushNotifications: data.notifications?.pushNotifications ?? true,
            postLikes: data.notifications?.postLikes ?? true,
            postComments: data.notifications?.postComments ?? true,
            newFollowers: data.notifications?.newFollowers ?? true,
            mentions: data.notifications?.mentions ?? true,
            eventReminders: data.notifications?.eventReminders ?? true,
          });

          setAppearance({
            theme: data.appearance?.theme || 'dark',
            fontSize: data.appearance?.fontSize || 'medium',
            colorScheme: data.appearance?.colorScheme || 'quantum',
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // 🧷 Saving handlers

  const handleSaveProfile = async () => {
    if (!currentUser || !profile) return;
    setSavingProfile(true);

    try {
      const ref = doc(db, 'members', currentUser.uid);

      await updateDoc(ref, {
        name: profile.name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        avatar: profile.avatar,
        updatedAt: serverTimestamp(),
      });

      // optionally sync Firebase Auth displayName + email
      try {
        await updateProfile(currentUser, {
          displayName: profile.name,
          photoURL: profile.avatar,
        });
      } catch (err) {
        console.warn('Could not update auth profile:', err);
      }

      if (profile.email && profile.email !== currentUser.email) {
        try {
          await updateEmail(currentUser, profile.email);
        } catch (err) {
          console.warn('Could not update auth email:', err);
        }
      }

      console.log('Profile saved.');
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!currentUser) return;
    setSavingPrivacy(true);
    try {
      const ref = doc(db, 'members', currentUser.uid);
      await updateDoc(ref, {
        privacy,
        updatedAt: serverTimestamp(),
      });
      console.log('Privacy settings saved.');
    } catch (err) {
      console.error('Error saving privacy:', err);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!currentUser) return;
    setSavingNotifications(true);
    try {
      const ref = doc(db, 'members', currentUser.uid);
      await updateDoc(ref, {
        notifications,
        updatedAt: serverTimestamp(),
      });
      console.log('Notification settings saved.');
    } catch (err) {
      console.error('Error saving notifications:', err);
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveAppearance = async () => {
    if (!currentUser) return;
    setSavingAppearance(true);
    try {
      const ref = doc(db, 'members', currentUser.uid);
      await updateDoc(ref, {
        appearance,
        updatedAt: serverTimestamp(),
      });
      console.log('Appearance settings saved.');
    } catch (err) {
      console.error('Error saving appearance:', err);
    } finally {
      setSavingAppearance(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-float-gentle" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float-gentle"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full bg-card/50 backdrop-blur-xl border border-border/50 p-1 grid grid-cols-2 md:grid-cols-5 gap-1">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={profile.avatar || '/placeholder.svg'} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent"
                    type="button"
                  >
                    <Camera className="h-4 w-4" />
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          username: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="bg-background/50 border-border/50 focus:border-primary min-h-[100px]"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {profile.bio.length}/160
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          location: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="website"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          website: e.target.value,
                        })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={savingProfile}
                  >
                    <Save className="h-4 w-4" />
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Account Settings
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        email: e.target.value,
                      })
                    }
                    className="bg-background/50 border-border/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">
                    Change Password
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="bg-background/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent"
                    type="button"
                  >
                    <Lock className="h-4 w-4" />
                    Update Password
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h3 className="text-lg font-semibold text-destructive">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button variant="destructive" className="gap-2" type="button">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Privacy Settings
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="space-y-1">
                    <Label
                      htmlFor="private-profile"
                      className="text-base font-medium"
                    >
                      Private Profile
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only approved followers can see your posts
                    </p>
                  </div>
                  <Switch
                    id="private-profile"
                    checked={privacy.privateProfile}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        privateProfile: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="space-y-1">
                    <Label
                      htmlFor="show-email"
                      className="text-base font-medium"
                    >
                      Show Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email on your profile
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        showEmail: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="space-y-1">
                    <Label
                      htmlFor="show-location"
                      className="text-base font-medium"
                    >
                      Show Location
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your location on your profile
                    </p>
                  </div>
                  <Switch
                    id="show-location"
                    checked={privacy.showLocation}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        showLocation: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="space-y-1">
                    <Label
                      htmlFor="allow-tags"
                      className="text-base font-medium"
                    >
                      Allow Tags
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let others tag you in posts
                    </p>
                  </div>
                  <Switch
                    id="allow-tags"
                    checked={privacy.allowTags}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        allowTags: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="allow-dms"
                      className="text-base font-medium"
                    >
                      Allow Direct Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can send you direct messages
                    </p>
                  </div>
                  <Switch
                    id="allow-dms"
                    checked={privacy.allowDMs}
                    onCheckedChange={(checked) =>
                      setPrivacy({
                        ...privacy,
                        allowDMs: checked,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSavePrivacy}
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={savingPrivacy}
                  >
                    <Save className="h-4 w-4" />
                    {savingPrivacy ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="space-y-4 pb-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-foreground">
                    General
                  </h3>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="email-notifications"
                        className="text-base font-medium"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="push-notifications"
                        className="text-base font-medium"
                      >
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          pushNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Activity
                  </h3>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="post-likes"
                        className="text-base font-medium"
                      >
                        Post Likes
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When someone likes your post
                      </p>
                    </div>
                    <Switch
                      id="post-likes"
                      checked={notifications.postLikes}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          postLikes: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="post-comments"
                        className="text-base font-medium"
                      >
                        Post Comments
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When someone comments on your post
                      </p>
                    </div>
                    <Switch
                      id="post-comments"
                      checked={notifications.postComments}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          postComments: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="new-followers"
                        className="text-base font-medium"
                      >
                        New Followers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When someone follows you
                      </p>
                    </div>
                    <Switch
                      id="new-followers"
                      checked={notifications.newFollowers}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          newFollowers: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="mentions"
                        className="text-base font-medium"
                      >
                        Mentions
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        When someone mentions you
                      </p>
                    </div>
                    <Switch
                      id="mentions"
                      checked={notifications.mentions}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          mentions: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="event-reminders"
                        className="text-base font-medium"
                      >
                        Event Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for upcoming events
                      </p>
                    </div>
                    <Switch
                      id="event-reminders"
                      checked={notifications.eventReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          eventReminders: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveNotifications}
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={savingNotifications}
                  >
                    <Save className="h-4 w-4" />
                    {savingNotifications ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="p-6 bg-card/50 backdrop-blur-xl border-border/50">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Appearance Settings
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() =>
                        setAppearance({ ...appearance, theme: 'light' })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'light'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-white mb-2" />
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button
                      onClick={() =>
                        setAppearance({ ...appearance, theme: 'dark' })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'dark'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-slate-950 mb-2" />
                      <p className="text-sm font-medium">Dark</p>
                    </button>
                    <button
                      onClick={() =>
                        setAppearance({ ...appearance, theme: 'auto' })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.theme === 'auto'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gradient-to-r from-white to-slate-950 mb-2" />
                      <p className="text-sm font-medium">Auto</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setAppearance({ ...appearance, fontSize: size })
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          appearance.fontSize === size
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/50'
                        }`}
                      >
                        <p
                          className={`font-medium mb-1 ${
                            size === 'small'
                              ? 'text-sm'
                              : size === 'medium'
                              ? 'text-base'
                              : 'text-lg'
                          }`}
                        >
                          Aa
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {size}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() =>
                        setAppearance({
                          ...appearance,
                          colorScheme: 'quantum',
                        })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.colorScheme === 'quantum'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gradient-to-br from-cyan-500 to-blue-600 mb-2" />
                      <p className="text-sm font-medium">Quantum</p>
                    </button>
                    <button
                      onClick={() =>
                        setAppearance({
                          ...appearance,
                          colorScheme: 'nebula',
                        })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.colorScheme === 'nebula'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gradient-to-br from-purple-500 to-pink-600 mb-2" />
                      <p className="text-sm font-medium">Nebula</p>
                    </button>
                    <button
                      onClick={() =>
                        setAppearance({
                          ...appearance,
                          colorScheme: 'aurora',
                        })
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        appearance.colorScheme === 'aurora'
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="w-full h-20 rounded bg-gradient-to-br from-green-500 to-teal-600 mb-2" />
                      <p className="text-sm font-medium">Aurora</p>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveAppearance}
                    className="bg-primary hover:bg-primary/90 gap-2"
                    disabled={savingAppearance}
                  >
                    <Save className="h-4 w-4" />
                    {savingAppearance ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

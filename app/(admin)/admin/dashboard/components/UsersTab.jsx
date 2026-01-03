'use client';

import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Edit,
  Mail,
  Trash2,
  MoreVertical,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';

export default function UsersTab({
  loading,
  users,
  searchQuery,
  onSearchChange,
  onRoleChange,
  updatingRoleId,
  currentUserId,
}) {
  return (
    <TabsContent value="users" className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur-xl border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background/50 border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold">Member</th>
                <th className="text-left p-4 text-sm font-semibold">Role</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="text-left p-4 text-sm font-semibold">Joined</th>
                <th className="text-left p-4 text-sm font-semibold">
                  Activity
                </th>
                <th className="text-right p-4 text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No members found.
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      user.name.toLowerCase().includes(query) ||
                      user.email.toLowerCase().includes(query) ||
                      user.role.toLowerCase().includes(query)
                    );
                  })
                  .map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-background/50 transition-colors"
                    >
                      <td className="p-4">
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
                      </td>
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            onRoleChange(user.id, e.target.value)
                          }
                          disabled={
                            updatingRoleId === user.id ||
                            user.id === currentUserId
                          }
                          className="h-9 rounded-md border border-border bg-background/50 px-2 text-sm text-foreground disabled:opacity-60"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
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
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </TabsContent>
  );
}

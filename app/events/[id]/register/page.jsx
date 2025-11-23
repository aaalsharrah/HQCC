"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, ArrowLeft, Plus, X, Check, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AppSidebarContent } from "../../../components/AppSidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/firebase/auth-context"
import { getEvent, registerForEvent } from "@/lib/firebase/events"
import { Loader2 } from "lucide-react"

export default function EventRegistrationPage() {
  const { user, loading: authLoading } = useAuth()
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [teamName, setTeamName] = useState("")
  const [teamMembers, setTeamMembers] = useState([])
  const [newMember, setNewMember] = useState("")
  const [tripReason, setTripReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      setEventId(id)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !eventId) return

    const loadEvent = async () => {
      setIsLoading(true)
      try {
        const evt = await getEvent(eventId)
        if (evt) {
          setEvent(evt)
        }
        if (user && evt?.type === "hackathon") {
          setTeamMembers([user.displayName || user.email?.split('@')[0] || 'You'])
        }
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId, authLoading, user])

  const handleAddMember = () => {
    if (newMember && teamMembers.length < 6) {
      setTeamMembers([...teamMembers, newMember])
      setNewMember("")
    }
  }

  const handleRemoveMember = (index) => {
    if (teamMembers.length > 1) {
      const newMembers = [...teamMembers]
      newMembers.splice(index, 1)
      setTeamMembers(newMembers)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!event || !user) return

    setIsSubmitting(true)
    try {
      await registerForEvent({
        eventId,
        userId: user.uid,
        registrationType: event.registrationType || (event.type === "hackathon" ? "group" : event.type === "trip" ? "individual" : "open"),
        data: {
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          userEmail: user.email || '',
          ...(event.type === "hackathon" && { teamName, teamMembers }),
          ...(event.type === "trip" && { tripReason }),
        },
      })
      setIsSuccess(true)
    } catch (error) {
      console.error('Error registering for event:', error)
      alert('Failed to register. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-foreground/60 mb-4">Event not found</p>
            <a href="/events" className="text-primary hover:underline">
              Back to Events
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Registration Confirmed!</CardTitle>
            <CardDescription>
              {event.type === "trip"
                ? "Your application has been received. The board will review it shortly."
                : "You are successfully registered for the event."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild className="w-full">
              <a href="/events">Back to Events</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 border-r border-border bg-background/50 backdrop-blur-xl z-30">
        <AppSidebarContent />
      </div>

      <div className="flex-1 md:ml-64 w-full">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <AppSidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/events">
                <ArrowLeft className="w-5 h-5" />
              </a>
            </Button>
            <h1 className="text-xl font-bold">Registration</h1>
          </div>
        </header>

        <main className="p-4 md:p-6 max-w-2xl mx-auto">
          <div className="mb-8">
            <Badge className="mb-2">{event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Event'}</Badge>
            <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{event.date?.toDate ? event.date.toDate().toLocaleDateString() : event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <Card className="border-primary/10 bg-card/40">
            <CardHeader>
              <CardTitle>Complete Registration</CardTitle>
              <CardDescription>Please fill out the details below to secure your spot.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Attendee</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
                    <Avatar>
                      <AvatarImage src={user?.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{(user?.displayName || user?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {event.type === "hackathon" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input
                        id="teamName"
                        placeholder="Enter your team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Team Members (Min 3, Max 6)</Label>
                        <span className="text-xs text-muted-foreground">{teamMembers.length}/6 Members</span>
                      </div>

                      <div className="space-y-2">
                        {teamMembers.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                {member[0]}
                              </div>
                              <span className="text-sm">
                                {member} {index === 0 && "(Captain)"}
                              </span>
                            </div>
                            {index !== 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveMember(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {teamMembers.length < 6 && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Add member name or email"
                            value={newMember}
                            onChange={(e) => setNewMember(e.target.value)}
                            className="h-9"
                          />
                          <Button type="button" size="sm" onClick={handleAddMember} disabled={!newMember}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                      )}
                      {teamMembers.length < 3 && (
                        <p className="text-xs text-destructive">You need at least 3 members to register.</p>
                      )}
                    </div>
                  </>
                )}

                {event.type === "trip" && (
                  <div className="space-y-2">
                    <Label htmlFor="reason">Why do you want to join this trip?</Label>
                    <Textarea
                      id="reason"
                      placeholder="Tell us how this trip aligns with your quantum computing goals..."
                      className="min-h-[100px]"
                      value={tripReason}
                      onChange={(e) => setTripReason(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This trip has limited capacity. Board members will review applications.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || (event.type === "hackathon" && (teamMembers.length < 3 || !teamName))}
                >
                  {isSubmitting
                    ? "Processing..."
                    : event.type === "trip"
                      ? "Submit Application"
                      : "Confirm Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}


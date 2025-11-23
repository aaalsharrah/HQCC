'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, ArrowRight, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AppSidebarContent } from '../components/AppSidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/lib/firebase/auth-context'
import { getEvents } from '@/lib/firebase/events'
import { Loader2 } from 'lucide-react'

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    const loadEvents = async () => {
      setIsLoading(true)
      try {
        const allEvents = await getEvents()
        setEvents(allEvents)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-xl font-bold">Upcoming Events</h1>
        </header>

        <main className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
              <p className="text-foreground/60 mb-4">No events scheduled</p>
              <p className="text-sm text-foreground/50">Check back later for upcoming events!</p>
            </div>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden bg-card/50 border-primary/10 hover:border-primary/30 transition-all"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto bg-muted relative">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20" />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                        {event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Event'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl md:text-2xl">{event.title}</CardTitle>
                      </div>
                      <CardDescription className="mb-4 text-base">{event.description}</CardDescription>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {event.date?.toDate ? event.date.toDate().toLocaleDateString() : event.date} • {event.time || "All Day"}
                        </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{event.attendeesCount || 0} Attending</span>
                        </div>
                      </div>
                    </div>

                    <CardFooter className="p-0">
                      <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        <a href={`/events/register?id=${event.id}`}>
                          Register Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))
          )}
        </main>
      </div>
    </div>
  )
}

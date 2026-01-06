"use client"

import { useEffect, useState } from "react"
import { Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/app/lib/firebase/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

export function Team() {
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const roleOrder = {
    president: 1,
    vice_president: 2,
    secretary: 3,
    treasurer: 4,
    advisor: 5,
  }

  const prettyRole = (value) => {
    switch (value) {
      case "president":
        return "President"
      case "vice_president":
        return "Vice President"
      case "secretary":
        return "Secretary"
      case "treasurer":
        return "Treasurer"
      case "advisor":
        return "Advisor"
      default:
        return "Admin"
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadAdmins() {
      try {
        const membersRef = collection(db, "members")
        const q = query(membersRef, where("role", "==", "admin"))
        const snap = await getDocs(q)
        const admins = snap.docs
          .map((docSnap) => {
            const data = docSnap.data()
            const name = data.name || "Admin"
            const initials = name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
            return {
              id: docSnap.id,
              name,
              role: prettyRole(data.boardRole),
              roleKey: data.boardRole || "",
              initials,
              bio: data.bio || "",
              linkedin: data.linkedin || "",
              email: data.email || "",
              avatar: data.avatar || "",
              deleted: !!data.deleted,
            }
          })
          .filter((member) => !member.deleted)
          .sort((a, b) => {
            const aOrder = roleOrder[a.roleKey] || 99
            const bOrder = roleOrder[b.roleKey] || 99
            if (aOrder !== bOrder) return aOrder - bOrder
            return a.name.localeCompare(b.name)
          })

        if (mounted) {
          setTeamMembers(admins)
        }
      } catch (err) {
        console.error("Failed to load leadership team", err)
        if (mounted) setTeamMembers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAdmins()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section
      id="team"
      className="py-32 px-4 sm:px-6 lg:px-8 relative bg-linear-to-b from-background to-card/20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Leadership Team
          </h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated team driving quantum innovation at Hofstra
          </p>
        </div>

        {/* HORIZONTAL SCROLL */}
        {loading ? (
          <div className="text-center text-muted-foreground">
            Loading leadership team...
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No admins found yet.
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="min-w-[260px] max-w-[280px] snap-start bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Avatar */}
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-28 h-28 rounded-full object-cover border border-border mb-6"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center mb-6">
                    <span className="text-4xl font-bold text-primary-foreground">
                      {member.initials}
                    </span>
                  </div>
                )}

                {/* Name & Role */}
                <h3 className="text-2xl font-bold text-foreground">{member.name}</h3>
                <p className="text-primary text-lg mb-3">{member.role}</p>

                {/* Bio */}
                <p className="text-foreground/60 text-sm mb-6 leading-relaxed max-w-xs">
                  {member.bio || "HQCC leadership team member."}
                </p>

                {/* Socials */}
                <div className="flex gap-3">
                  {member.linkedin && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all bg-transparent"
                      asChild
                    >
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <Linkedin className="w-5 h-5 text-primary" />
                      </a>
                    </Button>
                  )}
                  {member.email && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all bg-transparent"
                      asChild
                    >
                      <a href={`mailto:${member.email}`} aria-label={`${member.name} Email`}>
                        <Mail className="w-5 h-5 text-primary" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 inline-block">
            <p className="text-foreground/60 mb-4">
              Interested in joining the leadership team?
            </p>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <a href="#join">Get Involved</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

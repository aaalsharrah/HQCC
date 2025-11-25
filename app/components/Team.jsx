"use client"

import { Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const teamMembers = [
  {
    name: "Abdallah Aisharrah",
    role: "Founder & President",
    initials: "AA",
    bio: "Passionate about advancing quantum computing education and research at Hofstra University. Dedicated to building a vibrant community of quantum enthusiasts.",
    linkedin: "https://www.linkedin.com/",
    email: "abdallah@example.com",
  },
  {
    name: "Subhan Nadeem",
    role: "Co-Founder & Vice President",
    initials: "SN",
    bio: "Focused on building scalable developer tools, AI-powered platforms, and growing HQCC into a leading quantum & computing community at Hofstra.",
    linkedin: "https://www.linkedin.com/",
    email: "subhan@example.com",
  },
]

export function Team() {
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

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center"
            >
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center mb-6">
                <span className="text-4xl font-bold text-primary-foreground">
                  {member.initials}
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-2xl font-bold text-foreground">{member.name}</h3>
              <p className="text-primary text-lg mb-3">{member.role}</p>

              {/* Bio */}
              <p className="text-foreground/60 text-sm mb-6 leading-relaxed max-w-xs">
                {member.bio}
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

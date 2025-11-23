"use client"

import { Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Team() {
  return (
    <section id="team" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-background to-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">Leadership Team</h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated team driving quantum innovation at Hofstra
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card hover:border-primary/50 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <span className="text-4xl font-bold text-primary-foreground">AA</span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-1">Abdallah Alsharrah</h3>
                <p className="text-primary text-lg mb-4">Founder & President</p>
                <p className="text-foreground/60 mb-6 leading-relaxed">
                  Passionate about advancing quantum computing education and research at Hofstra University. Dedicated
                  to building a vibrant community of quantum enthusiasts.
                </p>

                <div className="flex gap-3 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all bg-transparent"
                  >
                    <Linkedin className="w-5 h-5 text-primary" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all bg-transparent"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 inline-block">
              <p className="text-foreground/60 mb-4">Interested in joining the leadership team?</p>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <a href="#join">Get Involved</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

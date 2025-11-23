"use client"

import { Brain, Cpu, Users, Zap } from "lucide-react"

export function About() {
  const features = [
    {
      icon: Brain,
      title: "Learn Quantum",
      description: "Master the fundamentals of quantum mechanics and computing algorithms",
    },
    {
      icon: Cpu,
      title: "Build Projects",
      description: "Create quantum applications using IBM Qiskit and other platforms",
    },
    {
      icon: Users,
      title: "Network",
      description: "Connect with industry professionals and quantum enthusiasts",
    },
    {
      icon: Zap,
      title: "Innovate",
      description: "Participate in hackathons and cutting-edge research",
    },
  ]

  return (
    <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-linear-to-b from-background to-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            What is Quantum Computing?
          </h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Quantum computing harnesses quantum mechanics to process information in revolutionary ways, solving complex
            problems beyond classical computers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:scale-105"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Active Members", value: "50+" },
            { label: "Events/Year", value: "20+" },
            { label: "Lab Visits", value: "5+" },
            { label: "Hackathons", value: "3+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 hover:bg-card hover:scale-105 transition-all duration-300"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-foreground/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

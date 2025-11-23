"use client"

import { Building2, Code2, Mic, GraduationCap } from "lucide-react"

export function Activities() {
  const activities = [
    {
      icon: Building2,
      title: "Tours & Lab Visits",
      description: "Tours of local labs to see real systems and meet engineers",
    },
    {
      icon: Code2,
      title: "Hackathons & Build Sprints",
      description: "Develop practical quantum solutions in fast-paced environments",
    },
    {
      icon: Mic,
      title: "Industry Speakers",
      description: "Gain insights from leading figures in the quantum field",
    },
    {
      icon: GraduationCap,
      title: "University Collaboration",
      description: "Work on interdisciplinary projects with peers and faculty",
    },
  ]

  return (
    <section
      id="activities"
      className="py-32 px-4 sm:px-6 lg:px-8 relative bg-linear-to-b from-card/20 to-background"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 text-balance">Club Activities</h2>
          <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
            Engage in hands-on experiences that bridge theory and practice in quantum computing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div
                key={index}
                className="group bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:bg-card hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-primary mb-3">{activity.title}</h3>
                    <p className="text-foreground/60 leading-relaxed text-lg">{activity.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-foreground mb-8 text-center">What You&apos;ll Learn</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Qubits",
              "Superposition",
              "Entanglement",
              "Quantum Gates",
              "Algorithms",
              "Error Correction",
              "Cryptography",
              "Optimization",
            ].map((concept, index) => (
              <div
                key={index}
                className="bg-primary/10 hover:bg-primary/20 rounded-lg px-4 py-3 text-center font-mono text-sm text-primary cursor-pointer transition-all hover:scale-105"
              >
                {concept}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

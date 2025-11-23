import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Activities } from "@/components/activities"
import { Team } from "@/components/team"
// import { Join } from "@/components/join"
import { Navigation } from "@/components/navigation"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />
      <Hero />
      <About />
      <Activities />
      <Team />
      {/* <Join /> */}
    </div>
  )
}

import { About } from "./components/About";
import { Activities } from "./components/Activities";
import { Hero } from "./components/Hero";
import { Join } from "./components/Join";
import { Navigation } from "./components/Navigation";
import { Team } from "./components/Team";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />
      <Hero />
      <About />
      <Activities />
      <Team />
      <Join />
    </div>
  )
}

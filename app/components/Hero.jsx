'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Quantum3DBackground from './Quantum-3d-Background';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Quantum3DBackground />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 ">
        <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-border">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Hofstra University
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-balance">
          <span className="block text-foreground mb-3">HQCC</span>
          <span className="block text-4xl sm:text-5xl lg:text-6xl bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient">
            Quantum Computing Club
          </span>
        </h1>

        <p className="text-2xl sm:text-3xl font-semibold text-primary/90 mb-8 tracking-wide">
          EXPLORE • BUILD • COLLABORATE
        </p>

        <p className="text-lg sm:text-xl text-foreground/60 mb-12 max-w-3xl mx-auto leading-relaxed">
          Dive into the frontier of quantum computing with like-minded peers and
          pioneering mentors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-xl group transition-all hover:scale-105"
          >
            <Link href={'/signup'} className="flex items-center gap-2">
              Join the Club
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 rounded-xl border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all bg-transparent"
          >
            <a href="#activities">Explore Activities</a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-secondary/50 to-dark-bg pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent-pink/30 bg-accent-pink/5 text-accent-pink text-xs font-medium tracking-wider uppercase">
          Trusted by 0 security experts worldwide
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
          <span className="bg-gradient-to-r from-white via-text-primary to-white bg-clip-text text-transparent">
            Definitely Not
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent-pink via-accent-cyan to-accent-pink bg-clip-text text-transparent">
            a Virus.
          </span>
        </h1>

        <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          100% of our 3 employees agree: this site is{" "}
          <span className="text-accent-cyan italic">probably</span> safe.
          Zero viruses detected. We checked with WebMD.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#featured-games"
            className="group relative px-8 py-4 rounded-xl font-semibold text-dark-bg bg-gradient-to-r from-accent-pink to-accent-cyan transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(255,79,216,0.5)]"
          >
            <span className="relative z-10">Browse Games</span>
          </a>
          <a
            href="#security"
            className="group relative px-8 py-4 rounded-xl font-semibold text-text-primary border border-white/10 bg-white/5 transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-[0_0_30px_-5px_rgba(110,231,255,0.3)]"
          >
            <span className="relative z-10">Scan Downloads</span>
          </a>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 text-text-secondary text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          All downloads are 100% totally definitely checked
        </div>
      </div>
    </section>
  );
}

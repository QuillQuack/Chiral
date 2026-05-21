import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import Hero from "@/components/Hero";
import FeaturedGames from "@/components/FeaturedGames";
import WarningBanner from "@/components/WarningBanner";
import SecuritySection from "@/components/SecuritySection";
import CommunityReviews from "@/components/CommunityReviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <ParticleField />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <FeaturedGames />
        <WarningBanner />
        <SecuritySection />
        <CommunityReviews />
      </main>
      <Footer />
    </>
  );
}

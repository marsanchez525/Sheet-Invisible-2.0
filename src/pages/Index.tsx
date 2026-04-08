import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import ChatInterface from "@/components/ChatInterface";
import ArchitectureSection from "@/components/ArchitectureSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ChatInterface />
      <ArchitectureSection />
      <FooterSection />
    </div>
  );
};

export default Index;

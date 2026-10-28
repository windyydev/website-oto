import HeroSection from "@/components/sections/HeroSection";
import FeaturedCarsSection from "@/components/sections/FeaturedCarsSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import AboutStatsSection from "@/components/sections/AboutStatsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestDriveCTASection from "@/components/sections/TestDriveCTASection";
import LatestNewsSection from "@/components/sections/LatestNewsSection";
import ContactConsultSection from "@/components/sections/ContactConsultSection";
import JsonLd, { generateAutoDealerSchema } from "@/components/seo/JsonLd";

export default function HomePage() {
  const autoDealerSchema = generateAutoDealerSchema();

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={autoDealerSchema} />
      {/* 1. Hero Section & Quick Search */}
      <HeroSection />

      {/* 2. Featured Spotlight Cars */}
      <FeaturedCarsSection />

      {/* 3. Why Us / 3 Atelier Pillars */}
      <WhyUsSection />

      {/* 4. Stats & Credibility */}
      <AboutStatsSection />

      {/* 5. Services Ecosystem */}
      <ServicesSection />

      {/* 6. Test Drive Call To Action */}
      <TestDriveCTASection />

      {/* 7. Latest Automotive Insights */}
      <LatestNewsSection />

      {/* 8. Private Contact & Consultation */}
      <ContactConsultSection />
    </div>
  );
}

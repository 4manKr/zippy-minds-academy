import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import TutorHighlights from "@/components/home/TutorHighlights";
import HowItWorks from "@/components/home/HowItWorks";
import TimezoneFeature from "@/components/home/TimezoneFeature";
import ReviewsCarousel from "@/components/home/ReviewsCarousel";
import StatsSection from "@/components/home/StatsSection";
import FAQSection from "@/components/home/FAQSection";
import CTABanner from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <FeaturedCourses />
      <TutorHighlights />
      <HowItWorks />
      <TimezoneFeature />
      <ReviewsCarousel />
      <StatsSection />
      <FAQSection />
      <CTABanner />
    </>
  );
}

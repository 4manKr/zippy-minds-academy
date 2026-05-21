import HeroSection       from "@/components/home/HeroSection";
import BrandStory        from "@/components/home/BrandStory";
import WhyChooseUs       from "@/components/home/WhyChooseUs";
import ProgramsSection   from "@/components/home/ProgramsSection";
import LearningExperience from "@/components/home/LearningExperience";
import SkillsSection     from "@/components/home/SkillsSection";
import ReviewsCarousel   from "@/components/home/ReviewsCarousel";
import HowItWorks        from "@/components/home/HowItWorks";
import CTABanner         from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStory />
      <WhyChooseUs />
      <ProgramsSection />
      <LearningExperience />
      <SkillsSection />
      <ReviewsCarousel />
      <HowItWorks />
      <CTABanner />
    </>
  );
}

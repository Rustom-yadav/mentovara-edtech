import HeroSection from "@/components/common/HeroSection";
import Features from "@/components/common/Features";
import PopularCoursesList from "@/components/course/PopularCoursesList";
import TeachCTA from "@/components/common/TeachCTA";
import StepsSection from "@/components/common/StepsSection";
import FinalCTA from "@/components/common/FinalCTA";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <StepsSection />
      <Features />
      <PopularCoursesList />
      <TeachCTA />
      <FinalCTA />
    </div>
  );
}

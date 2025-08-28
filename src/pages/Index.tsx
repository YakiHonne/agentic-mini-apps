
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import CourseCards from '@/components/CourseCards';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <CourseCards />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;

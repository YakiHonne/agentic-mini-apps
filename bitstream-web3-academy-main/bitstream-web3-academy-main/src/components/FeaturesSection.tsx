
import { BookOpen, Users, Zap, Target, Trophy, Smartphone } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Multi-format content with videos, quizzes, and hands-on exercises to keep you engaged.',
      color: 'text-bitcoin'
    },
    {
      icon: Users,
      title: 'Community Forums',
      description: 'Connect with fellow learners, ask questions, and share insights in our vibrant community.',
      color: 'text-purple'
    },
    {
      icon: Target,
      title: 'Personalized Progress',
      description: 'Track your learning journey with detailed analytics and customized learning paths.',
      color: 'text-yakihonne'
    },
    {
      icon: Trophy,
      title: 'Skill Certifications',
      description: 'Earn recognized certificates to showcase your expertise in decentralized technologies.',
      color: 'text-bitcoin'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance ensures quick loading and seamless learning across all devices.',
      color: 'text-purple'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Learn anywhere, anytime with our fully responsive design that works on all devices.',
      color: 'text-yakihonne'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Bitstream Analytics?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We've designed every aspect of our platform to provide the best learning experience 
            for mastering decentralized technologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gray-50 hover:bg-white">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <feature.icon className={`h-12 w-12 mx-auto ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

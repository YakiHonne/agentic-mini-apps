
import { Bitcoin, Zap, Users, ArrowRight, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';

const CourseCards = () => {
  const courses = [
    {
      id: 'bitcoin',
      title: 'Bitcoin Ecosystem',
      description: 'Master Bitcoin fundamentals, mining, wallets, and the Lightning Network. Learn how decentralized money works.',
      icon: Bitcoin,
      gradient: 'gradient-bitcoin',
      modules: 12,
      duration: '8 weeks',
      level: 'Beginner',
      students: '5,200+',
      rating: 4.9,
      link: '/bitcoin',
      topics: ['Blockchain Basics', 'Mining & Validation', 'Wallet Security', 'Lightning Network', 'Zaps & Payments']
    },
    {
      id: 'nostr',
      title: 'Nostr Protocol',
      description: 'Dive into the censorship-resistant social protocol. Understand relays, clients, and decentralized identity.',
      icon: Zap,
      gradient: 'gradient-nostr',
      modules: 10,
      duration: '6 weeks',
      level: 'Intermediate',
      students: '3,100+',
      rating: 4.8,
      link: '/nostr',
      topics: ['Protocol Basics', 'Relays & Clients', 'Key Management', 'Event Types', 'NIP Standards']
    },
    {
      id: 'yakihonne',
      title: 'Yakihonne Platform',
      description: 'Master long-form decentralized publishing. Learn content creation, curation, and community building.',
      icon: Users,
      gradient: 'gradient-yakihonne',
      modules: 8,
      duration: '4 weeks',
      level: 'Advanced',
      students: '1,800+',
      rating: 4.9,
      link: '/yakihonne',
      topics: ['Content Creation', 'Markdown Editor', 'Social Features', 'Relay Management', 'Community Building']
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Path
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Structured curricula designed to take you from beginner to expert in the decentralized web
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card key={course.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0 overflow-hidden">
              <div className={`h-2 ${course.gradient}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${course.gradient}`}>
                    <course.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-bitcoin transition-colors">
                  {course.title}
                </CardTitle>
                
                <CardDescription className="text-gray-600 leading-relaxed">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    {course.rating}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {course.modules} modules • {course.students} students
                </div>

                {/* Topics */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">What you'll learn:</h4>
                  <div className="flex flex-wrap gap-1">
                    {course.topics.slice(0, 3).map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {course.topics.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link to={course.link} className="block">
                  <Button className="w-full group mt-6">
                    Start Course
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCards;


import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Bitcoin as BitcoinIcon, Zap, Shield, TrendingUp, Users, Play, BookOpen, Clock, Star } from 'lucide-react';

const Bitcoin = () => {
  const modules = [
    {
      title: "Bitcoin Fundamentals",
      description: "Understanding the basics of Bitcoin, blockchain, and decentralized money",
      duration: "45 min",
      lessons: 8,
      completed: true,
      progress: 100
    },
    {
      title: "Blockchain Technology",
      description: "Deep dive into how blockchain works, mining, and consensus mechanisms",
      duration: "60 min",
      lessons: 12,
      completed: true,
      progress: 100
    },
    {
      title: "Bitcoin Wallets & Security",
      description: "Learn about different wallet types, private keys, and security best practices",
      duration: "40 min",
      lessons: 10,
      completed: false,
      progress: 70
    },
    {
      title: "Lightning Network",
      description: "Understand Layer 2 scaling solutions and instant Bitcoin payments",
      duration: "50 min",
      lessons: 9,
      completed: false,
      progress: 30
    },
    {
      title: "Bitcoin Mining",
      description: "Explore mining operations, hardware, and the economics of Bitcoin mining",
      duration: "55 min",
      lessons: 11,
      completed: false,
      progress: 0
    },
    {
      title: "DeFi on Bitcoin",
      description: "Discover decentralized finance applications built on Bitcoin",
      duration: "35 min",
      lessons: 7,
      completed: false,
      progress: 0
    }
  ];

  const videos = [
    {
      title: "What is Bitcoin? Complete Beginner's Guide",
      duration: "12:34",
      views: "1.2M",
      thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=225&fit=crop"
    },
    {
      title: "How Bitcoin Mining Actually Works",
      duration: "18:45",
      views: "890K",
      thumbnail: "https://images.unsplash.com/photo-1640161704729-cbe966a08476?w=400&h=225&fit=crop"
    },
    {
      title: "Lightning Network Explained Simply",
      duration: "15:20",
      views: "560K",
      thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=225&fit=crop"
    }
  ];

  const resources = [
    {
      title: "Bitcoin Whitepaper",
      description: "The original Bitcoin whitepaper by Satoshi Nakamoto",
      type: "PDF",
      icon: BookOpen
    },
    {
      title: "Bitcoin Developer Guide",
      description: "Technical documentation for Bitcoin development",
      type: "Documentation",
      icon: BookOpen
    },
    {
      title: "Bitcoin Core GitHub",
      description: "Official Bitcoin Core implementation repository",
      type: "Code Repository",
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-bitcoin/10 via-orange-50 to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-bitcoin rounded-full">
                <BitcoinIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Master Bitcoin Ecosystem
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Complete your journey from Bitcoin basics to advanced concepts including Lightning Network, 
              mining, and DeFi applications built on the world's first cryptocurrency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-bitcoin text-white">
                <Play className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Course Overview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-bitcoin" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Course Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-bitcoin" />
              <div className="text-2xl font-bold text-gray-900">8 hours</div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-bitcoin" />
              <div className="text-2xl font-bold text-gray-900">5,200+</div>
              <div className="text-sm text-gray-600">Students Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-bitcoin" />
              <div className="text-2xl font-bold text-gray-900">4.9</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Modules */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Modules</h2>
          <div className="space-y-6">
            {modules.map((module, index) => (
              <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${module.completed ? 'border-green-200 bg-green-50/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-500' : 'bg-bitcoin'}`}>
                        {module.completed ? (
                          <Shield className="h-5 w-5 text-white" />
                        ) : (
                          <BitcoinIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={module.completed ? "default" : "outline"} className="mb-2">
                        {module.completed ? "Completed" : `${module.progress}%`}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {module.lessons} lessons • {module.duration}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={module.progress} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Progress: {module.progress}%
                      </span>
                      <Button size="sm" variant={module.completed ? "outline" : "default"}>
                        {module.completed ? "Review" : "Continue"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Videos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Video Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                    <div className="p-3 bg-white/90 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-6 w-6 text-bitcoin" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-base group-hover:text-bitcoin transition-colors">
                    {video.title}
                  </CardTitle>
                  <CardDescription>
                    {video.views} views
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-bitcoin/10 rounded-lg">
                      <resource.icon className="h-5 w-5 text-bitcoin" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    Access Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Bitcoin;

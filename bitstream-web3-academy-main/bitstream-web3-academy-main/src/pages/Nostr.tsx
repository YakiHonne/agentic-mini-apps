import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Network, Users, Play, BookOpen, Clock, Star, Globe, Key, MessageSquare } from 'lucide-react';

const Nostr = () => {
  const modules = [
    {
      title: "Nostr Protocol Basics",
      description: "Introduction to the censorship-resistant social protocol",
      duration: "30 min",
      lessons: 6,
      completed: true,
      progress: 100
    },
    {
      title: "Keys & Identity",
      description: "Understanding public/private keys and decentralized identity",
      duration: "25 min",
      lessons: 5,
      completed: true,
      progress: 100
    },
    {
      title: "Relays & Infrastructure",
      description: "How Nostr relays work and network architecture",
      duration: "40 min",
      lessons: 8,
      completed: false,
      progress: 60
    },
    {
      title: "Nostr Clients",
      description: "Exploring different Nostr clients and their features",
      duration: "35 min",
      lessons: 7,
      completed: false,
      progress: 20
    },
    {
      title: "NIPs (Nostr Implementation Possibilities)",
      description: "Understanding Nostr standards and protocol extensions",
      duration: "45 min",
      lessons: 9,
      completed: false,
      progress: 0
    },
    {
      title: "Building on Nostr",
      description: "Developer guide to creating Nostr applications",
      duration: "60 min",
      lessons: 12,
      completed: false,
      progress: 0
    }
  ];

  const videos = [
    {
      title: "What is Nostr? Decentralized Social Media Explained",
      duration: "14:22",
      views: "450K",
      thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop"
    },
    {
      title: "Setting Up Your First Nostr Client",
      duration: "08:15",
      views: "280K",
      thumbnail: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=225&fit=crop"
    },
    {
      title: "Understanding Nostr Relays",
      duration: "16:33",
      views: "195K",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop"
    }
  ];

  const clients = [
    {
      name: "Damus",
      description: "Native iOS client with clean interface",
      platform: "iOS",
      features: ["Native iOS", "Lightning Tips", "Media Support"]
    },
    {
      name: "Amethyst",
      description: "Feature-rich Android client",
      platform: "Android", 
      features: ["Android Native", "Advanced Features", "Customizable"]
    },
    {
      name: "Iris",
      description: "Web-based Nostr client",
      platform: "Web",
      features: ["Web Based", "Easy Setup", "Cross Platform"]
    },
    {
      name: "Nostter",
      description: "Twitter-like interface for Nostr",
      platform: "Web",
      features: ["Familiar UI", "Web Based", "Social Features"]
    }
  ];

  const resources = [
    {
      title: "Nostr Protocol Specification",
      description: "Official protocol documentation and NIPs",
      type: "Documentation",
      icon: BookOpen
    },
    {
      title: "Nostr Developer Resources",
      description: "Tools and libraries for building on Nostr",
      type: "Development",
      icon: BookOpen
    },
    {
      title: "Public Relay List",
      description: "Curated list of public Nostr relays",
      type: "Infrastructure",
      icon: Network
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple/10 via-pink-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple rounded-full">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Master the Nostr Protocol
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Learn the censorship-resistant social protocol that's revolutionizing decentralized 
              communication. From basics to building your own applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-purple hover:bg-purple/90 text-white">
                <Play className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline">
                <Globe className="mr-2 h-5 w-5" />
                Explore Clients
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
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple" />
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div className="text-sm text-gray-600">Course Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple" />
              <div className="text-2xl font-bold text-gray-900">6 hours</div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple" />
              <div className="text-2xl font-bold text-gray-900">3,100+</div>
              <div className="text-sm text-gray-600">Students Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple" />
              <div className="text-2xl font-bold text-gray-900">4.8</div>
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
                      <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-500' : 'bg-purple'}`}>
                        {module.completed ? (
                          <Shield className="h-5 w-5 text-white" />
                        ) : (
                          <Zap className="h-5 w-5 text-white" />
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

        {/* Popular Nostr Clients */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Nostr Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clients.map((client, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <Badge variant="outline">{client.platform}</Badge>
                  </div>
                  <CardDescription>{client.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {client.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Try {client.name}
                    </Button>
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
                      <Play className="h-6 w-6 text-purple" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-base group-hover:text-purple transition-colors">
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
                    <div className="p-2 bg-purple/10 rounded-lg">
                      <resource.icon className="h-5 w-5 text-purple" />
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

export default Nostr;

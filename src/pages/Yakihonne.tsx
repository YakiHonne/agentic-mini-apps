
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Star } from 'lucide-react';

const Yakihonne = () => {
  const modules = [
    {
      title: "Yakihonne Introduction",
      description: "Getting started with decentralized long-form publishing",
      duration: "20 min",
      lessons: 4,
      completed: true,
      progress: 100
    },
    {
      title: "Content Creation", 
      description: "Writing and formatting long-form content on Yakihonne",
      duration: "35 min",
      lessons: 7,
      completed: false,
      progress: 30
    },
    {
      title: "Community Building",
      description: "Growing your audience and engaging with readers",
      duration: "40 min",
      lessons: 8,
      completed: false,
      progress: 0
    },
    {
      title: "Monetization Strategies",
      description: "Earning from your content through various methods",
      duration: "30 min",
      lessons: 6,
      completed: false,
      progress: 0
    }
  ];

  const videos = [
    {
      title: "Getting Started with Yakihonne",
      duration: "10:45",
      views: "125K",
      thumbnail: "/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png"
    },
    {
      title: "Creating Your First Long-form Post",
      duration: "12:30",
      views: "98K",
      thumbnail: "/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png"
    },
    {
      title: "Building Community on Yakihonne",
      duration: "15:18",
      views: "76K",
      thumbnail: "/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png"
    }
  ];

  const features = [
    {
      title: "Long-form Publishing",
      description: "Create detailed articles, essays, and stories with rich formatting",
      color: "text-yakihonne"
    },
    {
      title: "Media Integration",
      description: "Embed images, videos, and other media seamlessly",
      color: "text-yakihonne"
    },
    {
      title: "Community Features",
      description: "Build engaged communities around your content",
      color: "text-yakihonne"
    },
    {
      title: "Decentralized",
      description: "Content stored on decentralized infrastructure",
      color: "text-yakihonne"
    },
    {
      title: "Monetization",
      description: "Multiple ways to earn from your content",
      color: "text-yakihonne"
    },
    {
      title: "Cross-platform",
      description: "Publish to multiple platforms simultaneously",
      color: "text-yakihonne"
    }
  ];

  const contentTypes = [
    {
      title: "Articles & Essays",
      description: "In-depth articles on topics you're passionate about",
      examples: ["Technical guides", "Opinion pieces", "Research articles"]
    },
    {
      title: "Stories & Fiction",
      description: "Creative writing and storytelling",
      examples: ["Short stories", "Serialized novels", "Poetry"]
    },
    {
      title: "Tutorials & Guides",
      description: "Educational content and how-to guides",
      examples: ["Step-by-step tutorials", "Learning resources", "Best practices"]
    },
    {
      title: "News & Commentary",
      description: "Current events and analysis",
      examples: ["Industry news", "Market analysis", "Commentary"]
    }
  ];

  const resources = [
    {
      title: "Yakihonne Documentation",
      description: "Complete guide to using Yakihonne platform",
      type: "Documentation"
    },
    {
      title: "Content Creator Toolkit",
      description: "Tools and resources for content creators",
      type: "Tools"
    },
    {
      title: "Community Guidelines",
      description: "Best practices for building communities",
      type: "Guidelines"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yakihonne/10 via-blue-50 to-cyan-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-lg">
                <img 
                  src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                  alt="Yakihonne Logo" 
                  className="h-16 w-16 object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Master Yakihonne Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Learn to create compelling long-form content, build engaged communities, 
              and monetize your expertise on the decentralized publishing platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yakihonne hover:bg-yakihonne/90 text-white">
                <Play className="mr-2 h-5 w-5" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline">
                <img 
                  src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                  alt="Yakihonne" 
                  className="mr-2 h-5 w-5 object-contain"
                />
                Create Content
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
              <img 
                src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                alt="Yakihonne" 
                className="h-8 w-8 mx-auto mb-2 object-contain"
              />
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Course Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yakihonne" />
              <div className="text-2xl font-bold text-gray-900">4 hours</div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <img 
                src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                alt="Yakihonne" 
                className="h-8 w-8 mx-auto mb-2 object-contain"
              />
              <div className="text-2xl font-bold text-gray-900">1,800+</div>
              <div className="text-sm text-gray-600">Students Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yakihonne" />
              <div className="text-2xl font-bold text-gray-900">4.9</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yakihonne/10 rounded-lg">
                      <img 
                        src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                        alt="Yakihonne" 
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
                      <div className={`p-2 rounded-lg ${module.completed ? 'bg-green-500' : 'bg-yakihonne'}`}>
                        <img 
                          src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                          alt="Yakihonne" 
                          className="h-5 w-5 object-contain brightness-0 invert"
                        />
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

        {/* Content Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Content Types You Can Create</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Examples:</h4>
                    <div className="flex flex-wrap gap-1">
                      {type.examples.map((example, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
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
                  <div className="w-full h-48 bg-yakihonne/5 rounded-t-lg flex items-center justify-center">
                    <img 
                      src={video.thumbnail} 
                      alt="Yakihonne"
                      className="h-20 w-20 object-contain opacity-50"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                    <div className="p-3 bg-white/90 rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-6 w-6 text-yakihonne" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-base group-hover:text-yakihonne transition-colors">
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
                    <div className="p-2 bg-yakihonne/10 rounded-lg">
                      <img 
                        src="/lovable-uploads/fc59dd01-2609-4d46-a35f-3ec30cd763b1.png" 
                        alt="Yakihonne" 
                        className="h-5 w-5 object-contain"
                      />
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

export default Yakihonne;

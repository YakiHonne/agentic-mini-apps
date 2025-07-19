
import { useState } from 'react';
import { Bitcoin, Zap, Users, BookOpen, Trophy, Clock, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [user] = useState({
    name: 'Alex Thompson',
    level: 'Intermediate',
    totalProgress: 65,
    streakDays: 7,
    certificates: 2
  });

  const courseProgress = [
    {
      id: 'bitcoin',
      title: 'Bitcoin Ecosystem',
      icon: Bitcoin,
      progress: 85,
      nextLesson: 'Lightning Network Channels',
      timeLeft: '2 hours',
      gradient: 'from-bitcoin to-orange-600'
    },
    {
      id: 'nostr',
      title: 'Nostr Protocol',
      icon: Zap,
      progress: 60,
      nextLesson: 'Understanding Relays',
      timeLeft: '3 hours',
      gradient: 'from-purple to-pink-600'
    },
    {
      id: 'yakihonne',
      title: 'Yakihonne Platform',
      icon: Users,
      progress: 30,
      nextLesson: 'Content Creation Basics',
      timeLeft: '4 hours',
      gradient: 'from-yakihonne to-blue-600'
    }
  ];

  const recentAchievements = [
    { title: 'Bitcoin Fundamentals', icon: Bitcoin, date: '2 days ago' },
    { title: 'Lightning Network Expert', icon: Zap, date: '1 week ago' }
  ];

  const upcomingLessons = [
    { title: 'Advanced Mining Concepts', course: 'Bitcoin', time: 'Today 3:00 PM' },
    { title: 'Nostr Event Types', course: 'Nostr', time: 'Tomorrow 10:00 AM' },
    { title: 'Yakihonne Communities', course: 'Yakihonne', time: 'Friday 2:00 PM' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">Continue your journey to master decentralized technologies</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-bitcoin to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Overall Progress</p>
                  <p className="text-2xl font-bold">{user.totalProgress}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Learning Streak</p>
                  <p className="text-2xl font-bold">{user.streakDays} days</p>
                </div>
                <Star className="h-8 w-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yakihonne to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Certificates</p>
                  <p className="text-2xl font-bold">{user.certificates}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Current Level</p>
                  <p className="text-2xl font-bold">{user.level}</p>
                </div>
                <Badge className="bg-white text-green-600">Level 3</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Progress */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
            
            {courseProgress.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${course.gradient}`}>
                        <course.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>Next: {course.nextLesson}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.timeLeft} remaining
                      </div>
                      <Link to={`/${course.id}`}>
                        <Button size="sm" className="group">
                          Continue
                          <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-bitcoin" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-bitcoin/10">
                        <achievement.icon className="h-4 w-4 text-bitcoin" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple" />
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingLessons.map((lesson, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.course}</p>
                      <p className="text-xs text-purple">{lesson.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

'use client'; // Can be a client component to use hooks like useAuth

import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, ListChecks, BarChartBig, PlusCircle, Settings } from 'lucide-react';

// Example data - replace with actual data fetching
const exampleStats = [
  { title: "Active Projects", value: "5", icon: Briefcase, color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-500/20" },
  { title: "Clients Managed", value: "12", icon: Users, color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-500/20" },
  { title: "Tasks Due Today", value: "3", icon: ListChecks, color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-500/20" },
  { title: "Overall Progress", value: "75%", icon: BarChartBig, color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-500/20" },
];

const quickActions = [
  { label: "New Project", href: "/projects/create", icon: PlusCircle },
  { label: "New Client", href: "/clients/create", icon: PlusCircle },
  { label: "View Tasks", href: "/tasks", icon: ListChecks }, // Assuming a /tasks page
  { label: "Account Settings", href: "/account", icon: Settings },
];

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
              <CardContent><div className="h-10 bg-muted rounded w-1/2"></div></CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader><div className="h-6 bg-muted rounded w-1/3 mb-2"></div></CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = userProfile?.displayName || user?.displayName || 'User';

  return (
    <div className="space-y-8 p-1"> {/* Reduced padding here as layout provides it */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your construction management activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in" style={{animationDelay: "0.2s"}}>
        {exampleStats.map((stat, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 glass-card dark:glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Card */}
        <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.4s"}}>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Get started with common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" asChild className="justify-start text-left h-auto py-3 hover:bg-primary/10 dark:hover:bg-primary/5 border-gray-300 dark:border-gray-700 transition-all duration-200 transform hover:scale-[1.02]">
                <Link href={action.href}>
                  <action.icon className="mr-3 h-5 w-5 text-brand-blue" />
                  <span className="flex flex-col">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  </span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity or Notifications Card (Placeholder) */}
        <Card className="shadow-lg animate-fade-in glass-card dark:glass-card" style={{animationDelay: "0.6s"}}>
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Recent Activity</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Stay updated with the latest changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {/* Example items - replace with actual data */}
              <li className="text-sm text-gray-700 dark:text-gray-300">Project "Downtown Tower" status updated to "In Progress".</li>
              <li className="text-sm text-gray-700 dark:text-gray-300">New client "Innovate Corp" added.</li>
              <li className="text-sm text-gray-700 dark:text-gray-300">Task "Submit Permit Application" due tomorrow.</li>
            </ul>
            <Button variant="link" asChild className="mt-4 px-0 text-brand-blue">
              <Link href="/activity">View all activity &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  Kanban, 
  Activity, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatsCard } from './StatsCard';
import { ActivityFeed } from './ActivityFeed';
import { TeamPerformance } from './TeamPerformance';
import { ProjectOverview } from './ProjectOverview';
import { RecentActivity } from './RecentActivity';

export function AdminDashboard() {
  const { boards, cards, activities, initializeStore } = useBoardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const totalBoards = boards.length;
  const totalCards = cards.length;
  const completedCards = cards.filter(card => card.listId === 'list3').length; // Assuming list3 is "Done"
  const overdueTasks = cards.filter(card => 
    card.dueDate && new Date(card.dueDate) < new Date()
  ).length;

  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  const stats = [
    {
      title: 'Total Boards',
      value: totalBoards.toString(),
      change: '+12%',
      trend: 'up' as const,
      icon: Kanban,
      color: 'blue',
    },
    {
      title: 'Active Tasks',
      value: (totalCards - completedCards).toString(),
      change: '+8%',
      trend: 'up' as const,
      icon: Clock,
      color: 'orange',
    },
    {
      title: 'Completed Tasks',
      value: completedCards.toString(),
      change: '+23%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks.toString(),
      change: '-5%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-blue-100">
              Here's what's happening with your team today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Completion Rate</p>
            <p className="text-3xl font-bold">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Overview */}
        <div className="lg:col-span-2">
          <ProjectOverview boards={boards} />
        </div>

        {/* Team Performance */}
        <div>
          <TeamPerformance />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={activities.slice(0, 10)} />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}
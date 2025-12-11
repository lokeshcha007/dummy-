'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart3, TrendingUp, FileText, AlertCircle, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Stats, MonthlyData, CategoryData, StatusData, RecentActivity } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalComplaints: 0,
        openComplaints: 0,
        closedComplaints: 0,
        totalRTI: 0
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [statusData, setStatusData] = useState<StatusData[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // 1. Fetch Raw Data
            const { data: complaints } = await supabase.from('complaints').select('id, created_at, complaint_type, status');
            const { data: rtis } = await supabase.from('rti_requests').select('id, created_at, status');
            const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

            const allComplaints = complaints || [];
            const allRTIs = rtis || [];

            // 2. Calculate Summary Stats
            // Treat 'submitted' as pending/open complaints
            const open = allComplaints.filter(c =>
                c.status !== 'Resolved' &&
                c.status !== 'Closed' &&
                c.status !== 'closed' &&
                c.status !== 'resolved'
            ).length;

            const closed = allComplaints.filter(c =>
                c.status === 'Resolved' ||
                c.status === 'Closed' ||
                c.status === 'closed' ||
                c.status === 'resolved'
            ).length;

            setStats({
                totalUsers: userCount || 0,
                totalComplaints: allComplaints.length,
                openComplaints: open,
                closedComplaints: closed,
                totalRTI: allRTIs.length
            });

            // 3. Monthly Trend (Last 6 Months)
            const months: any = {};
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString('default', { month: 'short' });
                months[key] = { name: key, complaints: 0, rti: 0 };
            }

            allComplaints.forEach(c => {
                const d = new Date(c.created_at);
                const key = d.toLocaleString('default', { month: 'short' });
                if (months[key]) months[key].complaints++;
            });

            allRTIs.forEach(r => {
                const d = new Date(r.created_at);
                const key = d.toLocaleString('default', { month: 'short' });
                if (months[key]) months[key].rti++;
            });

            setMonthlyData(Object.values(months));

            // 4. Category Breakdown
            const categories: any = {};
            allComplaints.forEach(c => {
                const type = c.complaint_type || 'Uncategorized';
                categories[type] = (categories[type] || 0) + 1;
            });
            setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value: value as number })));

            // 5. Status Breakdown
            const statuses: any = {};
            allComplaints.forEach(c => {
                const status = c.status || 'Unknown';
                statuses[status] = (statuses[status] || 0) + 1;
            });
            setStatusData(Object.entries(statuses).map(([name, value]) => ({ name, value: value as number })));

            // 6. Recent Activity
            const combined = [
                ...allComplaints.map(c => ({ ...c, type: 'complaint' as const, title: c.complaint_type || 'Complaint' })),
                ...allRTIs.map(r => ({ ...r, type: 'rti' as const, title: 'RTI Request' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10);

            setRecentActivity(combined);

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3 text-primary">
                        <BarChart3 className="w-10 h-10" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Comprehensive insights into complaints, RTI requests, and user activity.
                    </p>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-500">{stats.totalUsers}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Total Complaints
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-500">{stats.totalComplaints}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Open Complaints
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-500">{stats.openComplaints}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Closed Complaints
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-500">{stats.closedComplaints}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                RTI Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-pink-500">{stats.totalRTI}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trend */}
                    <Card className="col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Monthly Trend (Last 6 Months)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="complaints" stroke="#8b5cf6" strokeWidth={2} name="Complaints" />
                                    <Line type="monotone" dataKey="rti" stroke="#ec4899" strokeWidth={2} name="RTI Requests" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Complaint Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${activity.type === 'complaint' ? 'bg-purple-500' : 'bg-pink-500'}`}></div>
                                        <div>
                                            <p className="font-medium">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</p>
                                        </div>
                                    </div>
                                    {activity.status && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${activity.status === 'Resolved' || activity.status === 'Closed'
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-orange-500/20 text-orange-500'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


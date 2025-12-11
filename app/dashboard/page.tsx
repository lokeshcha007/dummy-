'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { UserCard } from '@/components/UserCard';
import { User } from '@/types';

export default function Dashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVerified: 0,
        totalMobileUpdates: 0,
    });

    useEffect(() => {
        fetchUsers();

        const subscription = supabase
            .channel('users_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'users' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchUsers(); // Refresh list on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    async function fetchUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
            calculateStats(data || []);
        }
        setLoading(false);
    }

    function calculateStats(data: any[]) {
        const verified = data.filter(u => u.verification_status?.is_mobile_verified && u.verification_status?.is_aadhaar_verified).length;
        const mobileVerified = data.filter(u => u.verification_status?.is_mobile_verified).length;

        setStats({
            totalVerified: verified,
            totalMobileUpdates: mobileVerified,
        });
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3 text-primary">
                            <ShieldCheck className="w-10 h-10" />
                            Police Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Real-time monitoring of citizen verification and legal inquiries.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Card className="bg-card/50 backdrop-blur border-primary/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <Activity className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Mobile Verified</p>
                                    <h3 className="text-2xl font-bold">{stats.totalMobileUpdates}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur border-primary/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fully Verified</p>
                                    <h3 className="text-2xl font-bold">{stats.totalVerified}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <main>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((user) => (
                                <UserCard key={user.chat_id} user={user} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}


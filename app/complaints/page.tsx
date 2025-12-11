'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileText, Clock, CheckCircle, XCircle, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Complaint } from '@/types';

type TabType = 'pending' | 'open' | 'closed';

export default function ComplaintsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchComplaints();

        // Setup realtime subscription
        const subscription = supabase
            .channel('complaints_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'complaints' },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchComplaints();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchComplaints = async () => {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching complaints:', error);
        } else {
            setComplaints(data || []);
        }
        setLoading(false);
    };

    const handleAccept = async (complaintId: string) => {
        setUpdating(complaintId);

        try {
            // Update only the status in Supabase
            const { error } = await supabase
                .from('complaints')
                .update({ status: 'Open' })
                .eq('id', complaintId);

            if (error) {
                console.error('Error updating complaint:', error);
                alert(`Failed to accept complaint: ${error.message}`);
                setUpdating(null);
                return;
            }

            // Update local state
            setComplaints(prev =>
                prev.map(c => c.id === complaintId ? { ...c, status: 'Open' } : c)
            );

            // Switch to open tab
            setTimeout(() => {
                setActiveTab('open');
                setUpdating(null);
            }, 300);
        } catch (error: any) {
            console.error('Error:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
            setUpdating(null);
        }
    };

    const handleReject = async (complaintId: string) => {
        setUpdating(complaintId);

        try {
            // Update only the status in Supabase
            const { error } = await supabase
                .from('complaints')
                .update({ status: 'Closed' })
                .eq('id', complaintId);

            if (error) {
                console.error('Error updating complaint:', error);
                alert(`Failed to reject complaint: ${error.message}`);
                setUpdating(null);
                return;
            }

            // Update local state
            setComplaints(prev =>
                prev.map(c => c.id === complaintId ? { ...c, status: 'Closed' } : c)
            );

            // Switch to closed tab
            setTimeout(() => {
                setActiveTab('closed');
                setUpdating(null);
            }, 300);
        } catch (error: any) {
            console.error('Error:', error);
            alert(`Error: ${error.message || 'Unknown error'}`);
            setUpdating(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFilteredComplaints = (status: string) => {
        if (status === 'pending') {
            // Handle all pending/submitted statuses
            return complaints.filter(c =>
                c.status === 'Pending' ||
                c.status === 'pending' ||
                c.status === 'submitted' ||
                c.status === 'Submitted'
            );
        } else if (status === 'open') {
            return complaints.filter(c => c.status === 'Open' || c.status === 'open');
        } else {
            return complaints.filter(c =>
                c.status === 'Closed' ||
                c.status === 'Resolved' ||
                c.status === 'closed' ||
                c.status === 'resolved'
            );
        }
    };

    const pendingCount = getFilteredComplaints('pending').length;
    const openCount = getFilteredComplaints('open').length;
    const closedCount = getFilteredComplaints('closed').length;

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending', icon: Clock, count: pendingCount, color: 'orange' },
        { id: 'open' as TabType, label: 'Open', icon: FileText, count: openCount, color: 'blue' },
        { id: 'closed' as TabType, label: 'Closed', icon: CheckCircle, count: closedCount, color: 'green' }
    ];

    const filteredComplaints = getFilteredComplaints(activeTab);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-3 text-primary">
                        <FileText className="w-10 h-10" />
                        Complaints Management
                    </h1>
                    <p className="text-muted-foreground">
                        Review and manage citizen complaints in real-time.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-border">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${isActive
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${tab.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                                    tab.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                                        'bg-green-500/20 text-green-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Complaints List */}
                <div className="space-y-4">
                    {filteredComplaints.length === 0 ? (
                        <Card className="bg-card/50">
                            <CardContent className="p-12 text-center">
                                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                    <FileText className="w-12 h-12 opacity-50" />
                                    <p className="text-lg">No {activeTab} complaints found</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredComplaints.map((complaint) => (
                            <Card key={complaint.id} className="bg-card/50 hover:bg-card/80 transition-all border-l-4 border-l-primary">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl flex items-center gap-2">
                                                {complaint.complaint_type || 'General Complaint'}
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${complaint.status === 'Pending' || complaint.status === 'pending' || complaint.status === 'submitted' || complaint.status === 'Submitted'
                                                    ? 'bg-orange-500/20 text-orange-500' :
                                                    complaint.status === 'Open' || complaint.status === 'open'
                                                        ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-green-500/20 text-green-500'
                                                    }`}>
                                                    {complaint.status === 'submitted' || complaint.status === 'Submitted' ? 'Pending' : complaint.status}
                                                </span>
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                ID: {complaint.id} • Filed: {formatDate(complaint.created_at)}
                                            </p>
                                        </div>

                                        {/* Action Buttons for Pending Complaints */}
                                        {(complaint.status === 'Pending' || complaint.status === 'pending' || complaint.status === 'submitted' || complaint.status === 'Submitted') && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleAccept(complaint.id)}
                                                    disabled={updating === complaint.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    size="sm"
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    {updating === complaint.id ? 'Accepting...' : 'Accept'}
                                                </Button>
                                                <Button
                                                    onClick={() => handleReject(complaint.id)}
                                                    disabled={updating === complaint.id}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    {updating === complaint.id ? 'Rejecting...' : 'Reject'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2">
                                        {complaint.description && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Description:</p>
                                                <p className="text-sm">{complaint.description}</p>
                                            </div>
                                        )}
                                        {complaint.location && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Location:</p>
                                                <p className="text-sm">{complaint.location}</p>
                                            </div>
                                        )}
                                        {complaint.user_id && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">User ID:</p>
                                                <p className="text-sm font-mono">{complaint.user_id}</p>
                                            </div>
                                        )}
                                        {complaint.updated_at && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Last Updated:</p>
                                                <p className="text-sm">{formatDate(complaint.updated_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


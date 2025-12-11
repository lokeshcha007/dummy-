'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all complaints without filters
            const { data: complaints, error: complaintsError } = await supabase
                .from('complaints')
                .select('*');

            if (complaintsError) {
                setError(complaintsError);
            } else {
                setData({
                    total: complaints?.length || 0,
                    complaints: complaints || [],
                    statuses: complaints?.map(c => c.status) || []
                });
            }
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Supabase Complaints Debug</h1>

                {error && (
                    <Card className="border-red-500">
                        <CardHeader>
                            <CardTitle className="text-red-500">Error!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-sm overflow-auto">{JSON.stringify(error, null, 2)}</pre>
                        </CardContent>
                    </Card>
                )}

                {data && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">Total Complaints: {data.total}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Status Values Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {[...new Set(data.statuses as string[])].map((status: string, idx: number) => (
                                        <div key={idx} className="p-2 bg-muted rounded">
                                            <code>"{status}"</code>
                                        </div>
                                    ))}
                                    {data.statuses.length === 0 && (
                                        <p className="text-muted-foreground">No statuses found</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>All Complaints Data</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                                    {JSON.stringify(data.complaints, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}


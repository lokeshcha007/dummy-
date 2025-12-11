'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Users, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '../types';

export function UserCard({ user }: { user: User }) {
    const [showAadhaar, setShowAadhaar] = useState(false);
    const isVerified = user.verification_status?.is_mobile_verified && user.verification_status?.is_aadhaar_verified;

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${isVerified ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{user.profile_data?.name || 'Unknown User'}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">ID: {user.chat_id}</CardDescription>
                    </div>
                    <Badge variant={isVerified ? "default" : "destructive"} className={isVerified ? "bg-green-600 hover:bg-green-700" : ""}>
                        {isVerified ? 'VERIFIED' : 'PENDING'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">Mobile: {user.auth_data?.mobile_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                                Aadhaar: {showAadhaar ? (user.auth_data?.aadhaar_number || 'N/A') : '************'}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-transparent"
                                onClick={() => setShowAadhaar(!showAadhaar)}
                            >
                                {showAadhaar ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium border ${user.verification_status?.is_mobile_verified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {user.verification_status?.is_mobile_verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Mobile
                    </div>
                    <div className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium border ${user.verification_status?.is_aadhaar_verified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {user.verification_status?.is_aadhaar_verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Aadhaar
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


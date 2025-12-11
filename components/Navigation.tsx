'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, BarChart3, FileText, Upload, Search, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: ShieldCheck },
        { href: '/complaints', label: 'Complaints', icon: FileText },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/upload', label: 'Upload', icon: Upload },
        { href: '/match', label: 'Match', icon: Search },
        { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
        { href: '/criminals', label: 'Criminals', icon: Users },
    ];

    const { isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <nav className="border-b border-border bg-card/50 backdrop-blur">
            <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold">Police Control Room</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        <div className="h-6 w-px bg-border mx-2" />
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}


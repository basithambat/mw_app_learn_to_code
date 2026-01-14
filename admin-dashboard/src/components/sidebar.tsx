"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Database,
    FileText,
    Image as ImageIcon,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    Users,
    MessageSquare,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Content Library", href: "/content", icon: FileText },
    { name: "Moderation Queue", href: "/moderation/comments", icon: ShieldAlert },
    { name: "User Directory", href: "/users", icon: Users },
    { name: "Ingestion Sources", href: "/sources", icon: Database },
    { name: "Platform Jobs", href: "/jobs", icon: BarChart3 },
    { name: "Performance Analytics", href: "/analytics", icon: TrendingUp },
    { name: "System Settings", href: "/settings", icon: Settings },
];




export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 border-r bg-card h-screen sticky top-0">
            <div className="p-6 flex items-center gap-2 border-b">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold font-mono">WS</span>
                </div>
                <span className="font-bold text-lg tracking-tight">WhatSay Admin</span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold">BA</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold truncate">Admin User</span>
                        <span className="text-[10px] text-muted-foreground truncate">admin@whatsay.app</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

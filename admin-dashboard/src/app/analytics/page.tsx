"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, Target, Activity, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from "lucide-react";

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/stats/analytics');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const MetricCard = ({ title, value, change, description, icon: Icon, color }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className={cn("w-4 h-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : value}</div>
                <div className="flex items-center gap-1 mt-1">
                    {change !== undefined && (
                        <>
                            {change > 0 ? (
                                <ArrowUpRight className="w-3 h-3 text-green-500" />
                            ) : (
                                <ArrowDownRight className="w-3 h-3 text-red-500" />
                            )}
                            <span className={cn("text-xs font-medium", change > 0 ? "text-green-500" : "text-red-500")}>
                                {Math.abs(change)}%
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">{description}</span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
                    <p className="text-muted-foreground mt-1">Monitor ingestion velocity, quality metrics, and system latency.</p>
                </div>
                <Button onClick={fetchStats} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Ingestion Velocity"
                    value={stats?.ingestionVelocity || "0 articles/24h"}
                    icon={TrendingUp}
                    color="text-primary"
                />
                <MetricCard
                    title="Rewrite Success"
                    value={stats?.rewriteSuccessRate || "0%"}
                    icon={Target}
                    color="text-green-500"
                />
                <MetricCard
                    title="Active Sources"
                    value={`${stats?.healthySources || 0} / ${stats?.totalSources || 0}`}
                    icon={Activity}
                    color="text-blue-500"
                />
                <MetricCard
                    title="System Health"
                    value="Stable"
                    icon={Zap}
                    color="text-yellow-500"
                />
                <MetricCard
                    title="Dead Letter Queue"
                    value={stats?.queues?.deadLetter?.waiting || 0}
                    icon={AlertCircle}
                    color="text-red-500"
                    description="Jobs needing manual intervention"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Queue Backlog (Jobs Waiting)</CardTitle>
                        <CardDescription>Monitor congestion in processing pipelines.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col justify-center gap-6">
                        {[
                            { label: "Ingestion", val: stats?.queues?.ingestion?.waiting || 0, color: "bg-blue-500" },
                            { label: "Enrichment", val: stats?.queues?.enrichment?.waiting || 0, color: "bg-orange-500" },
                            { label: "Rewriting", val: stats?.queues?.rewriting?.waiting || 0, color: "bg-green-500" },
                            { label: "Images", val: stats?.queues?.imageResolution?.waiting || 0, color: "bg-purple-500" },
                            { label: "Dead Letter", val: stats?.queues?.deadLetter?.waiting || 0, color: "bg-red-500" },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium">{item.label}</span>
                                    <span className="text-muted-foreground">{item.val} pending</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", item.color)}
                                        style={{ width: `${Math.min(100, (item.val / 50) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Success Breakdown (24h)</CardTitle>
                        <CardDescription>Job completion rates for background workers.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col justify-center gap-6">
                        {[
                            { label: "Ingestion", val: stats?.queues?.ingestion?.completed || 0, failed: stats?.queues?.ingestion?.failed || 0 },
                            { label: "Enrichment", val: stats?.queues?.enrichment?.completed || 0, failed: stats?.queues?.enrichment?.failed || 0 },
                            { label: "Rewriting", val: stats?.queues?.rewriting?.completed || 0, failed: stats?.queues?.rewriting?.failed || 0 },
                            { label: "Images", val: stats?.queues?.imageResolution?.completed || 0, failed: stats?.queues?.imageResolution?.failed || 0 },
                        ].map((item) => {
                            const total = item.val + item.failed;
                            const rate = total > 0 ? (item.val / total) * 100 : 100;
                            return (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">{item.label} Success</span>
                                        <span className={cn(rate < 90 ? "text-red-500" : "text-green-500")}>
                                            {rate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", rate < 90 ? "bg-red-500" : "bg-green-500")}
                                            style={{ width: `${rate}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


function Maximized2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    )
}

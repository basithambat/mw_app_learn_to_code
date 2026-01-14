"use client";

import { useEffect, useState } from "react";
import {
    Database,
    RefreshCw,
    Play,
    History,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    MoreHorizontal,
    ExternalLink,
    Zap,
    Image as ImageIcon,
    Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import moment from "moment";

interface Job {
    id: string;
    name: string;
    data: any;
    status: string;
    timestamp: number;
    processedOn?: number;
    finishedOn?: number;
    failedReason?: string;
    attemptsMade: number;
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [queue, setQueue] = useState("rewrite");
    const [status, setStatus] = useState("failed");
    const [loading, setLoading] = useState(true);
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            if (queue === "dead-letter") {
                const response = await api.get(`/admin/dlq`);
                setJobs(response.data);
            } else {
                const response = await api.get(`/admin/jobs/${queue}`, {
                    params: { status }
                });
                setJobs(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [queue, status]);

    const handleRetry = async (jobId: string) => {
        try {
            setRetryingId(jobId);
            if (queue === "dead-letter") {
                await api.post(`/admin/dlq/${jobId}/requeue`);
            } else {
                await api.post(`/admin/jobs/${queue}/${jobId}/retry`);
            }
            // Remove from list after retry/requeue if we are in failed/dlq tab
            if (status === "failed" || queue === "dead-letter") {
                setJobs(jobs.filter(j => j.id !== jobId));
            }
        } catch (error) {
            console.error("Failed to retry job", error);
        } finally {
            setRetryingId(null);
        }
    };

    const handleDelete = async (jobId: string) => {
        if (!confirm("Permanently delete this job from DLQ?")) return;
        try {
            setDeletingId(jobId);
            await api.delete(`/admin/dlq/${jobId}`);
            setJobs(jobs.filter(j => j.id !== jobId));
        } catch (error) {
            console.error("Failed to delete job", error);
        } finally {
            setDeletingId(null);
        }
    };

    const QueueIcon = ({ name }: { name: string }) => {
        switch (name) {
            case "ingestion": return <Database className="w-4 h-4" />;
            case "enrich": return <Zap className="w-4 h-4 text-yellow-500" />;
            case "rewrite": return <RefreshCw className="w-4 h-4 text-orange-500" />;
            case "image": return <ImageIcon className="w-4 h-4 text-blue-500" />;
            default: return <Database className="w-4 h-4" />;
        }
    };

    const handleClearQueues = async () => {
        if (!confirm("Are you sure? This will purge all waiting and failed jobs across all pipelines.")) return;
        try {
            setLoading(true);
            await api.post("/admin/clear-queues");
            fetchJobs();
        } catch (error) {
            console.error("Failed to clear queues", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Jobs</h1>
                    <p className="text-muted-foreground mt-1">Deep dive into BullMQ worker queues and job failures.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearQueues}
                        disabled={loading}
                        className="gap-2"
                    >
                        <XCircle className="w-4 h-4" />
                        Clear All Queues
                    </Button>
                    <Button onClick={fetchJobs} variant="outline" disabled={loading} className="gap-2">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="rewrite" value={queue} onValueChange={setQueue} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="ingestion" className="gap-2">
                            <Database className="w-3.5 h-3.5" /> Ingestion
                        </TabsTrigger>
                        <TabsTrigger value="enrich" className="gap-2">
                            <Zap className="w-3.5 h-3.5" /> Enrichment
                        </TabsTrigger>
                        <TabsTrigger value="rewrite" className="gap-2">
                            <RefreshCw className="w-3.5 h-3.5" /> Rewriting
                        </TabsTrigger>
                        <TabsTrigger value="image" className="gap-2">
                            <ImageIcon className="w-3.5 h-3.5" /> Image Res
                        </TabsTrigger>
                        <TabsTrigger value="dead-letter" className="gap-2 text-red-500 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                            <AlertCircle className="w-3.5 h-3.5" /> Dead Letter
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Status:</span>
                        <Select value={status} onValueChange={setStatus} disabled={queue === "dead-letter"}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="waiting">Waiting</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader className="py-4 border-b">
                        <div className="flex items-center gap-2">
                            <QueueIcon name={queue} />
                            <CardTitle className="text-lg">
                                {queue.charAt(0).toUpperCase() + queue.slice(1)} Queue
                                <span className="ml-2 text-muted-foreground font-normal">({status})</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Job ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Attempts</TableHead>
                                    <TableHead>Data Preview</TableHead>
                                    {status === "failed" && <TableHead>Reason</TableHead>}
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                                            {status === "failed" && <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>}
                                            <TableCell className="text-right pr-6"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={status === "failed" ? 6 : 5} className="h-32 text-center text-muted-foreground">
                                            No jobs found with status "{status}" in this queue.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                                                {job.id.substring(0, 12)}...
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {moment(job.timestamp).fromNow()}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {job.attemptsMade}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <div className="max-w-[200px] truncate text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                                                    {JSON.stringify(job.data)}
                                                </div>
                                            </TableCell>
                                            {status === "failed" && (
                                                <TableCell className="text-xs text-red-500 max-w-[200px] truncate">
                                                    {job.failedReason}
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(status === "failed" || queue === "dead-letter") && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs"
                                                            onClick={() => handleRetry(job.id)}
                                                            disabled={retryingId === job.id}
                                                        >
                                                            <Play className={cn("w-3 h-3", retryingId === job.id && "animate-spin")} />
                                                            {queue === "dead-letter" ? "Requeue" : "Retry"}
                                                        </Button>
                                                    )}
                                                    {queue === "dead-letter" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(job.id)}
                                                            disabled={deletingId === job.id}
                                                        >
                                                            <XCircle className={cn("w-3 h-3", deletingId === job.id && "animate-spin")} />
                                                            Delete
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}

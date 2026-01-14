"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertTriangle,
    User as UserIcon,
    RefreshCw,
    MoreVertical,
    ExternalLink
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function CommentModerationPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending_review");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/moderation/comments", {
                params: { status: activeTab }
            });
            setComments(response.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [activeTab]);

    const handleResolve = async (id: string, action: 'APPROVE' | 'REMOVE') => {
        try {
            setActionLoading(id);
            await api.post(`/admin/moderation/comments/${id}/resolve`, { action, reason: "Moderator action via dashboard" });
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to resolve comment", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
                    <p className="text-muted-foreground">Review and manage user-generated comments.</p>
                </div>
                <Button onClick={fetchComments} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <Tabs defaultValue="pending_review" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="pending_review">Pending Review</TabsTrigger>
                    <TabsTrigger value="reported">Reported</TabsTrigger>
                    <TabsTrigger value="removed_moderator">Removed</TabsTrigger>
                    <TabsTrigger value="visible">Visible</TabsTrigger>
                </TabsList>

                <div className="mt-6 border rounded-lg bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[300px]">Comment / Context</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Flagged Reason</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : comments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Moderation queue is empty! Good job.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                comments.map((comment) => (
                                    <TableRow key={comment.id} className="group">
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                <p className="text-sm font-medium leading-relaxed">{comment.body}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 uppercase">
                                                        Post: {comment.post.postId.slice(0, 8)}...
                                                    </Badge>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4" asChild>
                                                        <a href={`/content/${comment.post.postId}`} target="_blank" rel="noreferrer">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-3 h-3 text-primary" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold truncate">@{comment.persona.handle}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">{comment.persona.displayName}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {activeTab === 'reported' ? (
                                                <div className="space-y-1">
                                                    {comment.reports.map((report: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {report.reason}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                                    {comment.state.replace('_', ' ')}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {comment.state !== 'visible' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs border-green-500/20 text-green-600 hover:bg-green-500/10"
                                                        onClick={() => handleResolve(comment.id, 'APPROVE')}
                                                        disabled={actionLoading === comment.id}
                                                    >
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Approve
                                                    </Button>
                                                )}
                                                {comment.state !== 'removed_moderator' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs border-red-500/20 text-red-600 hover:bg-red-500/10"
                                                        onClick={() => handleResolve(comment.id, 'REMOVE')}
                                                        disabled={actionLoading === comment.id}
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Remove
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>
        </div>
    );
}

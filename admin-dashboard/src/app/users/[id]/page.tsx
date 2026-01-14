"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    RefreshCw,
    Ban,
    ShieldCheck,
    ShieldAlert,
    MessageSquare,
    Users,
    History,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusReason, setStatusReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const handleUpdateStatus = async () => {
        if (!pendingStatus) return;
        try {
            setActionLoading(true);
            await api.post(`/admin/users/${id}/status`, {
                status: pendingStatus,
                reason: statusReason
            });
            await fetchUser();
            setIsDialogOpen(false);
            setStatusReason("");
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) return <div>User not found.</div>;

    const statusColors: any = {
        active: 'text-green-500 bg-green-500/10 border-green-500/20',
        banned: 'text-red-500 bg-red-500/10 border-red-500/20',
        shadow_banned: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{user.email || 'Anonymous User'}</h1>
                            <Badge variant="outline" className={cn("uppercase text-[10px] items-center gap-1", statusColors[user.status])}>
                                {user.status === 'active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                {user.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-mono mt-1">ID: {user.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <div className="flex gap-2">
                            {user.status !== 'active' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-green-500/50 text-green-600 hover:bg-green-500/10"
                                    onClick={() => { setPendingStatus('active'); setIsDialogOpen(true); }}
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Restore Account
                                </Button>
                            )}
                            {user.status !== 'shadow_banned' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                                    onClick={() => { setPendingStatus('shadow_banned'); setIsDialogOpen(true); }}
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    Shadow Ban
                                </Button>
                            )}
                            {user.status !== 'banned' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => { setPendingStatus('banned'); setIsDialogOpen(true); }}
                                >
                                    <Ban className="w-4 h-4" />
                                    Hard Ban
                                </Button>
                            )}
                        </div>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update User Status</DialogTitle>
                                <DialogDescription>
                                    Changing status to <strong>{pendingStatus}</strong>. This action will be audited.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-2 block">Reason for action</label>
                                <Textarea
                                    placeholder="e.g., Toxic behavior in comments, violating persona policy..."
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateStatus} disabled={actionLoading || !statusReason}>
                                    {actionLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Change
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Stats & Personas */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Comments</CardDescription>
                                <CardTitle className="text-2xl">{user._count?.comments || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Personas</CardDescription>
                                <CardTitle className="text-2xl">{user.personas?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Account Age</CardDescription>
                                <CardTitle className="text-2xl">{formatDistanceToNow(new Date(user.createdAt))}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <CardTitle>Owned Personas</CardTitle>
                            </div>
                            <CardDescription>Personas created and managed by this user.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {user.personas?.map((persona: any) => (
                                    <div key={persona.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            {persona.avatarUrl ? (
                                                <img src={persona.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <Users className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold truncate">{persona.displayName}</span>
                                                <Badge variant="outline" className="text-[8px] uppercase">{persona.type}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">@{persona.handle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Action History</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {user.auditLogs?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No recent actions recorded.</p>
                                ) : (
                                    user.auditLogs.map((log: any) => (
                                        <div key={log.id} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold uppercase text-[10px] text-muted-foreground">{log.action}</span>
                                                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                                                </div>
                                                <p className="mt-0.5 text-xs">
                                                    {log.metadata?.reason || "System action"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Security & Meta */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Account Security</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Email Verified</span>
                                <Badge variant={user.emailVerified ? 'default' : 'outline'}>{user.emailVerified ? 'Yes' : 'No'}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Last Seen</span>
                                <span className="font-medium">{formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}</span>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Firebase UID</span>
                                <p className="text-xs font-mono bg-muted p-2 rounded truncate" title={user.firebaseUid}>{user.firebaseUid}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Risk Assessment</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-red-600/80 leading-relaxed">
                                This user has 0 reports on record. Manual intervention is recommended if behavior deviates from persona guidelines.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

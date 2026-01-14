"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Users,
    Search,
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    Ban,
    ExternalLink,
    RefreshCw
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
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function UserDirectoryPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/users", {
                params: { q: search, limit, offset }
            });
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, offset]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Active</Badge>;
            case 'banned':
                return <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/5">Banned</Badge>;
            case 'shadow_banned':
                return <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/5">Shadow Banned</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
            case 'MODERATOR':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Mod</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
                    <p className="text-muted-foreground">Manage user accounts, roles, and platform access.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => fetchUsers()} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or Firebase UID..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                    <span>Total Users: <strong>{total}</strong></span>
                </div>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>User / Identity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Personas</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-sm font-bold truncate">{user.email || 'Anonymous'}</span>
                                                    {getRoleBadge(user.role)}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground truncate font-mono">{user.firebaseUid}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(user.status)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                            {user._count.personas} Personas
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" asChild>
                                                <Link href={`/users/${user.id}`}>
                                                    <ExternalLink className="w-3 h-3" />
                                                    View Detail
                                                </Link>
                                            </Button>
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

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} users
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={offset === 0}
                        onClick={() => setOffset(Math.max(0, offset - limit))}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={offset + limit >= total}
                        onClick={() => setOffset(offset + limit)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function ContentListPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/content", {
                params: {
                    limit: 20,
                    status: statusFilter === "all" ? undefined : statusFilter,
                }
            });
            setItems(response.data.items);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [statusFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "done":
            case "og_used":
            case "web_found":
            case "generated":
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none">Done</Badge>;
            case "pending":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-none">Pending</Badge>;
            case "failed":
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-none">Failed</Badge>;
            default:
                return <Badge variant="outline" className="bg-muted text-muted-foreground border-none">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
                    <p className="text-muted-foreground">Manage and debug all ingested articles.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Advanced Filters
                    </Button>
                    <Button size="sm">Export Data</Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, original URL..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by:</span>
                    <select
                        className="bg-background border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            <div className="border rounded-lg bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[400px]">Article Details</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Status</TableHead>
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
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No content found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors cursor-default group">
                                    <TableCell>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="font-semibold text-sm truncate">{item.titleOriginal}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono truncate uppercase tracking-tight">{item.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Badge variant="secondary" className="w-fit text-[10px] font-bold uppercase tracking-wider px-1.5 py-0">
                                                {item.sourceId}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground mt-1 capitalize">{item.sourceCategory || 'General'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Rewrite</span>
                                                </div>
                                                {getStatusBadge(item.rewriteStatus)}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Image</span>
                                                </div>
                                                {getStatusBadge(item.imageStatus)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <Link href={`/content/${item.id}`}>
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

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
    ExternalLink
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
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import moment from "moment";

interface Source {
    id: string;
    name: string;
    categories: string[];
    lastRunAt: string | null;
    status: string;
    lastError: string | null;
    metadata: any;
}

interface ApiError {
    message: string;
    status?: number;
}

export default function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [syncingId, setSyncingId] = useState<string | null>(null);

    const fetchSources = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/admin/sources");
            setSources(response.data);
        } catch (error: any) {
            console.error("Failed to fetch sources", error);
            setError({
                message: error.response?.data?.message || error.message || "Failed to load sources",
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const handleSync = async (sourceId: string) => {
        try {
            setSyncingId(sourceId);
            // Using the existing ingestion endpoint or the new admin one
            await api.post("/admin/jobs/run", { sourceId });
            // In a real app we might want a toast here
            setTimeout(() => fetchSources(), 2000); // Check status after a bit
        } catch (error) {
            console.error("Failed to trigger sync", error);
        } finally {
            setSyncingId(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">HEALTHY</Badge>;
            case "failed":
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">FAILING</Badge>;
            case "running":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 animate-pulse">RUNNING</Badge>;
            default:
                return <Badge variant="outline">UNKNOWN</Badge>;
        }
    };

    const filteredSources = sources.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ingestion Sources</h1>
                    <p className="text-muted-foreground mt-1">Manage scrapers, RSS feeds, and crawler adapters.</p>
                </div>
                <Button onClick={fetchSources} variant="outline" disabled={loading} className="gap-2">
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold">Unable to load sources</h3>
                        <p className="text-sm opacity-90">{error.message}</p>
                        {error.status === 404 && (
                            <p className="text-xs mt-1 font-mono bg-red-100/50 inline-block px-1 rounded">
                                Tip: The Admin API might not be deployed yet.
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-red-200 hover:bg-red-50 text-red-700"
                        onClick={fetchSources}
                    >
                        Try Again
                    </Button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Sources</CardTitle>
                        <Database className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sources.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Healthy Adapters</CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {sources.filter(s => s.status === "completed").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Failing Adapters</CardTitle>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {sources.filter(s => s.status === "failed").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search sources by name or ID..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Source</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Run</TableHead>
                                <TableHead>Categories</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="pl-6"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell className="text-right pr-6"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredSources.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No ingestion sources found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSources.map((source) => (
                                    <TableRow key={source.id}>
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{source.name}</span>
                                                <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-tighter">{source.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={source.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    {source.lastRunAt ? moment(source.lastRunAt).fromNow() : "Never"}
                                                </div>
                                                {source.lastError && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-red-500 max-w-[200px] truncate">
                                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                                        {source.lastError}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                {source.categories.map(cat => (
                                                    <Badge key={cat} variant="secondary" className="text-[9px] py-0 px-1 font-mono uppercase bg-muted/50">
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                                    title="Trigger Sync"
                                                    onClick={() => handleSync(source.id)}
                                                    disabled={syncingId === source.id}
                                                >
                                                    <Play className={cn("w-4 h-4", syncingId === source.id && "animate-spin")} />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Source Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2">
                                                            <History className="w-4 h-4" /> Run History
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2">
                                                            <Settings className="w-4 h-4" /> Configuration
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-red-500">
                                                            <XCircle className="w-4 h-4" /> Disable Source
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

const Settings = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    RefreshCw,
    ImageIcon,
    FileText,
    Database,
    ExternalLink,
    History,
    Lock,
    Unlock,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";


export default function ContentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/content/${id}`);
            setItem(response.data);
        } catch (error) {
            console.error("Failed to fetch detail", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleRerunRewrite = async () => {
        try {
            setActionLoading("rewrite");
            await api.post(`/admin/content/${id}/rerun-rewrite`);
            // Toast notification would be good here
            await fetchDetail();
        } catch (error) {
            console.error("Failed to rerun rewrite", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefetchImage = async () => {
        try {
            setActionLoading("image");
            await api.post(`/admin/content/${id}/refetch-image`);
            await fetchDetail();
        } catch (error) {
            console.error("Failed to refetch image", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && !item) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!item) return <div>Content not found.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight truncate max-w-[600px]">{item.titleOriginal}</h1>
                            <Badge variant="outline" className="font-mono text-[10px] uppercase">
                                {item.sourceId}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">ID: {item.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                            Source URL
                        </a>
                    </Button>
                    <Button size="sm" className="gap-2">
                        <Lock className="w-4 h-4" />
                        Lock for Edit
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Content Editor/Diff */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <CardTitle>Content Studio</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={item.rewriteStatus === 'done' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                        {item.rewriteStatus}
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription>Compare original extraction with the rewritten output.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="side-by-side" className="w-full">
                                <div className="px-6 py-2 border-b bg-muted/10">
                                    <TabsList className="bg-muted/50">
                                        <TabsTrigger value="side-by-side" className="text-xs">Side-by-Side</TabsTrigger>
                                        <TabsTrigger value="original" className="text-xs">Original Only</TabsTrigger>
                                        <TabsTrigger value="rewritten" className="text-xs">Rewritten Only</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="side-by-side" className="m-0">
                                    <div className="grid grid-cols-2 divide-x h-[500px]">
                                        <div className="p-6 overflow-y-auto space-y-4">
                                            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Original Data</span>
                                            </div>
                                            <h3 className="font-bold text-lg leading-snug">{item.titleOriginal}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.summaryOriginal}</p>
                                        </div>
                                        <div className="p-6 overflow-y-auto space-y-4 bg-muted/5">
                                            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur py-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Rewritten Output</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-muted-foreground">Model: {item.rewriteModel || 'N/A'}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={handleRerunRewrite}
                                                        disabled={actionLoading === 'rewrite'}
                                                    >
                                                        <RefreshCw className={cn("w-3 h-3", actionLoading === 'rewrite' && "animate-spin")} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-lg leading-snug text-primary">{item.titleRewritten || "Pending rewrite..."}</h3>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {item.summaryRewritten || (item.rewriteStatus === 'pending' ? "Processing summary rewrite..." : "No rewritten summary available.")}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="original" className="p-6 h-[500px] overflow-y-auto">
                                    <h1 className="text-3xl font-bold">{item.titleOriginal}</h1>
                                    <div className="mt-8 text-lg leading-relaxed">{item.summaryOriginal}</div>
                                </TabsContent>
                                <TabsContent value="rewritten" className="p-6 h-[500px] overflow-y-auto">
                                    <h1 className="text-3xl font-bold text-primary">{item.titleRewritten}</h1>
                                    <div className="mt-8 text-lg leading-relaxed">{item.summaryRewritten}</div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Raw Metadata</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted rounded-md p-4 font-mono text-[11px] overflow-x-auto h-[200px]">
                                <pre>{JSON.stringify(item.rawJson || {}, null, 2)}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Images & Timeline */}
                <div className="space-y-6">
                    <Card className="overflow-hidden border-2 border-primary/10">
                        <CardHeader className="bg-muted/30 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    <CardTitle>Image Asset</CardTitle>
                                </div>
                                <Badge variant={item.imageStatus === 'failed' ? 'destructive' : 'outline'} className="text-[10px] uppercase">
                                    {item.imageStatus}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="aspect-[16/9] w-full bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 relative overflow-hidden flex items-center justify-center">
                                {item.imageStorageUrl ? (
                                    <img src={item.imageStorageUrl} alt="Published" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon2 className="w-12 h-12 opacity-20" />
                                        <span className="text-xs">No image published</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs gap-2"
                                    onClick={handleRefetchImage}
                                    disabled={actionLoading === 'image'}
                                >
                                    <RefreshCw className={cn("w-3 h-3", actionLoading === 'image' && "animate-spin")} />
                                    Refetch
                                </Button>
                                <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                                    <ImageIcon className="w-3 h-3" />
                                    Replace
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Internal URL</span>
                                    <span className="text-xs truncate font-mono mt-0.5 text-primary cursor-pointer hover:underline" title={item.imageStorageUrl}>
                                        {item.imageStorageUrl || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source URL</span>
                                    <span className="text-xs truncate font-mono mt-0.5" title={item.ogImageUrl}>
                                        {item.ogImageUrl || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metadata</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0">{item.imageModel || 'Unknown'}</Badge>
                                        {item.imageMetadata?.contentType && (
                                            <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0">{item.imageMetadata.contentType}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-muted-foreground" />
                                <CardTitle>Operational History</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                                <div className="relative pl-8 group">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-background z-10">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Image Resolution Finished</h4>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                                <div className="relative pl-8 group">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-background z-10">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Rewrite Success</h4>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Model: {item.rewriteModel}</p>
                                    </div>
                                </div>
                                <div className="relative pl-8 group">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Ingested from Source</h4>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Source: {item.sourceId}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}



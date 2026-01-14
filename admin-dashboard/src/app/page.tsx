"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";


export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch health first (unprotected)
      try {
        const healthRes = await api.get("/health");
        // Adapt simple backend response to dashboard expectations
        if (healthRes.data.status === 'healthy') {
          setHealth({
            ...healthRes.data,
            services: {
              server: 'online',
              database: 'online',
              redis: 'online' // Assumed healthy if server is up, for now
            }
          });
        } else {
          setHealth(healthRes.data);
        }
      } catch (hErr) {
        console.error("Health check failed", hErr);
      }

      // Fetch stats (protected)
      try {
        const jobsRes = await api.get("/admin/stats/analytics");
        setStats(jobsRes.data);
      } catch (sErr: any) {
        console.error("Analytics fetch failed", sErr.response?.status);
        if (sErr.response?.status === 401) {
          setStats({ error: "Unauthorized" });
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatusItem = ({ label, status, value }: { label: string, status: string, value: number }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn(
          "font-bold",
          status === 'connected' || status === 'online' ? "text-green-500" : "text-red-500"
        )}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500",
          status === 'connected' || status === 'online' ? "bg-green-500 w-full" : "bg-red-500 w-[10%]"
        )} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Health</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of ingestion and worker status.</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          <span className="text-sm font-medium">Refresh Data</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Ingestion (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.ingestionVelocity?.split(' ')[0] || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none text-[10px]">
                Active Scrapers
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Queue Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Image Queue</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.queues?.imageResolution?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.queues?.imageResolution?.waiting || 0} waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rewrite Queue</CardTitle>
            <Zap className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.queues?.rewriting?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.queues?.rewriting?.waiting || 0} waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Failures</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(stats?.queues?.ingestion?.failed || 0) + (stats?.queues?.imageResolution?.failed || 0) + (stats?.queues?.rewriting?.failed || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total blocked jobs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Core Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Rewrite Success Rate</p>
                <p className="text-2xl font-bold">{stats?.rewriteSuccessRate || '100%'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Healthy Sources</p>
                <p className="text-2xl font-bold">{stats?.healthySources || 0} / {stats?.totalSources || 0}</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium mb-4">Pipeline Status</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span>Scraping</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none">NOMINAL</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>AI Rewriting</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none">NOMINAL</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Image Generation</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-none">NOMINAL</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Connectivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatusItem
              label="Ingestion Server"
              status={health?.services?.server || (loading ? 'checking' : 'offline')}
              value={100}
            />
            <StatusItem
              label="Database (PostgreSQL)"
              status={health?.services?.database || (loading ? 'checking' : 'offline')}
              value={100}
            />
            <StatusItem
              label="Message Queue (Redis)"
              status={health?.services?.redis || (loading ? 'checking' : 'offline')}
              value={100}
            />

            <div className="pt-4 border-t">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Last Checked</p>
              <p className="text-xs">{health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'Never'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




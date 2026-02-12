'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Activity, Database, Server, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function SystemHealth() {
    // In a real app, this would fetch from /admin/monitoring/realtime
    // For now, we'll mock the status
    const services = [
        { name: 'API Server', status: 'operational', uptime: '99.9%', latency: '45ms', icon: Server },
        { name: 'Database', status: 'operational', uptime: '99.99%', latency: '12ms', icon: Database },
        { name: 'Storage', status: 'operational', uptime: '99.95%', latency: '120ms', icon: Database }, // Using DB icon as proxy
        { name: 'Email Service', status: 'degraded', uptime: '98.5%', latency: '250ms', icon: Activity },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
            case 'degraded': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20'
            case 'down': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
            default: return 'secondary'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'operational': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
            case 'down': return <XCircle className="w-4 h-4 text-red-500" />
            default: return null
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
                <Card key={service.name}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {service.name}
                        </CardTitle>
                        <service.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(service.status)}
                            <div className="text-2xl font-bold capitalize">{service.status}</div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Uptime: {service.uptime} • Latency: {service.latency}
                        </p>
                    </CardContent>
                </Card>
            ))}

            <Card className="col-span-full mt-4">
                <CardHeader>
                    <CardTitle>System Logs</CardTitle>
                    <CardDescription>Recent system events and alerts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-muted/50 p-4 text-sm font-mono">
                        <div className="space-y-1">
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">[10:42:15]</span>
                                <span className="text-green-500">INFO</span>
                                <span>System backup completed successfully.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">[10:30:22]</span>
                                <span className="text-blue-500">DEBUG</span>
                                <span>Worker pool scaled up to 4 instances.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">[09:15:00]</span>
                                <span className="text-yellow-500">WARN</span>
                                <span>High memory usage detected on node-3.</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

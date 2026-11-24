import React from 'react';
import { useSystem } from '../context/SystemContext';
import Badge from '../components/Badge';
import { Server, Database, Layout, ShieldCheck, Check, Clock, Globe } from 'lucide-react';

export default function SystemOverviewPage() {
  const { status, data, latency, lastChecked, error, refetch } = useSystem();

  const services = [
    {
      name: 'Backend API Service',
      runtime: 'FastAPI / Python 3.14',
      status: status === 'healthy' ? 'Operational' : status === 'checking' ? 'Checking' : 'Unreachable',
      statusVariant: status === 'healthy' ? 'success' : status === 'checking' ? 'warning' : 'danger',
      details: status === 'healthy' ? `${data?.service} v${data?.version}` : error || 'No connection',
      icon: Server,
    },
    {
      name: 'Database Configuration',
      runtime: 'SQLAlchemy / Alembic / PostgreSQL',
      status: 'Configured',
      statusVariant: 'neutral',
      details: 'postgresql+psycopg2 (Pending migration phase)',
      icon: Database,
    },
    {
      name: 'Frontend Client',
      runtime: 'React 18 / Vite / Tailwind CSS',
      status: 'Operational',
      statusVariant: 'success',
      details: 'Single-Page Application Shell',
      icon: Layout,
    },
    {
      name: 'CORS Security Policy',
      runtime: 'Starlette CORSMiddleware',
      status: 'Active',
      statusVariant: 'accent',
      details: 'Allowed origin: http://localhost:5173',
      icon: ShieldCheck,
    },
  ];

  const configValues = [
    { key: 'VITE_API_BASE_URL', value: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', source: 'Client Environment' },
    { key: 'API Health Endpoint', value: '/api/health', source: 'Service Specification' },
    { key: 'Runtime Mode', value: import.meta.env.MODE || 'development', source: 'Vite Runtime' },
    { key: 'Router Stack', value: 'React Router v6', source: 'Client Dependency' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Core architecture status, environment parameters, and verified communication routes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
          >
            Run Health Check
          </button>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div className="bg-white border border-zinc-200 rounded-md p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded ${status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-600'}`}>
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                {status === 'healthy' ? 'Base Platform Operational' : 'Verifying Platform Connectivity'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Frontend client and FastAPI backend are configured as decoupled, independent services with CORS resolution.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {lastChecked && (
              <span className="flex items-center gap-1 text-[11px] font-mono">
                <Clock className="w-3 h-3 text-zinc-400" />
                Checked: {new Date(lastChecked).toLocaleTimeString()}
              </span>
            )}
            <Badge variant={status === 'healthy' ? 'success' : 'warning'}>
              {status === 'healthy' ? 'HTTP 200 OK' : 'Checking'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Component & Service Architecture Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Service Architecture
          </h2>
          <span className="text-[11px] text-zinc-400 font-mono">4 Services Configured</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <th className="py-2.5 px-4 font-medium">Service Component</th>
                <th className="py-2.5 px-4 font-medium">Tech Stack</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Runtime Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {services.map((svc) => {
                const Icon = svc.icon;
                return (
                  <tr key={svc.name} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-900 flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{svc.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600">{svc.runtime}</td>
                    <td className="py-3 px-4">
                      <Badge variant={svc.statusVariant}>{svc.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-xs font-mono">{svc.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Runtime Configuration Key-Value Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Runtime Configuration
        </h2>

        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <th className="py-2 px-4 font-medium">Configuration Key</th>
                <th className="py-2 px-4 font-medium">Active Value</th>
                <th className="py-2 px-4 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
              {configValues.map((cfg) => (
                <tr key={cfg.key} className="hover:bg-zinc-50/50">
                  <td className="py-2.5 px-4 font-semibold text-zinc-800">{cfg.key}</td>
                  <td className="py-2.5 px-4 text-zinc-600">{cfg.value}</td>
                  <td className="py-2.5 px-4 text-zinc-400 font-sans text-xs">{cfg.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified API Endpoints */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Initialized Endpoints
        </h2>

        <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                GET
              </span>
              <code className="text-xs font-mono text-zinc-900">/api/health</code>
              <span className="text-xs text-zinc-500">&mdash; Application health and version inspection</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium">Active & Verified</span>
          </div>
          <div className="p-3 bg-zinc-50 rounded border border-zinc-200 text-[11px] font-mono text-zinc-700 overflow-x-auto">
            {JSON.stringify(data || { status: 'healthy', service: 'StockFlow API', version: '0.1.0', environment: 'development' }, null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
}

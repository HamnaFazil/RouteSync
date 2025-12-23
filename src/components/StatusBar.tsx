import React from 'react';
import { Activity, Radio, Shield, Cpu } from 'lucide-react';

interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  blockedRoads: number;
  emergencyActive: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({
  nodeCount,
  edgeCount,
  blockedRoads,
  emergencyActive
}) => {
  return (
    <div className="bg-card border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              SmartRoute<span className="text-primary">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Emergency Response System v2.0
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="w-4 h-4" />
            <span className="text-xs font-mono">{nodeCount} Nodes</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-mono">{edgeCount} Routes</span>
          </div>
          
          <div className={`flex items-center gap-2 ${blockedRoads > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
            <Shield className="w-4 h-4" />
            <span className="text-xs font-mono">{blockedRoads} Blocked</span>
          </div>
          
          {emergencyActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emergency/20 border border-emergency/50">
              <div className="w-2 h-2 rounded-full bg-emergency animate-pulse" />
              <span className="text-xs font-mono text-emergency font-semibold">
                EMERGENCY ACTIVE
              </span>
            </div>
          )}
          
          {!emergencyActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 border border-success/50">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs font-mono text-success font-semibold">
                SYSTEM NOMINAL
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;

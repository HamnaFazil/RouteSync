import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'emergency';
  message: string;
}

interface EventLogProps {
  logs: LogEntry[];
}

const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-warning" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-destructive" />;
      case 'emergency':
        return <AlertCircle className="w-3 h-3 text-emergency animate-pulse" />;
      default:
        return <Info className="w-3 h-3 text-primary" />;
    }
  };

  const getTextColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      case 'emergency':
        return 'text-emergency';
      default:
        return 'text-foreground';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          System Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px] px-4 pb-4">
          <div className="space-y-1 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">
                No events logged yet...
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className={`flex items-start gap-2 py-1 border-b border-border/50 last:border-0 ${
                    log.type === 'emergency' ? 'bg-emergency/5 -mx-2 px-2 rounded' : ''
                  }`}
                >
                  <span className="text-muted-foreground shrink-0">
                    [{formatTime(log.timestamp)}]
                  </span>
                  {getIcon(log.type)}
                  <span className={getTextColor(log.type)}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventLog;

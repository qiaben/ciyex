import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, Mic, Video, Activity } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const NetworkInfo: React.FC = () => {
  // This would use real network metrics in production
  const networkQuality = 85;
  const audioQuality = 90;
  const videoQuality = 75;
  
  const getQualityColor = (quality: number) => {
    if (quality >= 80) return "text-green-500";
    if (quality >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getProgressColor = (quality: number) => {
    if (quality >= 80) return "bg-green-500";
    if (quality >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Connection Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network</span>
                <span className={getQualityColor(networkQuality)}>{networkQuality}%</span>
              </div>
              <Progress 
                value={networkQuality} 
                className={cn("h-2", getProgressColor(networkQuality))} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Audio</span>
                <span className={getQualityColor(audioQuality)}>{audioQuality}%</span>
              </div>
              <Progress 
                value={audioQuality} 
                className={cn("h-2", getProgressColor(audioQuality))} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Video</span>
                <span className={getQualityColor(videoQuality)}>{videoQuality}%</span>
              </div>
              <Progress 
                value={videoQuality} 
                className={cn("h-2", getProgressColor(videoQuality))} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Connection Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Latency</TableCell>
                <TableCell className="text-right">45ms</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Packet Loss</TableCell>
                <TableCell className="text-right">0.2%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Resolution</TableCell>
                <TableCell className="text-right">720p</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Framerate</TableCell>
                <TableCell className="text-right">30fps</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground mt-2">
        <p className="mb-1">Tips to improve quality:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use a wired internet connection if possible</li>
          <li>Close other bandwidth-intensive applications</li>
          <li>Make sure your camera is not being used by other applications</li>
        </ul>
      </div>
    </div>
  );
};

export default NetworkInfo;

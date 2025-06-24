
import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const colorSchemes: ColorScheme[] = [
  { name: 'Green (Default)', primary: '#2E7D32', secondary: '#E6F4EA', accent: '#4CAF50' },
  { name: 'Blue', primary: '#1976D2', secondary: '#E3F2FD', accent: '#2196F3' },
  { name: 'Purple', primary: '#7B1FA2', secondary: '#F3E5F5', accent: '#9C27B0' },
  { name: 'Teal', primary: '#00796B', secondary: '#E0F2F1', accent: '#009688' },
  { name: 'Amber', primary: '#FF8F00', secondary: '#FFF8E1', accent: '#FFC107' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [activeColorScheme, setActiveColorScheme] = useState<string>('Green (Default)');
  
  const applyColorScheme = (scheme: ColorScheme) => {
    document.documentElement.style.setProperty('--primary', hexToHSL(scheme.primary).h + ' ' + hexToHSL(scheme.primary).s + '% ' + hexToHSL(scheme.primary).l + '%');
    document.documentElement.style.setProperty('--secondary', hexToHSL(scheme.secondary).h + ' ' + hexToHSL(scheme.secondary).s + '% ' + hexToHSL(scheme.secondary).l + '%');
    document.documentElement.style.setProperty('--accent', hexToHSL(scheme.accent).h + ' ' + hexToHSL(scheme.accent).s + '% ' + hexToHSL(scheme.accent).l + '%');
    setActiveColorScheme(scheme.name);
  };
  
  // Convert hex color to HSL format
  function hexToHSL(hex: string) {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find max and min values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // Calculate lightness
    let l = (max + min) / 2;
    
    let h = 0;
    let s = 0;
    
    if (max !== min) {
      // Calculate saturation
      s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      
      // Calculate hue
      if (max === r) {
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / (max - min) + 2;
      } else {
        h = (r - g) / (max - min) + 4;
      }
      
      h *= 60;
    }
    
    // Round values
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
  }
  
  const MotionDropdownMenuItem = motion(DropdownMenuItem);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Appearance</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('light')}
              className={cn(
                "justify-center",
                theme === 'light' && "border-primary"
              )}
            >
              Light
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('dark')}
              className={cn(
                "justify-center",
                theme === 'dark' && "border-primary"
              )}
            >
              Dark
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme('system')}
              className={cn(
                "justify-center",
                theme === 'system' && "border-primary"
              )}
            >
              System
            </Button>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <p className="text-sm font-medium mb-2">Color Schemes</p>
          {colorSchemes.map((scheme, index) => (
            <MotionDropdownMenuItem
              key={scheme.name}
              whileHover={{
                backgroundColor: scheme.primary + '20',
                transition: { duration: 0.2 }
              }}
              onClick={() => applyColorScheme(scheme)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: scheme.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: scheme.accent }}
                />
              </div>
              <span>{scheme.name}</span>
              {activeColorScheme === scheme.name && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </MotionDropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeSwitcher;

import React from 'react';
import { 
  Mic, 
  Settings, 
  MoreHorizontal, 
  ChevronLeft, 
  Volume2, 
  RotateCcw, 
  Lightbulb, 
  Languages, 
  Eye, 
  EyeOff,
  Star,
  X,
  ChevronRight
} from 'lucide-react';

export const IconMic = ({ className }: { className?: string }) => <Mic className={className} />;
export const IconSettings = ({ className }: { className?: string }) => <Settings className={className} />;
export const IconMore = ({ className }: { className?: string }) => <MoreHorizontal className={className} />;
export const IconBack = ({ className }: { className?: string }) => <ChevronLeft className={className} />;
export const IconVolume = ({ className }: { className?: string }) => <Volume2 className={className} />;
export const IconRefresh = ({ className }: { className?: string }) => <RotateCcw className={className} />;
export const IconBulb = ({ className }: { className?: string }) => <Lightbulb className={className} />;
export const IconTrans = ({ className }: { className?: string }) => <Languages className={className} />;
export const IconEye = ({ className }: { className?: string }) => <Eye className={className} />;
export const IconEyeOff = ({ className }: { className?: string }) => <EyeOff className={className} />;
export const IconStar = ({ className }: { className?: string }) => <Star className={className} />;
export const IconClose = ({ className }: { className?: string }) => <X className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ChevronRight className={className} />;
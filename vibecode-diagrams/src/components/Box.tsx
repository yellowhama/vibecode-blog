import {Rect, Txt, Layout, Node} from '@motion-canvas/2d';
import {SignalValue, SimpleSignal, createRef, all} from '@motion-canvas/core';

export interface LabelBoxProps {
  label: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  textColor?: string;
  fontSize?: number;
  radius?: number;
}

export const COLORS = {
  bg: '#0D1B2A',           // Series Bible dark background
  primary: '#3B82F6',
  cyan: '#06B6D4',
  yellow: '#FFD93D',       // Vee hoodie yellow
  red: '#EF4444',
  green: '#7AE582',        // Series Bible success green
  text: '#F8FAFC',
  muted: '#64748B',
  surface: '#1B2838',      // Series Bible surface
  orange: '#FF6B35',       // Series Bible accent — chaos/failure
  blueprint: '#1E40AF',    // Blueprint blue
};

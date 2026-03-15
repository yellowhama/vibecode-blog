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
  bg: '#0E1117',
  primary: '#3B82F6',
  cyan: '#06B6D4',
  yellow: '#FFD166',
  red: '#EF4444',
  green: '#22C55E',
  text: '#F8FAFC',
  muted: '#64748B',
  surface: '#1E293B',
};

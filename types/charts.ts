export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface Bar3DData {
  data: ChartDataPoint[];
  maxValue?: number;
  title?: string;
}

export interface Line3DData {
  data: ChartDataPoint[];
  title?: string;
}

export interface Scatter3DData {
  points: {
    x: number;
    y: number;
    z: number;
    label: string;
    color?: string;
  }[];
  title?: string;
}

export interface Chart3DProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  interactive?: boolean;
}


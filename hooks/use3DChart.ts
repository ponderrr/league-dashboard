import { useState, useCallback } from 'react';

interface Use3DChartOptions {
  onDataPointClick?: (dataPoint: any) => void;
  onDataPointHover?: (dataPoint: any) => void;
}

export function use3DChart(options: Use3DChartOptions = {}) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);

  const handleDataPointClick = useCallback((dataPoint: any) => {
    setSelectedDataPoint(dataPoint);
    if (options.onDataPointClick) {
      options.onDataPointClick(dataPoint);
    }
  }, [options]);

  const handleDataPointHover = useCallback((dataPoint: any | null) => {
    setHoveredDataPoint(dataPoint);
    if (options.onDataPointHover && dataPoint) {
      options.onDataPointHover(dataPoint);
    }
  }, [options]);

  const clearSelection = useCallback(() => {
    setSelectedDataPoint(null);
  }, []);

  return {
    selectedDataPoint,
    hoveredDataPoint,
    handleDataPointClick,
    handleDataPointHover,
    clearSelection,
  };
}


export const CHART_COLORS = {
    primary: '#6366f1',    // Indigo
    secondary: '#06b6d4', // Cyan
    accent: '#f43f5e',    // Rose
    success: '#10b981',   // Emerald
    warning: '#f59e0b',  // Amber
    info: '#3b82f6',      // Blue
    
    // Full palette for multiple data points
    palette: [
        '#6366f1', // Indigo
        '#06b6d4', // Cyan
        '#f43f5e', // Rose
        '#8b5cf6', // Violet
        '#14b8a6', // Teal
        '#f97316', // Orange
        '#ec4899', // Pink
        '#22c55e', // Green
    ],
    
    // Gradient definitions for area fills
    gradients: {
        indigo: ['#6366f1', '#818cf8', '#a5b4fc'],
        cyan: ['#06b6d4', '#22d3ee', '#67e8f9'],
        rose: ['#f43f5e', '#fb7185', '#fda4af'],
    },
};

export const CHART_CONFIG = {
    barChart: {
        barRadius: [8, 8, 0, 0],
        barSize: 40,
    },
    lineChart: {
        strokeWidth: 3,
        dotRadius: 6,
        activeDotRadius: 8,
    },
    pieChart: {
        innerRadius: 60,
        outerRadius: 100,
    },
};

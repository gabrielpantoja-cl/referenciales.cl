import { Point } from '@/components/ui/mapa/MapMarker';

export interface RealEstateStats {
  totalProperties: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerSqm: number;
  averageSize: number;
  medianSize: number;
  totalVolume: number;
  averageDaysOnMarket?: number;
  priceAppreciation?: number;
  marketActivity: {
    byYear: { [year: string]: number };
    byMonth: { [month: string]: number };
    byCommune: { [commune: string]: number };
  };
  priceRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  sizeRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export interface ChartData {
  x: number;
  y: number;
  label?: string;
  color?: string;
  size?: number;
  date?: string;
  price?: number;
  sqm?: number;
  commune?: string;
  year?: number;
}

export class RealEstateAnalytics {
  private data: Point[];

  constructor(data: Point[]) {
    this.data = data.filter(point => 
      point.monto && 
      point.monto > 0 && 
      point.superficie && 
      point.superficie > 0
    );
  }

  // Calcular estadísticas principales
  calculateStats(): RealEstateStats {
    if (this.data.length === 0) {
      return this.getEmptyStats();
    }

    const prices = this.data.map(p => Number(p.monto)).filter(p => p > 0);
    const sizes = this.data.map(p => Number(p.superficie)).filter(s => s > 0);
    
    const totalProperties = this.data.length;
    const totalVolume = prices.reduce((sum, price) => sum + price, 0);
    
    // Estadísticas de precios
    const averagePrice = totalVolume / totalProperties;
    const medianPrice = this.calculateMedian(prices);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Estadísticas de superficie
    const averageSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const medianSize = this.calculateMedian(sizes);
    const pricePerSqm = averagePrice / averageSize;
    
    // Actividad del mercado
    const marketActivity = this.calculateMarketActivity();
    
    // Rangos de precios
    const priceRanges = this.calculatePriceRanges(prices);
    
    // Rangos de tamaño
    const sizeRanges = this.calculateSizeRanges(sizes);
    
    // Tendencia
    const trend = this.calculateTrend();

    return {
      totalProperties,
      averagePrice,
      medianPrice,
      minPrice,
      maxPrice,
      pricePerSqm,
      averageSize,
      medianSize,
      totalVolume,
      marketActivity,
      priceRanges,
      sizeRanges,
      trend,
    };
  }

  private getEmptyStats(): RealEstateStats {
    return {
      totalProperties: 0,
      averagePrice: 0,
      medianPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      pricePerSqm: 0,
      averageSize: 0,
      medianSize: 0,
      totalVolume: 0,
      marketActivity: {
        byYear: {},
        byMonth: {},
        byCommune: {}
      },
      priceRanges: [],
      sizeRanges: [],
      trend: {
        direction: 'stable',
        percentage: 0
      }
    };
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  private calculateMarketActivity() {
    const byYear: { [year: string]: number } = {};
    const byMonth: { [month: string]: number } = {};
    const byCommune: { [commune: string]: number } = {};

    this.data.forEach(point => {
      // Por año
      if (point.anio) {
        byYear[point.anio] = (byYear[point.anio] || 0) + 1;
      }

      // Por mes (si hay fecha de escritura)
      if (point.fechaescritura) {
        const date = new Date(point.fechaescritura);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      }

      // Por comuna
      if (point.comuna) {
        byCommune[point.comuna] = (byCommune[point.comuna] || 0) + 1;
      }
    });

    return { byYear, byMonth, byCommune };
  }

  private calculatePriceRanges(prices: number[]) {
    const ranges = [
      { min: 0, max: 50000000, label: 'Hasta $50M' },
      { min: 50000000, max: 100000000, label: '$50M - $100M' },
      { min: 100000000, max: 200000000, label: '$100M - $200M' },
      { min: 200000000, max: 500000000, label: '$200M - $500M' },
      { min: 500000000, max: Infinity, label: 'Más de $500M' }
    ];

    return ranges.map(range => {
      const count = prices.filter(price => price >= range.min && price < range.max).length;
      const percentage = (count / prices.length) * 100;
      
      return {
        range: range.label,
        count,
        percentage: Math.round(percentage * 100) / 100
      };
    }).filter(range => range.count > 0);
  }

  private calculateSizeRanges(sizes: number[]) {
    const ranges = [
      { min: 0, max: 50, label: 'Hasta 50 m²' },
      { min: 50, max: 100, label: '50-100 m²' },
      { min: 100, max: 200, label: '100-200 m²' },
      { min: 200, max: 500, label: '200-500 m²' },
      { min: 500, max: Infinity, label: 'Más de 500 m²' }
    ];

    return ranges.map(range => {
      const count = sizes.filter(size => size >= range.min && size < range.max).length;
      const percentage = (count / sizes.length) * 100;
      
      return {
        range: range.label,
        count,
        percentage: Math.round(percentage * 100) / 100
      };
    }).filter(range => range.count > 0);
  }

  private calculateTrend() {
    const dataWithDates = this.data.filter(point => 
      point.fechaescritura && point.monto
    ).sort((a, b) => 
      new Date(a.fechaescritura!).getTime() - new Date(b.fechaescritura!).getTime()
    );

    if (dataWithDates.length < 2) {
      return { direction: 'stable' as const, percentage: 0 };
    }

    const midpoint = Math.floor(dataWithDates.length / 2);
    const firstHalf = dataWithDates.slice(0, midpoint);
    const secondHalf = dataWithDates.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, point) => sum + Number(point.monto), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + Number(point.monto), 0) / secondHalf.length;

    const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentageChange) > 5) {
      direction = percentageChange > 0 ? 'up' : 'down';
    }

    return {
      direction,
      percentage: Math.round(Math.abs(percentageChange) * 100) / 100
    };
  }

  // Generar datos para diferentes tipos de gráficos
  getScatterPlotData(): ChartData[] {
    return this.data.map(point => ({
      x: point.superficie || 0,
      y: Number(point.monto) || 0,
      label: point.predio || 'Sin nombre',
      commune: point.comuna || 'Sin comuna',
      date: point.fechaescritura ? new Date(point.fechaescritura).toLocaleDateString() : '',
      price: Number(point.monto) || 0,
      sqm: point.superficie || 0
    }));
  }

  getTimeSeriesData(): ChartData[] {
    return this.data
      .filter(point => point.fechaescritura && point.monto)
      .map(point => ({
        x: new Date(point.fechaescritura!).getTime(),
        y: Number(point.monto),
        label: point.predio || 'Sin nombre',
        date: new Date(point.fechaescritura!).toLocaleDateString(),
        price: Number(point.monto),
        commune: point.comuna || 'Sin comuna'
      }))
      .sort((a, b) => a.x - b.x);
  }

  getPricePerSqmData(): ChartData[] {
    return this.data
      .filter(point => point.superficie && point.monto)
      .map(point => ({
        x: point.superficie!,
        y: Number(point.monto) / point.superficie!,
        label: point.predio || 'Sin nombre',
        commune: point.comuna || 'Sin comuna',
        price: Number(point.monto),
        sqm: point.superficie!
      }));
  }

  getHistogramData(field: 'price' | 'size', bins: number = 10): ChartData[] {
    const values = field === 'price' 
      ? this.data.map(p => Number(p.monto)).filter(v => v > 0)
      : this.data.map(p => Number(p.superficie)).filter(v => v > 0);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;

    const histogram = Array(bins).fill(0);
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    return histogram.map((count, index) => ({
      x: min + (index * binSize),
      y: count,
      label: field === 'price' 
        ? `${Math.round(min + (index * binSize) / 1000000)}M - ${Math.round(min + ((index + 1) * binSize) / 1000000)}M`
        : `${Math.round(min + (index * binSize))} - ${Math.round(min + ((index + 1) * binSize))} m²`
    }));
  }

  getCommuneData(): ChartData[] {
    const communeStats = this.data.reduce((acc, point) => {
      if (!point.comuna) return acc;
      
      if (!acc[point.comuna]) {
        acc[point.comuna] = {
          count: 0,
          totalPrice: 0,
          totalSize: 0
        };
      }
      
      acc[point.comuna].count++;
      if (point.monto) acc[point.comuna].totalPrice += Number(point.monto);
      if (point.superficie) acc[point.comuna].totalSize += point.superficie;
      
      return acc;
    }, {} as Record<string, { count: number; totalPrice: number; totalSize: number }>);

    return Object.entries(communeStats).map(([commune, stats]) => ({
      x: stats.count,
      y: stats.totalPrice / stats.count,
      label: commune,
      commune,
      size: stats.totalSize / stats.count
    }));
  }
}

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-CL').format(num);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};
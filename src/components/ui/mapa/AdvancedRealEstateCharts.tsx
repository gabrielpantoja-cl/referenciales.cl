'use client';

import React, { useState, useRef } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { Point } from './MapMarker';
import { 
  RealEstateAnalytics, 
  RealEstateStats, 
  ChartData, 
  formatCurrency, 
  formatNumber, 
  formatCompactCurrency 
} from '@/lib/realEstateAnalytics';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, Download, FileText, Calendar, MapPin, Zap as ScatterIcon } from 'lucide-react';

interface AdvancedRealEstateChartsProps {
  data: Point[];
  selectedArea?: string;
}

type ChartType = 'scatter' | 'timeSeries' | 'pricePerSqm' | 'histogram' | 'commune' | 'distribution';

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'
];

const AdvancedRealEstateCharts: React.FC<AdvancedRealEstateChartsProps> = ({ data, selectedArea = '' }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('scatter');
  const chartRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No hay datos seleccionados
        </h3>
        <p className="text-gray-500 mb-4">
          Dibuja un círculo en el mapa para seleccionar propiedades y ver los análisis
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">
            💡 Consejo: Usa la herramienta de círculo en el mapa para seleccionar un área y obtener análisis detallados
          </p>
        </div>
      </div>
    );
  }

  const analytics = new RealEstateAnalytics(data);
  const stats = analytics.calculateStats();

  const getChartData = (): ChartData[] => {
    switch (selectedChart) {
      case 'scatter':
        return analytics.getScatterPlotData();
      case 'timeSeries':
        return analytics.getTimeSeriesData();
      case 'pricePerSqm':
        return analytics.getPricePerSqmData();
      case 'histogram':
        return analytics.getHistogramData('price', 12);
      case 'commune':
        return analytics.getCommuneData();
      case 'distribution':
        return analytics.getHistogramData('size', 10);
      default:
        return analytics.getScatterPlotData();
    }
  };

  const chartData = getChartData();

  const downloadPDF = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const chartElement = chartRef.current;
      
      if (!chartElement) return;

      // ========== PÁGINA 1: PORTADA Y RESUMEN EJECUTIVO ==========
      pdf.setFontSize(24);
      pdf.text('REPORTE COMPLETO DE ANÁLISIS', 20, 30);
      pdf.text('DE MERCADO INMOBILIARIO', 20, 40);
      
      pdf.setFontSize(16);
      pdf.text(`Área Seleccionada: ${selectedArea || 'Región Metropolitana'}`, 20, 60);
      
      pdf.setFontSize(12);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, 75);
      pdf.text(`Total de propiedades analizadas: ${stats.totalProperties}`, 20, 85);
      
      // Resumen ejecutivo
      pdf.setFontSize(16);
      pdf.text('RESUMEN EJECUTIVO', 20, 105);
      
      pdf.setFontSize(11);
      const resumenY = 115;
      pdf.text(`• Precio promedio del área: ${formatCurrency(stats.averagePrice)}`, 25, resumenY);
      pdf.text(`• Precio mediano: ${formatCurrency(stats.medianPrice)}`, 25, resumenY + 8);
      pdf.text(`• Precio promedio por m²: ${formatCurrency(stats.pricePerSqm)}`, 25, resumenY + 16);
      pdf.text(`• Superficie promedio: ${formatNumber(stats.averageSize)} m²`, 25, resumenY + 24);
      pdf.text(`• Volumen total de transacciones: ${formatCurrency(stats.totalVolume)}`, 25, resumenY + 32);
      
      // Tendencia del mercado
      if (stats.trend.percentage > 0) {
        const trendText = stats.trend.direction === 'up' ? 'Alza' : 
                         stats.trend.direction === 'down' ? 'Baja' : 'Estable';
        pdf.text(`• Tendencia del mercado: ${trendText} (${stats.trend.percentage}%)`, 25, resumenY + 40);
      }

      // Capturar el gráfico para la primera página
      const canvas = await html2canvas(chartElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Agregar gráfico en la primera página
      pdf.text('GRÁFICO PRINCIPAL', 20, 175);
      pdf.addImage(imgData, 'PNG', 20, 185, imgWidth, Math.min(imgHeight, 90));

      // ========== PÁGINA 2: LISTADO COMPLETO DE PROPIEDADES ==========
      pdf.addPage('a4', 'landscape'); // Cambiar a horizontal para la tabla
      
      pdf.setFontSize(18);
      pdf.text('LISTADO COMPLETO PARA REVISIÓN EN CONSERVADOR DE BIENES RAÍCES', 20, 25);
      
      pdf.setFontSize(10);
      pdf.text(`Propiedades en el área seleccionada (${data.length} registros)`, 20, 35);
      
      // Configurar la tabla
      const tableStartY = 45;
      const rowHeight = 8;
      const colWidths = [25, 20, 15, 20, 80, 35, 25, 25, 35];
      let currentY = tableStartY;
      
      // Encabezados de la tabla
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, currentY - 6, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      let currentX = 20;
      const headers = ['Fojas', 'Número', 'Año', 'CBR', 'Comuna', 'Fecha Escritura', 'Superficie', 'Monto', 'ROL'];
      
      headers.forEach((header, index) => {
        pdf.text(header, currentX + 2, currentY);
        currentX += colWidths[index];
      });
      
      currentY += rowHeight;
      
      // Datos de las propiedades
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      data.forEach((property, index) => {
        // Alternar color de fondo para mejor lectura
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, currentY - 6, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        currentX = 20;
        const rowData = [
          property.fojas || '-',
          property.numero?.toString() || '-',
          property.anio?.toString() || '-',
          property.cbr || '-',
          property.comuna || '-',
          property.fechaescritura ? new Date(property.fechaescritura).toLocaleDateString('es-CL') : '-',
          property.superficie ? `${Math.round(property.superficie)} m²` : '-',
          property.monto ? formatCompactCurrency(Number(property.monto)) : '-',
          property.rol || '-'
        ];
        
        rowData.forEach((data, colIndex) => {
          pdf.text(data.toString().substring(0, 15), currentX + 2, currentY);
          currentX += colWidths[colIndex];
        });
        
        currentY += rowHeight;
        
        // Nueva página si es necesario
        if (currentY > 190) {
          pdf.addPage('a4', 'landscape');
          currentY = 25;
          
          // Repetir encabezados
          pdf.setFillColor(240, 240, 240);
          pdf.rect(20, currentY - 6, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
          
          pdf.setFont('helvetica', 'bold');
          currentX = 20;
          headers.forEach((header, index) => {
            pdf.text(header, currentX + 2, currentY);
            currentX += colWidths[index];
          });
          
          currentY += rowHeight;
          pdf.setFont('helvetica', 'normal');
        }
      });

      // ========== PÁGINA 3: DETALLES ADICIONALES ==========
      pdf.addPage('a4', 'portrait');
      
      pdf.setFontSize(16);
      pdf.text('INFORMACIÓN ADICIONAL PARA REVISIÓN', 20, 25);
      
      pdf.setFontSize(12);
      pdf.text('Campos disponibles para consulta en Conservador:', 20, 45);
      
      pdf.setFontSize(10);
      const fieldsY = 55;
      pdf.text('• Fojas: Número de fojas del registro en el conservador', 25, fieldsY);
      pdf.text('• Número: Número específico del registro', 25, fieldsY + 8);
      pdf.text('• Año: Año de inscripción de la escritura', 25, fieldsY + 16);
      pdf.text('• CBR: Conservador de Bienes Raíces correspondiente', 25, fieldsY + 24);
      pdf.text('• ROL: Rol de avalúo fiscal de la propiedad', 25, fieldsY + 32);
      pdf.text('• Fecha Escritura: Fecha de otorgamiento de la escritura pública', 25, fieldsY + 40);
      
      pdf.setFontSize(12);
      pdf.text('Estadísticas del área seleccionada:', 20, 105);
      
      pdf.setFontSize(10);
      const statsY = 115;
      pdf.text(`Total de propiedades: ${stats.totalProperties}`, 25, statsY);
      pdf.text(`Rango de precios: ${formatCurrency(Math.min(...data.map(p => Number(p.monto || 0)).filter(m => m > 0)))} - ${formatCurrency(Math.max(...data.map(p => Number(p.monto || 0))))}`, 25, statsY + 8);
      pdf.text(`Rango de superficies: ${Math.min(...data.map(p => p.superficie || 0).filter(s => s > 0))} m² - ${Math.max(...data.map(p => p.superficie || 0))} m²`, 25, statsY + 16);
      
      const comunas = Array.from(new Set(data.map(p => p.comuna).filter((c): c is string => !!c)));
      pdf.text(`Comunas incluidas: ${comunas.join(', ')}`, 25, statsY + 24);
      
      const añosRange = data.map(p => parseInt(p.anio)).filter(a => !isNaN(a) && a > 0);
      if (añosRange.length > 0) {
        pdf.text(`Rango de años: ${Math.min(...añosRange)} - ${Math.max(...añosRange)}`, 25, statsY + 32);
      }

      // Información de contacto y fecha
      pdf.setFontSize(8);
      pdf.text('Generado por Referenciales.cl - Sistema de Análisis de Mercado Inmobiliario', 20, 280);
      pdf.text(`Fecha de generación: ${new Date().toLocaleString('es-CL')}`, 20, 288);

      // Descargar
      const areaName = selectedArea ? selectedArea.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'area-seleccionada';
      pdf.save(`reporte-completo-${areaName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  const getChartConfig = () => {
    switch (selectedChart) {
      case 'scatter':
        return {
          title: 'Precio vs Superficie',
          xLabel: 'Superficie (m²)',
          yLabel: 'Precio (CLP)',
          description: 'Relación entre el tamaño y precio de las propiedades'
        };
      case 'timeSeries':
        return {
          title: 'Evolución de Precios en el Tiempo',
          xLabel: 'Fecha',
          yLabel: 'Precio (CLP)',
          description: 'Tendencia histórica de precios'
        };
      case 'pricePerSqm':
        return {
          title: 'Precio por m² vs Superficie',
          xLabel: 'Superficie (m²)',
          yLabel: 'Precio por m² (CLP)',
          description: 'Análisis de precio unitario por superficie'
        };
      case 'histogram':
        return {
          title: 'Distribución de Precios',
          xLabel: 'Rango de Precios',
          yLabel: 'Cantidad de Propiedades',
          description: 'Frecuencia de propiedades por rango de precio'
        };
      case 'commune':
        return {
          title: 'Análisis por Comuna',
          xLabel: 'Cantidad de Propiedades',
          yLabel: 'Precio Promedio (CLP)',
          description: 'Comparación de mercado por comuna'
        };
      case 'distribution':
        return {
          title: 'Distribución de Superficies',
          xLabel: 'Rango de Superficie (m²)',
          yLabel: 'Cantidad de Propiedades',
          description: 'Frecuencia de propiedades por tamaño'
        };
      default:
        return {
          title: 'Análisis de Datos',
          xLabel: 'X',
          yLabel: 'Y',
          description: 'Análisis de propiedades'
        };
    }
  };

  const config = getChartConfig();

  const renderChart = () => {
    const commonProps = {
      width: 500,
      height: 400,
      margin: { top: 20, right: 30, bottom: 60, left: 80 }
    };

    switch (selectedChart) {
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={config.xLabel}
              tickFormatter={(value) => `${value}m²`}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={config.yLabel}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip 
              formatter={(value: any, name: any, props: any) => {
                if (name === config.yLabel) return [formatCurrency(value), 'Precio'];
                if (name === config.xLabel) return [`${value} m²`, 'Superficie'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.label} - ${data.commune}`;
                }
                return label;
              }}
            />
            <Scatter name="Propiedades" data={chartData} fill="#3B82F6" />
          </ScatterChart>
        );

      case 'timeSeries':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number"
              dataKey="x"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: any) => [formatCurrency(value), 'Precio']}
            />
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'pricePerSqm':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Superficie"
              tickFormatter={(value) => `${value}m²`}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Precio por m²"
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip 
              formatter={(value: any, name: any) => {
                if (name === 'Precio por m²') return [formatCurrency(value), 'Precio/m²'];
                return [value, name];
              }}
            />
            <Scatter name="Precio por m²" data={chartData} fill="#10B981" />
          </ScatterChart>
        );

      case 'histogram':
      case 'distribution':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [value, 'Cantidad']}
            />
            <Bar dataKey="y" fill="#F59E0B" />
          </BarChart>
        );

      case 'commune':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Cantidad"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Precio Promedio"
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <Tooltip 
              formatter={(value: any, name: any) => {
                if (name === 'Precio Promedio') return [formatCurrency(value), 'Precio Promedio'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.label;
                }
                return label;
              }}
            />
            <Scatter name="Comunas" data={chartData} fill="#8B5CF6" />
          </ScatterChart>
        );

      default:
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="X"
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Y"
            />
            <Tooltip />
            <Scatter name="Datos" data={chartData} fill="#3B82F6" />
          </ScatterChart>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Análisis de Mercado Inmobiliario
          </h2>
          <p className="text-gray-600">
            {stats.totalProperties} propiedades analizadas • {config.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={downloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF Completo</span>
          </button>
        </div>
      </div>

      {/* Statistics Panel - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Precio Promedio</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCompactCurrency(stats.averagePrice)}
                </p>
              </div>
              <div className="text-blue-500">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Precio Mediano</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCompactCurrency(stats.medianPrice)}
                </p>
              </div>
              <div className="text-green-500">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Precio por m²</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCompactCurrency(stats.pricePerSqm)}
                </p>
              </div>
              <div className="text-purple-500">
                <MapPin className="w-8 h-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Volumen Total</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCompactCurrency(stats.totalVolume)}
                </p>
              </div>
              <div className="text-orange-500">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => setSelectedChart('scatter')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'scatter' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ScatterIcon className="w-4 h-4" />
          <span>Dispersión</span>
        </button>
        
        <button
          onClick={() => setSelectedChart('timeSeries')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'timeSeries' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LineChartIcon className="w-4 h-4" />
          <span>Tendencia</span>
        </button>
        
        <button
          onClick={() => setSelectedChart('pricePerSqm')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'pricePerSqm' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Precio/m²</span>
        </button>
        
        <button
          onClick={() => setSelectedChart('histogram')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'histogram' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Distribución Precios</span>
        </button>
        
        <button
          onClick={() => setSelectedChart('commune')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'commune' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Por Comuna</span>
        </button>
        
        <button
          onClick={() => setSelectedChart('distribution')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            selectedChart === 'distribution' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Distribución Tamaños</span>
        </button>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="bg-white p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
          {config.title}
        </h3>
        <div className="w-full h-96">
          <ResponsiveContainer>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Indicator */}
      {stats.trend.percentage > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className={`w-5 h-5 ${
              stats.trend.direction === 'up' ? 'text-green-500' : 
              stats.trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
            }`} />
            <span className="text-sm text-gray-600">
              Tendencia del mercado: 
              <span className={`font-semibold ml-1 ${
                stats.trend.direction === 'up' ? 'text-green-600' : 
                stats.trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend.direction === 'up' ? 'Alza' : 
                 stats.trend.direction === 'down' ? 'Baja' : 'Estable'} 
                {stats.trend.percentage > 0 && ` (${stats.trend.percentage}%)`}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRealEstateCharts;
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
import { useAuth } from '@/hooks/useAuth';

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
  const { canViewSensitiveData } = useAuth();

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

  // Función para formatear moneda completa sin abreviaciones
  const formatFullCurrency = (amount: number | bigint | null | undefined): string => {
    if (amount === null || amount === undefined) return '-';
    const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
    return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const downloadPDF = async () => {
    if (typeof window === 'undefined') return;

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      // Usar formato oficio chileno (216 x 330 mm)
      const pdf = new jsPDF('p', 'mm', [216, 330]);
      const chartElement = chartRef.current;
      
      if (!chartElement) return;

      let totalPages = 3; // Calcular después el número real de páginas
      let currentPageNumber = 1;

      // Función para agregar número de página
      const addPageNumber = (pageNum: number, total: number) => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Página ${pageNum} de ${total}`, 180, 320);
      };

      // ========== PÁGINA 1: PORTADA Y RESUMEN EJECUTIVO ==========
      pdf.setFontSize(26);
      pdf.text('REPORTE COMPLETO DE ANÁLISIS', 20, 35);
      pdf.text('DE MERCADO INMOBILIARIO', 20, 47);
      
      pdf.setFontSize(18);
      pdf.text(`Área Seleccionada: ${selectedArea || 'Región Metropolitana'}`, 20, 70);
      
      pdf.setFontSize(12);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 20, 85);
      pdf.text(`Total de propiedades analizadas: ${stats.totalProperties}`, 20, 97);
      
      // Resumen ejecutivo
      pdf.setFontSize(18);
      pdf.text('RESUMEN EJECUTIVO', 20, 120);
      
      pdf.setFontSize(12);
      const resumenY = 135;
      pdf.text(`• Precio promedio del área: ${formatFullCurrency(stats.averagePrice)}`, 25, resumenY);
      pdf.text(`• Precio mediano: ${formatFullCurrency(stats.medianPrice)}`, 25, resumenY + 10);
      pdf.text(`• Precio promedio por m²: ${formatFullCurrency(stats.pricePerSqm)}`, 25, resumenY + 20);
      pdf.text(`• Superficie promedio: ${formatNumber(stats.averageSize)} m²`, 25, resumenY + 30);
      pdf.text(`• Volumen total de transacciones: ${formatFullCurrency(stats.totalVolume)}`, 25, resumenY + 40);
      
      // Tendencia del mercado
      if (stats.trend.percentage > 0) {
        const trendText = stats.trend.direction === 'up' ? 'Alza' : 
                         stats.trend.direction === 'down' ? 'Baja' : 'Estable';
        pdf.text(`• Tendencia del mercado: ${trendText} (${stats.trend.percentage}%)`, 25, resumenY + 50);
      }

      // Capturar el gráfico para la primera página
      const canvas = await html2canvas(chartElement, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 175;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Agregar gráfico en la primera página
      pdf.setFontSize(16);
      pdf.text('GRÁFICO PRINCIPAL', 20, 210);
      pdf.addImage(imgData, 'PNG', 20, 220, imgWidth, Math.min(imgHeight, 85));

      // ========== PÁGINA 2: DETALLES ADICIONALES ==========
      pdf.addPage([216, 330], 'portrait');
      currentPageNumber++;
      
      pdf.setFontSize(18);
      pdf.text('INFORMACIÓN ADICIONAL PARA REVISIÓN', 20, 30);
      
      pdf.setFontSize(14);
      pdf.text('Campos disponibles para consulta en Conservador:', 20, 50);
      
      pdf.setFontSize(11);
      const fieldsY = 65;
      pdf.text('• Fojas: Número de fojas del registro en el conservador', 25, fieldsY);
      pdf.text('• Número: Número específico del registro', 25, fieldsY + 12);
      pdf.text('• Año: Año de inscripción de la escritura', 25, fieldsY + 24);
      pdf.text('• CBR: Conservador de Bienes Raíces correspondiente', 25, fieldsY + 36);
      pdf.text('• Predio: Descripción o dirección completa del predio', 25, fieldsY + 48);
      pdf.text('• Comuna: Comuna donde se ubica la propiedad', 25, fieldsY + 60);
      pdf.text('• ROL: Rol de avalúo fiscal de la propiedad', 25, fieldsY + 72);
      pdf.text('• Fecha Escritura: Fecha de otorgamiento de la escritura pública', 25, fieldsY + 84);
      pdf.text('• Superficie: Superficie total construida en metros cuadrados', 25, fieldsY + 96);
      pdf.text('• Monto: Valor total de la transacción en pesos chilenos', 25, fieldsY + 108);
      pdf.text('• Observaciones: Comentarios adicionales del registro', 25, fieldsY + 120);
      
      if (canViewSensitiveData) {
        pdf.text('• Comprador: Identificación del comprador (solo administradores)', 25, fieldsY + 132);
        pdf.text('• Vendedor: Identificación del vendedor (solo administradores)', 25, fieldsY + 144);
      }
      
      pdf.setFontSize(14);
      const statsHeaderY = canViewSensitiveData ? 225 : 205;
      pdf.text('Estadísticas del área seleccionada:', 20, statsHeaderY);
      
      pdf.setFontSize(11);
      const statsY = canViewSensitiveData ? 240 : 220;
      pdf.text(`Total de propiedades: ${stats.totalProperties}`, 25, statsY);
      pdf.text(`Rango de precios: ${formatFullCurrency(Math.min(...data.map(p => Number(p.monto || 0)).filter(m => m > 0)))} - ${formatFullCurrency(Math.max(...data.map(p => Number(p.monto || 0))))}`, 25, statsY + 12);
      pdf.text(`Rango de superficies: ${Math.min(...data.map(p => p.superficie || 0).filter(s => s > 0))} m² - ${Math.max(...data.map(p => p.superficie || 0))} m²`, 25, statsY + 24);
      
      const comunas = Array.from(new Set(data.map(p => p.comuna).filter((c): c is string => !!c)));
      pdf.text(`Comunas incluidas: ${comunas.join(', ')}`, 25, statsY + 36);
      
      const añosRange = data.map(p => parseInt(p.anio)).filter(a => !isNaN(a) && a > 0);
      if (añosRange.length > 0) {
        pdf.text(`Rango de años: ${Math.min(...añosRange)} - ${Math.max(...añosRange)}`, 25, statsY + 48);
      }

      // Información de generación
      pdf.setFontSize(9);
      pdf.text(`Fecha de generación: ${new Date().toLocaleString('es-CL')}`, 20, 315);

      // ========== LISTADO COMPLETO DE PROPIEDADES AL FINAL (Múltiples páginas en horizontal) ==========
      // Configurar la tabla - Headers y columnas dinámicas basadas en rol
      const baseHeaders = ['N°', 'Fojas', 'Núm', 'Año', 'CBR', 'Predio', 'Comuna', 'ROL', 'Fecha Escr.', 'Sup.(m²)', 'Monto (CLP)', 'Valor Unit.(CLP/m²)', 'Observaciones'];
      const sensitiveHeaders = ['Comprador', 'Vendedor'];
      
      const headers = canViewSensitiveData 
        ? [...baseHeaders, ...sensitiveHeaders]
        : baseHeaders;
      
      // Columnas optimizadas para formato oficio horizontal (297mm ancho útil)
      const baseColWidths = [10, 14, 12, 12, 15, 32, 20, 25, 22, 18, 25, 25, 30];
      const sensitiveColWidths = [28, 28];
      
      const colWidths = canViewSensitiveData 
        ? [...baseColWidths, ...sensitiveColWidths]
        : baseColWidths;

      // Calcular páginas necesarias para la tabla
      const rowsPerPage = 22; // Filas por página en formato horizontal
      const tablePages = Math.ceil(data.length / rowsPerPage);
      totalPages = 2 + tablePages; // 2 páginas iniciales + páginas de tabla

      // Agregar páginas para la tabla
      for (let tablePageNum = 0; tablePageNum < tablePages; tablePageNum++) {
        pdf.addPage([330, 216], 'landscape'); // Formato oficio horizontal
        currentPageNumber++;
        
        if (tablePageNum === 0) {
          pdf.setFontSize(16);
          pdf.text('LISTADO PARA REVISIÓN EN CONSERVADOR DE BIENES RAÍCES', 20, 25);
          
          pdf.setFontSize(10);
          pdf.text(`Propiedades en el área seleccionada (${data.length} registros enumerados)`, 20, 35);
        }
        
        const tableStartY = tablePageNum === 0 ? 45 : 25;
        const rowHeight = 8;
        let currentY = tableStartY;
        
        // Encabezados de la tabla
        pdf.setFillColor(230, 230, 230);
        pdf.rect(15, currentY - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        let currentX = 15;
        
        headers.forEach((header, index) => {
          pdf.text(header, currentX + 1, currentY);
          currentX += colWidths[index];
        });
        
        currentY += rowHeight;
        
        // Datos de las propiedades para esta página
        const startIndex = tablePageNum * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, data.length);
        const pageData = data.slice(startIndex, endIndex);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        
        pageData.forEach((property, index) => {
          const globalIndex = startIndex + index;
          
          // Alternar color de fondo para mejor lectura
          if (index % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(15, currentY - 4, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
          }
          
          currentX = 15;
          
          // Calcular valor unitario
          const calcularValorUnitario = (monto: any, superficie: any) => {
            const montoNum = typeof monto === 'bigint' ? Number(monto) : Number(monto);
            const superficieNum = Number(superficie);
            if (montoNum > 0 && superficieNum > 0) {
              const valorUnitario = montoNum / superficieNum;
              return formatFullCurrency(valorUnitario);
            }
            return '-';
          };

          // Agregar número de enumeración
          const baseRowData = [
            (globalIndex + 1).toString(), // Enumeración
            property.fojas || '-',
            property.numero?.toString() || '-',
            property.anio?.toString() || '-',
            property.cbr || '-',
            property.predio || '-',
            property.comuna || '-',
            property.rol || '-',
            property.fechaescritura ? new Date(property.fechaescritura).toLocaleDateString('es-CL') : '-',
            property.superficie ? `${Math.round(property.superficie)}` : '-',
            property.monto ? formatFullCurrency(property.monto) : '-',
            calcularValorUnitario(property.monto, property.superficie),
            property.observaciones || '-'
          ];
          
          const sensitiveRowData = [
            property.comprador || '-',
            property.vendedor || '-'
          ];
          
          const rowData = canViewSensitiveData 
            ? [...baseRowData, ...sensitiveRowData]
            : baseRowData;
          
          rowData.forEach((data, colIndex) => {
            // Ajustar longitud del texto según el ancho de la columna
            const maxLength = Math.floor(colWidths[colIndex] / 1.8);
            const textToShow = data.toString().length > maxLength 
              ? data.toString().substring(0, maxLength - 2) + '..'
              : data.toString();
            pdf.text(textToShow, currentX + 1, currentY);
            currentX += colWidths[colIndex];
          });
          
          currentY += rowHeight;
        });

        // Agregar número de página en formato horizontal
        addPageNumber(currentPageNumber, totalPages);
      }

      // Actualizar números de página en las primeras páginas
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= 2; i++) {
        pdf.setPage(i);
        addPageNumber(i, pageCount);
      }

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
              formatter={(value: any, name: any) => {
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

'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Point } from './MapMarker';

interface GraficoDispersionProps {
  data: Point[];
}

const GraficoDispersion: React.FC<GraficoDispersionProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center p-4">No hay datos para mostrar en el gráfico. Dibuja un círculo en el mapa para seleccionar referenciales.</div>;
  }

  const chartData = data.map(point => ({
    x: point.fechaescritura ? new Date(point.fechaescritura).getTime() : null,
    y: point.monto ? Number(point.monto) : null,
    ...point
  })).filter(point => point.x !== null && point.y !== null);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 className="text-lg font-semibold text-center mb-4">Gráfico de Dispersión: Fecha de Escritura vs. Monto de Compraventa</h3>
      <ResponsiveContainer>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 40, 
            left: 60,
          }}
        >
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Fecha de Escritura" 
            domain={['dataMin', 'dataMax']}
            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
          >
            <Label value="Fecha de Escritura" offset={-25} position="insideBottom" />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Monto de Compraventa" 
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          >
            <Label value="Monto de Compraventa (CLP)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            formatter={(value: any, name: any, props: any) => {
              if (name === 'Fecha de Escritura') return new Date(value).toLocaleDateString();
              if (name === 'Monto de Compraventa') return `${Number(value).toLocaleString('es-CL')}`;
              return value;
            }}
          />
          <Scatter name="Referenciales" data={chartData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoDispersion;

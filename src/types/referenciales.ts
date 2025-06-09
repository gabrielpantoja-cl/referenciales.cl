export interface Referencial {
  id: string;
  lat: number;
  lng: number;
  fojas: string;
  numero: number;
  anio: number;
  cbr: string;
  comprador: string;
  vendedor: string;
  predio: string;
  comuna: string;
  rol: string;
  fechaescritura: Date;
  monto: number | bigint | null;
  superficie: number;
  observaciones: string | null;
  userId: string;
  conservadorId: string; // Campo nuevo
  createdAt: Date;    // Añadido
  updatedAt: Date;    // Añadido
  user: {
    name: string | null;
    email: string;
  };
  conservador?: { // Relación opcional con conservadores
    id: string;
    nombre: string;
    comuna: string;
  };
}
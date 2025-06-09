// components/ui/referenciales/FormFields.tsx
import React from 'react';
import { Input } from '@/components/ui/primitives/input';

interface FormState {
  errors: {
    [key: string]: string[];
  };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
}

interface CurrentUser {
  id: string;
  name: string;
}

interface FormFieldsProps {
  state: FormState;
  currentUser: CurrentUser; // Añadimos currentUser a la interfaz
}

const FormFields: React.FC<FormFieldsProps> = ({ state, currentUser }) => {
  return (
    <>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        {currentUser ? (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Usuario:</span> {currentUser.name}
            <br />
            <span className="font-medium">ID:</span> {currentUser.id}
          </p>
        ) : (
          <p className="text-sm text-gray-700">Identificando usuario...</p>
        )}
      </div>

      <Input
        label="Fojas"
        id="fojas"
        name="fojas"
        placeholder="Escribe las fojas de la inscripción"
        pattern="^[0-9]+(\s?([vV](?:uelta)?|[vV]ta)?)?$"
        title="Ingrese un número seguido opcionalmente de 'v', 'V', 'vta' o 'vuelta' (con o sin espacio)"
        error={state.errors.fojas}
        required={true}
      />
      <Input
        label="Número"
        id="numero"
        name="numero"
        type="number"
        placeholder="Escribe el número de la inscripción"
        error={state.errors.numero}
        required={true}
      />

      <Input
        label="Año"
        id="anno"
        name="anno"
        type="number"
        placeholder="Escribe el año de la inscripción"
        error={state.errors.anno}
        required={true}
      />

      <Input
        label="Conservador de Bienes Raíces (CBR)"
        id="cbr"
        name="cbr"
        placeholder="Escribe el nombre del Conservador (ej. Nueva Imperial)"
        title="Ingrese el nombre del Conservador de Bienes Raíces, no su ID"
        error={state.errors.cbr}
        required={true}
      />
      
      {/* El campo conservadorId ya no se muestra al usuario directamente */}

      <Input
        label="Comuna"
        id="comuna"
        name="comuna"
        placeholder="Escribe el nombre de la comuna"
        error={state.errors.comuna}
        required={true}
      />

      <Input
        label="Rol de Avalúo"
        id="rolAvaluo"
        name="rolAvaluo"
        placeholder="Escribe el rol de avalúo de la propiedad"
        error={state.errors.rolAvaluo}
        required={true}
      />

      <Input
        label="Predio"
        id="predio"
        name="predio"
        placeholder="Escribe el nombre del predio"
        error={state.errors.predio}
        required={true}
      />

      <Input
        label="Vendedor"
        id="vendedor"
        name="vendedor"
        placeholder="Escribe el nombre del vendedor"
        error={state.errors.vendedor}
        required={true}
      />

      <Input
        label="Comprador"
        id="comprador"
        name="comprador"
        placeholder="Escribe el nombre del comprador"
        error={state.errors.comprador}
        required={true}
      />

      <Input
        label="Superficie (m2)"
        id="superficie"
        name="superficie"
        type="number"
        placeholder="Digita la superficie de la propiedad en m²"
        error={state.errors.superficie}
        required={true}
      />

      <Input
        label="Monto ($)"
        id="monto"
        name="monto"
        type="number"
        placeholder="Digita el monto de la transacción en pesos chilenos"
        error={state.errors.monto}
        required={true}
      />

      <Input
        label="Fecha de escritura"
        id="fechaEscritura"
        name="fechaEscritura"
        type="date"
        placeholder="dd-mm-aaaa"
        pattern="\d{2}-\d{2}-\d{4}"
        error={state.errors.fechaEscritura}
        required={true}
      />

      <Input
        label="Latitud"
        id="latitud"
        name="latitud"
        type="number"
        placeholder="-39.851241"
        step="any"
        error={state.errors.latitud}
        required={true}
      />

      <Input
        label="Longitud"
        id="longitud"
        name="longitud"
        type="number"
        placeholder="-73.215171"
        step="any"
        error={state.errors.longitud}
        required={true}
      />

      <Input
        label="Observaciones"
        id="observaciones"
        name="observaciones"
        placeholder="Escribe observaciones como deslindes o número de plano"
        error={state.errors.observaciones}
      />
    </>
  );
};

export default FormFields;
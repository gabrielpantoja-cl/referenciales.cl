"use client";

import Chatbot from '../../components/ui/common/Chatbot';

export default function ChatbotPage() {
  const handleClose = () => {
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-100">
      <div className="flex-grow flex items-center justify-center w-full">
        <Chatbot onClose={handleClose} />
      </div>
      <footer className="w-full p-4 bg-gray-200 text-center text-sm text-gray-600">
        Advertencia: Este chatbot utiliza inteligencia artificial y los mensajes generados pueden contener errores. Siempre verifique la información proporcionada.
      </footer>
    </div>
  );
}
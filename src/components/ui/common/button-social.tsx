// app/components/button-social.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/primitives/button";
import { signIn } from "next-auth/react";

interface ButtonSocialProps {
  children: React.ReactNode;
  provider: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ButtonSocial = ({ children, provider, className, onClick, disabled }: ButtonSocialProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      if (onClick) {
        onClick();
      } else {
        await signIn(provider);
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.");
      console.error(err);
    }
  };

  return (
    <div>
      <Button onClick={handleClick} className={className} disabled={disabled}>
        {children}
      </Button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ButtonSocial;
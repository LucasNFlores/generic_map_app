import * as React from "react";
import { useState } from "react"; // 1. Importar useState
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react"; // 2. Importar iconos (asumiendo lucide-react)

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // 3. Estado para manejar la visibilidad
    const [showPassword, setShowPassword] = useState(false);

    // 4. Determinar el tipo real del input
    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      // 5. Contenedor relativo para posicionar el icono
      <div className="relative w-full">
        <input
          type={inputType} // Usar el tipo dinámico
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            // 6. Añadir padding extra a la derecha si es tipo password
            type === "password" && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
        />
        {/* 7. Renderizar el botón del icono SÓLO si el tipo es "password" */}
        {type === "password" && (
          <button
            type="button" // Importante para que no envíe formularios
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
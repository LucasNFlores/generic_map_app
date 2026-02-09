import { MapStoreProvider } from "@/providers/map-store-provider";
import MapComponent from "@/components/map/mapComponent";
import Header from "@/components/ui/header";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col relative overflow-hidden bg-background">
      <Header />

      {/* Mapa de fondo interactivo pero de solo lectura */}
      <div className="absolute inset-0 z-0">
        <MapStoreProvider>
          <MapComponent isReadOnly={true} />
        </MapStoreProvider>
      </div>

      {/* Overlay opcional para mejorar contraste si fuera necesario */}
      <div className="absolute inset-0 bg-background/10 pointer-events-none z-10" />
    </main>
  );
}

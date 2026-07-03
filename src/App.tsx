import { useState, useCallback, useEffect } from 'react';
import { useInventarios } from '@/hooks/useInventarios';
import { Bienvenida } from '@/components/Bienvenida';
import { MenuPrincipal } from '@/components/MenuPrincipal';
import { InventarioView } from '@/components/InventarioView';
import { Busqueda } from '@/components/Busqueda';
import { Configuracion, type AppSettings } from '@/components/Configuracion';
import './index.css';

type Screen = 'bienvenida' | 'menu' | 'inventario' | 'busqueda' | 'configuracion';

const DEFAULT_SETTINGS: AppSettings = {
  idioma: 'es',
  tema: 'dark',
  altoContraste: false,
  reducirAnimaciones: false,
  tamanoTexto: 'normal',
};

function App() {
  const [screen, setScreen] = useState<Screen>('bienvenida');
  const [selectedInventarioId, setSelectedInventarioId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('farmasi_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const {
    inventarios,
    updateCantidad,
    setCantidad,
    buscarGlobal,
    resetInventarios,
  } = useInventarios();

  // Persist settings
  useEffect(() => {
    localStorage.setItem('farmasi_settings', JSON.stringify(settings));
  }, [settings]);

  const handleBienvenidaComplete = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleSelectInventario = useCallback((id: string) => {
    setSelectedInventarioId(id);
    setScreen('inventario');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setSelectedInventarioId(null);
    setScreen('menu');
  }, []);

  const handleSelectResult = useCallback((inventarioId: string, _productoIndex: number) => {
    setSelectedInventarioId(inventarioId);
    setScreen('inventario');
  }, []);

  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleResetData = useCallback(() => {
    resetInventarios();
  }, [resetInventarios]);

  const selectedInventario = selectedInventarioId 
    ? inventarios.find(i => i.id === selectedInventarioId) 
    : null;

  // Apply theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = settings.tema === 'dark' || (settings.tema === 'auto' && prefersDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  // Reduced motion
  useEffect(() => {
    if (settings.reducirAnimaciones) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [settings.reducirAnimaciones]);

  return (
    <div
      className="h-full w-full overflow-hidden relative transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0a0f 0%, #000000 40%, #0a0a1a 100%)'
          : 'linear-gradient(180deg, #f7f4ee 0%, #f2efe8 40%, #ebe7de 100%)',
      }}
    >
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10, 132, 255, 0.06) 0%, transparent 60%)'
            : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 113, 227, 0.05) 0%, transparent 60%)',
          opacity: isDark ? 1 : 0.7,
        }}
      />

      {/* Screen content */}
      <div className="relative h-full">
        {screen === 'bienvenida' && (
          <Bienvenida onComplete={handleBienvenidaComplete} isDark={isDark} />
        )}

        {screen === 'menu' && (
          <MenuPrincipal
            inventarios={inventarios}
            onSelectInventario={handleSelectInventario}
            onBuscar={() => setScreen('busqueda')}
            onConfiguracion={() => setScreen('configuracion')}
          />
        )}

        {screen === 'inventario' && selectedInventario && (
          <InventarioView
            inventario={selectedInventario}
            onBack={handleBackToMenu}
            onUpdateCantidad={updateCantidad}
            onSetCantidad={setCantidad}
          />
        )}

        {screen === 'busqueda' && (
          <Busqueda
            onBack={handleBackToMenu}
            onSelectResult={handleSelectResult}
            buscarGlobal={buscarGlobal}
            inventarios={inventarios}
          />
        )}

        {screen === 'configuracion' && (
          <Configuracion
            onBack={handleBackToMenu}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        )}
      </div>
    </div>
  );
}

export default App;

import { useState, useCallback, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useInventarios } from '@/hooks/useInventarios';
import { Bienvenida } from '@/components/Bienvenida';
import { MenuPrincipal } from '@/components/MenuPrincipal';
import { InventarioView } from '@/components/InventarioView';
import { Busqueda } from '@/components/Busqueda';
import { Configuracion, type AppSettings } from '@/components/Configuracion';
import { Login } from '@/components/Login';
import './index.css';

type Screen = 'bienvenida' | 'menu' | 'inventario' | 'busqueda' | 'configuracion';

const DEFAULT_SETTINGS: AppSettings = {
  idioma: 'es',
  tema: 'dark',
  altoContraste: false,
  reducirAnimaciones: false,
  tamanoTexto: 'normal',
};

function getDisplayName(user: User | null): string {
  if (!user) return 'Usuario';
  return user.email?.split('@')[0] || 'Usuario';
}

function App() {
  const [screen, setScreen] = useState<Screen>('bienvenida');
  const [selectedInventarioId, setSelectedInventarioId] = useState<string | null>(null);
  const [selectedProductoIndex, setSelectedProductoIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('farmasi_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // Listen auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) {
        setScreen('bienvenida');
        setSelectedInventarioId(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleBienvenidaComplete = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleSelectInventario = useCallback((id: string) => {
    setSelectedInventarioId(id);
    setSelectedProductoIndex(null);
    setScreen('inventario');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setSelectedInventarioId(null);
    setSelectedProductoIndex(null);
    setScreen('menu');
  }, []);

  const handleSelectResult = useCallback((inventarioId: string, productoIndex: number) => {
    setSelectedInventarioId(inventarioId);
    setSelectedProductoIndex(productoIndex);
    setScreen('inventario');
  }, []);

  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleResetData = useCallback(() => {
    resetInventarios();
  }, [resetInventarios]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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

  if (authLoading) {
    return (
      <div
        className="h-full w-full transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #0a0a0f 0%, #000000 40%, #0a0a1a 100%)'
            : 'linear-gradient(180deg, #f7f4ee 0%, #f2efe8 40%, #ebe7de 100%)',
        }}
      />
    );
  }

  if (!session) {
    return <Login isDark={isDark} />;
  }

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
            userName={getDisplayName(user)}
            onSelectInventario={handleSelectInventario}
            onBuscar={() => setScreen('busqueda')}
            onConfiguracion={() => setScreen('configuracion')}
          />
        )}

        {screen === 'inventario' && selectedInventario && (
          <InventarioView
            inventario={selectedInventario}
            selectedProductoIndex={selectedProductoIndex ?? undefined}
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
            userName={getDisplayName(user)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;

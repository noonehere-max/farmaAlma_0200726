import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Globe, Eye, RotateCcw, Moon, Sun, 
  Type, MonitorSmartphone, Info, ChevronRight,
  UserCircle, LogOut
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface AppSettings {
  idioma: 'es' | 'en';
  tema: 'dark' | 'light' | 'auto';
  altoContraste: boolean;
  reducirAnimaciones: boolean;
  tamanoTexto: 'normal' | 'grande';
}

interface ConfiguracionProps {
  onBack: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  userName: string;
  onLogout: () => void;
}

export function Configuracion({ onBack, settings, onUpdateSettings, onResetData, userName, onLogout }: ConfiguracionProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (settings.tamanoTexto === 'grande') {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [settings.tamanoTexto]);

  useEffect(() => {
    if (settings.altoContraste) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings.altoContraste]);

  const toggleSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onResetData();
    setConfirmReset(false);
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 
      className="text-xs font-semibold uppercase tracking-wider px-5 mt-6 mb-2"
      style={{ color: 'var(--ios-text-tertiary)' }}
    >
      {children}
    </h3>
  );

  const SettingRow = ({ 
    icon, label, description, children, danger 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    description?: string;
    children?: React.ReactNode;
    danger?: boolean;
  }) => (
    <div 
      className="flex items-center gap-3.5 px-5 py-3.5"
      style={{ borderBottom: '1px solid var(--ios-border)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? 'rgba(255, 59, 48, 0.10)' : 'var(--ios-surface)',
          color: danger ? 'var(--ios-red)' : 'var(--ios-text-secondary)',
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] ${danger ? 'text-[var(--ios-red)]' : ''}`}>{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--ios-text-tertiary)' }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );

  const SegmentedControl = <T extends string>({ 
    options, value, onChange 
  }: { 
    options: { label: string; value: T }[]; 
    value: T; 
    onChange: (v: T) => void;
  }) => (
    <div
      className="flex rounded-lg p-0.5 gap-0.5"
      style={{ background: 'var(--ios-surface)' }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            value === opt.value
              ? 'shadow-sm'
              : 'opacity-60 hover:opacity-80'
          }`}
          style={value === opt.value ? {
            background: 'var(--ios-surface-solid)',
            color: 'var(--ios-text-primary)',
          } : {}}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-[51px] h-[31px] rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        background: checked ? 'var(--ios-green)' : 'var(--ios-text-tertiary)',
      }}
    >
      <div 
        className="absolute top-[2px] w-[27px] h-[27px] rounded-full shadow-sm transition-all duration-200"
        style={{
          left: checked ? '22px' : '2px',
          background: '#fff',
        }}
      />
    </button>
  );

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 pt-6 pb-4 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn-glass rounded-full p-2.5 flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h2 
            className="text-xl font-semibold"
            style={{ fontFamily: "'SF Pro Display', system-ui" }}
          >
            Configuración
          </h2>
        </div>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Cuenta */}
        <SectionTitle>Cuenta</SectionTitle>
        <div className="liquid-glass rounded-2xl mx-5 overflow-hidden">
          <SettingRow
            icon={<UserCircle size={16} strokeWidth={1.5} />}
            label={userName}
            description="Usuario activo"
          />
          <button
            onClick={onLogout}
            className="w-full text-left"
          >
            <SettingRow
              icon={<LogOut size={16} strokeWidth={1.5} />}
              label="Cerrar sesión"
              description="Salir de la cuenta actual"
              danger
            />
          </button>
        </div>

        {/* General */}
        <SectionTitle>General</SectionTitle>
        <div className="liquid-glass rounded-2xl mx-5 overflow-hidden">
          <SettingRow 
            icon={<Globe size={16} strokeWidth={1.5} />}
            label="Idioma"
            description="Idioma de la interfaz"
          >
            <SegmentedControl
              options={[
                { label: 'Español', value: 'es' },
                { label: 'English', value: 'en' },
              ]}
              value={settings.idioma}
              onChange={(v) => toggleSetting('idioma', v)}
            />
          </SettingRow>

          <SettingRow 
            icon={settings.tema === 'light' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            label="Tema"
            description="Apariencia visual"
          >
            <SegmentedControl
              options={[
                { label: 'Oscuro', value: 'dark' },
                { label: 'Claro', value: 'light' },
                { label: 'Auto', value: 'auto' },
              ]}
              value={settings.tema}
              onChange={(v) => toggleSetting('tema', v)}
            />
          </SettingRow>
        </div>

        {/* Accesibilidad */}
        <SectionTitle>Accesibilidad</SectionTitle>
        <div className="liquid-glass rounded-2xl mx-5 overflow-hidden">
          <SettingRow 
            icon={<Eye size={16} strokeWidth={1.5} />}
            label="Alto contraste"
            description="Mejora la visibilidad de bordes y textos"
          >
            <Toggle checked={settings.altoContraste} onChange={(v) => toggleSetting('altoContraste', v)} />
          </SettingRow>

          <SettingRow 
            icon={<MonitorSmartphone size={16} strokeWidth={1.5} />}
            label="Reducir animaciones"
            description="Minimiza los efectos visuales"
          >
            <Toggle checked={settings.reducirAnimaciones} onChange={(v) => toggleSetting('reducirAnimaciones', v)} />
          </SettingRow>

          <SettingRow 
            icon={<Type size={16} strokeWidth={1.5} />}
            label="Tamaño de texto"
            description="Ajusta el tamaño general del texto"
          >
            <SegmentedControl
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Grande', value: 'grande' },
              ]}
              value={settings.tamanoTexto}
              onChange={(v) => toggleSetting('tamanoTexto', v)}
            />
          </SettingRow>
        </div>

        {/* Datos */}
        <SectionTitle>Datos</SectionTitle>
        <div className="liquid-glass rounded-2xl mx-5 overflow-hidden">
          <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
            <DialogTrigger asChild>
              <button className="w-full text-left">
                <SettingRow 
                  icon={<RotateCcw size={16} strokeWidth={1.5} />}
                  label="Restablecer datos"
                  description="Vuelve a los valores iniciales de inventario"
                  danger
                >
                  <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
                </SettingRow>
              </button>
            </DialogTrigger>
            <DialogContent
              className="glass-sheet border-0 sm:max-w-[320px] rounded-3xl p-6 gap-0"
              style={{ background: 'var(--ios-surface-solid)', backdropFilter: 'blur(60px)' }}
            >
              <DialogHeader className="space-y-2 pb-4">
                <DialogTitle className="text-center text-lg font-semibold">
                  Restablecer inventarios
                </DialogTitle>
                <DialogDescription className="text-center text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
                  Esto revertirá todas las cantidades a sus valores iniciales. Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98]"
                  style={{ 
                    background: 'var(--ios-red)',
                    color: '#fff',
                  }}
                >
                  Restablecer
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="w-full py-3 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] btn-glass"
                  style={{ color: 'var(--ios-blue)' }}
                >
                  Cancelar
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* About */}
        <SectionTitle>Acerca de</SectionTitle>
        <div className="liquid-glass rounded-2xl mx-5 overflow-hidden mb-8">
          <SettingRow 
            icon={<Info size={16} strokeWidth={1.5} />}
            label="Farmasi Inventory"
            description="Versión 1.0"
          />
          <div 
            className="px-5 py-3 text-xs"
            style={{ color: 'var(--ios-text-tertiary)', borderTop: '1px solid var(--ios-border)' }}
          >
            Diseñado para la gestión eficiente de inventarios Farmasi.
            Compatible con iOS 27 Liquid Glass.
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Lock, User, Eye, EyeOff, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LoginProps {
  isDark?: boolean;
}

function usernameToEmail(username: string): string {
  const clean = username.trim().toLowerCase();
  return `${clean}@farmasi.local`;
}

export function Login({ isDark = true }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = usernameToEmail(username);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center px-6 transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0a0a0f 0%, #000000 40%, #0a0a1a 100%)'
          : 'linear-gradient(180deg, #f7f4ee 0%, #f2efe8 40%, #ebe7de 100%)',
      }}
    >
      {/* Logo */}
      <div className="liquid-glass-strong rounded-3xl p-8 mb-8 animate-fadeInUp">
        <Package size={64} strokeWidth={1.5} style={{ color: 'var(--ios-blue)' }} />
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm liquid-glass rounded-3xl p-6 space-y-5 animate-fadeIn">
        <div className="text-center space-y-1">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'SF Pro Display', system-ui", color: 'var(--ios-text-primary)' }}
          >
            Bienvenido
          </h1>
          <p className="text-sm" style={{ color: 'var(--ios-text-secondary)' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium ml-1" style={{ color: 'var(--ios-text-secondary)' }}>
              Usuario
            </label>
            <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
              <User size={18} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Tu usuario"
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ios-text-tertiary)]"
                style={{ color: 'var(--ios-text-primary)' }}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium ml-1" style={{ color: 'var(--ios-text-secondary)' }}>
              Contraseña
            </label>
            <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
              <Lock size={18} strokeWidth={1.5} style={{ color: 'var(--ios-text-tertiary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ios-text-tertiary)]"
                style={{ color: 'var(--ios-text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-full transition-colors"
                style={{ color: 'var(--ios-text-tertiary)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="text-sm text-center px-4 py-2.5 rounded-xl"
              style={{
                background: 'rgba(255, 59, 48, 0.10)',
                color: 'var(--ios-red)',
                border: '1px solid rgba(255, 59, 48, 0.20)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            style={{
              background: 'var(--ios-blue)',
              color: '#fff',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs" style={{ color: 'var(--ios-text-tertiary)' }}>
        Farmasi Inventory Manager
      </p>
    </div>
  );
}

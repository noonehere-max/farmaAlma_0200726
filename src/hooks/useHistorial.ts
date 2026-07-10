import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type HistorialAccion = 'crear' | 'editar' | 'eliminar' | 'mover';

export interface HistorialCambio {
  campo: string;
  anterior: string;
  nuevo: string;
}

export interface HistorialEntry {
  id?: number;
  fecha: string;
  usuario: string;
  accion: HistorialAccion;
  inventarioId: string;
  productoNombre: string;
  cambios: HistorialCambio[];
}

interface HistorialRow {
  id: number;
  created_at: string;
  user_email: string;
  accion: HistorialAccion;
  inventario_id: string;
  producto_nombre: string;
  cambios: HistorialCambio[];
}

const STORAGE_KEY = 'farmasi_historial';

function rowsToEntries(rows: HistorialRow[]): HistorialEntry[] {
  return rows.map(row => ({
    id: row.id,
    fecha: row.created_at,
    usuario: row.user_email,
    accion: row.accion,
    inventarioId: row.inventario_id,
    productoNombre: row.producto_nombre,
    cambios: Array.isArray(row.cambios) ? row.cambios : [],
  }));
}

export function useHistorial(userEmail: string | null) {
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  const loadLocal = useCallback((): HistorialEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocal = useCallback((entries: HistorialEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, []);

  const fetchHistorial = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('historial')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<HistorialRow[]>();

      if (fetchError) throw fetchError;

      const entries = rowsToEntries(data || []);
      setHistorial(entries);
      saveLocal(entries);
      setError(null);
    } catch (err) {
      console.error('Error cargando historial:', err);
      setHistorial(loadLocal());
      setError('No se pudo cargar el historial desde el servidor.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [loadLocal, saveLocal]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  const addEntry = useCallback(
    async (entry: Omit<HistorialEntry, 'id' | 'fecha' | 'usuario'>) => {
      const newEntry: HistorialEntry = {
        ...entry,
        fecha: new Date().toISOString(),
        usuario: userEmail || 'Usuario anónimo',
      };

      // Optimista local
      setHistorial(prev => {
        const next = [newEntry, ...prev];
        saveLocal(next);
        return next;
      });

      try {
        const { error: insertError } = await supabase.from('historial').insert({
          user_email: newEntry.usuario,
          accion: newEntry.accion,
          inventario_id: newEntry.inventarioId,
          producto_nombre: newEntry.productoNombre,
          cambios: newEntry.cambios,
        });

        if (insertError) throw insertError;
      } catch (err) {
        console.error('Error guardando historial:', err);
        // Se mantiene el fallback local; no revertimos
      }
    },
    [userEmail, saveLocal]
  );

  const clearHistorial = useCallback(async () => {
    setHistorial([]);
    saveLocal([]);
    try {
      const { error: deleteError } = await supabase.from('historial').delete().neq('id', 0);
      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error limpiando historial:', err);
    }
  }, [saveLocal]);

  return {
    historial,
    loading,
    error,
    addEntry,
    clearHistorial,
    refresh: fetchHistorial,
  };
}

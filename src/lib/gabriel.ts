import type { Inventario, Producto } from '@/data/inventarios';

export type GabrielState = 'idle' | 'searching' | 'no-results' | 'results';

export interface GabrielSuggestion {
  label: string;
  query: string;
}

export interface GabrielResponse {
  state: GabrielState;
  message: string;
  suggestions: GabrielSuggestion[];
  insight?: string;
}

const KEYWORDS: Record<string, string[]> = {
  skincare: ['skincare', 'piel', 'rostro', 'serum', 'mascarilla', 'contorno', 'limpiador'],
  cuidadocorporal: ['cuerpo', 'corporal', 'cabello', 'jabón', 'desodorante', 'perfume', 'masaje'],
  maquillaje: ['maquillaje', 'labial', 'sombra', 'rubor', 'pestañas', 'brocha', 'corrector'],
  nutriplus: ['nutriplus', 'nutrición', 'suplemento', 'cafe', 'colageno', 'vitamina', 'gummies'],
};

const INVENTORY_NAMES: Record<string, string> = {
  skincare: 'Skincare 2026',
  cuidadocorporal: 'Cuidado Corporal',
  maquillaje: 'Maquillaje',
  nutriplus: 'Nutriplus',
};

function detectInventoryKeyword(query: string): string | null {
  const q = query.toLowerCase();
  for (const [id, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => q.includes(w))) return id;
  }
  return null;
}

function findSimilarProducts(
  query: string,
  inventarios: Inventario[],
  limit = 4
): { producto: Producto; inventario: Inventario }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(t => t.length > 2);

  const scored: { producto: Producto; inventario: Inventario; score: number }[] = [];
  for (const inv of inventarios) {
    for (const prod of inv.productos) {
      const name = prod.nombre.toLowerCase();
      let score = 0;
      if (name.includes(q)) score += 10;
      for (const term of terms) {
        if (name.includes(term)) score += 3;
      }
      if (score > 0) scored.push({ producto: prod, inventario: inv, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ producto, inventario }) => ({ producto, inventario }));
}

export function askGabriel(
  query: string,
  results: { producto: Producto; inventario: Inventario; index: number }[],
  inventarios: Inventario[]
): GabrielResponse {
  const q = query.trim();

  // Estado idle: sin texto
  if (!q) {
    const total = inventarios.reduce((acc, inv) => acc + inv.productos.length, 0);
    return {
      state: 'idle',
      message: `¡Hola! Soy Gabriel. Busca entre ${total} productos y te ayudo a encontrar lo que necesitas.`,
      suggestions: [
        { label: 'Skincare', query: 'skincare' },
        { label: 'Maquillaje', query: 'maquillaje' },
      ],
    };
  }

  // Estado searching: texto pero aún no hay resultados
  if (q.length > 0 && results.length === 0) {
    const similar = findSimilarProducts(q, inventarios);
    const detected = detectInventoryKeyword(q);

    if (similar.length > 0) {
      const suggestions = similar.map(s => ({
        label: s.producto.nombre,
        query: s.producto.nombre,
      }));
      return {
        state: 'no-results',
        message: `No encontré "${q}" exacto, pero vi estas opciones similares:`,
        suggestions,
      };
    }

    if (detected) {
      return {
        state: 'no-results',
        message: `Parece que buscas productos de ${INVENTORY_NAMES[detected]}. Prueba con una palabra más específica.`,
        suggestions:
          inventarios
            .find(inv => inv.id === detected)
            ?.productos.slice(0, 3)
            .map(p => ({ label: p.nombre, query: p.nombre })) ?? [],
      };
    }

    return {
      state: 'no-results',
      message: `No encontré resultados para "${q}". ¿Quieres que busque algo parecido?`,
      suggestions: [
        { label: 'Buscar skincare', query: 'skincare' },
        { label: 'Buscar maquillaje', query: 'maquillaje' },
        { label: 'Ver todos', query: '' },
      ],
    };
  }

  // Estado results: hay resultados
  const count = results.length;
  const categories = Array.from(new Set(results.map(r => r.inventario.nombre)));

  const suggestions: GabrielSuggestion[] = [];
  if (categories.length > 1) {
    suggestions.push({
      label: `Solo ${categories[0]}`,
      query: `${q} ${categories[0].split(' ')[0].toLowerCase()}`,
    });
  }

  return {
    state: 'results',
    message: `Encontré ${count} resultado${count !== 1 ? 's' : ''} en ${categories.length} inventario${categories.length !== 1 ? 's' : ''}.`,
    suggestions,
  };
}

# Farmasi Inventory Manager

Aplicación web para gestionar el inventario de productos **Farmasi** de forma sencilla, rápida y visual.

## ¿Qué hace esta aplicación?

Esta app permite llevar el control de stock de cuatro categorías de productos Farmasi:

- **Maquillaje**
- **Skincare 2026**
- **Cuidado Corporal**
- **Nutriplus**

Desde la interfaz puedes:

- Revisar el estado de cada inventario: cuántos productos hay y cuántos tienen existencias.
- Aumentar o disminuir la cantidad de cada producto con botones `+` y `-`.
- Editar la cantidad directamente tocando el número.
- Ordenar los productos por nombre o por cantidad.
- Buscar productos por nombre en todos los inventarios a la vez.
- Ver colores de advertencia según el stock: verde (bien), naranja (bajo) o rojo (agotado).
- Restablecer todos los datos a los valores iniciales.

## Características principales

- **Diseño tipo iOS Liquid Glass**: interfaz moderna con modo oscuro, claro y automático.
- **Autenticación**: inicio de sesión con usuario y contraseña mediante Supabase.
- **Sincronización en la nube**: los cambios se guardan en Supabase y se actualizan en tiempo real.
- **Respaldo local**: si falla la conexión con Supabase, la app sigue funcionando con los datos locales.
- **Accesibilidad**: opciones de alto contraste, reducción de animaciones y tamaño de texto grande.
- **Búsqueda inteligente**: sugerencias del asistente Gabriel mientras escribes.

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (autenticación y base de datos)
- Lucide React (iconos)

## Instalación y uso

1. Clona el repositorio.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. La conexión con Supabase ya está configurada en `src/lib/supabase.ts`. Si necesitas usar tu propio proyecto de Supabase, actualiza esa configuración.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre la URL que aparece en la terminal (por defecto `http://localhost:5173`).

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run preview` | Previsualiza la versión de producción. |
| `npm run lint` | Ejecuta el linter para revisar el código. |

## Estructura del proyecto

- `src/App.tsx`: componente raíz y navegación entre pantallas.
- `src/components/`: componentes de la interfaz (inventario, búsqueda, configuración, login, etc.).
- `src/hooks/useInventarios.ts`: lógica de carga, actualización y sincronización de inventarios.
- `src/data/inventarios.ts`: datos iniciales de productos.
- `src/lib/supabase.ts`: configuración de cliente de Supabase.

## Notas

- La aplicación está diseñada principalmente para uso en español.
- Los ajustes de tema, idioma y accesibilidad se guardan en el navegador (`localStorage`).
- Si es la primera vez que se ejecuta, los datos iniciales se cargan automáticamente en Supabase.

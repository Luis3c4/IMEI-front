import { useRouter } from '@tanstack/react-router'
import { type HeaderInfo } from '@/types'

/**
 * Hook que obtiene la información del header (título y descripción) basado en la ruta actual
 * 
 * Uso:
 * ```tsx
 * const headerInfo = useHeaderInfo()
 * // Retorna: { title: "IMEI Check", description: "CGenera cotizaciones en PDFonsultor de dispositivos" }
 * ```
 * 
 * Para agregar nuevas rutas:
 * 1. Actualiza el objeto HEADER_INFO_MAP con la ruta y sus datos
 * 2. Asegúrate que la ruta coincida con el 'path' definido en route-definitions.tsx
 */

const HEADER_INFO_MAP: Record<string, HeaderInfo> = {
  '/': {
    title: 'IMEI Check',
    description: 'Consultor de dispositivos',
  },
  '/imei-check': {
    title: 'IMEI Check',
    description: 'Consultor de dispositivos',
  },
  '/factura': {
    title: 'Cotizador iPhone',
    description: 'Genera cotizaciones en PDF',
  },
  // Agregar más rutas aquí según sea necesario
}

export const useHeaderInfo = (): HeaderInfo => {
  const router = useRouter()
  const currentPathname = router.state.location.pathname

  // Busca coincidencia exacta primero
  if (HEADER_INFO_MAP[currentPathname]) {
    return HEADER_INFO_MAP[currentPathname]
  }

  // Búsqueda parcial para rutas dinámicas (ej: /users/123)
  for (const [path, info] of Object.entries(HEADER_INFO_MAP)) {
    if (currentPathname.startsWith(path)) {
      return info
    }
  }

  // Fallback por defecto
  return {
    title: 'IMEI Check',
    description: 'Consultor de dispositivos',
  }
}

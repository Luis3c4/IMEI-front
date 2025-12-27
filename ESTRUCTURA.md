# Diagrama de Arquitectura - IMEI Checker

## Estructura en Capas

```
┌─────────────────────────────────────────────┐
│            UI / PRESENTACIÓN                │
│                (App.tsx)                    │
│  Gestiona estado global y renderiza        │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
┌────────▼────────┐  ┌──▼──────────────┐
│   COMPONENTES   │  │    HOOKS        │
├─────────────────┤  ├─────────────────┤
│ • Scanner       │  │useIMEIChecker   │
│ • InfoCard      │  │useStats         │
│ • Toast         │  │                 │
│ • ServiceSel.   │  │Lógica React     │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────▼────────────┐
         │   SERVICIOS / API   │
         ├────────────────────┤
         │  IMEIAPIService    │
         │                    │
         │ • checkDevice()    │
         │ • getStats()       │
         │ • getBalance()     │
         │ • getServices()    │
         │ • getLastOrder()   │
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │   BASE DE DATOS    │
         │   BACKEND API      │
         │                    │
         │ localhost:5000     │
         │ DHRU Fusion API    │
         └────────────────────┘
```

## Estructura de Archivos

```
src/
│
├── App.tsx                          [CONTENEDOR PRINCIPAL]
│   ├─ Estado global
│   ├─ Renderiza componentes
│   ├─ Maneja scanner modal
│   └─ Bloquea scroll cuando scanner abierto
│
├── components/                      [COMPONENTES REUTILIZABLES]
│   ├── Scanner.tsx                 [Captura códigos de barras]
│   │   ├─ Accede a cámara
│   │   ├─ Lee códigos barras
│   │   ├─ Valida serial e IMEI
│   │   └─ Emite onScan con valor
│   │
│   ├── InfoCard.tsx               [Tarjeta de información]
│   │   ├─ Props: label, value, highlight
│   │   └─ Colores según resaltado
│   │
│   ├── Toast.tsx                  [Notificaciones emergentes]
│   │   ├─ Props: toast state
│   │   └─ Colores por tipo
│   │
│   └── ServiceSelector.tsx        [Selector de servicios]
│       └─ Props: services, selectedId, onChange
│
├── hooks/                           [LÓGICA REUTILIZABLE]
│   ├── useIMEIChecker.ts          [Lógica de búsqueda]
│   │   ├─ Maneja estado de búsqueda
│   │   ├─ Valida entrada
│   │   └─ Llama a checkDevice()
│   │
│   └── useStats.ts                [Gestión de datos globales]
│       ├─ Carga estadísticas
│       ├─ Obtiene balance
│       ├─ Recupera últimas órdenes
│       └─ Refrescar datos
│
├── services/                        [INTEGRACIÓN CON BACKEND]
│   └── api.ts                      [Clase IMEIAPIService]
│       ├─ static checkDevice()     [Consulta dispositivo]
│       ├─ static getStats()        [Obtiene stats]
│       ├─ static getBalance()      [Obtiene balance]
│       ├─ static getServices()     [Lista servicios]
│       └─ static getLastOrder()    [Última orden]
│
├── types/                           [DEFINICIONES TYPESCRIPT]
│   └── index.ts                    [Tipos compartidos]
│       ├─ DeviceInfo
│       ├─ Stats
│       ├─ Service
│       ├─ LastOrderInfo
│       ├─ ToastState
│       ├─ ScannerProps
│       └─ InfoCardProps
│
└── utils/                           [CONSTANTES Y UTILIDADES]
    └── constants.ts                [Configuración global]
        ├─ API_BASE
        ├─ TOAST_DURATION
        ├─ BARCODE_VALIDATION
        └─ DEFAULT_SERVICE_ID
```

## Flujo de Datos

### Búsqueda Manual

```
Usuario ingresa Serial/IMEI
        ↓
App.tsx: handleConsultar()
        ↓
IMEIAPIService.checkDevice()
        ↓
API Backend (POST /api/check)
        ↓
setResult() + showToast()
        ↓
Renderiza InfoCard x 14
```

### Búsqueda por Scanner

```
Usuario abre Scanner
        ↓
Scanner.tsx: Lee código de barras
        ↓
Valida patrón (S... o 15 dígitos)
        ↓
onScan() callback
        ↓
App.tsx: handleScan()
        ↓
setInputValue() [mismo que #1]
        ↓
Cierra modal + busca automáticamente
```

### Carga de Datos Iniciales

```
App.tsx: useEffect (montar)
        ↓
loadInitialData()
        ↓
Promise.all([
  getStats(),
  getBalance(),
  getServices()
])
        ↓
setStats() + setBalance() + setServices()
        ↓
Renderiza balance bar + servicios
```

## Validación de Barras

```
Código detectado en scanner
        ↓
¿Patrón válido?
        ├─ S[A-Z0-9]{8,}  Serial válido
        ├─ \d{15}         IMEI válido
        └─ Otro           Ignorar
```

## Endpoints API

```
POST /api/check
├─ Body: { imei_code, service_id }
└─ Response: DeviceInfo

GET /api/sheet-stats
└─ Response: { total_consultas, sheet_existe, sheet_url, ultima_consulta }

GET /api/balance
└─ Response: { balance }

GET /api/services
└─ Response: Service[]

GET /api/last-order
└─ Response: { precio, order_id }
```
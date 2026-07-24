# Decodificación de QR Externo (Panini)

## Descripción General

La funcionalidad de importar QR externo permite decodificar códigos QR de álbumes Panini para obtener el estado de la colección (stickers pegados y repetidas).

## Importación

```typescript
import { decodeExternalQR } from '@mi-album-fifa/shared'
```

## Ejemplo de uso

```typescript
const qrText = '⋋^H4sI...==;H4sI...==;H4sI...=='

try {
  const albumState = decodeExternalQR(qrText)
  console.log(albumState)
  
  // Resultado:
  // {
  //   FWC: { owned: [2, 13, 14], repeated: [1, 0, 3] },
  //   MEX: { owned: [1, 8], repeated: [2, 0] },
  //   ...
  //   CC: { owned: [1, 8, 14], repeated: [1, 0, 3] }
  // }
} catch (error) {
  console.error('Error al decodificar QR:', error.message)
}
```

## Estructura de retorno

```typescript
type AlbumState = Record<string, StickerState>

type StickerState = {
  owned: number[]      // Números de stickers pegados (1-20 o 1-14 para CC)
  repeated: number[]   // Cantidad de repetidas para cada sticker pegado
}
```

**Nota:** Solo se incluyen las cards que tienen al menos un sticker pegado. Las cards vacías se omiten del resultado.

## Interpretación

Para cada card (FWC, MEX, RSA, etc.):

- `owned[i]` = número del sticker pegado (1-based)
- `repeated[i]` = cantidad de repetidas del sticker `owned[i]`

**Ejemplo:**
```typescript
const mex = albumState.MEX
// { owned: [1, 8, 15], repeated: [2, 0, 1] }

// Significa:
// - MEX 1: pegada + 2 repetidas (total 3 en la colección)
// - MEX 8: pegada + 0 repetidas (total 1 en la colección)
// - MEX 15: pegada + 1 repetida (total 2 en la colección)
```

## Integración en la UI

### Web
No implementado actualmente. Solo disponible en mobile.

### Mobile (Expo)

En la app mobile, la opción "Importar QR Externo" está disponible en el menú de usuario:

1. Toca el avatar/menú de usuario en la esquina superior derecha
2. Selecciona "Importar QR Externo"
3. Pega el texto del QR o carga un archivo `.txt`
4. Toca "Decodificar QR"
5. El resultado se mostrará en el modal y se registrará en la consola

**Componente:** `ImportQRModal.tsx`

```typescript
// Uso en componentes
import ImportQRModal from '@/src/components/ImportQRModal'

<ImportQRModal 
  visible={showImportQR} 
  onClose={() => setShowImportQR(false)} 
/>
```

## Formato del QR Externo

El QR contiene tres bloques separados por `;`, todos comprimidos con gzip y codificados en Base64:

### Estructura

```
⋋^<base64_gzip_part0>;<base64_gzip_part1>;<base64_gzip_part2>
```

### Partes

1. **Part0** (125 bytes descomprimidos): Bitmap de 1000 bits
   - Indica qué stickers están pegados
   - Bit = 0: sticker pegado
   - Bit = 1: sticker no pegado
   - Orden: LSB (bit0 es el menos significativo)

2. **Part1** (125 bytes descomprimidos): Bitmap de 1000 bits
   - Indica qué stickers tienen repetidas (cantidad > 0)
   - Bit = 1: sticker tiene repetidas
   - Bit = 0: sticker no tiene repetidas
   - Orden: LSB (bit0 es el menos significativo)

3. **Part2** (variable): Array compacto de contadores
   - Contiene un byte por cada sticker con repetidas
   - Orden: secuencial según bitIndex de Part1 (bits encendidos)
   - Valor almacenado = repetidas + 1
   - Ejemplo: byte=2 significa 1 repetida, byte=4 significa 3 repetidas

## Notas técnicas

- Total de stickers: 994 (49 cards × 20 + 1 card CC × 14)
- Bits usados: 994 (6 bits de padding)
- Compresión: gzip
- Codificación: Base64
- Decompresión: Usa librería `fflate`
- Orden de cards: FWC, MEX, RSA, KOR, ..., PAN, CC (50 cards totales)

## Archivos y Componentes

### Backend (Shared Package)

- **Función:** `decodeExternalQR(qrText: string): AlbumState`
- **Archivo:** `packages/shared/src/lib/externalQR.ts`
- **Tipos:** `packages/shared/src/types/externalQR.ts`
  - `AlbumState`: Resultado decodificado
  - `StickerState`: Estado de stickers por card

### Frontend Mobile

- **Componente:** `ImportQRModal.tsx`
- **Ubicación:** `apps/mobile/src/components/ImportQRModal.tsx`
- **Características:**
  - Modal para pegar o cargar QR
  - Decodificación en tiempo real
  - Muestra resultado en modal y consola
  - Manejo de errores con mensajes claros

### Integración en la App Mobile

El flujo completo es:

1. **Estado en `(tabs)/index.tsx`:**
   ```typescript
   const [showImportQR, setShowImportQR] = useState(false)
   const handleShowImportQR = useCallback(() => setShowImportQR(true), [])
   ```

2. **Callback en `AuthBar.tsx`:**
   ```typescript
   <UserMenu
     ...
     onImportQR={onImportQR || (() => {})}
     ...
   />
   ```

3. **Botón en `UserMenu.tsx`:**
   ```typescript
   <Pressable onPress={() => { onImportQR(); setShowMenu(false) }}>
     <QRIcon color={theme.textMuted} />
     <Text>Importar QR Externo</Text>
   </Pressable>
   ```

4. **Modal en `(tabs)/index.tsx`:**
   ```typescript
   <ImportQRModal visible={showImportQR} onClose={() => setShowImportQR(false)} />
   ```

## Manejo de Errores

La función `decodeExternalQR` lanza excepciones en los siguientes casos:

- Formato de QR inválido (menos de 2 partes)
- Error al descomprimir gzip
- Error al decodificar Base64
- Datos corruptos o incompletos

Todos los errores se capturan en el componente `ImportQRModal` y se muestran al usuario.

## Próximas Mejoras

- [ ] Guardar datos decodificados en Supabase
- [ ] Opción para sobreescribir colección actual
- [ ] Validación de integridad del QR
- [ ] Soporte para escanear QR con cámara
- [ ] Historial de QR importados

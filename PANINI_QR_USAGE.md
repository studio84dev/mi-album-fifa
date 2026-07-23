# Uso de decodePaniniQR

## Importación

```typescript
import { decodePaniniQR } from '@mi-album-fifa/shared'
```

## Ejemplo de uso

```typescript
const qrText = '⋋^H4sI...==;H4sI...==;H4sI...=='

const albumState = decodePaniniQR(qrText)

// Resultado:
// {
//   FWC: { owned: [2, 13, 14], repeated: [1, 0, 3] },
//   MEX: { owned: [], repeated: [] },
//   ...
//   CC: { owned: [1, 8, 14], repeated: [1, 0, 3] }
// }
```

## Estructura de retorno

```typescript
type AlbumState = Record<string, StickerState>

type StickerState = {
  owned: number[]      // Números de stickers pegados (1-20 o 1-14 para CC)
  repeated: number[]   // Cantidad de repetidas para cada sticker pegado
}
```

## Interpretación

Para cada card (FWC, MEX, RSA, etc.):

- `owned[i]` = número del sticker pegado
- `repeated[i]` = cantidad de repetidas del sticker `owned[i]`

**Ejemplo:**
```typescript
const mex = albumState.MEX
// { owned: [1, 8, 15], repeated: [2, 0, 1] }

// Significa:
// - MEX 1: pegada + 2 repetidas (total 3)
// - MEX 8: pegada + 0 repetidas (total 1)
// - MEX 15: pegada + 1 repetida (total 2)
```

## Formato del QR Panini

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

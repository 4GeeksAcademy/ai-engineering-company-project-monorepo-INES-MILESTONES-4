---
name: validate-context-alignment
description: Verifica que un archivo del sitio de Nexova (landing page, formulario de talento) contenga literalmente el contenido exigido por CONTEXT.md — copy, campos, mensajes de error, mensaje de éxito, restricción de audiencia y el bloque Schema.org — parseando CONTEXT.md en vivo, sin duplicar su contenido a mano.
---

# validate-context-alignment

## Tarea recurrente que resuelve

Cada vez que se edite la landing page o el formulario de registro de talento de Nexova (Hito 1), hay que confirmar que el resultado sigue diciendo exactamente lo que pide `CONTEXT.md` — mismos 11 campos, mismos 11 mensajes de error literales, mismo mensaje de éxito, misma frase de restricción para empresas, y el mismo bloque JSON-LD `Organization`. Revisar esto a mano, línea por línea, cada vez que se toca `uis/website/`, es exactamente el tipo de verificación repetitiva que hay que automatizar — y es la comprobación directa de que la infraestructura de este repo (memory bank, reglas, skills) está atada a los datos reales de Nexova y no a una plantilla genérica.

## Objetivo único

**Detectar contenido faltante o incorrecto respecto al briefing real de Nexova** en uno o más archivos ya construidos (HTML/JS/TSX), comparando contra requisitos **extraídos en vivo de `CONTEXT.md`** — nunca contra una copia estática mantenida a mano, para que el chequeo nunca quede desactualizado si `CONTEXT.md` cambia.

Esta skill no genera contenido ni corrige nada — solo señala qué falta o no coincide.

## Inputs documentados

| Input | Obligatorio | Descripción |
| --- | --- | --- |
| `<target_file>` (uno o más, posicionales) | Sí (salvo con `--dump-requirements`) | Archivo(s) ya construidos a verificar — p. ej. `uis/website/index.html`, `uis/website/talento.html`. |
| `--context <ruta>` | No — por defecto `CONTEXT.md` en la raíz del repo | Ruta al briefing a parsear. Solo se cambiaría si se prueba contra un `CONTEXT.md` alternativo. |
| `--dump-requirements` | No | Imprime en JSON todo lo extraído de `CONTEXT.md` (útil para auditar que el parser sigue leyendo bien el briefing tras un cambio) y termina sin verificar ningún archivo. |

No requiere dependencias de terceros — solo la librería estándar de Python 3.9+.

## Qué extrae de `CONTEXT.md` (en vivo, por sección)

- **Schema.org**: el bloque JSON-LD `Organization` completo (bajo "## Schema.org markup requerido"), comparado como datos (no como texto) contra cualquier `<script type="application/ld+json">` del archivo objetivo.
- **Campos del formulario**: los 11 nombres de campo de la tabla ("## Campos del formulario de registro de talento").
- **Mensajes de error**: los 11 mensajes literales ("## Mensajes de error esperados"); el mensaje de comentarios (con el contador dinámico `(quedan X)`) se trata como caso especial — solo exige el prefijo fijo más la palabra "quedan" en el archivo.
- **Mensaje de éxito**: las 3 líneas del blockquote ("## Mensaje de éxito").
- **Mensaje de restricción**: la frase para empresas que buscan contratar servicios ("## Restricción específica").
- **Contacto, footer, header, hero, servicios (3×2) y "Por qué Nexova" (4 bullets)**: todo el copy de landing ("## Contenido de la landing page").

## Cómo ejecutarla

```bash
# Auditar que el parser sigue leyendo bien CONTEXT.md
python3 skills/validate-context-alignment/scripts/check_content_against_context.py --dump-requirements

# Verificar un archivo construido
python3 skills/validate-context-alignment/scripts/check_content_against_context.py uis/website/index.html

# Verificar varios a la vez (landing + formulario)
python3 skills/validate-context-alignment/scripts/check_content_against_context.py \
  uis/website/index.html uis/website/talento.html
```

## Criterios de aceptación (explícitos y verificables)

1. **Sin dependencias externas**: corre con `python3` estándar.
2. **Extracción real, no copia estática**: `--dump-requirements` debe reflejar el contenido *actual* de `CONTEXT.md` — verificado ejecutándolo contra el `CONTEXT.md` real del repo y confirmando que los 11 campos, los 11 mensajes de error, el JSON-LD completo, el hero, los 3 servicios y los 4 bullets de "Por qué Nexova" salen exactamente como están escritos en el briefing.
3. **Detección positiva verificada**: contra [`examples/sample_pass.html`](./examples/sample_pass.html) — un fixture construido para contener todo lo requerido — el script imprime `OK` y termina con código `0`.
4. **Detección negativa verificada**: contra [`examples/sample_fail.html`](./examples/sample_fail.html) — el mismo fixture con tres defectos deliberados (mensaje de error del checkbox borrado, teléfono del Schema.org alterado, frase de restricción borrada) — el script imprime `FAIL` con exactamente esos tres problemas listados por su nombre y termina con código `1`.
5. **Comparación de Schema.org por datos, no por texto**: reformatear el JSON-LD del archivo objetivo (indentación distinta, orden de claves distinto) no debe producir un falso `FAIL` — solo un valor realmente distinto o ausente lo hace. Verificado: `sample_pass.html` usa un JSON-LD con indentación de una sola línea por objeto de dirección y pasa igual.
6. **Manejo de archivos inexistentes**: pasar una ruta que no existe se reporta como `FAIL` con el motivo explícito (`file does not exist`) en vez de lanzar una excepción sin manejar.
7. **Múltiples archivos en una sola corrida**: pasar varios `target_file` evalúa cada uno por separado y el código de salida final es `1` si cualquiera falla.

## Limitaciones conocidas

- Compara **subcadenas literales**, no HTML renderizado — texto partido entre nodos no adyacentes (p. ej. una etiqueta separada de su mensaje de error por mucho marcado intermedio) puede seguir dando `OK` si la subcadena exacta aparece en cualquier parte del archivo; no valida asociación semántica campo↔mensaje.
- No traduce ni valida el idioma — si se implementa una versión en inglés del sitio, esta skill solo cubre la versión que coincide literalmente con el copy en español de `CONTEXT.md`.
- Si `CONTEXT.md` cambia su formato de encabezados o de tabla, el parser puede dejar de encontrar una sección — por eso el criterio de aceptación 2 (`--dump-requirements`) debe volver a correrse después de cualquier cambio a `CONTEXT.md` para confirmar que la extracción sigue completa.

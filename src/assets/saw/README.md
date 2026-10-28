# Imágenes del personaje (opcionales)

La aplicación **no necesita imágenes**: incluye una ilustración vectorial
(SVG animado) del muñeco, trazada a partir de la imagen de referencia y
dibujada en `src/components/SawCharacter.tsx`.

El SVG está separado en capas (melena, cabeza, mejillas, ojos, cejas, nariz,
mandíbula articulada, moño), por eso puede cambiar de expresión y girar la
mirada sin deformar el resto del personaje.

## Cómo reemplazarla por imágenes propias

Copie los archivos en **esta misma carpeta** con estos nombres exactos:

```
src/assets/saw/normal.png
src/assets/saw/smile.png
src/assets/saw/laugh.png
src/assets/saw/angry.png
src/assets/saw/surprised.png
src/assets/saw/threatening.png
```

- Formatos admitidos: `.png`, `.webp`, `.jpg`, `.jpeg`, `.svg`.
- En cuanto exista **al menos una** imagen, el componente deja de dibujar el
  SVG y usa las imágenes, con fundido suave entre expresiones.
- Si falta la imagen de alguna expresión, se usa `normal`.
- No hay que modificar ningún archivo de código: Vite detecta los archivos
  automáticamente (`import.meta.glob`).

## Recomendaciones

- Fondo transparente (PNG o WebP).
- Formato vertical, aprox. 600 × 800 px.
- El personaje centrado, mirando al frente (el giro de cabeza lo aplica la
  aplicación por software).

> Use ilustraciones propias o con licencia libre. Evite material protegido por
> derechos de autor.

# Sonidos (opcionales)

Los sonidos son **opcionales**: si la carpeta está vacía la aplicación
funciona igual y simplemente no se reproduce audio.

## Cómo agregarlos

Copie los archivos en **esta misma carpeta** con estos nombres exactos:

| Archivo        | Cuándo suena                                  |
| -------------- | --------------------------------------------- |
| `start.mp3`    | Al presionar **INICIAR EVALUACIÓN**           |
| `tick.mp3`     | En cada uno de los últimos 10 segundos        |
| `next.mp3`     | Al cambiar de pregunta                        |
| `gameover.mp3` | Cuando el contador llega a `00:00`            |
| `laugh.mp3`    | Cuando el personaje se ríe                    |
| `finish.mp3`   | Al terminar la evaluación                     |

- Formatos admitidos: `.mp3`, `.wav`, `.ogg`, `.m4a`.
- No hay que modificar ningún archivo de código: Vite detecta los archivos
  automáticamente (`import.meta.glob` en `src/audio/sounds.ts`).
- El volumen de cada sonido se ajusta en la constante `VOLUMES` de
  `src/audio/sounds.ts`.
- Durante la evaluación, la tecla `M` (o el botón 🔊) silencia el audio.

> Nota: los navegadores bloquean el audio hasta que el usuario interactúa con
> la página. Como el primer sonido se dispara al presionar el botón de inicio,
> el resto se reproduce sin problemas.

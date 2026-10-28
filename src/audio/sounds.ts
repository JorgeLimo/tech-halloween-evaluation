/**
 * Gestor de sonido.
 *
 * Los archivos son OPCIONALES: si no existen, la aplicación funciona igual
 * y las llamadas a `playSound` simplemente no hacen nada.
 *
 * Para agregar un sonido, copie el archivo en `src/assets/sounds/` con el
 * nombre indicado (admite .mp3, .wav o .ogg):
 *
 *   start.mp3      -> al presionar INICIAR EVALUACIÓN
 *   tick.mp3       -> en los últimos segundos
 *   next.mp3       -> al cambiar de pregunta
 *   gameover.mp3   -> cuando el contador llega a 00:00
 *   laugh.mp3      -> risa del personaje
 *   finish.mp3     -> al terminar la evaluación
 *
 * No hace falta tocar ningún otro archivo: Vite los detecta automáticamente.
 */

export type SoundName = 'start' | 'tick' | 'next' | 'gameover' | 'laugh' | 'finish';

/** Volumen por sonido (0 a 1). */
const VOLUMES: Record<SoundName, number> = {
  start: 0.8,
  tick: 0.5,
  next: 0.6,
  gameover: 0.9,
  laugh: 0.7,
  finish: 0.8,
};

// Vite resuelve en build-time todos los archivos presentes en la carpeta.
const files = import.meta.glob('../assets/sounds/*.{mp3,wav,ogg,m4a}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const registry = new Map<SoundName, string>();

for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop()?.replace(/\.[^.]+$/, '') as SoundName | undefined;
  if (name) registry.set(name, url);
}

const cache = new Map<SoundName, HTMLAudioElement>();

let muted = false;

export function isSoundAvailable(name: SoundName): boolean {
  return registry.has(name);
}

export function setMuted(value: boolean): void {
  muted = value;
  if (muted) {
    cache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Reproduce un sonido si el archivo existe. Nunca lanza excepciones. */
export function playSound(name: SoundName, options?: { loop?: boolean }): void {
  if (muted) return;

  const url = registry.get(name);
  if (!url) return;

  try {
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      cache.set(name, audio);
    }
    audio.loop = options?.loop ?? false;
    audio.volume = VOLUMES[name];
    audio.currentTime = 0;
    // Los navegadores rechazan la promesa si el usuario aún no interactuó.
    void audio.play().catch(() => undefined);
  } catch {
    // Silencio intencional: el sonido es un extra, nunca debe romper la app.
  }
}

export function stopSound(name: SoundName): void {
  const audio = cache.get(name);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function stopAllSounds(): void {
  cache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

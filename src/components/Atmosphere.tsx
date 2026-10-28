import { useMemo } from 'react';
import '../styles/atmosphere.css';

interface AtmosphereProps {
  /** `alert` intensifica la luz roja (Game Over / últimos segundos). */
  intensity?: 'calm' | 'normal' | 'alert';
  /** Cantidad de partículas de polvo. */
  particles?: number;
}

interface Particle {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  opacity: number;
}

/**
 * Capas ambientales: viñeta, humo, luces rojas, polvo flotante y grano de
 * película. Es puramente decorativa, por eso queda fuera del árbol accesible.
 */
export function Atmosphere({ intensity = 'normal', particles = 26 }: AtmosphereProps) {
  const dust = useMemo<Particle[]>(
    () =>
      Array.from({ length: particles }, () => ({
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        delay: Math.random() * -24,
        duration: 16 + Math.random() * 20,
        drift: -40 + Math.random() * 80,
        opacity: 0.12 + Math.random() * 0.4,
      })),
    [particles],
  );

  return (
    <div className={`atmosphere atmosphere--${intensity}`} aria-hidden="true">
      <div className="atmosphere__glow atmosphere__glow--one" />
      <div className="atmosphere__glow atmosphere__glow--two" />
      <div className="atmosphere__smoke atmosphere__smoke--back" />
      <div className="atmosphere__smoke atmosphere__smoke--front" />

      <div className="atmosphere__dust">
        {dust.map((particle, index) => (
          <span
            key={index}
            className="atmosphere__mote"
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              ['--drift' as string]: `${particle.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="atmosphere__grain" />
      <div className="atmosphere__vignette" />
      <div className="atmosphere__scanlines" />
    </div>
  );
}

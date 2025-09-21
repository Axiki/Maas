import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThemeStore } from '../../stores/themeStore';
import { PaperSurface } from '../../types';

interface PaperShaderProps {
  surface?: PaperSurface;
  intensity?: number;
  animationSpeed?: number;
  enabled?: boolean;
  className?: string;
}

const fragmentShader = `
precision mediump float;
uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

// Simple noise function
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Blue noise pattern
float blueNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fiber streaks
float fibers(vec2 st) {
    float angle = 0.3;
    vec2 rotated = vec2(
        cos(angle) * st.x - sin(angle) * st.y,
        sin(angle) * st.x + cos(angle) * st.y
    );
    
    return smoothstep(0.98, 1.0, sin(rotated.x * 50.0)) * 0.1;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    
    // Animated grain
    float grain = blueNoise(st * 200.0 + uTime * 0.1) * 0.03;
    
    // Fiber texture
    float fiber = fibers(st * 20.0) * 0.5;
    
    // Soft vignette
    vec2 center = st - 0.5;
    float vignette = 1.0 - dot(center, center) * 0.3;
    
    // Combine effects
    float paper = (grain + fiber) * uIntensity * vignette;
    
    // Subtle warm tone with transparency
    vec3 color = vec3(0.95, 0.94, 0.92) + paper;
    float alpha = 0.15 * uIntensity;
    
    gl_FragColor = vec4(color, alpha);
}
`;

const vertexShader = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const STATIC_TEXTURE =
  "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'4\\' height=\\'4\\' viewBox=\\'0 0 4 4\\'%3E%3Cpath fill=\\'#000\\' fill-opacity=\\'0.03\\' d=\\'M1 3h1v1H1V3zm2-2h1v1H3V1z\\'%3E%3C/path%3E%3C/svg%3E')";

export const PaperShader: React.FC<PaperShaderProps> = ({
  surface = 'background',
  intensity,
  animationSpeed,
  enabled,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  const paperShader = useThemeStore((state) => state.paperShader);
  const surfaceSettings = paperShader.surfaces[surface];

  const effectiveEnabled = Boolean(
    enabled ?? (paperShader.enabled && surfaceSettings?.enabled)
  );
  const effectiveIntensity = intensity ?? surfaceSettings?.intensity ?? 0;
  const effectiveSpeed = animationSpeed ?? surfaceSettings?.animationSpeed ?? 0;

  const shouldAnimate =
    effectiveEnabled && !shouldReduceMotion && effectiveSpeed > 0;

  const containerClassName =
    surface === 'background'
      ? `fixed inset-0 pointer-events-none w-full h-full ${className}`.trim()
      : className;
  const baseStyle: React.CSSProperties =
    surface === 'background' ? { zIndex: -1 } : {};

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    setShouldReduceMotion(mediaQuery.matches);

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if ('removeEventListener' in mediaQuery) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    try {
      setIsVisible(true);
      setIsSupported(true);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: effectiveIntensity },
          uResolution: {
            value: new THREE.Vector2(window.innerWidth, window.innerHeight),
          },
        },
        transparent: true,
        blending: THREE.MultiplyBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      materialRef.current = material;

      let frameCount = 0;
      let lastTime = performance.now();
      let averageFrameTime = 0;

      const animateFrame = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        frameCount += 1;
        averageFrameTime =
          (averageFrameTime * (frameCount - 1) + deltaTime) / frameCount;

        if (frameCount > 60 && averageFrameTime > 2) {
          setIsVisible(false);
          console.warn('Paper shader disabled due to performance');
          return;
        }

        if (material.uniforms) {
          material.uniforms.uTime.value = currentTime * 0.001 * effectiveSpeed;
          material.uniforms.uIntensity.value = effectiveIntensity;
        }

        renderer.render(scene, camera);
        lastTime = currentTime;

        animationIdRef.current = requestAnimationFrame(animateFrame);
      };

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height, false);
        if (material.uniforms) {
          material.uniforms.uResolution.value.set(width, height);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      animateFrame();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        renderer.dispose();
        material.dispose();
        geometry.dispose();
        rendererRef.current = null;
        sceneRef.current = null;
        materialRef.current = null;
      };
    } catch (error) {
      console.warn('Paper shader not supported:', error);
      setIsSupported(false);
    }
  }, [shouldAnimate, effectiveIntensity, effectiveSpeed]);

  if (!effectiveEnabled) {
    return null;
  }

  const shouldRenderCanvas = shouldAnimate && isSupported && isVisible;

  if (!shouldRenderCanvas) {
    const fallbackOpacity = Math.min(0.85, Math.max(0.12, effectiveIntensity * 0.55));

    return (
      <div
        className={containerClassName}
        style={{
          ...baseStyle,
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, ${(0.16 * effectiveIntensity).toFixed(
            3
          )}), rgba(255, 255, 255, 0)), ${STATIC_TEXTURE}`,
          backgroundSize: 'cover, 4px 4px',
          opacity: fallbackOpacity,
          mixBlendMode: 'multiply',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={containerClassName}
      style={baseStyle}
      aria-hidden="true"
    />
  );
};

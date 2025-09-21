import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useThemeStore } from '../../stores/themeStore';

interface PaperShaderProps {
  intensity?: number;
  animationSpeed?: number;
  enabled?: boolean;
  surfaces?: Array<'background' | 'cards'>;
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

const staticNoiseTexture =
  "url('data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'4\\' height=\\'4\\' viewBox=\\'0 0 4 4\\'%3E%3Cpath fill=\\'#000\\' fill-opacity=\\'0.02\\' d=\\'M1 3h1v1H1V3zm2-2h1v1H3V1z\\'%3E%3C/path%3E%3C/svg%3E')";

export const PaperShader: React.FC<PaperShaderProps> = ({
  intensity,
  animationSpeed,
  enabled,
  surfaces,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [hasPerformanceFallback, setHasPerformanceFallback] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const paperShader = useThemeStore((state) => state.paperShader);

  const surfacesOverride = useMemo(() => (surfaces ? new Set(surfaces) : null), [surfaces]);

  const backgroundConfig = paperShader.surfaces.background;
  const resolvedBackgroundEnabled =
    surfacesOverride !== null ? surfacesOverride.has('background') : backgroundConfig.enabled;
  const resolvedBackgroundIntensity = intensity ?? backgroundConfig.intensity;
  const resolvedBackgroundSpeed = animationSpeed ?? backgroundConfig.animationSpeed;
  const overallEnabled = enabled ?? paperShader.enabled;
  const backgroundActive =
    overallEnabled && resolvedBackgroundEnabled && resolvedBackgroundIntensity > 0;

  const reducedMotionMode = paperShader.reducedMotion.mode;
  const reducedMotionMultiplier = paperShader.reducedMotion.intensityMultiplier;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => {
      mediaQuery.removeEventListener('change', updatePreference);
    };
  }, []);

  const disableForReducedMotion = prefersReducedMotion && reducedMotionMode === 'disabled';
  const staticForReducedMotion = prefersReducedMotion && reducedMotionMode === 'static';
  const shouldAttemptCanvas = backgroundActive && !disableForReducedMotion && !staticForReducedMotion;

  useEffect(() => {
    if (!shouldAttemptCanvas || !canvasRef.current || !isSupported) {
      return;
    }

    setHasPerformanceFallback(false);

    const canvas = canvasRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let disposed = false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 1;

      geometry = new THREE.PlaneGeometry(2, 2);
      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: resolvedBackgroundIntensity },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        },
        transparent: true,
        blending: THREE.MultiplyBlending,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    } catch (error) {
      console.warn('Paper shader not supported:', error);
      setIsSupported(false);
      return;
    }

    if (!renderer || !scene || !material || !geometry || !camera) {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
    };

    const stopRenderer = () => {
      if (disposed) {
        return;
      }
      disposed = true;
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };

    let frameCount = 0;
    let lastTime = performance.now();
    let averageFrameTime = 0;

    const animate = () => {
      if (disposed) {
        return;
      }

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      frameCount += 1;
      averageFrameTime = (averageFrameTime * (frameCount - 1) + deltaTime) / frameCount;

      if (frameCount > 90 && averageFrameTime > 2.4) {
        setHasPerformanceFallback(true);
        stopRenderer();
        return;
      }

      material.uniforms.uTime.value = currentTime * 0.001 * resolvedBackgroundSpeed;
      material.uniforms.uIntensity.value = resolvedBackgroundIntensity;

      renderer.render(scene, camera);
      lastTime = currentTime;
      animationIdRef.current = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      stopRenderer();
    };
  }, [shouldAttemptCanvas, resolvedBackgroundIntensity, resolvedBackgroundSpeed, isSupported]);

  const shouldRenderStaticFallback =
    backgroundActive && (staticForReducedMotion || !isSupported || hasPerformanceFallback);

  const fallbackMultiplier = staticForReducedMotion ? reducedMotionMultiplier : 0.35;
  const fallbackIntensity = Math.min(
    1,
    Math.max(0, resolvedBackgroundIntensity * fallbackMultiplier)
  );
  const fallbackOpacity = Math.min(0.45, fallbackIntensity * 0.4);
  const fallbackTint = Math.min(0.2, fallbackIntensity * 0.3);

  if (!backgroundActive) {
    return null;
  }

  if (shouldRenderStaticFallback && fallbackOpacity > 0) {
    return (
      <div
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{
          zIndex: -1,
          backgroundImage:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0)), " +
            staticNoiseTexture,
          backgroundSize: 'cover, 4px 4px',
          opacity: fallbackOpacity,
          backgroundColor: `rgba(248, 244, 240, ${fallbackTint.toFixed(3)})`,
        }}
      />
    );
  }

  if (!shouldAttemptCanvas || !isSupported || hasPerformanceFallback) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none w-full h-full ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};

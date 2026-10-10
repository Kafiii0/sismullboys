'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function IntroLoader() {
  const [stage, setStage] = useState('reveal'); 
  const canvasRef = useRef(null);
  const shockwaveTriggerRef = useRef(null);

  useEffect(() => {
    
    const t1 = setTimeout(() => {
      setStage('entering');
      
      setTimeout(() => {
        if (shockwaveTriggerRef.current) {
          shockwaveTriggerRef.current();
        }
      }, 380);
    }, 1250);

    const t2 = setTimeout(() => {
      setStage('morph');
    }, 2100);

    const t3 = setTimeout(() => {
      setStage('done');
    }, 2850);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setStage('done');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.y = 2.75;
    scene.add(globeGroup);

    const radius = 1.35;

    const sphereGeo = new THREE.SphereGeometry(radius, 22, 18);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xff2a45,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff3b48,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide
    });
    const eqMesh = new THREE.Mesh(new THREE.RingGeometry(radius + 0.02, radius + 0.045, 64), ringMat);
    eqMesh.rotation.x = Math.PI / 2;
    globeGroup.add(eqMesh);

    const meridianMesh = new THREE.Mesh(new THREE.RingGeometry(radius + 0.05, radius + 0.075, 64), ringMat.clone());
    meridianMesh.material.opacity = 0.28;
    meridianMesh.rotation.y = Math.PI / 4;
    globeGroup.add(meridianMesh);

    const pointCount = 130;
    const pointGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointCount);
      const theta = Math.sqrt(pointCount * Math.PI) * phi;
      const r = radius + 0.015;

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      if (i % 4 === 0) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.28;
      }
    }

    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const pointMesh = new THREE.Points(pointGeo, pointMat);
    globeGroup.add(pointMesh);

    const arcs = [];
    for (let i = 0; i < 5; i++) {
      const idx1 = Math.floor(Math.random() * pointCount);
      const idx2 = (idx1 + Math.floor(pointCount / 2)) % pointCount;

      const p1 = new THREE.Vector3(positions[idx1 * 3], positions[idx1 * 3 + 1], positions[idx1 * 3 + 2]);
      const p2 = new THREE.Vector3(positions[idx2 * 3], positions[idx2 * 3 + 1], positions[idx2 * 3 + 2]);

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(radius + 0.45);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
      const curveMat = new THREE.LineBasicMaterial({
        color: 0xff3355,
        transparent: true,
        opacity: 0.65,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(arcLine);

      const spark = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      globeGroup.add(spark);
      arcs.push({ curve, spark, progress: Math.random() });
    }

    const shockwaves = [];
    shockwaveTriggerRef.current = () => {
      for (let s = 0; s < 3; s++) {
        setTimeout(() => {
          const swGeo = new THREE.RingGeometry(0.12, 0.22, 48);
          const swMat = new THREE.MeshBasicMaterial({
            color: 0xff3b5c,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
          });
          const swMesh = new THREE.Mesh(swGeo, swMat);
          swMesh.position.set(0, 0, 0);
          scene.add(swMesh);
          shockwaves.push({ mesh: swMesh, scale: 1, opacity: 1 });
        }, s * 130);
      }
    };

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      globeGroup.rotation.y += 0.0025;
      eqMesh.rotation.z += 0.005;

      arcs.forEach((arc) => {
        arc.progress = (arc.progress + 0.016) % 1;
        const pos = arc.curve.getPoint(arc.progress);
        arc.spark.position.copy(pos);
      });

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.scale += 0.17;
        sw.opacity -= 0.038;
        sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
        sw.mesh.material.opacity = Math.max(0, sw.opacity);

        if (sw.opacity <= 0) {
          scene.remove(sw.mesh);
          sw.mesh.geometry.dispose();
          sw.mesh.material.dispose();
          shockwaves.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (stage === 'done') return null;

  const isEntering = stage === 'entering' || stage === 'morph';
  const isMorphing = stage === 'morph';

  return (
    <div
      onClick={() => setStage('done')}
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-750 ease-out select-none cursor-pointer overflow-hidden ${
        isMorphing
          ? 'bg-[#08080A]/0 backdrop-blur-none pointer-events-none'
          : 'bg-[#08080A] backdrop-blur-xl'
      }`}
    >
      
      <div
        className={`absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none transition-opacity duration-700 ${
          isMorphing ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/15 blur-[140px] rounded-full pointer-events-none animate-pulse transition-opacity duration-700 ${
          isMorphing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={
                isEntering
                  ? {
                      opacity: [1, 1, 0],
                      x: ['0%', '55%', '115%'],
                      y: 0,
                      scale: [1, 0.65, 0.02],
                      rotate: 0,
                      filter: ['brightness(1) blur(0px)', 'brightness(1.8) blur(0.5px)', 'brightness(3) blur(2px)'],
                      transition: {
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }
                  : {
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotate: 0,
                      filter: 'brightness(1) blur(0px)',
                      transition: { duration: 0.7, ease: 'easeOut' }
                    }
              }
              className="flex flex-col items-center lg:items-start text-center lg:text-left pointer-events-none"
            >
              <h1 className="font-grotesk text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[0.2em] lg:tracking-[0.25em] text-white drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)] uppercase">
                PROMETHEUS<span className="text-red-500">.</span>
              </h1>
            </motion.div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div
              ref={canvasRef}
              className={`relative w-full h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center pointer-events-none transition-all duration-750 ease-out ${
                isMorphing ? 'scale-105 opacity-0 blur-sm' : 'scale-100 opacity-100 blur-0'
              }`}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

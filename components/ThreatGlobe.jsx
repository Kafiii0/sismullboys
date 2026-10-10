'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const COORDINATES = [
  
  { lat: -6.2, lng: 106.8 },   
  { lat: -7.25, lng: 112.75 }, 
  { lat: 1.35, lng: 103.8 },   
  { lat: 3.13, lng: 101.68 },  
  { lat: 13.75, lng: 100.5 },  
  { lat: 14.59, lng: 120.98 }, 
  { lat: 35.68, lng: 139.76 }, 
  { lat: 34.69, lng: 135.5 },  
  { lat: 37.56, lng: 126.97 }, 
  { lat: 25.03, lng: 121.56 }, 
  { lat: 22.31, lng: 114.16 }, 

  { lat: 50.11, lng: 8.68 },   
  { lat: 51.51, lng: -0.12 },  
  { lat: 48.85, lng: 2.35 },   
  { lat: 52.37, lng: 4.89 },   
  { lat: 47.37, lng: 8.54 },   
  { lat: 40.41, lng: -3.7 },   
  { lat: 59.32, lng: 18.06 },  
  { lat: 52.22, lng: 21.01 },  

  { lat: 40.71, lng: -74.0 },   
  { lat: 37.77, lng: -122.42 },
  { lat: 34.05, lng: -118.24 },
  { lat: 41.87, lng: -87.62 }, 
  { lat: 32.77, lng: -96.79 },  
  { lat: 47.6, lng: -122.33 },  
  { lat: 43.65, lng: -79.38 },  
  { lat: 19.43, lng: -99.13 },  

  { lat: 25.2, lng: 55.27 },   
  { lat: 24.71, lng: 46.67 },  
  { lat: 28.61, lng: 77.21 },  
  { lat: 12.97, lng: 77.59 },  

  { lat: -23.55, lng: -46.63 },
  { lat: -34.6, lng: -58.38 }, 
  { lat: -33.86, lng: 151.21 },
  { lat: -37.81, lng: 144.96 },
  { lat: -26.2, lng: 28.04 },  
  { lat: 30.04, lng: 31.23 }   
];

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function ThreatGlobe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL not available:', e);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.25; 
    earthGroup.rotation.y = 2.75; 
    scene.add(earthGroup);

    const radius = 1.35;

    const textureLoader = new THREE.TextureLoader();
    const earthNightTex = textureLoader.load('/textures/earth_night.jpg');
    earthNightTex.colorSpace = THREE.SRGBColorSpace;

    const earthGeo = new THREE.SphereGeometry(radius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthNightTex,
      emissiveMap: earthNightTex,
      emissive: 0xff2a4a, 
      emissiveIntensity: 1.15,
      roughness: 0.5,
      metalness: 0.15,
      color: 0xfff1f2, 
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.9); 
    scene.add(ambientLight);

    const mainSunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainSunLight.position.set(5, 3, 5);
    scene.add(mainSunLight);

    const redRimLight = new THREE.DirectionalLight(0xff1744, 2.4); 
    redRimLight.position.set(-5, -2, -3);
    scene.add(redRimLight);

    const cyberAccentLight = new THREE.DirectionalLight(0xff3366, 1.8);
    cyberAccentLight.position.set(3, -4, 4);
    scene.add(cyberAccentLight);

    const arcs = [];
    const ripples = [];

    const sparkGeo = new THREE.SphereGeometry(0.022, 16, 16);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const haloGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.6 });

    const arcColors = [0xff1744, 0xff3366, 0xe11d48, 0xff4d6d, 0xf43f5e];

    function createAttack() {
      const fromIdx = Math.floor(Math.random() * COORDINATES.length);
      let toIdx = Math.floor(Math.random() * COORDINATES.length);
      if (fromIdx === toIdx) toIdx = (toIdx + 1) % COORDINATES.length;

      const p1 = latLngToVector3(COORDINATES[fromIdx].lat, COORDINATES[fromIdx].lng, radius);
      const p2 = latLngToVector3(COORDINATES[toIdx].lat, COORDINATES[toIdx].lng, radius);

      const distance = p1.distanceTo(p2);
      if (distance < 0.25) return;

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.normalize();
      const altitude = radius + Math.min(distance * 0.45, 0.7);
      mid.multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curvePoints = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      
      const chosenColor = arcColors[Math.floor(Math.random() * arcColors.length)];
      const curveMat = new THREE.LineBasicMaterial({
        color: chosenColor,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      earthGroup.add(arcLine);

      const sparkGroup = new THREE.Group();
      const sparkCore = new THREE.Mesh(sparkGeo, sparkMat);
      const sparkHalo = new THREE.Mesh(haloGeo, haloMat);
      sparkGroup.add(sparkCore);
      sparkGroup.add(sparkHalo);
      sparkGroup.position.copy(p1);
      earthGroup.add(sparkGroup);

      arcs.push({
        curve,
        arcLine,
        sparkGroup,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        targetPos: p2,
        targetNormal: p2.clone().normalize()
      });
    }

    for (let i = 0; i < 14; i++) {
      createAttack();
    }
    arcs.forEach((a) => {
      a.progress = Math.random() * 0.85;
    });

    const attackInterval = setInterval(() => {
      if (arcs.length < 18) {
        createAttack();
      }
    }, 350);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0.0025 }; 

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationVelocity.y = deltaX * 0.004;
      rotationVelocity.x = deltaY * 0.004;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      rotationVelocity.y = deltaX * 0.004;
      rotationVelocity.x = deltaY * 0.004;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      earthGroup.rotation.y += rotationVelocity.y;
      earthGroup.rotation.x += rotationVelocity.x;

      if (!isDragging) {
        
        rotationVelocity.y += (0.0022 - rotationVelocity.y) * 0.03;
        rotationVelocity.x += (0 - rotationVelocity.x) * 0.03;
      }

      earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x));

      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        a.progress += a.speed;

        if (a.progress < 1) {
          const currentPos = a.curve.getPoint(a.progress);
          a.sparkGroup.position.copy(currentPos);
          a.arcLine.material.opacity = Math.sin(a.progress * Math.PI) * 0.7;
        } else {
          
          const ringMesh = new THREE.Mesh(
            new THREE.RingGeometry(0.01, 0.03, 32),
            new THREE.MeshBasicMaterial({
              color: 0xff2244,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.9,
              blending: THREE.AdditiveBlending
            })
          );
          ringMesh.position.copy(a.targetPos);
          ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), a.targetNormal);
          earthGroup.add(ringMesh);

          ripples.push({
            mesh: ringMesh,
            scale: 1,
            opacity: 0.9
          });

          earthGroup.remove(a.arcLine);
          earthGroup.remove(a.sparkGroup);
          a.arcLine.geometry.dispose();
          a.arcLine.material.dispose();
          arcs.splice(i, 1);
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.scale += 0.08;
        r.opacity -= 0.035;

        r.mesh.scale.set(r.scale, r.scale, r.scale);
        r.mesh.material.opacity = Math.max(0, r.opacity);

        if (r.opacity <= 0) {
          earthGroup.remove(r.mesh);
          r.mesh.geometry.dispose();
          r.mesh.material.dispose();
          ripples.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(attackInterval);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />
    </div>
  );
}

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    FaceMesh?: any;
  }
}

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return resolve();
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.body.appendChild(s);
});

export interface FacePresenceGuardHandle {
  stop: () => void;
}

interface FacePresenceGuardProps {
  onPresenceChange?: (present: boolean) => void;
  showPreview?: boolean; // show a small camera preview window
}

const FacePresenceGuard = forwardRef<FacePresenceGuardHandle, FacePresenceGuardProps>(({ onPresenceChange, showPreview = true }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [present, setPresent] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const presentRef = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let faceMesh: any = null;
    let missingFrames = 0;
    let presentFrames = 0;

    const setup = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
        }

        // Create FaceMesh instance (support namespaced or direct)
        // @ts-ignore
        const FaceMeshCtor = (window.FaceMesh && (window.FaceMesh.FaceMesh || window.FaceMesh)) || null;
        if (!FaceMeshCtor) throw new Error('FaceMesh not available');
        // @ts-ignore
        faceMesh = new FaceMeshCtor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          const hasFace = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;
          if (hasFace) {
            presentFrames += 1;
            missingFrames = 0;
            if (presentFrames > 5 && !presentRef.current) {
              presentRef.current = true;
              setPresent(true);
              onPresenceChange?.(true);
            }
          } else {
            presentFrames = 0;
            missingFrames += 1;
            // ~30 frames ≈ ~0.5s at 60fps for faster recovery/trigger
            if (missingFrames > 30 && presentRef.current) {
              presentRef.current = false;
              setPresent(false);
              onPresenceChange?.(false);
            }
          }
        });

        const onFrame = async () => {
          if (videoRef.current) {
            await faceMesh.send({ image: videoRef.current });
          }
          rafRef.current = requestAnimationFrame(onFrame);
        };
        setInitialized(true);
        onFrame();
      } catch (e) {
        console.error('FacePresenceGuard init error', e);
      }
    };

    setup();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [onPresenceChange]);

  useImperativeHandle(ref, () => ({
    stop: () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      setInitialized(false);
    }
  }), []);

  return (
    <div className="relative">
      {/* Small preview window */}
      {showPreview && (
        <div className="fixed bottom-4 right-4 z-40 shadow-lg border border-gray-200 rounded-xl overflow-hidden bg-black/10 backdrop-blur">
          <video ref={videoRef} className="w-56 h-40 object-cover" playsInline muted />
        </div>
      )}
      {!initialized && (
        <div className="text-sm text-gray-500">Initializing camera…</div>
      )}
      {!present && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md text-center">
            <h3 className="text-xl font-semibold mb-2">Interview Paused</h3>
            <p className="text-gray-600 mb-4">We can’t detect your face. Please return to the frame to continue.</p>
            <p className="text-xs text-gray-400">Tip: Ensure sufficient lighting and face centered in the camera.</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default FacePresenceGuard;



import React, { useEffect, useRef, useState } from 'react';

// Lightweight interviewer avatar with on-device eye/gaze estimation.
// Loads MediaPipe FaceMesh from CDN at runtime to avoid bundling.

declare global {
  interface Window {
    FaceMesh?: any;
    drawConnectors?: any;
    drawLandmarks?: any;
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

const InterviewerAvatar: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let faceMesh: any = null;
    let rafId: number | null = null;

    const setup = async () => {
      try {
        // Load mediapipe facemesh from CDN
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');

        // Start webcam
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Init FaceMesh
        // @ts-ignore
        faceMesh = new window.FaceMesh({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw subtle webcam overlay for debug (transparent)
          ctx.save();
          ctx.globalAlpha = 0.0;
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            // Eyes landmarks indices (approximate): 33 (left eye outer), 133 (left eye inner), 362 (right eye outer), 263 (right eye inner)
            const leftOuter = landmarks[33];
            const leftInner = landmarks[133];
            const rightOuter = landmarks[362];
            const rightInner = landmarks[263];

            // Simple gaze heuristic: compare horizontal symmetry of eye corners
            const leftCenterX = (leftOuter.x + leftInner.x) / 2;
            const rightCenterX = (rightOuter.x + rightInner.x) / 2;
            const midX = (leftCenterX + rightCenterX) / 2;
            const centerOffset = Math.abs(0.5 - midX); // 0 means centered in frame
            const score = Math.max(0, 1 - centerOffset * 4); // map to 0..1
            setEyeContactScore(score);

            // Optional: draw small indicators
            ctx.fillStyle = 'rgba(59,130,246,0.15)';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 3, 40, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        const onFrame = async () => {
          if (videoRef.current) {
            await faceMesh.send({ image: videoRef.current });
          }
          rafId = requestAnimationFrame(onFrame);
        };

        setReady(true);
        onFrame();
      } catch (e) {
        console.error('InterviewerAvatar setup failed:', e);
      }
    };

    setup();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const eyeContactText = eyeContactScore > 0.7 ? 'Great eye contact' : eyeContactScore > 0.4 ? 'Maintain eye contact' : 'Try looking at the interviewer';
  const eyeContactColor = eyeContactScore > 0.7 ? 'text-green-600' : eyeContactScore > 0.4 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Avatar */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48 rounded-full shadow-modern-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            {/* Simple human-like avatar using SVG */}
            <svg viewBox="0 0 128 128" className="w-40 h-40">
              <circle cx="64" cy="44" r="24" fill="#F3E8FF" />
              <rect x="34" y="70" width="60" height="38" rx="18" fill="#DBEAFE" />
              <circle cx="54" cy="42" r="4" fill="#1F2937" />
              <circle cx="74" cy="42" r="4" fill="#1F2937" />
              <path d="M52 54 Q64 60 76 54" stroke="#6B7280" strokeWidth="2" fill="none" />
            </svg>
            <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-white shadow text-xs font-medium">
              AI Interviewer
            </div>
          </div>
        </div>

        {/* Webcam + gaze analysis (hidden video, visible canvas) */}
        <div className="relative">
          <video ref={videoRef} className="hidden" playsInline />
          <canvas ref={canvasRef} className="rounded-xl border border-gray-200 w-full h-auto" />
          <div className={`mt-2 text-sm font-medium ${eyeContactColor}`}>{eyeContactText}</div>
        </div>
      </div>
      {!ready && (
        <div className="mt-4 text-sm text-gray-500">Initializing interviewer and eye tracking…</div>
      )}
    </div>
  );
};

export default InterviewerAvatar;



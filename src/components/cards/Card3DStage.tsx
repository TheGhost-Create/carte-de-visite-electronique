import { RotateCcw, Square, SwitchCamera } from "lucide-react";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { TemplateDefinition, VirtualCardData } from "../../types/card";
import { getFullName, getInitials } from "./cardUtils";

type Card3DStageProps = {
  data: VirtualCardData;
  template: TemplateDefinition;
  onInteraction?: () => void;
};

type ViewMode = "front" | "back";
type ThreeModule = typeof import("three");

import QRCodeGenerator from "qrcode";

function loadImageSafe(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = src;
  });
}

function createCardTexture(
  THREE: ThreeModule,
  data: VirtualCardData,
  template: TemplateDefinition,
  side: ViewMode,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 756;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, template.palette.surface);
    gradient.addColorStop(0.52, template.palette.secondary);
    gradient.addColorStop(1, template.palette.primary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative metallic lines
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = template.palette.metallic;
    ctx.lineWidth = 2;
    for (let i = -220; i < canvas.width; i += 92) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 420, canvas.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Corner decorative accents
    ctx.strokeStyle = template.palette.primary;
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    if (side === "front") {
      // FRONT VIEW
      // Name
      ctx.fillStyle = template.palette.text;
      ctx.font = "800 78px Inter, Arial, sans-serif";
      const name = getFullName(data) || "Vantaj CardLink";
      ctx.fillText(name, 80, 210);

      // Job Title
      ctx.font = "600 36px Inter, Arial, sans-serif";
      ctx.fillStyle = template.palette.muted;
      ctx.fillText(data.jobTitle || "Digital Identity", 82, 270);

      // Company
      ctx.font = "500 30px Inter, Arial, sans-serif";
      ctx.fillStyle = template.palette.text;
      ctx.fillText(data.company || "Premium Identity Studio", 82, 320);

      // Tagline
      if (data.tagline) {
        ctx.font = "400 24px Inter, Arial, sans-serif";
        ctx.fillStyle = template.palette.muted;
        ctx.fillText(data.tagline.slice(0, 52), 82, 380);
      }

      // Contact Pill
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.roundRect(80, 480, 580, 76, 22);
      ctx.fill();

      ctx.fillStyle = template.palette.text;
      ctx.font = "500 26px Inter, Arial, sans-serif";
      ctx.fillText(data.email || data.phone || data.website || "connect@vantaj.card", 110, 528);

      // Bottom bar brand
      ctx.fillStyle = template.palette.muted;
      ctx.font = "600 20px Inter, Arial, sans-serif";
      ctx.fillText("VANTAJ CARDLINK • SMART NFC", 82, 670);

      // Profile photo placeholder
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(840, 110, 260, 260, 40);
      ctx.fill();

      ctx.fillStyle = template.palette.text;
      ctx.font = "800 64px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(getInitials(data), 970, 265);
      ctx.textAlign = "left";
    } else {
      // BACK VIEW
      ctx.fillStyle = template.palette.text;
      ctx.font = "800 64px Inter, Arial, sans-serif";
      ctx.fillText("Vantaj CardLink", 80, 180);

      ctx.font = "500 28px Inter, Arial, sans-serif";
      ctx.fillStyle = template.palette.muted;
      ctx.fillText("Touchez ou scannez pour enregistrer ce contact", 80, 240);

      // NFC contactless symbol
      ctx.strokeStyle = template.palette.primary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(140, 420, 28, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(140, 420, 48, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(140, 420, 68, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();

      ctx.fillStyle = template.palette.text;
      ctx.font = "600 26px Inter, Arial, sans-serif";
      ctx.fillText("NFC Instant Connect", 230, 428);

      // QR Code box
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(810, 130, 280, 280, 28);
      ctx.fill();

      ctx.fillStyle = template.palette.surface;
      ctx.font = "700 48px Inter, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("QR", 950, 290);
      ctx.textAlign = "left";

      ctx.fillStyle = template.palette.muted;
      ctx.font = "500 22px Inter, Arial, sans-serif";
      ctx.fillText("Scannez pour ouvrir le profil", 810, 450);
    }
  };

  redraw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  // Asynchronous image loading for high fidelity
  if (side === "front" && data.profileImage) {
    loadImageSafe(data.profileImage).then((img) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(840, 110, 260, 260, 40);
      ctx.clip();
      ctx.drawImage(img, 840, 110, 260, 260);
      ctx.restore();

      // Border around photo
      ctx.strokeStyle = template.palette.metallic;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(840, 110, 260, 260, 40);
      ctx.stroke();

      texture.needsUpdate = true;
    }).catch(() => {
      // keep fallback initials
    });
  }

  if (side === "back") {
    const qrUrl = data.qrCodeUrl || data.website || window.location.href;
    QRCodeGenerator.toDataURL(qrUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 250,
      color: {
        dark: template.palette.surface,
        light: "#ffffff",
      },
    }).then((url) => loadImageSafe(url)).then((qrImg) => {
      ctx.drawImage(qrImg, 825, 145, 250, 250);
      texture.needsUpdate = true;
    }).catch(() => {
      // keep fallback
    });
  }

  return texture;
}

export function Card3DStage({ data, template, onInteraction }: Card3DStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number>();
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const autoRef = useRef(true);
  const targetRef = useRef({ x: -0.12, y: 0.32 });
  const hasNotifiedInteractionRef = useRef(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [view, setView] = useState<ViewMode>("front");
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    hasNotifiedInteractionRef.current = false;
  }, [data, template]);

  useEffect(() => {
    autoRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    targetRef.current.y = view === "front" ? 0.32 : Math.PI + 0.32;
  }, [view]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!context) {
      setWebglAvailable(false);
      return undefined;
    }

    let disposeScene: (() => void) | undefined;
    let disposed = false;

    import("three").then((THREE) => {
      if (disposed) {
        return;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0.12, 6.4);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const frontTexture = createCardTexture(THREE, data, template, "front");
      const backTexture = createCardTexture(THREE, data, template, "back");
      const edgeMaterial = new THREE.MeshPhysicalMaterial({
        color: template.palette.metallic,
        metalness: 0.72,
        roughness: 0.25,
        clearcoat: 0.55,
      });
      const frontMaterial = new THREE.MeshPhysicalMaterial({
        map: frontTexture,
        metalness: 0.24,
        roughness: 0.28,
        clearcoat: 0.7,
        clearcoatRoughness: 0.2,
      });
      const backMaterial = new THREE.MeshPhysicalMaterial({
        map: backTexture,
        metalness: 0.24,
        roughness: 0.3,
        clearcoat: 0.7,
        clearcoatRoughness: 0.24,
      });

      const card = new THREE.Mesh(
        new THREE.BoxGeometry(3.37, 2.125, 0.11, 8, 8, 2),
        [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, frontMaterial, backMaterial],
      );
      group.add(card);

      const rim = new THREE.LineSegments(
        new THREE.EdgesGeometry(card.geometry),
        new THREE.LineBasicMaterial({
          color: template.palette.primary,
          transparent: true,
          opacity: 0.34,
        }),
      );
      group.add(rim);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(2.55, 72),
        new THREE.MeshBasicMaterial({
          color: template.palette.primary,
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.42;
      scene.add(floor);

      scene.add(new THREE.AmbientLight(0xffffff, 0.78));
      const keyLight = new THREE.PointLight(0xb8cfff, 2.2, 18);
      keyLight.position.set(2.4, 2.8, 4.6);
      scene.add(keyLight);
      const sideLight = new THREE.PointLight(0xffffff, 1.2, 14);
      sideLight.position.set(-3.2, -1.2, 3.2);
      scene.add(sideLight);

      const resize = () => {
        const width = mount.clientWidth || 520;
        const height = mount.clientHeight || 340;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);

      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        const pointer = pointerRef.current;
        const groupTarget = targetRef.current;

        if (autoRef.current && !pointer.active) {
          groupTarget.y += 0.004;
        }

        const hoverX = pointer.active ? pointer.y * 0.32 : 0;
        const hoverY = pointer.active ? pointer.x * 0.48 : 0;

        group.rotation.x += (groupTarget.x + hoverX - group.rotation.x) * 0.065;
        group.rotation.y += (groupTarget.y + hoverY - group.rotation.y) * 0.065;
        group.rotation.z += ((pointer.active ? -pointer.x * 0.04 : 0) - group.rotation.z) * 0.07;
        card.position.y = Math.sin(performance.now() * 0.0012) * 0.035;
        renderer.render(scene, camera);
      };

      animate();

      disposeScene = () => {
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        resizeObserver.disconnect();
        frontTexture.dispose();
        backTexture.dispose();
        card.geometry.dispose();
        rim.geometry.dispose();
        floor.geometry.dispose();
        edgeMaterial.dispose();
        frontMaterial.dispose();
        backMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, [data, template]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: (event.clientX - rect.left) / rect.width - 0.5,
      y: (event.clientY - rect.top) / rect.height - 0.5,
      active: true,
    };
    setAutoRotate(false);
    notifyInteraction();
  };

  const reset = () => {
    pointerRef.current = { x: 0, y: 0, active: false };
    targetRef.current = { x: -0.12, y: 0.32 };
    setView("front");
    notifyInteraction();
  };

  const notifyInteraction = () => {
    if (!hasNotifiedInteractionRef.current) {
      hasNotifiedInteractionRef.current = true;
      onInteraction?.();
    }
  };

  return (
    <section className="stage-3d" aria-label="Interactive 3D card preview">
      <div
        className="stage-3d__canvas"
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          pointerRef.current.active = false;
        }}
      >
        {!webglAvailable && (
          <div className="stage-3d__fallback">
            <Square aria-hidden="true" />
            <span>2D fallback active</span>
          </div>
        )}
      </div>
      <div className="stage-3d__controls" aria-label="3D preview controls">
        <button
          type="button"
          onClick={() => {
            setAutoRotate((current) => !current);
            notifyInteraction();
          }}
          aria-pressed={autoRotate}
        >
          <SwitchCamera aria-hidden="true" size={15} />
          {autoRotate ? "Auto on" : "Auto off"}
        </button>
        <button
          type="button"
          onClick={() => {
            setView("front");
            notifyInteraction();
          }}
          aria-pressed={view === "front"}
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => {
            setView("back");
            notifyInteraction();
          }}
          aria-pressed={view === "back"}
        >
          Back
        </button>
        <button type="button" onClick={reset}>
          <RotateCcw aria-hidden="true" size={15} />
          Reset
        </button>
      </div>
    </section>
  );
}

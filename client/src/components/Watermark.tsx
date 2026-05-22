import { useEffect, useRef } from "react";

interface WatermarkProps {
  text: string;        // Texto principal (ex: nome do residente)
  subtext?: string;    // Texto secundário opcional (ex: data/hora)
  opacity?: number;    // 0–1, padrão 0.12
}

/**
 * Marca d'água dinâmica gerada via Canvas.
 * Renderizada como overlay fixo sobre todo o conteúdo da página,
 * com pointer-events: none para não bloquear interações.
 *
 * Estratégia de dissuasão:
 * - Texto diagonal repetido em grade cobrindo toda a viewport
 * - Gerado via Canvas → difícil de remover via DevTools (não é texto DOM)
 * - Inclui nome do usuário + data/hora → identifica o autor de vazamentos
 */
export default function Watermark({ text, subtext, opacity = 0.12 }: WatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // Configurações do texto
      const fontSize = Math.max(13, Math.min(16, W / 30));
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillStyle = `rgba(80, 80, 80, ${opacity})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Dimensões do bloco de texto (linha principal + sublinha)
      const lineH = fontSize * 1.5;
      const blockH = subtext ? lineH * 2.2 : lineH;
      const blockW = Math.max(
        ctx.measureText(text).width,
        subtext ? ctx.measureText(subtext).width : 0
      ) + 40;

      // Espaçamento entre repetições
      const spacingX = blockW + 60;
      const spacingY = blockH + 60;

      // Rotação diagonal
      const angle = -Math.PI / 6; // -30°

      // Cobrir toda a área com margem extra para rotação
      const diagLen = Math.sqrt(W * W + H * H);
      const cols = Math.ceil(diagLen / spacingX) + 2;
      const rows = Math.ceil(diagLen / spacingY) + 2;

      ctx.translate(W / 2, H / 2);
      ctx.rotate(angle);
      ctx.translate(-diagLen / 2, -diagLen / 2);

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * spacingX + (row % 2 === 0 ? 0 : spacingX / 2);
          const y = row * spacingY;

          ctx.fillText(text, x, y);
          if (subtext) {
            ctx.font = `${Math.max(10, fontSize - 2)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillText(subtext, x, y + lineH);
            ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          }
        }
      }

      ctx.restore();
    };

    draw();

    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [text, subtext, opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        userSelect: "none",
      }}
      aria-hidden="true"
    />
  );
}

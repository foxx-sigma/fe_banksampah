export const SHADOW_LAYERS = [

  { color: "#0A6B62", x: 5.0, y: 5.0 },

];

export default function LayeredExtrudedText({ text }: { text: string }) {
  const letters = text.split("");

  return (
    <span className="relative inline-block whitespace-nowrap">
      {SHADOW_LAYERS.slice()
        .reverse()
        .map((layer, li) => (
          <span
            key={li}
            aria-hidden="true"
            className="absolute inset-0 flex"
            style={{ transform: `translate3d(${layer.x}px, ${layer.y}px, 0)` }}
          >
            {letters.map((char, ci) => (
              <span
                key={ci}  
                className="extruded-shadow-letter inline-block"
                data-layer={SHADOW_LAYERS.length - 1 - li}
                style={{ color: layer.color, opacity: 0 }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      {letters.map((char, ci) => (
        <span
          key={ci}
          className="extruded-main-letter relative inline-block text-primary"
          style={{ opacity: 0 }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

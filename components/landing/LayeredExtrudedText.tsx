export default function LayeredExtrudedText({ text }: { text: string }) {
  const letters = text.split("");

  return (
    <span className="relative inline-block whitespace-nowrap">
      {letters.map((char, ci) => (
        <span
          key={ci}
          className="stagger-letter relative inline-block text-primary"
          style={{ opacity: 0 }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

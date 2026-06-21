type TextSectionProps = {
  eyebrow: string;
  title: string;
  text: string[];
  highlight?: boolean;
};

export function TextSection({ eyebrow, title, text, highlight = false }: TextSectionProps) {
  return (
    <section className={`section textSection ${highlight ? 'visionCard' : ''}`}>
      <div className="textContent">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </section>
  );
}

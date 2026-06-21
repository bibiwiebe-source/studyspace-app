import { Reveal } from './Reveal';

const features = [
  ['⌕', 'Freie Lernräume finden', 'Schnell sehen, welche Räume gerade verfügbar sind und wo sie sich befinden.'],
  ['✓', 'Räume direkt buchen', 'Halbtags oder ganztags reservieren, ohne lange Umwege oder unklare Prozesse.'],
  ['◫', 'Ausstattung vorab einsehen', 'Monitor, Whiteboard, Steckdosen oder WLAN direkt vor der Buchung prüfen.'],
  ['◇', 'Gruppenräume entdecken', 'Passende Räume für Lerngruppen, Projektarbeit und ruhige Arbeitsphasen finden.'],
  ['↻', 'Verfügbarkeiten prüfen', 'Tagesstatus und Reservierungen übersichtlich auf einen Blick vergleichen.'],
  ['▦', 'Bessere Auslastung bestehender Lernflächen', 'Vorhandene Räume werden sichtbarer und können effizienter genutzt werden.'],
];

export function Features() {
  return (
    <section className="section" id="features">
      <Reveal>
        <div className="sectionHeader">
          <span className="eyebrow">Features</span>
          <h2>Was ist mit StudySpace möglich?</h2>
        </div>
      </Reveal>
      <div className="featureGrid">
        {features.map(([icon, title, text], index) => (
          <Reveal key={title} className="featureReveal">
            <article className="featureCard" style={{ transitionDelay: `${index * 60}ms` }}>
              <div className="featureIcon">{icon}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

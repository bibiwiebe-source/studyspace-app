import { Reveal } from './Reveal';

const screens = [
  { title: 'Login', lines: ['StudySpace', 'Matrikelnummer', 'Einloggen'] },
  { title: 'Raumübersicht', lines: ['Freie Lernräume', 'W204 frei', 'Z022 frei'] },
  { title: 'Buchungsbestätigung', lines: ['Bestätigt', 'W204', '13:00 - 18:00 Uhr'] },
];

export function AppPreview() {
  return (
    <section className="section previewSection">
      <Reveal>
        <div className="sectionHeader centered">
          <span className="eyebrow">App Preview</span>
          <h2>So könnte StudySpace aussehen</h2>
          <p>Die mobile App befindet sich derzeit in Entwicklung. Ziel ist eine intuitive und schnelle Raumbuchung für Studierende.</p>
        </div>
      </Reveal>
      <div className="phoneGrid">
        {screens.map((screen, index) => (
          <Reveal key={screen.title} className="phoneReveal">
            <div className="phoneMockup" style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="phoneNotch" />
              <div className="phoneScreen">
                <span className="screenLabel">{screen.title}</span>
                <div className="screenLogo" />
                {screen.lines.map((line) => <div className="screenLine" key={line}>{line}</div>)}
                <div className="screenButton" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

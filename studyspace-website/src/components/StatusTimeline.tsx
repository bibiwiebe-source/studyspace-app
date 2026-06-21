import { Reveal } from './Reveal';

const statusItems = ['Idee entwickelt', 'Konzept erstellt', 'Website in Entwicklung', 'Mobile App in Entwicklung', 'Pilotphase geplant'];

export function StatusTimeline() {
  return (
    <section className="section statusSection">
      <Reveal>
        <div className="sectionHeader">
          <span className="eyebrow">Roadmap</span>
          <h2>Aktueller Projektstatus</h2>
        </div>
      </Reveal>
      <div className="timeline">
        {statusItems.map((item, index) => (
          <Reveal key={item}>
            <div className={`timelineItem ${index < 4 ? 'active' : ''}`}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import { Logo } from './Logo';

export function Hero() {
  return (
    <section className="hero section">
      <nav className="nav" aria-label="Hauptnavigation">
        <Logo />
        <a href="#features" className="navLink">Projekt entdecken</a>
      </nav>
      <div className="heroGrid">
        <div className="heroCopy">
          <div className="heroLogoWrap"><Logo large /></div>
          <p className="badge">🚧 Website und App befinden sich aktuell in Entwicklung</p>
          <h1>Freie Lernräume in Sekunden finden.</h1>
          <p className="heroText">StudySpace vereinfacht die Suche und Buchung von Lern- und Gruppenräumen auf dem Campus.</p>
          <a href="#features" className="primaryButton">Projekt entdecken</a>
        </div>
        <div className="heroVisual" aria-label="StudySpace Produktvorschau">
          <div className="glassPanel mainPanel">
            <div className="panelTop"><span>Heute</span><strong>4 freie Räume</strong></div>
            <div className="roomPreview free"><span>W204</span><small>frei bis 18:00</small></div>
            <div className="roomPreview"><span>Z022</span><small>2 Plätze · Monitor</small></div>
            <div className="roomPreview muted"><span>Y1.10</span><small>ausgebucht</small></div>
          </div>
          <div className="floatingCard cardOne">Campus MG</div>
          <div className="floatingCard cardTwo">Buchung bestätigt</div>
        </div>
      </div>
    </section>
  );
}

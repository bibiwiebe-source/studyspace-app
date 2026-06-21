import { Reveal } from './Reveal';

function MiniStudyIcon() {
  return (
    <div className="phoneAppIcon" aria-hidden="true">
      <div className="phoneIconBuilding">
        <div>
          <span />
          <span />
        </div>
        <i />
      </div>
      <div className="phoneIconBook">
        <span />
        <em />
      </div>
    </div>
  );
}

export function AppPreview() {
  return (
    <section className="section previewSection">
      <Reveal>
        <div className="sectionHeader centered">
          <span className="eyebrow">App Preview</span>
          <h2>So könnte StudySpace aussehen</h2>
          <p>
            Die mobile App befindet sich derzeit in Entwicklung. Ziel ist eine intuitive und schnelle Raumbuchung für Studierende.
          </p>
        </div>
      </Reveal>

      <div className="phoneGrid">
        <Reveal className="phoneReveal">
          <div className="phoneMockup">
            <div className="phoneNotch" />
            <div className="phoneScreen appLogin">
              <MiniStudyIcon />
              <h3>StudySpace</h3>
              <p>Finde und buche freie Lernräume auf dem Campus</p>
              <div className="previewInput">Matrikelnummer oder E-Mail</div>
              <div className="previewInput">Passwort</div>
              <div className="previewPrimary">Einloggen</div>
            </div>
          </div>
        </Reveal>

        <Reveal className="phoneReveal">
          <div className="phoneMockup">
            <div className="phoneNotch" />
            <div className="phoneScreen appRooms">
              <span className="screenLabel">Heute · HSNR Campus MG</span>
              <h3>Freie Lernräume</h3>
              <p>4 Räume sind aktuell direkt frei</p>
              <div className="previewRoomCard free">
                <div>
                  <strong>W204</strong>
                  <small>Gebäude W · 6 Plätze</small>
                </div>
                <span>Frei</span>
              </div>
              <div className="previewChips">
                <span>Whiteboard</span>
                <span>WLAN</span>
                <span>Monitor</span>
              </div>
              <div className="previewRoomCard free">
                <div>
                  <strong>Z022</strong>
                  <small>Gebäude Z · 8 Plätze</small>
                </div>
                <span>Frei</span>
              </div>
              <div className="previewRoomCard muted">
                <div>
                  <strong>Y1.10</strong>
                  <small>Gebäude Y1 · heute belegt</small>
                </div>
                <span>Belegt</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="phoneReveal">
          <div className="phoneMockup">
            <div className="phoneNotch" />
            <div className="phoneScreen appSuccess">
              <div className="previewCheck">✓</div>
              <h3>Deine Buchung wurde bestätigt</h3>
              <p>W204 ist von 13:00 bis 18:00 Uhr für dich reserviert.</p>
              <div className="successSummary">
                <span>Raum</span>
                <strong>W204</strong>
              </div>
              <div className="successSummary">
                <span>Zeitraum</span>
                <strong>Halbtags · Nachmittag</strong>
              </div>
              <div className="previewPrimary">Zurück zur Übersicht</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

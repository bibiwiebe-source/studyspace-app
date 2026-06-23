const downloads = [
  {
    title: 'One-Pager',
    meta: 'A4 · für PDF speichern',
    text: 'Pitch-taugliche Übersicht für Hochschulen, Professoren und Pilotpartner.',
    href: '/downloads/onepager.html',
  },
  {
    title: 'Flyer',
    meta: 'A5 · zwei Flyer auf eine A4-Seite',
    text: 'Kompakter Flyer für Studierende mit QR-Code-Platzhalter.',
    href: '/downloads/flyer.html',
  },
];

export function DownloadPanel() {
  return (
    <section
      className="section"
      aria-labelledby="downloads-title"
      style={{ paddingTop: 52, paddingBottom: 0 }}
    >
      <div style={{ maxWidth: 640, marginBottom: 22 }}>
        <span className="eyebrow">Downloads</span>
        <h2 id="downloads-title">Materialien herunterladen</h2>
        <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 16, lineHeight: 1.6 }}>
          Die Dateien sind druckoptimiert und können im Browser als PDF gespeichert werden.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {downloads.map((item) => (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            key={item.title}
            style={{
              display: 'block',
              minHeight: 168,
              padding: 22,
              border: '1px solid rgba(223, 231, 242, 0.9)',
              borderRadius: 24,
              color: 'var(--navy)',
              background: 'rgba(255, 255, 255, 0.86)',
              boxShadow: 'var(--shadow)',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                marginBottom: 18,
                padding: '7px 10px',
                borderRadius: 999,
                color: '#147a51',
                background: 'var(--green-soft)',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {item.meta}
            </span>
            <strong style={{ display: 'block', color: 'var(--navy)', fontSize: 22, fontWeight: 950 }}>
              {item.title}
            </strong>
            <p style={{ marginTop: 10, color: 'var(--muted)', fontSize: 15, lineHeight: 1.55, fontWeight: 700 }}>
              {item.text}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

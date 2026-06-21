import { Logo } from './Logo';

type FooterProps = { year: number };

export function Footer({ year }: FooterProps) {
  return (
    <footer className="footer">
      <Logo />
      <div>
        <p>Projekt in Entwicklung</p>
        <p>© {year} · Entwickelt von Studierenden</p>
      </div>
    </footer>
  );
}

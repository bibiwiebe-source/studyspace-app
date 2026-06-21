import { Logo } from './Logo';

type FooterProps = {
  year: number;
};

export function Footer({ year }: FooterProps) {
  return (
    <footer className="footer">
      <Logo />
      <div className="footerText">
        <p>Projekt in Entwicklung</p>
        <p>Entwickelt in Kooperation mit HSNR FB03</p>
        <p>© {year} · Entwickelt von Studierenden</p>
      </div>
    </footer>
  );
}

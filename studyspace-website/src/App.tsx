import { AppPreview } from './components/AppPreview';
import { DownloadPanel } from './components/DownloadPanel';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Reveal } from './components/Reveal';
import { StatusTimeline } from './components/StatusTimeline';
import { TextSection } from './components/TextSection';
import './App.css';

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <main>
      <Hero />
      <Features />
      <AppPreview />
      <StatusTimeline />
      <Reveal>
        <TextSection
          eyebrow="Über uns"
          title="Von Studierenden für Studierende."
          text={[
            'Wir sind selbst Studierende der Betriebswirtschaftslehre und standen während unseres Studiums regelmäßig vor dem gleichen Problem: Freie Lernräume waren oft schwer zu finden und vorhandene Räume wurden nicht optimal genutzt.',
            'Aus diesem Grund entstand die Idee zu StudySpace. Wir wollten eine einfache, moderne und digitale Lösung schaffen, die Studierenden dabei hilft, freie Lern- und Gruppenräume schnell zu finden und zu buchen.',
            'StudySpace wird von Studierenden für Studierende entwickelt. Unser Ziel ist es, den Studienalltag angenehmer zu gestalten und die Nutzung bestehender Lernflächen an Hochschulen zu verbessern.',
          ]}
        />
      </Reveal>
      <Reveal>
        <TextSection
          eyebrow="Unsere Vision"
          title="Weniger Suchen. Mehr Lernen."
          text={[
            'Wir glauben, dass Studierende ihre Zeit nicht mit der Suche nach freien Lernplätzen verbringen sollten. StudySpace soll Hochschulen dabei unterstützen, vorhandene Räume effizienter zu nutzen und Studierenden eine moderne Nutzererfahrung bieten.',
          ]}
          highlight
        />
      </Reveal>
      <DownloadPanel />
      <Footer year={currentYear} />
    </main>
  );
}

export default App;

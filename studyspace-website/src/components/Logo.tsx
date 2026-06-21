type LogoProps = {
  large?: boolean;
};

export function Logo({ large = false }: LogoProps) {
  return (
    <div className={`logo ${large ? 'logoLarge' : ''}`} aria-label="StudySpace Logo">
      <div className="studyIcon" aria-hidden="true">
        <div className="studyIconBuilding">
          <div className="studyIconWindows">
            <span />
            <span />
          </div>
          <div className="studyIconDoor" />
        </div>
        <div className="studyIconBook">
          <span />
          <i />
        </div>
      </div>
      <strong>StudySpace</strong>
    </div>
  );
}

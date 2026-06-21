type LogoProps = {
  large?: boolean;
};

export function Logo({ large = false }: LogoProps) {
  return (
    <div className={`logo ${large ? 'logoLarge' : ''}`} aria-label="StudySpace Logo">
      <div className="logoMark">
        <span />
        <span />
        <i />
      </div>
      <strong>StudySpace</strong>
    </div>
  );
}

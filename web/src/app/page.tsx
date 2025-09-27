import LetterGlitch from './LetterGlitch';

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
      />
    </div>
  );
}

import LetterGlitch from '../components/LetterGlitch';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen w-full relative">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
      />
      {/* Launch App Button - Centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Link 
          href="/home"
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
        >
          Launch App
        </Link>
      </div>
    </div>
  );
}

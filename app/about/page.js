import Link from 'next/link'

export const metadata = {
  title: 'About Us | ShowUp',
  description: 'Learn more about ShowUp - The platform for Indian college students.',
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/about-us.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center">
        <h1 
          className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 drop-shadow-2xl" 
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          About Us
        </h1>
        
        <p className="text-white/90 max-w-2xl text-lg md:text-xl mb-12 font-medium drop-shadow-md">
          We are building the ultimate platform for Indian college students to showcase projects, find hackathon teammates, and get discovered.
        </p>

        {/* Profiles Side by Side */}
        <div className="flex flex-row items-end justify-center gap-6 md:gap-16 mb-12">
          <div className="flex flex-col items-center">
            <div className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform">
              <img 
                src="/aryan.png" 
                alt="Aryan" 
                className="w-48 h-48 md:w-72 md:h-72 object-contain" 
                style={{ clipPath: 'inset(2% 10% 8% 10%)' }}
              />
            </div>
            <span className="mt-2 text-[#FFC629] font-bold tracking-widest uppercase text-sm drop-shadow-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Aryan
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform">
              <img 
                src="/atishay.png" 
                alt="Atishay" 
                className="w-48 h-48 md:w-72 md:h-72 object-contain" 
                style={{ clipPath: 'inset(2% 10% 8% 10%)' }}
              />
            </div>
            <span className="mt-2 text-[#FFC629] font-bold tracking-widest uppercase text-sm drop-shadow-md" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Atishay
            </span>
          </div>
        </div>

        <Link href="/">
          <button className="px-8 py-4 bg-[#FFC629] text-black font-extrabold uppercase tracking-[0.1em] text-sm shadow-[6px_6px_0px_rgba(0,0,0,0.5)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,0.6)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_rgba(0,0,0,0.4)] transition-all">
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  )
}

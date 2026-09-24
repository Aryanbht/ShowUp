import Link from 'next/link'


export const metadata = {
  title: 'About Us | ShowUp',
  description: 'Two builders. One platform.',
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-0 anim-bg"
        style={{
          backgroundImage: "url('/about-us.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Vignette Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)' }} 
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Montenegrin+Gothic+One&display=swap');
        
        @keyframes bgZoomOut {
          0% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1); opacity: 0.9; }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(60px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .anim-bg {
          animation: bgZoomOut 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-slide-up {
          opacity: 0;
          animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 5s ease-in-out infinite 2.5s;
        }
        .glass-box {
          background: rgba(10, 15, 30, 0.66);
          backdrop-filter: blur(12px);
          color: white;
          filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.25)) drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4));
        }

        .bubble-right {
          clip-path: polygon(
            0% 0%, 
            calc(100% - 30px) 0%, 
            calc(100% - 30px) calc(50% - 25px), 
            100% 50%, 
            calc(100% - 30px) calc(50% + 25px), 
            calc(100% - 30px) 100%, 
            0% 100%
          );
          padding-right: calc(2rem + 30px) !important;
        }

        .bubble-left {
          clip-path: polygon(
            30px 0%, 
            100% 0%, 
            100% 100%, 
            30px 100%, 
            30px calc(50% + 25px), 
            0% 50%, 
            30px calc(50% - 25px)
          );
          padding-left: calc(2rem + 30px) !important;
        }

        @media (max-width: 768px) {
          .bubble-right, .bubble-left {
            clip-path: polygon(
              0% 30px, 
              calc(50% - 25px) 30px, 
              50% 0%, 
              calc(50% + 25px) 30px, 
              100% 30px, 
              100% 100%, 
              0% 100%
            );
            padding-top: calc(2rem + 30px) !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
        }
      `}} />

      {/* TOP NAVIGATION BAR */}
      <div className="absolute -top-4 md:-top-10 left-0 w-full px-2 pt-0 pb-4 md:px-6 md:pb-6 grid grid-cols-3 items-center z-50">
        
        {/* LOGO */}
        <Link href="/" className="anim-slide-up flex justify-start -ml-4 md:-ml-16" style={{ animationDelay: '0.1s' }}>
          <img 
            src="/logo.png" 
            alt="ShowUp Logo" 
            className="h-12 sm:h-16 md:h-48 lg:h-64 w-auto object-contain hover:scale-105 transition-transform cursor-pointer" 
          />
        </Link>

        {/* TITLE */}
        <div className="flex justify-center">
          <h1
            className="text-[#eab308] text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-normal anim-slide-up whitespace-nowrap"
            style={{ 
              fontFamily: "'Montenegrin Gothic One', sans-serif",
              animationDelay: '0.15s',
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 1px 0 #000, 1px 0px 0 #000, 0px -1px 0 #000, -1px 0px 0 #000, 5px 5px 0px rgba(0,0,0,1)'
            }}
          >
            ABOUT US
          </h1>
        </div>

        {/* BUTTON */}
        <div className="anim-slide-up flex justify-end pr-2 md:pr-6 -mt-3 md:-mt-8" style={{ animationDelay: '0.2s' }}>
          <Link href="/">
            <button 
              className="bg-[#eab308] text-black font-extrabold px-3 py-1.5 md:px-6 md:py-2.5 text-[10px] sm:text-xs md:text-base tracking-[0.1em] uppercase shadow-[2px_2px_0_rgba(0,0,0,0.6)] md:shadow-[4px_4px_0_rgba(0,0,0,0.6)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_rgba(0,0,0,0.7)] md:hover:shadow-[6px_6px_0_rgba(0,0,0,0.7)] active:translate-x-[2px] active:translate-y-[2px] transition-all whitespace-nowrap" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              GET STARTED
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col items-center pt-24 md:pt-48">

        {/* CHARACTER SECTION */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-6 w-full mt-10 md:mt-0 px-4 anim-slide-up" style={{ animationDelay: '0.3s' }}>

          {/* ARYAN WRAPPER */}
          <div className="relative group flex flex-col items-center animate-float z-10 hover:z-20 cursor-pointer">

            {/* ARYAN AVATAR */}
            <img
              src="/aryan.png"
              alt="Aryan"
              className="w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] xl:w-[550px] xl:h-[550px] object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ clipPath: 'inset(2% 10% 8% 10%)', imageRendering: 'pixelated' }}
            />
            <span className="text-black font-bold mt-2 tracking-widest text-base drop-shadow-md text-center leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ARYAN <br /> BHATNAGAR
            </span>

            {/* ARYAN BUBBLE (Hidden on mobile/tablet, appears on hover on large desktop) */}
            <div className="hidden xl:block absolute right-full top-[45%] -translate-y-1/2 translate-x-[70px] opacity-0 scale-90 origin-right group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none glass-box w-[340px] p-8 shadow-xl bubble-right z-30">
              <h3 className="font-bold text-xl mb-1 text-[#eab308]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ARYAN BHATNAGAR</h3>
              <p className="text-base font-semibold opacity-80 mb-3 text-white">Co-founder</p>
              <p className="text-base font-medium leading-relaxed text-white">Lorem ipsum dolor sit amet consectetur adipiscing.</p>
              <p className="text-sm uppercase tracking-wider opacity-60 mt-4 font-bold text-white">Lorem ipsum, DELHI</p>
            </div>
          </div>

          {/* ATISHAY WRAPPER */}
          <div className="relative group flex flex-col items-center animate-float-delayed z-10 hover:z-20 md:-ml-8 lg:-ml-12 cursor-pointer">

            {/* ATISHAY AVATAR */}
            <img
              src="/atishay.png"
              alt="Atishay"
              className="w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] xl:w-[550px] xl:h-[550px] object-contain transition-transform duration-500 group-hover:scale-105"
              style={{ clipPath: 'inset(2% 10% 8% 10%)', imageRendering: 'pixelated' }}
            />
            <span className="text-black font-bold mt-2 tracking-widest text-base drop-shadow-md text-center leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ATISHAY <br /> JAIN
            </span>

            {/* ATISHAY BUBBLE (Hidden on mobile/tablet, appears on hover on large desktop) */}
            <div className="hidden xl:block absolute left-full top-[45%] -translate-y-1/2 -translate-x-[70px] opacity-0 scale-90 origin-left group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none glass-box w-[340px] p-8 shadow-xl bubble-left z-30">
              <h3 className="font-bold text-xl mb-1 text-[#eab308]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ATISHAY JAIN</h3>
              <p className="text-base font-semibold opacity-80 mb-3 text-white">Co-founder</p>
              <p className="text-base font-medium leading-relaxed text-white">Lorem ipsum dolor sit amet consectetur adipiscing.</p>
              <p className="text-sm uppercase tracking-wider opacity-60 mt-4 font-bold text-white">Lorem ipsum, PANIPAT</p>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="mb-12 mt-12 md:mt-0 pb-8 anim-slide-up" style={{ animationDelay: '0.6s' }}>
          <Link href="/">
            <button
              className="bg-[#eab308] text-black font-extrabold px-10 py-4 text-sm tracking-[0.1em] uppercase shadow-[6px_6px_0_rgba(0,0,0,0.6)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_rgba(0,0,0,0.7)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              BACK TO HOME
            </button>
          </Link>
        </div>

      </div>
    </main>
  )
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mailgenLogo from './assets/mailgen-logo.png';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll height to apply active border to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0914] text-white overflow-hidden relative">
      {/* 🧭 Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0b0914]/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={mailgenLogo} alt="MailGen" className="h-8 w-auto" />
            <span className="font-['Outfit'] font-bold text-xl bg-gradient-to-r from-white to-[#e0c3fc] bg-clip-text text-transparent">
              MailGen
            </span>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <li>
              <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('use-cases')} className="hover:text-white transition-colors cursor-pointer">
                Use Cases
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">
                Pricing
              </button>
            </li>
          </ul>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-600 px-5 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(123,44,191,0.3)] hover:shadow-[0_6px_20px_rgba(123,44,191,0.5)] hover:-translate-y-0.5 transition-all duration-300">
              Get Started Free
            </Link>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button className="md:hidden flex flex-col gap-1.5 cursor-pointer z-50" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`w-6 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <div className={`fixed top-0 left-0 w-full h-screen bg-[#0b0914]/98 backdrop-blur-xl z-40 flex justify-center items-center transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>
          <ul className="flex flex-col items-center gap-6 text-xl font-semibold w-full px-6">
            <li>
              <button onClick={() => scrollToSection('features')} className="hover:text-purple-400 transition-colors">
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('use-cases')} className="hover:text-purple-400 transition-colors">
                Use Cases
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-purple-400 transition-colors">
                Pricing
              </button>
            </li>
            <li className="w-12 h-px bg-white/10 my-2"></li>
            <li>
              <Link to="/login" className="text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 px-10 py-3.5 rounded-xl block text-center shadow-lg" onClick={() => setMobileMenuOpen(false)}>
                Get Started Free
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 🦸 Hero Section */}
      <section className="relative pt-44 pb-20 px-6 text-center max-w-4xl mx-auto z-10 flex flex-col items-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] radial-bg-glow pointer-events-none -z-10"></div>
        
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/85 mb-8 animate-fade-down">
          <span className="w-1.5 h-1.5 bg-[#c77dff] rounded-full shadow-[0_0_10px_#c77dff] badge-pulse-dot-anim"></span>
          <span>AI-Powered · No more blank page panic</span>
        </div>

        <h1 className="font-['Outfit'] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-6 animate-fade-up-1">
          Write Formal Mails in <span className="bg-gradient-to-r from-[#c77dff] via-[#7b2cbf] to-[#9d4edd] bg-clip-text text-transparent">Seconds, Not Hours</span>
        </h1>

        <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mb-10 animate-fade-up-2">
          Generate professional emails for any situation — leave requests, internship applications,
          complaints, and more. Built for students and working professionals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto animate-fade-up-3">
          <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-600 px-8 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            ✉ Start Writing Free
          </Link>
          <button onClick={() => scrollToSection('preview')} className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl font-semibold hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            ▶ See it in action
          </button>
        </div>
      </section>

      {/* 🖥️ App Preview Card */}
      <section id="preview" className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600/15 to-purple-400/2 border border-purple-500/15 rounded-3xl p-3 shadow-2xl animate-fade-in">
          <div className="bg-[#110f24] border border-white/5 rounded-2xl overflow-hidden">
            {/* Fake Browser Top Bar */}
            <div className="bg-[#0b0918] py-3 px-5 flex items-center border-b border-white/5">
              <div className="flex gap-1.5 mr-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
              </div>
              <div className="bg-white/4 border border-white/8 rounded-md py-1 px-4 text-[10px] sm:text-xs text-white/40 flex-grow max-w-md mx-auto text-center font-mono">
                mailgen.app/dashboard
              </div>
            </div>

            {/* Non-Functional Generator Mockup */}
            <div className="p-6 md:p-8 flex flex-col gap-6 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Mail Type</label>
                <div className="bg-white/3 border border-white/8 rounded-lg p-3 text-sm">📋 Leave Request</div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">What do you need to write today?</label>
                <div className="bg-white/3 border border-white/8 rounded-lg p-3 text-sm text-white/70 min-h-16">
                  I need 3 days leave starting Monday due to fever...
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Select Tone</label>
                <div className="flex gap-2">
                  <span className="bg-purple-500/15 border border-purple-500 text-purple-400 rounded-full py-1.5 px-4 text-xs font-semibold">Formal</span>
                  <span className="bg-white/3 border border-white/8 text-white/60 rounded-full py-1.5 px-4 text-xs">Semi-Formal</span>
                  <span className="bg-white/3 border border-white/8 text-white/60 rounded-full py-1.5 px-4 text-xs">Urgent</span>
                </div>
              </div>

              <button type="button" className="bg-purple-600/40 text-white/60 font-semibold py-3 px-6 rounded-lg self-start text-sm cursor-not-allowed">
                ✉ Generate Mail
              </button>

              {/* Output container */}
              <div className="bg-white/2 border border-white/6 rounded-xl p-5 relative mt-3">
                <span className="absolute top-4 right-4 text-[9px] font-bold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 rounded-full py-1 px-3 uppercase tracking-wider">
                  Generated
                </span>
                <pre className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  Subject: Leave Application for Medical Reasons<br />
                  Date: June 11, 2026<br /><br />
                  Dear Sir/Madam,<br /><br />
                  I am writing to formally request a leave of absence for 3 days, starting from Monday, due to a sudden fever.<br /><br />
                  I have ensured that all my critical tasks are up to date, and I will check my mails periodically for any urgent matters.<br /><br />
                  Thank you for your consideration.<br /><br />
                  Sincerely,<br />
                  Jane Doe
                </pre>
                <div className="flex gap-2.5 mt-5 border-t border-white/6 pt-4">
                  <button className="bg-transparent border border-white/8 hover:bg-white/5 text-white/50 rounded-md py-1.5 px-4 text-xs cursor-not-allowed">📋 Copy</button>
                  <button className="bg-transparent border border-white/8 hover:bg-white/5 text-white/50 rounded-md py-1.5 px-4 text-xs cursor-not-allowed">↺ Regenerate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Stats Row */}
      <section className="bg-white/2 border-y border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="font-['Outfit'] text-4xl font-bold bg-gradient-to-r from-white to-[#c77dff] bg-clip-text text-transparent">10K+</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Mails Generated</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Outfit'] text-4xl font-bold bg-gradient-to-r from-white to-[#c77dff] bg-clip-text text-transparent">8</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Mail Categories</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Outfit'] text-4xl font-bold bg-gradient-to-r from-white to-[#c77dff] bg-clip-text text-transparent">30s</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Avg. Generation Time</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Outfit'] text-4xl font-bold bg-gradient-to-r from-white to-[#c77dff] bg-clip-text text-transparent">3</span>
            <span className="text-xs text-white/50 uppercase tracking-wider">Tone Options</span>
          </div>
        </div>
      </section>

      {/* ✨ Features Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 rounded-full py-1 px-4 uppercase tracking-widest inline-block mb-4">
            FEATURES
          </span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-white/60 max-w-md mx-auto text-sm sm:text-base">No templates. No overthinking. Just describe and generate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/2 border border-white/5 hover:border-purple-500/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">🤖</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">AI-Powered Writing</h3>
            <p className="text-white/60 text-sm leading-relaxed">Describe your situation in plain language and get a perfectly structured formal mail instantly.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white/2 border border-white/5 hover:border-[#b5179e]/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-pink-500/15 border border-pink-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">🎯</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">Tone Control</h3>
            <p className="text-white/60 text-sm leading-relaxed">Switch between Formal, Semi-Formal, and Urgent tones with a single click.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white/2 border border-white/5 hover:border-blue-500/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">📚</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">Mail History</h3>
            <p className="text-white/60 text-sm leading-relaxed">All your generated mails are saved. Copy, regenerate, or reference them anytime.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white/2 border border-white/5 hover:border-yellow-500/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-yellow-500/15 border border-yellow-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">⚡</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">8 Mail Types</h3>
            <p className="text-white/60 text-sm leading-relaxed">Leave, Internship, Complaints, Follow-ups, Apologies, Offer Acceptance and more.</p>
          </div>
          {/* Card 5 */}
          <div className="bg-white/2 border border-white/5 hover:border-green-500/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">🔒</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">Secure & Private</h3>
            <p className="text-white/60 text-sm leading-relaxed">Your mails are tied to your account. No one else can see what you've written.</p>
          </div>
          {/* Card 6 */}
          <div className="bg-white/2 border border-white/5 hover:border-red-500/25 p-8 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center text-2xl mb-6">📋</div>
            <h3 className="font-['Outfit'] text-lg font-semibold mb-3">One-Click Copy</h3>
            <p className="text-white/60 text-sm leading-relaxed">Copy the full mail to your clipboard instantly — ready to paste anywhere.</p>
          </div>
        </div>
      </section>

      {/* 👥 Use Cases Section */}
      <section id="use-cases" className="py-24 px-6 bg-[#0b0914] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 rounded-full py-1 px-4 uppercase tracking-widest inline-block mb-4">
              USE CASES
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold mb-4">Made for Everyone</h2>
            <p className="text-white/60 text-sm sm:text-base">Whether you're studying or working, we've got you covered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Students */}
            <div className="bg-white/2 border border-white/5 hover:border-purple-500/10 p-8 sm:p-10 rounded-2xl text-left transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl">🎓</span>
                <h3 className="font-['Outfit'] text-xl sm:text-2xl font-bold">Students</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-8">Craft flawless applications and leave letters to professors and administrators.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-500/10 text-[#c77dff] border border-purple-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Leave Request</span>
                <span className="bg-purple-500/10 text-[#c77dff] border border-purple-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Internship Apply</span>
                <span className="bg-purple-500/10 text-[#c77dff] border border-purple-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Scholarship</span>
                <span className="bg-purple-500/10 text-[#c77dff] border border-purple-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Deadline Extension</span>
              </div>
            </div>

            {/* Professionals */}
            <div className="bg-white/2 border border-white/5 hover:border-pink-500/10 p-8 sm:p-10 rounded-2xl text-left transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl sm:text-4xl">💼</span>
                <h3 className="font-['Outfit'] text-xl sm:text-2xl font-bold">Professionals</h3>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-8">Communicate clearly and effectively with clients, managers, and HR representatives.</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-pink-500/10 text-[#f72585] border border-pink-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Resignation</span>
                <span className="bg-pink-500/10 text-[#f72585] border border-pink-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Offer Acceptance</span>
                <span className="bg-pink-500/10 text-[#f72585] border border-pink-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Client Follow-up</span>
                <span className="bg-pink-500/10 text-[#f72585] border border-pink-500/20 rounded-full py-1.5 px-4 text-xs font-semibold">Complaint</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <span className="text-[10px] font-bold text-[#c77dff] bg-purple-500/10 border border-purple-500/20 rounded-full py-1 px-4 uppercase tracking-widest inline-block mb-4">
              PRICING
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-white/60 text-sm sm:text-base">Write better emails today. No credit card required.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-3xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white/2 border border-white/5 p-8 rounded-3xl flex-1 flex flex-col text-left transition-all duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h3 className="font-['Outfit'] text-lg font-bold mb-2">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-['Outfit']">$0</span>
                  <span className="text-xs text-white/50">/ month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-8 flex-grow text-sm text-white/70">
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Mock AI generation</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">8 standard mail categories</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">One-click copy tool</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Save up to 5 history items</span></li>
              </ul>
              <Link to="/signup" className="bg-white/8 hover:bg-white/12 text-white py-3 px-6 rounded-xl text-center text-sm font-semibold transition-all">
                Get Started Free
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-b from-purple-900/20 to-white/2 border border-[#c77dff]/35 hover:border-[#c77dff] p-8 rounded-3xl flex-1 flex flex-col text-left relative transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(123,44,191,0.25)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold tracking-widest text-[#0b0914] bg-[#c77dff] py-1 px-4 rounded-full shadow-[0_4px_10px_rgba(199,125,255,0.4)]">
                POPULAR
              </div>
              <div className="mb-6 mt-2">
                <h3 className="font-['Outfit'] text-lg font-bold mb-2">Pro Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-['Outfit']">$9</span>
                  <span className="text-xs text-white/50">/ month</span>
                </div>
              </div>
              <ul className="flex flex-col gap-4 mb-8 flex-grow text-sm text-white/70">
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Real Google Gemini AI</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Unlimited email generation</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">High-quality customized prompts</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Cloud history & sync</span></li>
                <li className="flex items-center gap-2">✓ <span className="text-white/80">Priority support</span></li>
              </ul>
              <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl text-center text-sm font-semibold transition-all">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📣 CTA Banner */}
      <section className="py-20 px-6">
        <div className="bg-gradient-to-br from-[#1b0c36] to-[#0d061f] border border-purple-500/15 rounded-3xl p-10 sm:p-16 text-center max-w-5xl mx-auto relative overflow-hidden shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] radial-card-glow pointer-events-none"></div>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold mb-4 relative z-10">Stop staring at a blank email</h2>
          <p className="text-white/60 text-sm sm:text-base max-w-lg mx-auto mb-8 relative z-10 leading-relaxed">Join thousands of students and professionals who write better mails, faster.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 max-w-xs sm:max-w-none mx-auto">
            <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-pink-600 hover:to-purple-600 py-3.5 px-8 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              ✉ Create Free Account
            </Link>
            <button onClick={() => scrollToSection('features')} className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 py-3.5 px-8 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer">
              Learn more →
            </button>
          </div>
        </div>
      </section>

      {/* 🦶 Footer */}
      <footer className="border-t border-white/5 py-10 px-6 bg-[#080710]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-xs text-white/45">
            © 2026 MailGen. Built with ❤
          </div>
          <div className="flex gap-6 text-xs text-white/45">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" className="hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

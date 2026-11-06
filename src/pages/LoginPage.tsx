/**
 * Hotel Arunika Senja ERP - Login Page
 * Pixel-accurate implementation of video frames 00:00 - 00:03 with 7-Role RBAC Demo Selection:
 * - Left panel: Hotel interior visual with "THE GUEST STANDARD / Stay in control of every stay."
 * - Right panel: Brand lockup, "Sign in.", email/password inputs, "Sign in →" button,
 *   and demo account selector pills for all 7 hotel roles.
 */

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { DEMO_USERS } from '../data/seedData';
import { UserRole } from '../types/erp';

interface LoginPageProps {
  onLoginSuccess: (selectedRole: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { switchRole } = useERP();

  const [email, setEmail] = useState('admin@arunika.test');
  const [password, setPassword] = useState('Arunika123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const user = DEMO_USERS.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword('Arunika123');
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      switchRole(selectedRole);
      onLoginSuccess(selectedRole);
    }, 350);
  };

  const rolePills: { role: UserRole; label: string; staff: string }[] = [
    { role: 'owner', label: 'Owner / Administrator', staff: 'Nadhira P.' },
    { role: 'frontdesk', label: 'Front Desk / Receptionist', staff: 'Bima W.' },
    { role: 'sales', label: 'Sales', staff: 'Laras P.' },
    { role: 'warehouse', label: 'Warehouse / Inventory', staff: 'Santi K.' },
    { role: 'procurement', label: 'Procurement / Purchase', staff: 'Fauzan R.' },
    { role: 'finance', label: 'Finance / Accounting', staff: 'Hendri S.' },
    { role: 'housekeeping', label: 'Housekeeping', staff: 'Agus S.' },
  ];

  // Curated boutique hotel visuals for Arunika Senja
  const showcaseSlides = [
    {
      image: '/src/assets/images/arunika_hotel_lobby_1793295695960.jpg',
      tag: 'THE GUEST STANDARD',
      title: 'Stay in control of every stay.',
      subtitle: 'One connected system for rooms, minibar, stock, sales and the ledger behind Arunika Senja.',
      label: 'Main Lobby & Courtyard',
    },
    {
      image: '/src/assets/images/arunika_luxury_suite_1793328003259.jpg',
      tag: 'BOUTIQUE SUITES',
      title: 'Uncompromised luxury and comfort.',
      subtitle: '8 bespoke guest suites designed for discerning travelers and executive stays in Jakarta.',
      label: 'Executive Suite Room',
    },
    {
      image: '/src/assets/images/arunika_rooftop_sunset_1793328003788.jpg',
      tag: 'SENJA TWILIGHT LOUNGE',
      title: 'Where sunset meets warm hospitality.',
      subtitle: 'Rooftop infinity terrace and twilight dining overlooking the vibrant capital skyline.',
      label: 'Rooftop Lounge & Terrace',
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-rotate photos every 6 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % showcaseSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [showcaseSlides.length]);

  return (
    <div className="min-h-screen bg-white flex items-stretch font-sans">
      {/* Left Column: Full-Height Brand Showcase with Photo Switcher */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900 flex-col justify-between p-10 xl:p-12">
        {/* Background Image with Smooth Fade */}
        <img
          key={showcaseSlides[currentSlideIndex].image}
          src={showcaseSlides[currentSlideIndex].image}
          alt={showcaseSlides[currentSlideIndex].label}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />

        {/* Top Badges / Location Tag */}
        <div className="relative z-10 flex items-center justify-between text-white/80 text-xs">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-medium tracking-wide">
            📍 Jakarta Boutique Property
          </span>
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-medium">
            {showcaseSlides[currentSlideIndex].label}
          </span>
        </div>

        {/* Bottom Hero Typography & Slide Controls */}
        <div className="relative z-10 text-white space-y-4">
          <div className="max-w-lg space-y-2.5">
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#D8AD43] uppercase">
              {showcaseSlides[currentSlideIndex].tag}
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold font-serif-luxury leading-tight drop-shadow-xs">
              {showcaseSlides[currentSlideIndex].title}
            </h2>
            <p className="text-xs text-neutral-200 leading-relaxed max-w-md drop-shadow-xs">
              {showcaseSlides[currentSlideIndex].subtitle}
            </p>
          </div>

          {/* Slide Switcher Controls */}
          <div className="flex items-center gap-2 pt-2">
            {showcaseSlides.map((slide, idx) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'w-8 bg-[#D8AD43]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={slide.label}
              />
            ))}
            <span className="text-[10px] text-white/60 ml-2">
              Klik titik untuk ganti foto ({currentSlideIndex + 1}/{showcaseSlides.length})
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Workspace Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-14 bg-[#FFFFFF] overflow-y-auto">
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          {/* Logo Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D8AD43] via-[#C6A66B] to-[#B38E32] flex items-center justify-center text-[#0B2342] font-bold text-xs shrink-0 shadow-xs">
              AS
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B2342] tracking-tight">
                Hotel Arunika Senja
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Hospitality ERP · Role-Based Access Control
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-wider text-[#64748B] uppercase">
              AUTHENTICATED WORKSPACE
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2342] tracking-tight">
              Sign in.
            </h1>
            <p className="text-xs text-[#475569]">
              Select your staff role to launch your designated dashboard and permitted menus.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1E2A3A] block">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-xs text-[#0B2342] focus:outline-hidden focus:border-[#D8AD43] focus:ring-1 focus:ring-[#D8AD43] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#1E2A3A] block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3.5 pr-10 bg-white border border-slate-200 rounded-lg text-xs text-[#0B2342] focus:outline-hidden focus:border-[#D8AD43] focus:ring-1 focus:ring-[#D8AD43] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#0B2342] hover:bg-[#163454] text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#D8AD43]/30"
            >
              {isLoading ? (
                <span>Authorizing role...</span>
              ) : (
                <>
                  <span>Sign in as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D8AD43]" />
                </>
              )}
            </button>
          </form>

          {/* 7 Demo Accounts Pill Selector */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Select Demo Role (7 Roles):</span>
              <span className="font-mono text-[#1E2A3A] font-medium">Pass: Arunika123</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rolePills.map(item => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRole(item.role)}
                    className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0B2342] text-[#D8AD43] border-[#D8AD43] font-semibold shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#D8AD43]" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Small Footer */}
        <div className="text-center text-[11px] text-neutral-400 pt-6">
          © 2026 Arunika Senja ERP · Simulated Role-Based Access Control
        </div>
      </div>
    </div>
  );
};

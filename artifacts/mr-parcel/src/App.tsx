import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Phone,
  Route as RouteIcon,
  Ruler,
  Scale,
  Send,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import heroHandoffImage from '@assets/generated_images/mr-parcel-customer-handoff-hero.jpg';
import businessHandoffImage from '@assets/generated_images/mr-parcel-business-handoff.jpg';
import packingCareImage from '@assets/generated_images/mr-parcel-packing-care.jpg';
import localBusinessImage from '@assets/generated_images/mr-parcel-local-business.jpg';
import coastalRouteImage from '@assets/generated_images/mr-parcel-coastal-route.jpg';
import heroHandoffVideo from '@assets/mr-parcel-hero-1080p.mp4';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';

const queryClient = new QueryClient();
const WHATSAPP_URL = 'https://wa.me/27640700868';

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return <MessageCircle size={size} strokeWidth={2.4} aria-hidden="true" />;
}

function LogoVan({ inverse = false }: { inverse?: boolean }) {
  return (
    <svg viewBox="0 0 76 48" className="h-8 w-[3.2rem]" aria-hidden="true">
      <path d="M9 20 1 13l5-1 4-8 6 9 8-4-3 12" fill="#b9e4df" stroke={inverse ? '#08263d' : '#fffaf1'} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 26V16c0-4 3-7 7-7h27c5 0 9 3 11 7l6 11v7H18Z" fill="#0f5b83" stroke={inverse ? '#08263d' : '#fffaf1'} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M53 12H43v15h25l-5-11c-2-3-5-4-10-4Z" fill="#d4eeea" stroke={inverse ? '#08263d' : '#fffaf1'} strokeWidth="2" />
      <path d="M19 22h29v7H19Z" fill="#f36f21" />
      <path d="M27 22v7M38 22v7" stroke="#08263d" strokeWidth="1.4" opacity=".5" />
      <circle cx="30" cy="36" r="6.2" fill="#fffaf1" stroke="#08263d" strokeWidth="2.5" />
      <circle cx="30" cy="36" r="2.4" fill="#f36f21" />
      <circle cx="61" cy="36" r="6.2" fill="#fffaf1" stroke="#08263d" strokeWidth="2.5" />
      <circle cx="61" cy="36" r="2.4" fill="#f36f21" />
      <path d="m70 28 5 2-1 4-5-1Z" fill="#f36f21" stroke="#08263d" strokeWidth="1.5" />
    </svg>
  );
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand-home">
      <span className={`grid h-10 w-14 place-items-center overflow-hidden rounded-[13px] ${inverse ? 'bg-[#f36f21]' : 'bg-[#08263d]'}`} aria-hidden="true">
        <LogoVan inverse={inverse} />
      </span>
      <span className={`font-display text-[1.05rem] font-extrabold leading-none tracking-[-.05em] ${inverse ? 'text-[#fffaf1]' : 'text-[#08263d]'}`}>
        Mr <span className={inverse ? 'text-[#f7a061]' : 'text-[#f36f21]'}>PARCEL</span>
      </span>
    </Link>
  );
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location]);
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/routes', label: 'Routes' },
    { href: '/contact', label: 'Contact' },
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-[#173e54] bg-[#08263d]/95 backdrop-blur-md">
      <div className="container-wide flex h-[4.6rem] items-center justify-between">
        <BrandMark inverse />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link" aria-current={location === item.href ? 'page' : undefined} data-testid={`link-nav-${item.label.toLowerCase()}`}>
              {item.label}
            </Link>
          ))}
          <Link href="/book" className="btn-primary min-h-10 px-4" data-testid="link-nav-book">
            Get a quote <ArrowRight size={16} />
          </Link>
        </nav>
        <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-[#fffaf1] md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-menu border-t border-[#173e54] bg-[#08263d] px-4 pb-5 pt-3 md:hidden" aria-label="Mobile navigation">
          <div className="container-wide flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm font-bold text-[#d9e6e6] hover:bg-[#123c55] hover:text-[#f7a061]" data-testid={`link-mobile-${item.label.toLowerCase()}`}>
                {item.label}
              </Link>
            ))}
            <Link href="/book" className="btn-primary mt-2" data-testid="link-mobile-book">Get a quote <ArrowRight size={16} /></Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="dark-panel border-t border-[#234e66]">
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.25fr_.8fr_.8fr] md:py-16">
        <div>
          <BrandMark inverse />
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#b8ccd7]">Fast, reliable mini parcel delivery between West Coast towns and Cape Town.</p>
          <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f7a061] hover:text-[#fffaf1]" href={WHATSAPP_URL} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp">
            <WhatsAppIcon size={17} /> 064 07 00 868
          </a>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f7a061]">Explore</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#b8ccd7]">
            <Link href="/services" className="hover:text-[#fffaf1]" data-testid="link-footer-services">Services & parcel rules</Link>
            <Link href="/routes" className="hover:text-[#fffaf1]" data-testid="link-footer-routes">Routes & service area</Link>
            <Link href="/book" className="hover:text-[#fffaf1]" data-testid="link-footer-book">Book a delivery</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f7a061]">Details</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#b8ccd7]">
            <span>MrParcel.co.za</span>
            <span>West Coast & Cape Town</span>
            <span>Up to 25kg per parcel</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[#234e66]">
        <div className="container-wide flex flex-col gap-2 py-5 text-xs text-[#86a5b3] sm:flex-row sm:items-center sm:justify-between">
          <span data-testid="text-footer-copyright">© {new Date().getFullYear()} Mr PARCEL. Local & Efficient.</span>
          <span>Fast. Secure. Local.</span>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a className="whatsapp-float" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat with Mr Parcel on WhatsApp" data-testid="link-floating-whatsapp">
      <WhatsAppIcon size={20} /><span>Chat on WhatsApp</span>
    </a>
  );
}

function VanIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative ${compact ? 'h-[205px]' : 'h-[300px] sm:h-[350px]'}`} aria-label="Illustration of a blue delivery van carrying parcels">
      <div className="absolute bottom-[18%] left-[6%] h-[3px] w-[83%] rotate-[-4deg] bg-[#f36f21]/40" />
      <svg viewBox="0 0 620 330" className="floaty relative z-10 h-full w-full overflow-visible" role="img">
        <path d="M40 264 C165 254 307 271 560 253" fill="none" stroke="#f36f21" strokeDasharray="10 11" strokeWidth="4" className="route-line" />
        <path d="M88 242 C160 154 207 132 282 170 S390 188 512 105" fill="none" stroke="#f36f21" strokeLinecap="round" strokeWidth="4" opacity=".7" className="route-line" />
        <circle cx="88" cy="242" r="8" fill="#fffaf1" stroke="#f36f21" strokeWidth="5" />
        <circle cx="512" cy="105" r="8" fill="#fffaf1" stroke="#f36f21" strokeWidth="5" />
        <path d="M164 85 180 47l20 30 30-17-9 47" fill="#b9e4df" stroke="#08263d" strokeLinejoin="round" strokeWidth="7" />
        <path d="m400 75 32-33 17 39 32-4-35 39" fill="#b9e4df" stroke="#08263d" strokeLinejoin="round" strokeWidth="7" />
        <path d="M111 174v-42c0-15 12-27 27-27h280c18 0 33 10 43 26l39 61v42H111Z" fill="#0f5b83" stroke="#08263d" strokeLinejoin="round" strokeWidth="9" />
        <path d="M441 114h-82v74h129l-24-54c-5-12-11-20-23-20Z" fill="#b9e4df" stroke="#08263d" strokeWidth="7" />
        <path d="M363 119h69c8 0 13 4 17 11l20 47h-106Z" fill="#d4eeea" />
        <path d="M115 174h247v29H115Z" fill="#f36f21" />
        <path d="M210 174v29M303 174v29" stroke="#08263d" strokeWidth="4" opacity=".45" />
        <text x="139" y="195" fill="#fffaf1" fontFamily="DM Sans, sans-serif" fontSize="21" fontWeight="800" letterSpacing="2">MR PARCEL</text>
        <path d="M148 229h264" stroke="#08263d" strokeWidth="8" />
        <circle cx="177" cy="247" r="28" fill="#fffaf1" stroke="#08263d" strokeWidth="8" />
        <circle cx="177" cy="247" r="11" fill="#f36f21" />
        <circle cx="445" cy="247" r="28" fill="#fffaf1" stroke="#08263d" strokeWidth="8" />
        <circle cx="445" cy="247" r="11" fill="#f36f21" />
        <path d="m491 191 25 13-5 17-24-5Z" fill="#f36f21" stroke="#08263d" strokeWidth="5" />
        <path d="M88 242h-34M512 105l30-17" stroke="#08263d" strokeLinecap="round" strokeWidth="4" />
        <g transform="translate(50 197) rotate(-12)">
          <path d="M0 16 42 0l23 28-43 18Z" fill="#f2a261" stroke="#08263d" strokeWidth="5" />
          <path d="m22 8 22 28M14 12l29 13" stroke="#c36b35" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body, light = false }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return (
    <div className={`scroll-reveal max-w-2xl ${light ? 'text-[#fffaf1]' : 'text-[#08263d]'}`} data-scroll-reveal>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="display-heading mt-4 text-4xl sm:text-5xl">{title}</h2>
      {body && <p className={`mt-5 max-w-xl text-base leading-7 ${light ? 'text-[#b8ccd7]' : 'text-[#527080]'}`}>{body}</p>}
    </div>
  );
}

function RouteRibbon() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[.72rem] font-extrabold uppercase tracking-[.12em] text-[#f7a061]">
      <span>West Coast</span><span className="h-1 w-1 rounded-full bg-[#f7a061]" />
      <span>Cape Town</span><span className="h-1 w-1 rounded-full bg-[#f7a061]" />
      <span>150km radius</span>
    </div>
  );
}

function Home() {
  const serviceCards = [
    { icon: Clock3, title: 'Same-day, when it matters', body: 'Need a small parcel in Cape Town today? We keep the trip moving and the updates simple.' },
    { icon: ShieldCheck, title: 'Handled like it is ours', body: 'Secure transport, clear handover, and a weighbill so you know where your parcel stands.' },
    { icon: MapPin, title: 'Local routes, real people', body: 'From Velddrif and Saldanha to Malmesbury and Cape Town — this is our patch.' },
  ];
  return (
    <PageFrame>
      <section className="hero-media dark-panel relative isolate min-h-[39rem] overflow-hidden sm:min-h-[44rem] lg:min-h-[43rem]">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={heroHandoffImage} alt="" className="hero-media-image h-full w-full object-cover" />
          <video
            className="hero-media-video absolute inset-0 h-full w-full object-cover"
            poster={heroHandoffImage}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onCanPlay={(event) => { event.currentTarget.style.opacity = '1'; }}
            onError={(event) => { event.currentTarget.style.opacity = '0'; }}
          >
            <source src={heroHandoffVideo} type="video/mp4" />
          </video>
          <div className="hero-media-scrim absolute inset-0" />
        </div>
        <div className="container-wide relative flex min-h-[39rem] items-end py-14 sm:min-h-[44rem] sm:py-20 lg:min-h-[43rem] lg:items-center lg:py-24">
          <div className="max-w-2xl">
            <RouteRibbon />
            <p className="reveal reveal-1 mt-6 max-w-lg text-sm font-bold uppercase tracking-[.12em] text-[#d8eeea]">A little closer to home</p>
            <h1 className="display-heading reveal reveal-1 mt-4 max-w-3xl text-[3.5rem] leading-[.9] text-[#fffaf1] sm:text-[5.8rem] lg:text-[6.8rem]">MR <span className="text-[#f36f21]">PARCEL</span></h1>
            <p className="reveal reveal-2 mt-6 max-w-xl font-display text-2xl font-extrabold leading-tight tracking-[-.04em] text-[#fffaf1] sm:text-3xl">The friendly way to move a small parcel.</p>
            <p className="reveal reveal-2 mt-3 max-w-lg text-base leading-7 text-[#e1eeed] sm:text-lg">Same-day delivery between the West Coast and Cape Town, with a real person on the other end of the message.</p>
            <div className="reveal reveal-3 mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn-primary" data-testid="link-home-book">Get a delivery quote <ArrowRight size={17} /></Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-secondary" data-testid="link-home-whatsapp"><WhatsAppIcon size={18} /> WhatsApp us</a>
            </div>
            <div className="reveal reveal-4 mt-8 flex items-center gap-3 text-xs font-bold text-[#d8e8e8]"><Check size={16} className="text-[#f7a061]" /> Local routes. Clear updates. Careful handovers.</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#d8eeea]/20 bg-[#08263d]/70 backdrop-blur-sm">
          <div className="container-wide grid grid-cols-2 gap-5 py-5 text-xs font-bold text-[#e0eeec] sm:grid-cols-4">
            <span className="flex items-center gap-2"><PackageCheck size={16} className="text-[#f7a061]" /> Weighbill included</span>
            <span className="flex items-center gap-2"><Scale size={16} className="text-[#f7a061]" /> Up to 25kg</span>
            <span className="flex items-center gap-2"><Ruler size={16} className="text-[#f7a061]" /> 48 × 40 × 39cm</span>
            <span className="flex items-center gap-2"><RouteIcon size={16} className="text-[#f7a061]" /> 150km radius</span>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#fffaf1]">
        <div className="container-wide">
          <SectionHeading eyebrow="Why Mr Parcel" title="The local courier you can actually reach." body="No call-centre runaround. No mystery handovers. Just a friendly, practical service built around small parcels and the people sending them." />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {serviceCards.map(({ icon: Icon, title, body }, index) => (
              <article key={title} className={`benefit-card paper-panel soft-shadow rounded-2xl p-6 ${index === 1 ? 'md:translate-y-7' : ''}`} data-testid={`card-home-benefit-${index}`}>
                <div className="benefit-icon grid h-12 w-12 place-items-center rounded-xl bg-[#b9e4df] text-[#08263d]"><Icon size={23} /></div>
                <h3 className="font-display mt-7 text-xl font-extrabold tracking-[-.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#527080]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-paper section-pad overflow-hidden bg-[#dcece8]">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <figure className="process-story-image image-frame overflow-hidden rounded-[1.5rem]">
            <img src={packingCareImage} alt="Hands carefully tying a tag onto a packed parcel beside a coastal window" className="h-full min-h-[23rem] w-full object-cover object-[58%_center] sm:min-h-[31rem]" loading="lazy" />
            <figcaption className="image-caption"><span className="h-2 w-2 rounded-full bg-[#f7a061]" /> Packed with care, ready for the road.</figcaption>
          </figure>
          <div>
            <SectionHeading eyebrow="How it works" title="Three messages from pickup to handover." body="We keep the logistics behind the scenes and the next step in front of you." />
            <Link href="/book" className="btn-primary mt-8" data-testid="link-home-how-book">Start a booking <ArrowRight size={17} /></Link>
            <div className="relative mt-10 space-y-4">
              {[
                ['01', 'Tell us what is moving', 'Send your pickup, drop-off and parcel details on WhatsApp.'],
                ['02', 'We confirm the trip', 'You get a clear quote, timing and the handover plan.'],
                ['03', 'It gets there safely', 'Your parcel travels with a weighbill and tracking language you can trust.'],
              ].map(([number, title, body]) => (
                <div key={number} className="process-step flex gap-5 rounded-2xl border border-[#bfd5d2] bg-[#fffaf1]/80 p-5 sm:items-center" data-testid={`card-home-step-${number}`}>
                  <span className="process-number font-display text-3xl font-extrabold text-[#f36f21]">{number}</span>
                  <div><h3 className="font-display text-lg font-extrabold tracking-[-.03em] text-[#08263d]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#527080]">{body}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#fffaf1]">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <SectionHeading eyebrow="The human handover" title="Small business runs on people." body="When a customer is waiting on an order, the handover matters. We help local makers and shop owners send with confidence, from the first message to the final smile." />
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/services" className="btn-ghost w-fit" data-testid="link-home-human-services">See business delivery <ArrowRight size={17} /></Link>
              <span className="text-sm font-bold text-[#527080]">A familiar face, not a tracking maze.</span>
            </div>
          </div>
          <figure className="image-frame order-1 overflow-hidden rounded-[1.5rem] lg:order-2">
            <img src={businessHandoffImage} alt="Local shop owner smiling as a Mr Parcel driver receives a parcel at her doorway" className="h-full min-h-[22rem] w-full object-cover sm:min-h-[29rem]" loading="lazy" />
            <figcaption className="image-caption"><span className="h-2 w-2 rounded-full bg-[#f36f21]" /> A careful handover is part of the service.</figcaption>
          </figure>
        </div>
      </section>

      <section className="dark-panel section-pad">
        <div className="container-wide grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <SectionHeading eyebrow="On our map" title="A local route with a wide reach." body="The West Coast and Cape Town are our everyday. Check the towns we serve and the 150km radius around them." light />
            <div className="mt-8 flex flex-wrap gap-2">
              {['Velddrif', 'Vredenburg', 'Saldanha', 'Hopefield', 'Malmesbury', 'Cape Town'].map((town) => <span key={town} className="rounded-full border border-[#2f5d73] px-3.5 py-2 text-sm font-bold text-[#d5e6e8]" data-testid={`badge-home-town-${town.toLowerCase()}`}>{town}</span>)}
            </div>
          </div>
          <Link href="/routes" className="btn-secondary shrink-0" data-testid="link-home-routes">See service areas <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="orange-panel">
        <div className="container-wide flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
          <div><p className="font-display text-3xl font-extrabold tracking-[-.05em] sm:text-4xl">Got a parcel to move?</p><p className="mt-2 text-sm font-medium text-[#ffe1cf]">A quick WhatsApp is all it takes to get a quote.</p></div>
          <Link href="/book" className="btn-secondary w-fit" data-testid="link-home-bottom-book">Get a quote <ArrowRight size={17} /></Link>
        </div>
      </section>
    </PageFrame>
  );
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="page-intro dark-panel overflow-hidden">
      <div className="container-wide relative grid items-end gap-8 py-16 sm:py-20 md:grid-cols-[1fr_.7fr] md:py-24">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-[#0f5b83]/50 blur-3xl" />
        <div className="relative">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display-heading reveal reveal-1 mt-5 max-w-3xl text-5xl text-[#fffaf1] sm:text-6xl">{title}</h1>
          <p className="reveal reveal-2 mt-6 max-w-xl text-base leading-7 text-[#b8ccd7]">{body}</p>
        </div>
        <div className="relative hidden md:block"><VanIllustration compact /></div>
      </div>
    </section>
  );
}

function Services() {
  const rules = [
    { icon: Scale, title: 'Weight limit', body: 'Each parcel can weigh up to 25kg.' },
    { icon: Ruler, title: 'Parcel size', body: 'Maximum dimensions are 48cm × 40cm × 39cm.' },
    { icon: PackageCheck, title: 'Pack it properly', body: 'Use a strong box, seal all edges and cushion anything fragile.' },
  ];
  return (
    <PageFrame>
      <PageIntro eyebrow="Services & parcel rules" title="Small parcels. Properly handled." body="A straightforward local delivery service for the things that do not need a giant truck — just the right person, the right route and a bit of care." />
      <section className="section-pad bg-[#fffaf1]">
        <div className="container-wide">
          <SectionHeading eyebrow="What we do" title="The right-sized delivery service." body="Mr Parcel is made for everyday local sending: personal packages, business orders, documents and those time-sensitive little things." />
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <article className="dark-panel hard-shadow rounded-2xl p-7 sm:p-9" data-testid="card-service-same-day">
              <div className="flex items-start justify-between gap-5"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#f36f21] text-[#fffaf1]"><Clock3 size={23} /></div><span className="rounded-full bg-[#1a4a64] px-3 py-1.5 text-[.67rem] font-extrabold uppercase tracking-[.13em] text-[#b9e4df]">Most popular</span></div>
              <h3 className="font-display mt-12 text-3xl font-extrabold tracking-[-.05em]">Same-day mini parcel delivery</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#b8ccd7]">For parcels that need to move between the West Coast and Cape Town without waiting around. Share the details, we confirm what is possible, and we get it on the road.</p>
              <div className="mt-8 flex flex-wrap gap-2"><span className="rounded-full border border-[#2d607a] px-3 py-2 text-xs font-bold text-[#d5e6e8]">Fast</span><span className="rounded-full border border-[#2d607a] px-3 py-2 text-xs font-bold text-[#d5e6e8]">Secure</span><span className="rounded-full border border-[#2d607a] px-3 py-2 text-xs font-bold text-[#d5e6e8]">Local</span></div>
            </article>
            <div className="grid gap-5">
               <article className="service-business-card paper-panel overflow-hidden rounded-2xl" data-testid="card-service-business">
                 <div className="service-business-image relative h-48 overflow-hidden">
                   <img src={localBusinessImage} alt="Local shop owner handing a parcel to a courier at her doorway" className="h-full w-full object-cover object-[58%_center]" loading="lazy" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#08263d]/65 via-transparent to-transparent" />
                   <span className="absolute bottom-4 left-5 rounded-full bg-[#fffaf1]/95 px-3 py-1.5 text-[.67rem] font-extrabold uppercase tracking-[.13em] text-[#f36f21]">Local business runs on handovers</span>
                 </div>
                 <div className="p-7">
                   <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fbe1d2] text-[#f36f21]"><Box size={22} /></div>
                   <h3 className="font-display mt-6 text-2xl font-extrabold tracking-[-.05em]">For local businesses</h3>
                   <p className="mt-3 text-sm leading-6 text-[#527080]">Keep customers happy with a practical way to send orders, samples, stock and documents around the region.</p>
                 </div>
               </article>
              <article className="paper-panel rounded-2xl p-7" data-testid="card-service-personal"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#b9e4df] text-[#08263d]"><Send size={22} /></div><h3 className="font-display mt-6 text-2xl font-extrabold tracking-[-.05em]">For everyday errands</h3><p className="mt-3 text-sm leading-6 text-[#527080]">Forgotten keys, a birthday parcel, a return or a document — if it fits the rules, we can help move it.</p></article>
            </div>
          </div>
        </div>
      </section>
      <section className="section-pad bg-[#dcece8]">
        <div className="container-wide">
          <SectionHeading eyebrow="Before you book" title="A few simple parcel rules." body="Good packaging makes for a smoother handover. Here is what to check before your parcel leaves." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {rules.map(({ icon: Icon, title, body }) => <article className="rounded-2xl border border-[#bfd5d2] bg-[#fffaf1] p-6" key={title} data-testid={`card-service-rule-${title.toLowerCase().replaceAll(' ', '-')}`}><Icon size={23} className="text-[#f36f21]" /><h3 className="font-display mt-6 text-lg font-extrabold text-[#08263d]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#527080]">{body}</p></article>)}
          </div>
        </div>
      </section>
      <section className="section-pad bg-[#fffaf1]">
        <div className="container-wide grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHeading eyebrow="What can travel" title="The quick yes / no list." body="When in doubt, send us a WhatsApp before packing up. We would rather check first than disappoint you later." />
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-[#b9ded6] bg-[#eaf7f3] p-6" data-testid="card-service-allowed"><div className="flex items-center gap-3 font-display text-lg font-extrabold text-[#0d634f]"><Check size={21} /> Usually allowed</div><ul className="mt-5 space-y-3 text-sm leading-6 text-[#386b67]"><li>• Documents and paperwork</li><li>• Clothing and personal items</li><li>• Small business orders</li><li>• Sealed household goods</li></ul></article>
            <article className="rounded-2xl border border-[#f2c7b1] bg-[#fff0e8] p-6" data-testid="card-service-forbidden"><div className="flex items-center gap-3 font-display text-lg font-extrabold text-[#a53d1a]"><CircleAlert size={21} /> Not accepted</div><ul className="mt-5 space-y-3 text-sm leading-6 text-[#86523f]"><li>• Dangerous or illegal goods</li><li>• Flammable liquids and aerosols</li><li>• Perishable food or live plants</li><li>• Cash, weapons or valuables</li></ul></article>
          </div>
        </div>
      </section>
      <section className="orange-panel"><div className="container-wide flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between"><p className="font-display text-3xl font-extrabold tracking-[-.05em]">Ready to move a parcel?</p><Link href="/book" className="btn-secondary w-fit" data-testid="link-services-book">Check my delivery <ArrowRight size={17} /></Link></div></section>
    </PageFrame>
  );
}

function RouteDiagram() {
  return (
    <div className="route-map-shell relative overflow-hidden rounded-2xl bg-[#dcece8] p-4 sm:p-8" data-testid="visual-route-map">
      <svg viewBox="0 0 700 430" className="h-auto w-full" role="img" aria-label="Illustrated service route map connecting West Coast towns and Cape Town">
        <path d="M105 103 C180 90 220 173 312 150 S450 191 584 304" fill="none" stroke="#f36f21" strokeDasharray="10 9" strokeLinecap="round" strokeWidth="6" className="route-line" />
        <path d="M88 295 C180 235 230 258 312 150" fill="none" stroke="#0f5b83" strokeDasharray="6 10" strokeWidth="4" />
        <path d="M312 150 C366 129 416 130 468 181" fill="none" stroke="#f36f21" strokeDasharray="6 10" strokeWidth="4" />
        <circle cx="105" cy="103" r="14" fill="#fffaf1" stroke="#f36f21" strokeWidth="7" /><circle cx="205" cy="140" r="11" fill="#fffaf1" stroke="#f36f21" strokeWidth="6" /><circle cx="312" cy="150" r="15" fill="#08263d" stroke="#fffaf1" strokeWidth="6" /><circle cx="410" cy="149" r="11" fill="#fffaf1" stroke="#f36f21" strokeWidth="6" /><circle cx="468" cy="181" r="11" fill="#fffaf1" stroke="#f36f21" strokeWidth="6" /><circle cx="584" cy="304" r="15" fill="#f36f21" stroke="#fffaf1" strokeWidth="6" /><circle cx="88" cy="295" r="11" fill="#fffaf1" stroke="#0f5b83" strokeWidth="6" />
        <g fill="#08263d" fontFamily="DM Sans, sans-serif" fontSize="15" fontWeight="700"><text x="62" y="78">Velddrif</text><text x="167" y="119">Vredenburg</text><text x="275" y="120">Saldanha</text><text x="382" y="118">Hopefield</text><text x="435" y="224">Malmesbury</text><text x="540" y="341">Cape Town</text><text x="42" y="326">150km radius</text></g>
        <path d="M40 363c94-20 187 8 281-13s203-3 335-32" fill="none" stroke="#a6ceca" strokeWidth="3" />
        <path d="M38 378c120-23 190 6 295-12s201-2 333-29" fill="none" stroke="#a6ceca" strokeWidth="2" />
      </svg>
      <div className="absolute left-5 top-5 rounded-full bg-[#fffaf1] px-3 py-2 text-[.68rem] font-extrabold uppercase tracking-[.13em] text-[#f36f21] shadow-sm">Our local loop</div>
    </div>
  );
}

function Routes() {
  const towns = [
    ['Velddrif', 'Our northern anchor on the West Coast.'],
    ['Vredenburg', 'A regular stop for local parcels and pickups.'],
    ['Saldanha', 'Moving parcels in and out of the bay.'],
    ['Hopefield', 'A handy link between the coast and inland routes.'],
    ['Malmesbury', 'The practical bridge into Cape Town.'],
    ['Cape Town', 'City drop-offs within our service radius.'],
  ];
  return (
    <PageFrame>
      <PageIntro eyebrow="Routes & service areas" title="The West Coast, connected." body="We travel a familiar local loop between the coast and Cape Town. If your town is within roughly 150km of our route, send us the details and we will check the trip." />
       <section className="section-pad bg-[#fffaf1]">
         <div className="container-wide grid items-start gap-10 lg:grid-cols-[.82fr_1.18fr]">
           <div><SectionHeading eyebrow="The 150km promise" title="Close enough to feel local." body="Our service is built around a 150km radius from the towns we serve. That means practical coverage, sensible timing and a courier who knows the road." /><div className="mt-8 rounded-2xl bg-[#fbe1d2] p-6"><div className="flex items-center gap-3 text-[#a53d1a]"><RouteIcon size={22} /><span className="font-display text-xl font-extrabold">150km service radius</span></div><p className="mt-3 text-sm leading-6 text-[#86523f]">Outside the listed towns? WhatsApp us anyway. We will tell you honestly what is possible.</p></div></div>
           <div className="route-visual-stack">
             <figure className="route-photo-frame image-frame overflow-hidden rounded-[1.5rem]">
               <img src={coastalRouteImage} alt="Blue delivery van travelling a coastal road with a parcel in the foreground" className="h-full min-h-[15rem] w-full object-cover object-[55%_center] sm:min-h-[19rem]" loading="lazy" />
               <figcaption className="image-caption"><span className="h-2 w-2 rounded-full bg-[#f7a061]" /> The road between coast and city.</figcaption>
             </figure>
             <RouteDiagram />
           </div>
        </div>
       </section>
      <section className="section-pad bg-[#dcece8]">
        <div className="container-wide">
          <SectionHeading eyebrow="Town by town" title="Places on the route." body="These are the towns we plan around every day. Tap a place when you are ready to tell us what needs moving." />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {towns.map(([town, body], index) => <Link href="/book" className="route-town-card group flex items-start justify-between gap-4 rounded-2xl border border-[#bfd5d2] bg-[#fffaf1] p-5 transition-transform hover:-translate-y-1" key={town} data-testid={`link-route-town-${town.toLowerCase()}`}><span><span className="block text-xs font-extrabold uppercase tracking-[.12em] text-[#f36f21]">0{index + 1}</span><span className="mt-3 block font-display text-xl font-extrabold tracking-[-.04em] text-[#08263d]">{town}</span><span className="mt-1 block text-sm leading-5 text-[#527080]">{body}</span></span><ArrowDownRight size={20} className="shrink-0 text-[#f36f21] transition-transform group-hover:translate-x-1 group-hover:translate-y-1" /></Link>)}
          </div>
        </div>
      </section>
      <section className="dark-panel"><div className="container-wide flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-3xl font-extrabold tracking-[-.05em]">Not sure if we reach you?</p><p className="mt-2 text-sm text-[#b8ccd7]">Send your pickup and drop-off. We will check the route.</p></div><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-primary w-fit" data-testid="link-routes-whatsapp"><WhatsAppIcon size={18} /> Ask on WhatsApp</a></div></section>
    </PageFrame>
  );
}

function Book() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', pickup: '', dropoff: '', parcel: '', weight: '', timing: '', notes: '' });
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const message = useMemo(() => `Hi Mr Parcel, I would like a delivery quote.\n\nName: ${form.name}\nPickup: ${form.pickup}\nDrop-off: ${form.dropoff}\nParcel: ${form.parcel}\nWeight: ${form.weight || 'Not sure'}\nTiming: ${form.timing || 'Flexible'}\nNotes: ${form.notes || 'None'}\n\nSent from MrParcel.co.za`, [form]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <PageFrame>
      <PageIntro eyebrow="Book a delivery" title="Tell us where it is going." body="Fill in the basics below and we will open a WhatsApp chat with your delivery details ready to send. No account. No waiting for an email reply." />
      <section className="section-pad bg-[#fffaf1]">
        <div className="container-wide grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <form className="booking-form paper-panel soft-shadow rounded-2xl p-6 sm:p-9" onSubmit={submit} data-testid="form-book-delivery">
            <div className="mb-8"><p className="font-display text-2xl font-extrabold tracking-[-.05em] text-[#08263d]">Your delivery details</p><p className="mt-2 text-sm text-[#527080]">The more we know, the quicker we can quote.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label><span className="field-label">Your name *</span><input className="field-control" required value={form.name} onChange={update('name')} placeholder="e.g. Alex" data-testid="input-book-name" /></label>
              <label><span className="field-label">Pickup town *</span><input className="field-control" required value={form.pickup} onChange={update('pickup')} placeholder="e.g. Velddrif" data-testid="input-book-pickup" /></label>
              <label><span className="field-label">Drop-off town *</span><input className="field-control" required value={form.dropoff} onChange={update('dropoff')} placeholder="e.g. Cape Town" data-testid="input-book-dropoff" /></label>
              <label><span className="field-label">Parcel description *</span><input className="field-control" required value={form.parcel} onChange={update('parcel')} placeholder="e.g. Small clothing box" data-testid="input-book-parcel" /></label>
              <label><span className="field-label">Approx. weight</span><input className="field-control" value={form.weight} onChange={update('weight')} placeholder="e.g. 4kg" data-testid="input-book-weight" /></label>
              <label><span className="field-label">When do you need it?</span><select className="field-control" value={form.timing} onChange={update('timing')} data-testid="select-book-timing"><option value="">Choose one</option><option>Today</option><option>Tomorrow</option><option>This week</option><option>Flexible</option></select></label>
            </div>
            <label className="mt-5 block"><span className="field-label">Anything else we should know?</span><textarea className="field-control min-h-28 resize-y" value={form.notes} onChange={update('notes')} placeholder="Fragile, access instructions, preferred handover..." data-testid="textarea-book-notes" /></label>
            <button className="btn-primary mt-6 w-full sm:w-auto" type="submit" data-testid="button-submit-book"><WhatsAppIcon size={18} /> Send details on WhatsApp <ArrowRight size={17} /></button>
            {sent && <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0d634f]" data-testid="status-book-sent"><Check size={17} /> WhatsApp is opening with your details.</p>}
            <p className="mt-5 text-xs leading-5 text-[#779095]">By sending, you are opening a WhatsApp conversation with Mr Parcel on 064 07 00 868.</p>
          </form>
          <aside className="lg:sticky lg:top-28">
            <div className="booking-note dark-panel rounded-2xl p-7 sm:p-9"><span className="eyebrow">Before you send</span><h2 className="font-display mt-5 text-3xl font-extrabold tracking-[-.05em]">A good quote starts with good details.</h2><ul className="mt-7 space-y-5">{['Maximum 25kg per parcel', 'Maximum size 48cm × 40cm × 39cm', 'Pack and seal your parcel securely', 'We provide weighbill and tracking language'].map((item) => <li className="flex gap-3 text-sm leading-6 text-[#c5d8dc]" key={item}><Check size={18} className="mt-1 shrink-0 text-[#f7a061]" />{item}</li>)}</ul><div className="mt-8 border-t border-[#2e5b70] pt-6"><p className="text-xs font-extrabold uppercase tracking-[.13em] text-[#f7a061]">Need a quick answer?</p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-bold text-[#fffaf1] hover:text-[#f7a061]" data-testid="link-book-quick-whatsapp"><WhatsAppIcon size={18} /> Chat directly</a></div></div>
            <div className="mt-5 rounded-2xl bg-[#dcece8] p-6"><div className="flex gap-3"><CircleAlert size={20} className="shrink-0 text-[#f36f21]" /><p className="text-sm leading-6 text-[#386b67]">Do not send dangerous goods, flammable liquids, perishables or valuables. See the full parcel rules on <Link href="/services" className="font-bold underline" data-testid="link-book-services">Services</Link>.</p></div></div>
          </aside>
        </div>
      </section>
    </PageFrame>
  );
}

function Contact() {
  return (
    <PageFrame>
      <PageIntro eyebrow="Contact Mr Parcel" title="A real person is one WhatsApp away." body="We keep contact simple. Tell us what you need moved, where it is going and when — we will get back to you with the next step." />
      <section className="section-pad bg-[#fffaf1]">
        <div className="container-narrow">
          <div className="contact-hero orange-panel hard-shadow rounded-2xl p-7 sm:p-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fffaf1] text-[#19ad70]"><WhatsAppIcon size={28} /></div>
            <p className="eyebrow mt-10 !text-[#ffe1cf]">WhatsApp only</p>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-[-.06em] sm:text-5xl">Let’s get your parcel moving.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#ffe1cf]">For quotes, route checks, pickup details and quick questions, send us a WhatsApp. It is the quickest way to reach the person behind the van.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="btn-secondary mt-8" data-testid="link-contact-whatsapp"><WhatsAppIcon size={19} /> WhatsApp 064 07 00 868</a>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="paper-panel rounded-2xl p-6" data-testid="card-contact-number"><Phone size={21} className="text-[#f36f21]" /><p className="mt-5 text-xs font-extrabold uppercase tracking-[.13em] text-[#779095]">Phone / WhatsApp</p><p className="mt-2 font-display text-xl font-extrabold text-[#08263d]">064 07 00 868</p></div>
            <div className="paper-panel rounded-2xl p-6" data-testid="card-contact-website"><MapPin size={21} className="text-[#f36f21]" /><p className="mt-5 text-xs font-extrabold uppercase tracking-[.13em] text-[#779095]">Website</p><p className="mt-2 font-display text-xl font-extrabold text-[#08263d]">MrParcel.co.za</p></div>
          </div>
          <div className="mt-12 border-t border-[#d7e0dc] pt-10"><SectionHeading eyebrow="Good to know" title="Keep it local. Keep it moving." body="Mr Parcel serves the West Coast and Cape Town, with a practical 150km service radius. For a quick answer about your town or parcel, WhatsApp us the details." /><Link href="/routes" className="btn-ghost mt-7" data-testid="link-contact-routes">Check our routes <ArrowRight size={17} /></Link></div>
        </div>
      </section>
      <section className="dark-panel"><div className="container-wide flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-3xl font-extrabold tracking-[-.05em]">Prefer to send the details now?</p><p className="mt-2 text-sm text-[#b8ccd7]">Use the short quote form and jump straight into WhatsApp.</p></div><Link href="/book" className="btn-primary w-fit" data-testid="link-contact-book">Get a quote <ArrowRight size={17} /></Link></div></section>
    </PageFrame>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-reveal]'));
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return <div className="site-shell"><Header /><main>{children}</main><Footer /><WhatsAppFloat /></div>;
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/routes" component={Routes} />
        <Route path="/book" component={Book} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  useEffect(() => {
    document.title = 'Mr Parcel | Same-Day Parcel Delivery West Coast & Cape Town';
    const description = 'Fast, reliable same-day parcel delivery between Velddrif, Vredenburg, Saldanha, Hopefield, Malmesbury & Cape Town. WhatsApp 064 07 00 868.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
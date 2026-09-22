import React, { useEffect } from 'react';
import {
  ExternalLink,
  Youtube,
  Globe,
  Code2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
  Share2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SEO_CONFIG } from '../config/seoConfig';

interface AbdullahHackerSEOViewProps {
  onNavigateToApp?: (view?: string) => void;
}

export const AbdullahHackerSEOView: React.FC<AbdullahHackerSEOViewProps> = ({ onNavigateToApp }) => {
  const canonicalUrl = `${SEO_CONFIG.WEBSITE_URL}${SEO_CONFIG.SEO_PAGE_PATH}`;

  // Update DOM Title, Meta Tags, Canonical Link, and JSON-LD structured data on mount
  useEffect(() => {
    // 1. Title
    const originalTitle = document.title;
    document.title = SEO_CONFIG.SEO_TITLE;

    // Helper for managing <meta> tags
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Meta description and robots
    setMetaTag('name', 'description', SEO_CONFIG.META_DESCRIPTION);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'author', SEO_CONFIG.PROFILE_NAME);

    // 3. Open Graph Tags
    setMetaTag('property', 'og:title', SEO_CONFIG.SEO_TITLE);
    setMetaTag('property', 'og:description', SEO_CONFIG.META_DESCRIPTION);
    setMetaTag('property', 'og:type', 'profile');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:site_name', SEO_CONFIG.SITE_NAME);
    setMetaTag('property', 'og:image', SEO_CONFIG.OG_IMAGE_URL);

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', SEO_CONFIG.SEO_TITLE);
    setMetaTag('name', 'twitter:description', SEO_CONFIG.META_DESCRIPTION);
    setMetaTag('name', 'twitter:image', SEO_CONFIG.OG_IMAGE_URL);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Schema.org JSON-LD Structured Data
    const schemaScriptId = 'schema-abdullah-55566-hacker';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SEO_CONFIG.WEBSITE_URL}/#website`,
          url: SEO_CONFIG.WEBSITE_URL,
          name: SEO_CONFIG.SITE_NAME,
          description: SEO_CONFIG.META_DESCRIPTION,
          inLanguage: 'en-US',
        },
        {
          '@type': 'ProfilePage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: SEO_CONFIG.SEO_TITLE,
          description: SEO_CONFIG.META_DESCRIPTION,
          isPartOf: { '@id': `${SEO_CONFIG.WEBSITE_URL}/#website` },
          about: { '@id': `${canonicalUrl}#person` },
          inLanguage: 'en-US',
          datePublished: '2026-01-01T00:00:00+00:00',
          dateModified: new Date().toISOString(),
        },
        {
          '@type': 'Person',
          '@id': `${canonicalUrl}#person`,
          name: SEO_CONFIG.PROFILE_NAME,
          alternateName: 'Abdullah55566hacker',
          jobTitle: 'Software Creator & Digital Developer',
          url: canonicalUrl,
          sameAs: [SEO_CONFIG.YOUTUBE_CHANNEL_URL],
          knowsAbout: [
            'Artificial Intelligence',
            'Full-Stack Web Development',
            'Application Building',
            'Creative Coding',
            'Technology Education',
          ],
        },
        {
          '@type': 'Organization',
          '@id': `${SEO_CONFIG.WEBSITE_URL}/#organization`,
          name: SEO_CONFIG.PROFILE_NAME,
          url: SEO_CONFIG.WEBSITE_URL,
          sameAs: [SEO_CONFIG.YOUTUBE_CHANNEL_URL],
        },
      ],
    };

    schemaScript.text = JSON.stringify(structuredData);

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById(schemaScriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [canonicalUrl]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Semantic Navigation */}
      <header className="sticky top-0 z-30 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-3" aria-label="Brand Navigation">
            <a
              href="/"
              onClick={(e) => {
                if (onNavigateToApp) {
                  e.preventDefault();
                  onNavigateToApp('dashboard-chat');
                }
              }}
              className="flex items-center gap-2.5 text-white font-bold tracking-tight hover:opacity-90 transition"
              title="Return to ThinkPulse AI Platform"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-cyan-500/20">
                A
              </div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">
                {SEO_CONFIG.PROFILE_NAME}
              </span>
            </a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={SEO_CONFIG.YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Visit official YouTube channel"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YouTube Channel</span>
              <span className="sm:hidden">YouTube</span>
            </a>

            <button
              onClick={() => (onNavigateToApp ? onNavigateToApp('dashboard-chat') : (window.location.href = '/'))}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Semantic Article Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* HERO SECTION */}
        <section
          aria-labelledby="hero-heading"
          className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-6 sm:p-10 overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Public Creator & Technology Moniker</span>
              </div>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
              >
                {SEO_CONFIG.PROFILE_NAME}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Welcome to the official public creator portal for{' '}
                <strong className="text-white font-semibold">{SEO_CONFIG.PROFILE_NAME}</strong>.
                This online brand represents creative software development, autonomous AI platform
                engineering, full-stack web builders, and educational tech projects.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={SEO_CONFIG.YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-red-600/25"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Subscribe on YouTube</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <button
                  onClick={() => (onNavigateToApp ? onNavigateToApp('dashboard-chat') : (window.location.href = '/'))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Explore ThinkPulse AI</span>
                </button>
              </div>
            </div>

            {/* Visual Avatar Card */}
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-1 shadow-2xl shadow-cyan-500/20 relative">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                    <Code2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-extrabold text-white tracking-wide">
                    {SEO_CONFIG.PROFILE_NAME}
                  </span>
                  <span className="text-[11px] text-cyan-400 mt-1 font-mono">Tech & Media Hub</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: ABOUT THE BRAND & ONLINE JOURNEY */}
        <section aria-labelledby="about-heading" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <h2 id="about-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              About the Brand: {SEO_CONFIG.PROFILE_NAME}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              The moniker <strong className="text-white font-semibold">{SEO_CONFIG.PROFILE_NAME}</strong> is
              the public identity and channel name adopted by Abdullah for publishing web development
              innovations, technological demonstrations, tutorials, and next-generation software applications.
            </p>
            <p>
              In digital culture and technical communities, creative handles like{' '}
              <span className="text-cyan-400 font-mono font-medium">"{SEO_CONFIG.PROFILE_NAME}"</span> signify a passion
              for deep systems exploration, creative software engineering, and pushing the boundaries of what is
              possible on the modern web. This public profile does not participate in or promote unauthorized
              activities; it is strictly dedicated to constructive software creation, educational programming content,
              and artificial intelligence systems.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Software Engineering</h3>
                <p className="text-xs text-slate-400">
                  Full-stack web applications, React architectures, and cloud microservices.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Autonomous AI</h3>
                <p className="text-xs text-slate-400">
                  Multimodal language models, visual studio synthesis, and reactive app builders.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Creator Community</h3>
                <p className="text-xs text-slate-400">
                  Accessible technology education, coding guides, and digital showcases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FEATURED PLATFORMS & TECHNOLOGIES */}
        <section aria-labelledby="platforms-heading" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 id="platforms-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Technologies by {SEO_CONFIG.PROFILE_NAME}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    TP
                  </div>
                  <h3 className="text-base font-bold text-white">ThinkPulse AI Autonomous Platform</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Flagship
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A multimodal artificial intelligence platform featuring low-latency streaming chat, responsive image
                generation, voice synthesis, interactive code execution, and cloud document parsing.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => (onNavigateToApp ? onNavigateToApp('dashboard-chat') : (window.location.href = '/'))}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open ThinkPulse Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                    WB
                  </div>
                  <h3 className="text-base font-bold text-white">Autonomous AI Website & App Builder</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Core Tool
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Empowering users to generate single-page applications, interactive calculators, tools, and portfolios
                instantly via natural language prompting with instant live sandbox execution.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => (onNavigateToApp ? onNavigateToApp('dashboard-website') : (window.location.href = '/'))}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Web Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 3: CONTENT & YOUTUBE MEDIA HUB */}
        <section aria-labelledby="media-heading" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Youtube className="w-4 h-4" />
            </div>
            <h2 id="media-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              YouTube Channel & Community Hub
            </h2>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-slate-900/60 to-slate-900/40 p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Official YouTube Channel: {SEO_CONFIG.PROFILE_NAME}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Follow tutorials, feature breakdowns, coding sessions, and digital product launches.
                </p>
              </div>

              <a
                href={SEO_CONFIG.YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-lg shadow-red-600/30 shrink-0"
              >
                <Youtube className="w-4 h-4" />
                <span>Visit YouTube Channel</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 font-mono break-all">
              <span className="text-slate-500 block sm:inline">Configured Channel URL: </span>
              <span className="text-red-300 font-semibold">{SEO_CONFIG.YOUTUBE_CHANNEL_URL}</span>
            </div>
          </div>
        </section>

        {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section aria-labelledby="faq-heading" className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Who is "{SEO_CONFIG.PROFILE_NAME}"?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                "{SEO_CONFIG.PROFILE_NAME}" is the public online moniker, channel name, and creator brand used by
                Abdullah to showcase artificial intelligence tools, interactive web applications, software engineering
                tutorials, and digital media projects.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                What projects are associated with this brand?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Key projects include the ThinkPulse AI Multimodal Platform, AI Web Builder, and educational video
                tutorials distributed on YouTube, providing accessible technology guidance for developers and creators.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                How can I contact or collaborate with {SEO_CONFIG.PROFILE_NAME}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                You can reach out through the official YouTube channel or via the support ticketing portal available
                inside the ThinkPulse AI dashboard.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Semantic Footer with Internal Links */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 sm:px-8 py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{SEO_CONFIG.PROFILE_NAME}</span>
            <span>•</span>
            <span>Official Public Brand & Creator Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              onClick={(e) => {
                if (onNavigateToApp) {
                  e.preventDefault();
                  onNavigateToApp('dashboard-chat');
                }
              }}
              className="hover:text-cyan-400 transition"
            >
              Home Platform
            </a>
            <a href={canonicalUrl} className="text-cyan-400 hover:underline">
              Creator Profile
            </a>
            <a
              href={SEO_CONFIG.YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-400 transition"
            >
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

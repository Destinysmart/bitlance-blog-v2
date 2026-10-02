import React, { useState, useMemo } from "react";
import {
  Search,
  Globe,
  Link2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Sparkles,
  Copy,
  Check,
  Share2,
  Twitter,
  FileCode,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Monitor,
  HelpCircle,
  Tag,
  ArrowRight,
  Maximize2
} from "lucide-react";

export interface SeoMetaFields {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  slug: string;
  robotsMeta: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  focusKeyword?: string;
  schemaData?: string;
}

export interface ArticleReference {
  id?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  featured_image?: string;
  published_at?: string;
  updated_at?: string;
  author_name?: string;
}

interface ArticleSeoMetaManagerProps {
  fields: SeoMetaFields;
  onChange: (field: keyof SeoMetaFields, value: string) => void;
  article?: ArticleReference;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
  variant?: "embedded" | "modal" | "card";
  onClose?: () => void;
}

export function ArticleSeoMetaManager({
  fields,
  onChange,
  article,
  onSave,
  isSaving = false,
  variant = "embedded",
  onClose,
}: ArticleSeoMetaManagerProps) {
  const [previewMode, setPreviewMode] = useState<
    "google-desktop" | "google-mobile" | "twitter" | "facebook" | "raw-tags" | "json-ld"
  >("google-desktop");
  const [copiedCode, setCopiedCode] = useState(false);
  const [includeBrandSuffix, setIncludeBrandSuffix] = useState(true);
  const [customCanonicalActive, setCustomCanonicalActive] = useState(
    Boolean(fields.canonicalUrl && fields.canonicalUrl.trim().length > 0)
  );

  const brandSuffix = " | BitLance";
  const defaultDomain =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://blog.bitlance.work";

  // Compute canonical URL dynamically
  const generatedCanonicalUrl = useMemo(() => {
    const cleanSlug = fields.slug || (article?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${defaultDomain}/article/${cleanSlug || "article"}`;
  }, [defaultDomain, fields.slug, article?.title]);

  const activeCanonicalUrl = fields.canonicalUrl?.trim() || generatedCanonicalUrl;

  // Clean article body text for analysis & auto-extracting
  const plainTextContent = useMemo(() => {
    if (!article?.content) return "";
    return article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }, [article?.content]);

  // Live Title & Description calculations
  const effectiveTitle = fields.seoTitle || article?.title || "Untitled Article";
  const displayTitle = includeBrandSuffix && !effectiveTitle.includes("BitLance")
    ? `${effectiveTitle}${brandSuffix}`
    : effectiveTitle;

  const effectiveDescription =
    fields.metaDescription ||
    article?.subtitle ||
    plainTextContent.slice(0, 155) ||
    "Read this in-depth guide on BitLance – The Bitcoin-native remote freelance marketplace.";

  const effectiveOgImage =
    fields.ogImage ||
    article?.featured_image ||
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2669&auto=format&fit=crop";

  // Focus Keyword Analysis
  const keyword = fields.focusKeyword?.trim().toLowerCase() || "";
  const keywordAnalysis = useMemo(() => {
    if (!keyword) return null;
    const titleMatch = effectiveTitle.toLowerCase().includes(keyword);
    const descMatch = effectiveDescription.toLowerCase().includes(keyword);
    const slugMatch = (fields.slug || "").toLowerCase().includes(keyword.replace(/\s+/g, "-"));
    
    // Count in content
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "gi");
    const count = plainTextContent ? (plainTextContent.match(regex) || []).length : 0;
    const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length || 1;
    const density = ((count / wordCount) * 100).toFixed(1);

    const first100Words = plainTextContent.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
    const inFirst100 = first100Words.includes(keyword);

    return {
      titleMatch,
      descMatch,
      slugMatch,
      count,
      density: parseFloat(density),
      inFirst100,
    };
  }, [keyword, effectiveTitle, effectiveDescription, fields.slug, plainTextContent]);

  // Overall Dynamic SEO Score Calculation
  const seoAudit = useMemo(() => {
    const checks: { label: string; passed: boolean; tip: string; weight: number }[] = [];

    // Title Length (40 - 60 chars)
    const titleLen = effectiveTitle.length;
    const titlePassed = titleLen >= 30 && titleLen <= 65;
    checks.push({
      label: "SEO Title Length",
      passed: titlePassed,
      tip: titleLen < 30 ? "Title is under 30 characters (aim for 40-60)" : titleLen > 65 ? "Title exceeds 65 characters and may truncate in Google SERP" : "Optimal length (40–60 characters)",
      weight: 20,
    });

    // Description Length (120 - 160 chars)
    const descLen = effectiveDescription.length;
    const descPassed = descLen >= 110 && descLen <= 165;
    checks.push({
      label: "Meta Description Length",
      passed: descPassed,
      tip: descLen < 110 ? "Description is too brief (aim for 120-160 chars for high CTR)" : descLen > 165 ? "Description exceeds 165 characters and will be cut off by Google" : "Optimal length (120–160 characters)",
      weight: 20,
    });

    // Canonical URL Validity
    const hasValidCanonical = Boolean(activeCanonicalUrl && /^https?:\/\//i.test(activeCanonicalUrl));
    checks.push({
      label: "Canonical URL Configured",
      passed: hasValidCanonical,
      tip: hasValidCanonical ? "Proper canonical link declared to consolidate page authority" : "Missing valid absolute canonical URL (http:// or https:// required)",
      weight: 15,
    });

    // Robots Indexing Directive
    const isIndexable = !fields.robotsMeta.toLowerCase().includes("noindex");
    checks.push({
      label: "Search Engine Indexable",
      passed: isIndexable,
      tip: isIndexable ? "Set to index, allowing search engine bots to crawl & rank" : "Currently set to 'noindex' – hidden from search engines",
      weight: 15,
    });

    // Featured / Social Image
    const hasImage = Boolean(effectiveOgImage && effectiveOgImage.startsWith("http"));
    checks.push({
      label: "Open Graph Social Image",
      passed: hasImage,
      tip: hasImage ? "Valid high-resolution image ready for Google Discover & Social share cards" : "No social preview image assigned",
      weight: 15,
    });

    // Keyword optimization (if keyword provided)
    if (keyword) {
      const kwPassed = Boolean(keywordAnalysis?.titleMatch && keywordAnalysis?.descMatch);
      checks.push({
        label: `Keyword Focus ("${keyword}")`,
        passed: kwPassed,
        tip: kwPassed
          ? "Target keyword strategically positioned in both Title tag and Meta Description"
          : "Include target keyword in both SEO Title and Meta Description",
        weight: 15,
      });
    } else {
      // Content Length check
      const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;
      const contentLenPassed = wordCount >= 300;
      checks.push({
        label: "Comprehensive Content Depth",
        passed: contentLenPassed,
        tip: contentLenPassed ? `High content depth (${wordCount} words)` : `Article is under 300 words (${wordCount} words) – expand content for ranking power`,
        weight: 15,
      });
    }

    const totalWeight = checks.reduce((acc, c) => acc + c.weight, 0);
    const passedWeight = checks.filter((c) => c.passed).reduce((acc, c) => acc + c.weight, 0);
    const score = Math.round((passedWeight / totalWeight) * 100);

    return { score, checks };
  }, [effectiveTitle, effectiveDescription, activeCanonicalUrl, fields.robotsMeta, effectiveOgImage, keyword, keywordAnalysis, plainTextContent]);

  // Helper actions
  const autoOptimizeFromContent = () => {
    if (article?.title) {
      onChange("seoTitle", article.title.trim());
    }
    if (article?.subtitle && article.subtitle.length >= 80) {
      onChange("metaDescription", article.subtitle.trim());
    } else if (plainTextContent) {
      const cleanSnippet = plainTextContent.slice(0, 155).trim() + "...";
      onChange("metaDescription", cleanSnippet);
    }
    if (!fields.slug && article?.title) {
      const generatedSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      onChange("slug", generatedSlug);
    }
  };

  const handleCopyTags = () => {
    const rawTags = `<!-- SEO Meta Tags Generated by BitLance CMS -->
<title>${displayTitle}</title>
<meta name="title" content="${displayTitle}" />
<meta name="description" content="${effectiveDescription}" />
<meta name="robots" content="${fields.robotsMeta || "index, follow"}" />
<link rel="canonical" href="${activeCanonicalUrl}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article" />
<meta property="og:url" content="${activeCanonicalUrl}" />
<meta property="og:title" content="${fields.ogTitle || displayTitle}" />
<meta property="og:description" content="${fields.ogDescription || effectiveDescription}" />
<meta property="og:image" content="${effectiveOgImage}" />

<!-- Twitter / X -->
<meta property="twitter:card" content="${fields.twitterCard || "summary_large_image"}" />
<meta property="twitter:url" content="${activeCanonicalUrl}" />
<meta property="twitter:title" content="${fields.ogTitle || displayTitle}" />
<meta property="twitter:description" content="${fields.ogDescription || effectiveDescription}" />
<meta property="twitter:image" content="${effectiveOgImage}" />`;

    navigator.clipboard.writeText(rawTags);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const generatedJsonLd = useMemo(() => {
    if (fields.schemaData && fields.schemaData.trim().startsWith("{")) {
      return fields.schemaData;
    }
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": activeCanonicalUrl,
      },
      "headline": effectiveTitle,
      "description": effectiveDescription,
      "image": [effectiveOgImage],
      "datePublished": article?.published_at || new Date().toISOString(),
      "dateModified": article?.updated_at || article?.published_at || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": article?.author_name || "BitLance Team",
        "url": `${defaultDomain}/about`,
      },
      "publisher": {
        "@type": "Organization",
        "name": "BitLance",
        "logo": {
          "@type": "ImageObject",
          "url": `${defaultDomain}/logo.png`,
        },
      },
    };
    return JSON.stringify(schema, null, 2);
  }, [fields.schemaData, activeCanonicalUrl, effectiveTitle, effectiveDescription, effectiveOgImage, article, defaultDomain]);

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col ${
        variant === "modal" ? "max-w-5xl w-full max-h-[90vh]" : "w-full"
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-slate-900 text-white p-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                Article SEO & Meta-Tag Manager
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                Dynamic Engine
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Fine-tune title tags, search snippets, canonical URLs & social sharing cards for maximum Google & AI visibility.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* SEO Health Badge */}
          <div className="flex items-center gap-2.5 bg-gray-800/80 border border-gray-700/60 rounded-2xl px-4 py-2">
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                SEO Score
              </div>
              <div className="text-base font-black text-white leading-none">
                {seoAudit.score}
                <span className="text-xs text-gray-400 font-semibold">/100</span>
              </div>
            </div>
            <div
              className={`h-3 w-3 rounded-full animate-pulse ${
                seoAudit.score >= 80
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                  : seoAudit.score >= 60
                  ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                  : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
              }`}
            />
          </div>

          {/* Quick Auto-Optimize button */}
          <button
            type="button"
            onClick={autoOptimizeFromContent}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Auto-fill title, excerpt description and slug from article content"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            Auto-Extract
          </button>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Save Changes
                </>
              )}
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Editor Controls + Right Live Simulation Preview */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 bg-gray-50/50">
        {/* LEFT COLUMN: Meta Tag Input Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 bg-white">
          {/* 1. SEO Title Management */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-brand-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-brand-600" />
                SEO Title Tag (`&lt;title&gt;`)
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    effectiveTitle.length >= 35 && effectiveTitle.length <= 60
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : effectiveTitle.length > 60
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {effectiveTitle.length} / 60 chars
                </span>
                <label className="flex items-center gap-1 text-[11px] text-gray-500 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBrandSuffix}
                    onChange={(e) => setIncludeBrandSuffix(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                  />
                  + Brand Suffix
                </label>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={article?.title || "e.g., The Ultimate Guide to Bitcoin Freelancing in 2026"}
                value={fields.seoTitle}
                onChange={(e) => onChange("seoTitle", e.target.value)}
                className="w-full text-sm font-medium border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Visual length progress meter */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-400">
              <span>Pixel Width preview: ~{Math.min(600, Math.round(displayTitle.length * 9.5))}px / 580px max</span>
              <span>{displayTitle.length > 60 ? "May truncate on Google search snippets" : "Optimal SERP display"}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  effectiveTitle.length >= 35 && effectiveTitle.length <= 60
                    ? "bg-emerald-500"
                    : effectiveTitle.length > 60
                    ? "bg-red-500"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.min(100, (effectiveTitle.length / 65) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Meta Description Management */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-brand-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-brand-600" />
                Meta Description (`&lt;meta name="description"&gt;`)
              </label>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  effectiveDescription.length >= 120 && effectiveDescription.length <= 160
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : effectiveDescription.length > 160
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {effectiveDescription.length} / 160 chars
              </span>
            </div>

            <textarea
              rows={3}
              placeholder="Write a clear, compelling summary (120-160 characters) that encourages searchers to click through from Google..."
              value={fields.metaDescription}
              onChange={(e) => onChange("metaDescription", e.target.value)}
              className="w-full text-sm font-medium border border-gray-200 rounded-xl p-3.5 bg-white text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50 transition-all placeholder:text-gray-400 resize-none"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>Goal: 120 - 160 characters</span>
              <button
                type="button"
                onClick={() => {
                  if (plainTextContent) {
                    onChange("metaDescription", plainTextContent.slice(0, 155).trim() + "...");
                  }
                }}
                className="text-brand-600 hover:text-brand-700 font-bold hover:underline cursor-pointer"
              >
                Extract from Article Body
              </button>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  effectiveDescription.length >= 120 && effectiveDescription.length <= 160
                    ? "bg-emerald-500"
                    : effectiveDescription.length > 160
                    ? "bg-red-500"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.min(100, (effectiveDescription.length / 165) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3. Canonical URL Management */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:border-brand-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-brand-600" />
                Canonical URL (`&lt;link rel="canonical"&gt;`)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !customCanonicalActive;
                    setCustomCanonicalActive(next);
                    if (!next) {
                      onChange("canonicalUrl", "");
                    }
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    customCanonicalActive
                      ? "bg-brand-50 text-brand-700 border border-brand-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {customCanonicalActive ? "Custom Override: On" : "Using Default"}
                </button>
              </div>
            </div>

            {customCanonicalActive ? (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://blog.bitlance.work/article/your-preferred-canonical"
                    value={fields.canonicalUrl}
                    onChange={(e) => onChange("canonicalUrl", e.target.value)}
                    className="w-full text-sm font-medium border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50 transition-all placeholder:text-gray-400"
                  />
                </div>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Consolidates search ranking signals if this article is published across syndication partners.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3 flex items-center justify-between text-xs text-gray-700">
                <div className="truncate font-mono text-[11px]">
                  {generatedCanonicalUrl}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200">
                  Auto-Resolved
                </span>
              </div>
            )}

            {/* Slug Configuration */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-600">URL Slug Path:</span>
              <div className="flex-1 max-w-sm">
                <div className="flex rounded-xl shadow-xs">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-xs font-mono">
                    /article/
                  </span>
                  <input
                    type="text"
                    placeholder="article-slug"
                    value={fields.slug}
                    onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="flex-1 min-w-0 block w-full px-3 py-2 text-xs font-mono rounded-none rounded-r-xl border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Robots Directives & Focus Keyword */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Robots directive */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                Robots Indexing Directive
              </label>
              <select
                value={fields.robotsMeta}
                onChange={(e) => onChange("robotsMeta", e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none focus:border-brand-500"
              >
                <option value="index, follow">Index, Follow (Recommended / Default)</option>
                <option value="noindex, follow">Noindex, Follow (Internal / Unlisted)</option>
                <option value="index, nofollow">Index, Nofollow (Do not pass link equity)</option>
                <option value="noindex, nofollow">Noindex, Nofollow (Hidden draft)</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Instructs Googlebot and Bingbot whether to index and crawl outbound hyperlinks.
              </p>
            </div>

            {/* Focus Keyword */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <label className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5 mb-2">
                <Tag className="h-3.5 w-3.5 text-brand-600" />
                Focus Keyphrase / Topic
              </label>
              <input
                type="text"
                placeholder="e.g., lightning payments"
                value={fields.focusKeyword || ""}
                onChange={(e) => onChange("focusKeyword", e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none focus:border-brand-500"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                Audits keyphrase occurrence in Title, Meta Description, URL and article text.
              </p>
            </div>
          </div>

          {/* Keyword Audit Results (if keyword set) */}
          {keyword && keywordAnalysis && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Keyphrase Audit: &ldquo;{keyword}&rdquo;</span>
                <span className="text-[11px] font-semibold text-amber-800">
                  {keywordAnalysis.count} mentions ({keywordAnalysis.density}% density)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div
                  className={`p-2 rounded-xl flex items-center gap-1.5 font-medium ${
                    keywordAnalysis.titleMatch
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "bg-red-100/70 text-red-800"
                  }`}
                >
                  {keywordAnalysis.titleMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <span>In Title</span>
                </div>

                <div
                  className={`p-2 rounded-xl flex items-center gap-1.5 font-medium ${
                    keywordAnalysis.descMatch
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "bg-red-100/70 text-red-800"
                  }`}
                >
                  {keywordAnalysis.descMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <span>In Description</span>
                </div>

                <div
                  className={`p-2 rounded-xl flex items-center gap-1.5 font-medium ${
                    keywordAnalysis.slugMatch
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "bg-amber-100/70 text-amber-800"
                  }`}
                >
                  {keywordAnalysis.slugMatch ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>In URL Slug</span>
                </div>

                <div
                  className={`p-2 rounded-xl flex items-center gap-1.5 font-medium ${
                    keywordAnalysis.inFirst100
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "bg-amber-100/70 text-amber-800"
                  }`}
                >
                  {keywordAnalysis.inFirst100 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>In Intro (100w)</span>
                </div>
              </div>
            </div>
          )}

          {/* Social Overrides Collapsible Accordion */}
          <details className="group border border-gray-200/80 rounded-2xl p-4 bg-white">
            <summary className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center justify-between cursor-pointer list-none">
              <span className="flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-brand-600" />
                Custom Social Sharing Overrides (Open Graph & Twitter)
              </span>
              <span className="text-[11px] font-semibold text-brand-600 group-open:rotate-90 transition-transform">
                Configure &rarr;
              </span>
            </summary>
            <div className="pt-4 space-y-3 border-t border-gray-100 mt-3 text-xs">
              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Social Title Override (`og:title`)
                </label>
                <input
                  type="text"
                  placeholder="Defaults to SEO Title if left empty"
                  value={fields.ogTitle || ""}
                  onChange={(e) => onChange("ogTitle", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Social Description Override (`og:description`)
                </label>
                <textarea
                  rows={2}
                  placeholder="Defaults to Meta Description if left empty"
                  value={fields.ogDescription || ""}
                  onChange={(e) => onChange("ogDescription", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="text-gray-600 font-semibold block mb-1">
                  Social Image URL (`og:image`)
                </label>
                <input
                  type="url"
                  placeholder="Defaults to Article Featured Image"
                  value={fields.ogImage || ""}
                  onChange={(e) => onChange("ogImage", e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-600 font-semibold">Twitter Card Style:</span>
                <select
                  value={fields.twitterCard || "summary_large_image"}
                  onChange={(e) => onChange("twitterCard", e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
                >
                  <option value="summary_large_image">summary_large_image (Large Hero Card)</option>
                  <option value="summary">summary (Compact Square Thumbnail)</option>
                </select>
              </div>
            </div>
          </details>
        </div>

        {/* RIGHT COLUMN: Live Interactive SERP & Social Card Simulation */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col bg-slate-50/70">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-brand-600" />
                Live Search & Social Preview
              </span>

              {/* View Switcher Pills */}
              <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-2xs gap-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewMode("google-desktop")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewMode === "google-desktop"
                      ? "bg-brand-500 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Google Desktop SERP"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("google-mobile")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewMode === "google-mobile"
                      ? "bg-brand-500 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Google Mobile SERP"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("twitter")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewMode === "twitter"
                      ? "bg-brand-500 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Twitter / X Card"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("facebook")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewMode === "facebook"
                      ? "bg-brand-500 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Open Graph / Facebook Card"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("raw-tags")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewMode === "raw-tags"
                      ? "bg-brand-500 text-white"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="HTML Meta Tags Inspector"
                >
                  <FileCode className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 overflow-hidden transition-all">
              {/* 1. GOOGLE DESKTOP SERP */}
              {previewMode === "google-desktop" && (
                <div className="space-y-1.5 text-left font-sans select-none">
                  {/* Breadcrumb line */}
                  <div className="flex items-center gap-2 text-xs text-[#202124]">
                    <div className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      B
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-[#202124]">BitLance Blog</span>
                      <span className="text-[#5f6368] text-[11px] ml-1.5 truncate">
                        https://blog.bitlance.work &rsaquo; article &rsaquo; {fields.slug || "guide"}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer leading-snug break-words">
                    {displayTitle}
                  </h3>

                  {/* Snippet Description */}
                  <p className="text-xs text-[#4d5156] leading-relaxed break-words">
                    <span className="text-[#70757a] mr-1.5 font-medium">
                      {article?.published_at
                        ? new Date(article.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) + " —"
                        : "Sep 24, 2026 —"}
                    </span>
                    {effectiveDescription}
                  </p>
                </div>
              )}

              {/* 2. GOOGLE MOBILE SERP */}
              {previewMode === "google-mobile" && (
                <div className="max-w-[340px] mx-auto bg-white p-3 rounded-2xl border border-gray-200/80 shadow-xs space-y-2 select-none">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-6 w-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                      B
                    </div>
                    <div className="text-[11px] leading-tight">
                      <div className="font-bold text-[#202124]">BitLance</div>
                      <div className="text-[#5f6368] text-[10px] truncate max-w-[220px]">
                        blog.bitlance.work &rsaquo; article
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-[#1a0dab] leading-snug">
                    {displayTitle}
                  </h3>

                  {effectiveOgImage && (
                    <div className="rounded-xl overflow-hidden aspect-[16/9] bg-gray-100">
                      <img
                        src={effectiveOgImage}
                        alt="Mobile SERP snippet"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs text-[#4d5156] leading-relaxed">
                    {effectiveDescription}
                  </p>
                </div>
              )}

              {/* 3. TWITTER / X CARD */}
              {previewMode === "twitter" && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-black text-white select-none">
                  {effectiveOgImage && (
                    <div className="aspect-[1.91/1] w-full bg-gray-900 relative">
                      <img
                        src={effectiveOgImage}
                        alt="Twitter Card"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300">
                        blog.bitlance.work
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-gray-950 space-y-1">
                    <div className="text-xs text-gray-400 font-medium">blog.bitlance.work</div>
                    <h4 className="text-sm font-bold text-gray-100 line-clamp-1">
                      {fields.ogTitle || displayTitle}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {fields.ogDescription || effectiveDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. FACEBOOK / LINKEDIN CARD */}
              {previewMode === "facebook" && (
                <div className="border border-gray-300 rounded-xl overflow-hidden bg-[#f0f2f5] select-none">
                  {effectiveOgImage && (
                    <div className="aspect-[1.91/1] w-full bg-gray-200">
                      <img
                        src={effectiveOgImage}
                        alt="Open Graph Card"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3 bg-[#f0f2f5] space-y-0.5 border-t border-gray-200">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      BLOG.BITLANCE.WORK
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {fields.ogTitle || displayTitle}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {fields.ogDescription || effectiveDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* 5. RAW HTML META TAGS INSPECTOR */}
              {previewMode === "raw-tags" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500 text-[11px]">
                      Rendered &lt;head&gt; HTML Output
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTags}
                      className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCode ? "Copied!" : "Copy HTML"}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono bg-gray-900 text-emerald-400 p-3.5 rounded-xl overflow-x-auto max-h-[260px] leading-relaxed">
{`<title>${displayTitle}</title>
<meta name="description" content="${effectiveDescription}" />
<link rel="canonical" href="${activeCanonicalUrl}" />
<meta name="robots" content="${fields.robotsMeta}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${activeCanonicalUrl}" />
<meta property="og:title" content="${fields.ogTitle || displayTitle}" />
<meta property="og:description" content="${fields.ogDescription || effectiveDescription}" />
<meta property="og:image" content="${effectiveOgImage}" />
<meta name="twitter:card" content="${fields.twitterCard || "summary_large_image"}" />`}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Actionable SEO Checklist & Recommendations */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center justify-between">
              <span>SEO Audit Checklist</span>
              <span className="text-brand-600 font-bold">
                {seoAudit.checks.filter((c) => c.passed).length} / {seoAudit.checks.length} Passed
              </span>
            </h4>

            <div className="space-y-2">
              {seoAudit.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                    chk.passed
                      ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                      : "bg-amber-50/60 border-amber-200/80 text-amber-950"
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>{chk.label}</span>
                      <span className="text-[10px] font-semibold opacity-75">
                        +{chk.weight} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      {chk.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Rich Results JSON-LD snippet expander */}
          <details className="border border-gray-200 rounded-2xl p-4 bg-white text-xs">
            <summary className="font-bold text-gray-800 cursor-pointer flex items-center justify-between list-none">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-brand-600" />
                Schema.org Article (JSON-LD) Output
              </span>
              <span className="text-gray-400 text-[10px]">Inspect JSON &rarr;</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <pre className="p-3 bg-gray-900 text-amber-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48">
                {generatedJsonLd}
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

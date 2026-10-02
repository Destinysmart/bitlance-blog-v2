import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, Check, ArrowRight, Loader2 } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const loadArticleData = () => {
    fetch(`/api/articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.content, "text/html");
        const headers = doc.querySelectorAll("h2, h3");
        const extractedToc: { id: string; text: string; level: number }[] = [];

        headers.forEach((header, index) => {
          const id =
            header.id ||
            `heading-${index}-${(header.textContent || "").replace(/[^\w]+/g, "-").toLowerCase()}`;
          header.id = id;
          extractedToc.push({
            id,
            text: header.textContent || "",
            level: parseInt(header.tagName.substring(1), 10),
          });
        });

        setToc(extractedToc);
        setArticle({ ...data, content: doc.body.innerHTML });

        // Fetch author
        if (data.author_id) {
          fetch(`/api/users`)
            .then((r) => r.json())
            .then((uList) => {
              const foundUser = uList.find((u: any) => u.id === data.author_id);
              setAuthor(foundUser);
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!article) return;
    fetch("/api/articles?status=published")
      .then((r) => r.json())
      .then((data) => {
        const others = data.filter((a: any) => a.id !== article.id);
        const sorted = others.sort((a: any, b: any) => {
          if (a.category_id === article.category_id && b.category_id !== article.category_id) return -1;
          if (a.category_id !== article.category_id && b.category_id === article.category_id) return 1;
          return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
        });
        setRelatedArticles(sorted.slice(0, 3));
      })
      .catch(console.error);
  }, [article]);

  const getCategoryName = (id: string, art?: any) => {
    if (id === "c_security" || art?.tags?.includes("Security")) return "Security";
    if (id === "c2") return "Success Stories";
    if (id === "c3") return "Guides";
    if (id === "c4") return "Tutorials";
    if (id === "c1" || id === "c5") return "Product";
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "Guides";
  };

  const getReadingTimeForArticle = (art: any) => {
    if (art.reading_time) return art.reading_time;
    const text = art.content ? art.content.replace(/<[^>]+>/g, "") : "";
    const words = text.trim().split(/\s+/).length || 1;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  useEffect(() => {
    loadArticleData();
  }, [slug]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setReadingProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen pt-32 text-center text-[#6B6B6B] font-sans">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F2861D] mb-3" />
        <p className="text-sm font-semibold">Loading article...</p>
      </div>
    );
  }

  const categoryName = getCategoryName(article.category_id, article);

  return (
    <div className="min-h-screen bg-[#FAF6EF] font-sans selection:bg-[#F2861D] selection:text-white">
      <SEO
        type="article"
        title={article.seo_title || `${article.title} | BitLance Blog`}
        description={
          article.meta_description ||
          article.subtitle ||
          article.content?.replace(/<[^>]+>/g, "").substring(0, 155) ||
          "Read this article on BitLance Blog."
        }
        image={article.og_image || article.featured_image}
        url={article.canonical_url || `https://blog.bitlance.work/article/${article.slug || article.id}`}
        publishedTime={article.published_at || article.created_at}
        modifiedTime={article.updated_at || article.published_at || article.created_at}
        authorName={author?.name || "BitLance Core Team"}
        articleBody={article.content?.replace(/<[^>]+>/g, "")}
        robotsMeta={article.robots_meta || "index, follow"}
        canonicalUrl={article.canonical_url || `https://blog.bitlance.work/article/${article.slug || article.id}`}
        ogTitle={article.og_title}
        ogDescription={article.og_description}
        ogImage={article.og_image}
        twitterCard={article.twitter_card || "summary_large_image"}
        schemaData={article.schema_data}
        faqs={article.faqs}
        breadcrumbs={[
          { name: "Blog", item: "/" },
          { name: categoryName, item: `/category/${categoryName.toLowerCase()}` },
          { name: article.title, item: `/article/${article.slug || article.id}` },
        ]}
      />

      {/* Smooth Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-[#F2861D] z-[60] transition-all duration-150 ease-out shadow-xs"
        style={{ width: `${readingProgress}%` }}
      />

      <Navigation />

      <article className="pt-8 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumbs
            items={[
              { name: "Blog", path: "/" },
              { name: categoryName, path: `/category/${categoryName.toLowerCase()}` },
              { name: article.title, path: `/article/${article.slug || article.id}` },
            ]}
          />
        </div>

        {/* EDITORIAL ARTICLE HEADER */}
        <header className="max-w-4xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-[1.14] tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-xl text-[#6B6B6B] mb-8 leading-relaxed font-normal">
              {article.subtitle}
            </p>
          )}

          {/* Author Row & Social Share Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
                alt={author?.name || "Author"}
                className="w-10 h-10 rounded-full object-cover shadow-2xs"
              />
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {author?.name || "Bitlance Core Team"}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-medium">
                  <span>
                    {new Date(article.published_at || article.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{getReadingTimeForArticle(article)}</span>
                </div>
              </div>
            </div>

            {/* Minimalist Sharing Actions */}
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://blog.bitlance.work/article/${article.slug || article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X"
                aria-label="Share on X"
                className="w-9 h-9 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://blog.bitlance.work/article/${article.slug || article.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
                className="w-9 h-9 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-[#6B6B6B] hover:text-blue-700 flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Link"
                aria-label="Copy Article Link"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                    <span className="text-[#16A34A]">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden bg-black/5 mb-14 shadow-sm">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Content Layout with Table of Contents Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Table of Contents Sticky Sidebar */}
          {toc.length > 0 ? (
            <aside className="lg:col-span-3 hidden lg:block">
              <div className="sticky top-28 space-y-5">
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-3">
                    On this page
                  </h3>
                  <nav className="space-y-2" aria-label="Table of Contents">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`block text-xs text-[#6B6B6B] hover:text-[#F2861D] transition-colors line-clamp-1 py-0.5 ${
                          item.level === 3 ? "pl-3 font-normal" : "font-medium"
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          ) : (
            <div className="hidden lg:block lg:col-span-2" />
          )}

          {/* Main Article Body */}
          <main className={toc.length > 0 ? "lg:col-span-9 max-w-3xl" : "lg:col-span-8 lg:col-start-3 max-w-3xl"}>
            <div
              className="prose prose-lg max-w-none text-[#1A1A1A] leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Author Attribution Card */}
            <div className="mt-14 pt-8 flex items-center gap-4">
              <img
                src={author?.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"}
                alt={author?.name || "Author"}
                className="w-12 h-12 rounded-full object-cover shrink-0 shadow-2xs"
              />
              <div>
                <p className="text-xs uppercase tracking-wider text-[#6B6B6B] font-semibold">Written by</p>
                <h3 className="text-base font-bold text-[#1A1A1A]">
                  {author?.name || "Bitlance Core Team"}
                </h3>
                <p className="text-xs text-[#6B6B6B] font-normal mt-0.5 max-w-md">
                  Research and insights on Lightning Network payments, remote Bitcoin work, and freelancing.
                </p>
              </div>
            </div>
          </main>
        </div>

        {/* Related Articles 3-Card Grid */}
        {relatedArticles.length > 0 && (
          <section className="mt-20 pt-8">
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-6">
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/article/${rel.slug || rel.id}`}
                  className="group flex flex-col h-full bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_20px_32px_-6px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-black/5 mb-4 shrink-0">
                    <img
                      src={rel.featured_image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#F2861D] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                  <p className="text-[#6B6B6B] text-xs leading-relaxed mb-4 line-clamp-2 flex-grow font-normal">
                    {rel.subtitle || rel.content?.replace(/<[^>]+>/g, "").substring(0, 110)}...
                  </p>
                  <div className="flex items-center gap-2 pt-3 mt-auto text-xs text-[#6B6B6B] font-medium">
                    <span>
                      {new Date(rel.published_at || rel.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>{getReadingTimeForArticle(rel)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </article>

      <Footer />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import {
  Check,
  Loader2,
} from "lucide-react";

// Category Tabs with Bitlance Moderate Radius
const EDITORIAL_PILLARS = [
  { id: "all", label: "All Posts", type: "all", slug: "" },
  { id: "guides", label: "Guides", type: "category", slug: "guides" },
  { id: "tutorials", label: "Tutorials", type: "category", slug: "tutorials" },
  { id: "security", label: "Security", type: "category", slug: "security" },
  { id: "success-stories", label: "Success Stories", type: "category", slug: "success-stories" },
  { id: "product", label: "Product Updates", type: "category", slug: "product" }
];

export function HomePage() {
  const { categorySlug, topicSlug, featuredSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(console.error);

    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => setTopics(data))
      .catch(console.error);

    fetch("/api/featured-collections")
      .then((r) => r.json())
      .then((data) => setFeaturedCollections(data))
      .catch(console.error);

    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error);

    fetch("/api/articles?status=published")
      .then((r) => r.json())
      .then((data) => {
        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(b.published_at || b.created_at).getTime() -
            new Date(a.published_at || a.created_at).getTime(),
        );
        setArticles(sorted);
      })
      .catch(console.error);
  }, []);

  const finalCategorySlug = categorySlug || searchParams.get("category");
  const finalTopicSlug = topicSlug || searchParams.get("topic");
  const finalFeaturedSlug = featuredSlug || searchParams.get("featured");

  const activeCategoryObj = categories.find((c) => c.slug === finalCategorySlug);
  const activeTopicObj = topics.find((t) => t.slug === finalTopicSlug);
  const activeFeaturedObj = featuredCollections.find((f) => f.slug === finalFeaturedSlug);

  // Filter articles based on active selections
  const filteredArticles = articles.filter((article) => {
    if (activeCategoryObj) {
      if (activeCategoryObj.slug === "security") {
        return (
          article.category_id === "c_security" ||
          article.tags?.some((t: string) => t.toLowerCase() === "security") ||
          article.title?.toLowerCase().includes("security") ||
          article.title?.toLowerCase().includes("custody")
        );
      }
      if (activeCategoryObj.slug === "guides") {
        return article.category_id === "c3" || article.tags?.some((t: string) => t.toLowerCase() === "guides");
      }
      if (activeCategoryObj.slug === "tutorials") {
        return article.category_id === "c4" || article.tags?.some((t: string) => t.toLowerCase() === "tutorials");
      }
      if (activeCategoryObj.slug === "success-stories") {
        return article.category_id === "c2" || article.tags?.some((t: string) => t.toLowerCase().includes("stories"));
      }
      if (activeCategoryObj.slug === "product") {
        return article.category_id === "c1" || article.category_id === "c5";
      }
      return article.category_id === activeCategoryObj.id;
    }

    if (activeTopicObj) {
      const topicNameLower = activeTopicObj.name.toLowerCase();
      const hasTag = article.tags?.some((t: string) => t.toLowerCase() === topicNameLower);
      const inTitle = article.title?.toLowerCase().includes(topicNameLower);
      const inSubtitle = article.subtitle?.toLowerCase().includes(topicNameLower);
      if (!hasTag && !inTitle && !inSubtitle) return false;
    }

    if (activeFeaturedObj) {
      const fSlug = activeFeaturedObj.slug;
      if (fSlug === "editors-picks") return ["a_11", "a_1", "a_12"].includes(article.id);
      if (fSlug === "most-popular" || fSlug === "trending") return (article.view_count || 0) > 3000;
      if (fSlug === "latest") return true;
      if (fSlug === "beginner-friendly") return article.category_id === "c3" || article.category_id === "c4";
    }

    return true;
  });

  // Hero Split Layout:
  const leadArticle = filteredArticles[0];
  const topStories = filteredArticles.slice(1, 4);
  const mainGridArticles = filteredArticles.slice(4);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(mainGridArticles.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, topicSlug, featuredSlug, searchParams]);

  const startIndex = (currentPage - 1) * pageSize;
  const displayedArticles = mainGridArticles.slice(startIndex, startIndex + pageSize);

  const getCategoryName = (categoryId: string, article?: any) => {
    if (categoryId === "c_security" || article?.tags?.includes("Security")) return "Security";
    if (categoryId === "c2") return "Success Stories";
    if (categoryId === "c3") return "Guides";
    if (categoryId === "c4") return "Tutorials";
    if (categoryId === "c1" || categoryId === "c5") return "Product";
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Guides";
  };

  const getAuthor = (authorId: string) => {
    return (
      users.find((u) => u.id === authorId) || {
        name: "BitLance Core Team",
        avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      }
    );
  };

  const getReadingTime = (article: any) => {
    if (article.reading_time) return article.reading_time;
    const text = article.content ? article.content.replace(/<[^>]+>/g, "") : "";
    const words = text.trim().split(/\s+/).length || 1;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const activeSelectionName =
    activeCategoryObj?.name ||
    activeTopicObj?.name ||
    activeFeaturedObj?.name ||
    "";

  const dynamicTitle = activeSelectionName
    ? `${activeSelectionName} - Bitlance Blog`
    : "Bitlance Blog";

  const dynamicDescription = activeSelectionName
    ? `Explore guides, payment security, and updates on ${activeSelectionName} on Bitlance.`
    : "The simplest freelance platform for the Bitcoin economy.";

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    setTimeout(() => {
      setNewsletterLoading(false);
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-[#1A1A1A] font-sans selection:bg-[#F2861D] selection:text-white">
      <SEO
        title={dynamicTitle}
        description={dynamicDescription}
        orgSchema={true}
        breadcrumbs={
          activeSelectionName
            ? [
                { name: "Blog", item: "/" },
                {
                  name: activeSelectionName,
                  item: `/category/${finalCategorySlug || finalTopicSlug || finalFeaturedSlug}`,
                },
              ]
            : [{ name: "Blog", item: "/" }]
        }
        canonicalUrl="https://blog.bitlance.work/"
      />

      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        
        {/* Blog Header */}
        <div className="max-w-4xl mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.08] mb-3 sm:mb-4 text-balance">
            Bitlance Blog
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#6B6B6B] leading-relaxed font-normal max-w-2xl text-balance">
            The simplest freelance platform for the Bitcoin economy.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {EDITORIAL_PILLARS.map((filter) => {
              let isActive = false;
              if (filter.type === "all") {
                isActive = !finalCategorySlug && !finalTopicSlug && !finalFeaturedSlug;
              } else if (filter.type === "category") {
                isActive = finalCategorySlug === filter.slug;
              }

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    if (filter.type === "all") {
                      navigate("/");
                    } else {
                      navigate(`/category/${filter.slug}`);
                    }
                  }}
                  className={`min-h-[38px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-97 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2861D] ${
                    isActive
                      ? "bg-[#1A1A1A] text-white shadow-xs"
                      : "text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-black/5"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN HERO SPLIT LAYOUT */}
        {leadArticle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 mb-16 lg:mb-24 items-stretch">
            
            {/* Left Column: Prominent Lead Feature Story (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col">
              <Link
                to={`/article/${leadArticle.slug || leadArticle.id}`}
                className="group flex flex-col h-full bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_20px_32px_-6px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                {/* Responsive 16:10 (mobile) to 16:9 (tablet/desktop) Image */}
                <div className="aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-black/5 mb-5 sm:mb-6 shrink-0">
                  <img
                    src={leadArticle.featured_image || "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2670&auto=format&fit=crop"}
                    alt={leadArticle.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-[2.2rem] font-bold text-[#1A1A1A] leading-[1.18] mb-3 group-hover:text-[#F2861D] transition-colors text-balance">
                  {leadArticle.title}
                </h2>

                <p className="text-[#6B6B6B] text-xs sm:text-sm lg:text-base leading-relaxed mb-6 font-normal line-clamp-2 sm:line-clamp-3 flex-grow">
                  {leadArticle.subtitle || leadArticle.content?.replace(/<[^>]+>/g, "").substring(0, 190) + "..."}
                </p>

                {/* Bottom Row: Metadata */}
                <div className="flex items-center gap-3 pt-4 mt-auto">
                  <img
                    src={getAuthor(leadArticle.author_id).avatar}
                    alt={getAuthor(leadArticle.author_id).name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs"
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6B6B6B] font-medium">
                    <span className="font-semibold text-[#1A1A1A]">{getAuthor(leadArticle.author_id).name}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {new Date(leadArticle.published_at || leadArticle.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{getReadingTime(leadArticle)}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Column: Curated Stories (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] pb-2 mb-3">
                  Curated Stories
                </h3>

                <div className="space-y-3.5">
                  {topStories.map((story) => (
                    <Link
                      key={story.id}
                      to={`/article/${story.slug || story.id}`}
                      className="group flex gap-3.5 sm:gap-4 p-3 rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03),0_6px_12px_-2px_rgba(0,0,0,0.02)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05),0_12px_20px_-4px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-20 h-20 sm:w-22 sm:h-20 rounded-xl overflow-hidden bg-black/5 shrink-0">
                        <img
                          src={story.featured_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] leading-snug group-hover:text-[#F2861D] transition-colors line-clamp-2 mb-1.5">
                          {story.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] font-medium mt-auto">
                          <span>
                            {new Date(story.published_at || story.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>·</span>
                          <span>{getReadingTime(story)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 3-COLUMN EDITORIAL ARTICLE GRID */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
              {activeSelectionName ? `${activeSelectionName} Articles` : "Latest Articles"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {displayedArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug || article.id}`}
                className="group flex flex-col h-full bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_20px_32px_-6px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-black/5 mb-5 shrink-0">
                  <img
                    src={article.featured_image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2 leading-snug group-hover:text-[#F2861D] transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed mb-6 line-clamp-2 flex-grow font-normal">
                  {article.subtitle || article.content?.replace(/<[^>]+>/g, "").substring(0, 120) + "..."}
                </p>

                {/* Card Author & Time Metadata */}
                <div className="flex items-center gap-3 pt-4 mt-auto">
                  <img
                    src={getAuthor(article.author_id).avatar}
                    alt={getAuthor(article.author_id).name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1A1A1A] truncate">
                      {getAuthor(article.author_id).name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B6B6B] mt-0.5">
                      <span>
                        {new Date(article.published_at || article.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span>{getReadingTime(article)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination with modern borderless style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-14 pt-8">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`min-h-[40px] px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all select-none ${
                  currentPage === 1
                    ? "bg-transparent text-[#9CA3AF] cursor-not-allowed opacity-40"
                    : "bg-white text-[#1A1A1A] hover:bg-black/5 shadow-xs active:scale-97 cursor-pointer"
                }`}
              >
                Previous
              </button>

              <div className="text-xs sm:text-sm font-semibold text-[#1A1A1A] px-3">
                Page {currentPage} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`min-h-[40px] px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all text-white select-none ${
                  currentPage === totalPages
                    ? "bg-transparent text-[#9CA3AF] cursor-not-allowed opacity-40"
                    : "bg-[#1A1A1A] hover:bg-black shadow-xs active:scale-97 cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* NEWSLETTER MODULE (Brand Guide voice; #2A1E14 dark brown-black surface) */}
        <section className="mb-16 rounded-3xl bg-[#2A1E14] text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              Built for Bitcoiners, by Bitcoiners.
            </h2>
            <p className="text-[#EAE4D8] text-sm sm:text-base leading-relaxed mb-6 font-normal">
              One email every week. New jobs, freelance guides, and platform updates straight to your inbox.
            </p>

            {newsletterSuccess ? (
              <div className="flex items-center gap-2.5 text-[#16A34A] bg-white/10 px-5 py-3.5 rounded-xl text-xs font-semibold animate-fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>You are subscribed. Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-black/30 text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F2861D] text-white placeholder-gray-400 font-medium flex-grow shadow-inner min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="min-h-[44px] bg-[#F2861D] hover:bg-[#D9740F] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm active:scale-97 flex items-center justify-center gap-2 select-none"
                >
                  {newsletterLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </form>
            )}
            <p className="text-[11px] text-[#EAE4D8]/70 mt-3 font-normal">
              No spam, ever. Unsubscribe at any time with one click.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

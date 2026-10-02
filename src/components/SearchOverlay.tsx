import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Clean, safe text highlighting component for search matches
function HighlightText({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return <>{text}</>;

  const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-[#F2861D]/20 text-[#D9740F] font-semibold px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

const QUICK_TOPICS = [
  "Guides",
  "Tutorials",
  "Security",
  "Success Stories",
  "Product",
  "Lightning Network",
  "Remote Work",
  "Bitcoin Freelancing",
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cache recent searches in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem("bitlance_recent_searches");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const addToRecentSearches = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== cleaned.toLowerCase());
      const next = [cleaned, ...filtered].slice(0, 5);
      try {
        localStorage.setItem("bitlance_recent_searches", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to persist search terms", e);
      }
      return next;
    });
  };

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch data on open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/articles?status=published")
      .then((r) => r.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/topics")
      .then((r) => r.json())
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 80);
  }, [isOpen]);

  // Clean snippet generator
  const getContentSnippet = (content: string, q: string) => {
    const plainText = (content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const idx = plainText.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) {
      return plainText.substring(0, 95) + "...";
    }
    const start = Math.max(0, idx - 30);
    const end = Math.min(plainText.length, idx + q.length + 65);
    let snippet = plainText.substring(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < plainText.length) snippet = snippet + "...";
    return snippet;
  };

  // Search logic: matches any resource across title, tags, category, topic, author, content
  const q = debouncedQuery.toLowerCase().trim();
  const searchWords = q.split(/\s+/).filter(Boolean);

  const filteredResults = q.length === 0
    ? []
    : articles
        .map((article) => {
          const title = (article.title || "").toLowerCase();
          const subtitle = (article.subtitle || "").toLowerCase();
          const contentRaw = (article.content || "").replace(/<[^>]+>/g, " ").toLowerCase();
          const category = categories.find((c) => c.id === article.category_id);
          const catName = category ? category.name.toLowerCase() : "";
          const tags = Array.isArray(article.tags) ? article.tags.map((t) => String(t).toLowerCase()) : [];
          const author = users.find((u) => u.id === article.author_id);
          const authorName = author ? author.name.toLowerCase() : "";

          let score = 0;

          if (title === q) score += 100;
          else if (title.startsWith(q)) score += 60;
          else if (title.includes(q)) score += 40;

          if (tags.some((t) => t.includes(q))) score += 35;
          if (catName.includes(q)) score += 30;
          if (subtitle.includes(q)) score += 20;
          if (authorName.includes(q)) score += 15;
          if (contentRaw.includes(q)) score += 10;

          // Word-by-word matching so multi-term queries bring up any resource
          for (const word of searchWords) {
            if (title.includes(word)) score += 15;
            else if (tags.some((t) => t.includes(word))) score += 10;
            else if (catName.includes(word)) score += 8;
            else if (subtitle.includes(word)) score += 5;
            else if (authorName.includes(word)) score += 5;
            else if (contentRaw.includes(word)) score += 3;
          }

          return { article, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.article);

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : "Guides";
  };

  const getReadingTime = (art: any) => {
    if (art.reading_time) return art.reading_time;
    const words = (art.content || "").replace(/<[^>]+>/g, "").split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        if (filteredResults.length > 0) {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % filteredResults.length);
        }
      } else if (e.key === "ArrowUp") {
        if (filteredResults.length > 0) {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
        }
      } else if (e.key === "Enter") {
        if (filteredResults.length > 0 && activeIndex >= 0 && activeIndex < filteredResults.length) {
          e.preventDefault();
          const target = filteredResults[activeIndex];
          addToRecentSearches(inputValue);
          navigate(`/article/${target.slug || target.id}`);
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, filteredResults, activeIndex, navigate, inputValue]);

  const handleSelectSuggestion = (term: string) => {
    setInputValue(term);
    setDebouncedQuery(term);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleArticleClick = (art: any) => {
    addToRecentSearches(inputValue || art.title);
    navigate(`/article/${art.slug || art.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col pt-0 sm:pt-20 px-0 sm:px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Bar Input */}
            <div className="flex items-center px-4 min-h-[58px] bg-black/[0.02] gap-3 focus-within:ring-0 focus-within:outline-none">
              <Search className="h-4.5 w-4.5 text-[#6B6B6B] shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                className="w-full bg-transparent py-4 text-base text-[#1A1A1A] placeholder:text-[#9CA3AF] font-normal border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                placeholder="Search resources, guides, and articles..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => setInputValue("")}
                  className="rounded-lg p-1 text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-black/5 transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Results / Quick Topics Body */}
            <div className="overflow-y-auto px-4 py-4 max-h-[60vh]">
              {inputValue.trim().length === 0 ? (
                /* Clean, lightweight initial state (no bulky repetitive cards) */
                <div className="space-y-4 py-1">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#6B6B6B]">Recent searches</span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem("bitlance_recent_searches");
                          }}
                          className="text-[11px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSelectSuggestion(term)}
                            className="rounded-xl bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 text-xs text-[#1A1A1A] font-medium transition-colors cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-2">Popular topics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleSelectSuggestion(topic)}
                          className="rounded-xl bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] transition-all cursor-pointer active:scale-97"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Search Results */
                <div>
                  <div className="text-xs font-medium text-[#6B6B6B] mb-2 px-1">
                    {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"} for "{inputValue}"
                  </div>

                  <div className="space-y-1">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((art, idx) => {
                        const isSelected = idx === activeIndex;
                        const excerpt = getContentSnippet(art.content || "", inputValue);
                        const categoryName = getCategoryName(art.category_id);

                        return (
                          <div
                            key={art.id}
                            onClick={() => handleArticleClick(art)}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all group cursor-pointer ${
                              isSelected
                                ? "bg-[#FAF6EF]"
                                : "hover:bg-black/[0.03]"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] font-semibold text-[#F2861D]">
                                  {categoryName}
                                </span>
                                <span className="text-[11px] text-[#9CA3AF]">·</span>
                                <span className="text-[11px] text-[#6B6B6B]">
                                  {getReadingTime(art)}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#F2861D] transition-colors leading-snug line-clamp-1">
                                <HighlightText text={art.title} search={inputValue} />
                              </h4>
                              <p className="text-xs text-[#6B6B6B] font-normal leading-relaxed line-clamp-1 mt-0.5">
                                <HighlightText text={excerpt} search={inputValue} />
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#F2861D] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-sm font-semibold text-[#1A1A1A] mb-1">No resources found</p>
                        <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto mb-4">
                          Try a different keyword or choose from one of the popular topics.
                        </p>
                        <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mx-auto">
                          {QUICK_TOPICS.slice(0, 4).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => handleSelectSuggestion(t)}
                              className="rounded-xl bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 text-xs text-[#1A1A1A] font-medium transition-colors cursor-pointer"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

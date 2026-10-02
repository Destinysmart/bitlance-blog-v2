import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import { Bookmark, Clock, Trash2, Users, FileText, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'following'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("registeredUser");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchData = () => {
    setLoading(true);
    
    const fetchBookmarks = fetch("/api/bookmarks", { headers: { "x-user-id": "user_1" } }).then(r => r.json());
    const fetchFeed = fetch("/api/follows/feed", { headers: { "x-user-id": "user_1" } }).then(r => r.json());

    Promise.all([fetchBookmarks, fetchFeed])
      .then(([bookmarksData, feedData]) => {
        setBookmarks(bookmarksData);
        setFeed(feedData);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removeBookmark = (articleId: string) => {
    fetch(`/api/bookmarks/${articleId}`, { 
      method: "DELETE",
      headers: { "x-user-id": "user_1" }
    }).then(() => {
      setBookmarks(bookmarks.filter(b => b.id !== articleId));
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col font-sans selection:bg-[#F2861D] selection:text-white">
      <SEO 
        title="My Reader Profile & Reading List - BitLance" 
        description="Access your saved Bitcoin guides, freelance tutorials, remote work articles, and followed author feeds on your customized BitLance profile page." 
        canonicalUrl="https://bitlance.work/profile"
        personSchema={{
          name: "Bitlance Reader",
          description: "Active reader and contributor on BitLance, exploring remote work, decentralized micro-payroll, and Bitcoin developments.",
          jobTitle: "Bitcoin Economy Contributor",
          skills: ["Bitcoin", "Lightning Network", "Remote Work", "Digital Payments"]
        }}
        breadcrumbs={[
          { name: "Blog", item: "/" },
          { name: "Profile", item: "/profile" }
        ]}
      />
      <Navigation />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ name: "Profile", path: "/profile" }]} />
        </div>
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={user?.avatar || "https://i.pravatar.cc/150?u=user_1"} alt="Profile avatar" className="w-18 h-18 rounded-full object-cover shadow-xs" loading="lazy" referrerPolicy="no-referrer" />
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">{user?.name || "My Profile"}</h1>
              <p className="text-[#6B6B6B] font-medium text-sm">Logged in as {user?.role || "Reader"}</p>
              {user?.email && <p className="text-xs text-[#6B6B6B] mt-1 font-mono">{user.email}</p>}
            </div>
          </div>
          {user && (
            <button
              onClick={() => {
                localStorage.removeItem("registeredUser");
                setUser(null);
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all self-start md:self-auto cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Customized Dashboard Widgets */}
        {user && (
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-8">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">
              {user.role} Dashboard Details
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {user.role === "Client" ? (
                <>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Company Profile</span>
                    <span className="font-semibold text-[#1A1A1A] text-sm">{user.details?.companyName || "Personal/Independent"}</span>
                  </div>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Active Job Project</span>
                    <span className="font-semibold text-[#1A1A1A] text-sm line-clamp-1">{user.details?.projectBrief || "None started"}</span>
                  </div>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Milestone Budget</span>
                    <span className="font-bold text-[#F2861D] text-sm">{user.details?.budgetSats ? `${Number(user.details.budgetSats).toLocaleString()} sats` : "Not specified"}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Professional Specialty</span>
                    <span className="font-semibold text-[#1A1A1A] text-sm line-clamp-1">{user.details?.specialty || "General Contractor"}</span>
                  </div>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Lightning Address (Payouts)</span>
                    <span className="font-bold text-[#F2861D] text-sm font-mono truncate block" title={user.details?.lightningAddress}>{user.details?.lightningAddress}</span>
                  </div>
                  <div className="bg-black/[0.02] p-4 rounded-xl">
                    <span className="text-xs font-medium text-[#6B6B6B] block mb-1">Portfolio & Proof of Work</span>
                    <span className="font-semibold text-[#1A1A1A] text-sm truncate block">
                      {user.details?.portfolioUrl ? (
                        <a href={user.details.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#F2861D]">{user.details.portfolioUrl}</a>
                      ) : (
                        "Not provided"
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modern Borderless Tabs */}
        <div className="flex items-center gap-1.5 mb-8">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'bookmarks' 
                ? 'bg-[#1A1A1A] text-white shadow-xs' 
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-black/5'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'fill-current' : ''}`} /> My Reading List
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'following' 
                ? 'bg-[#1A1A1A] text-white shadow-xs' 
                : 'text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-black/5'
            }`}
          >
            <Users className="w-4 h-4" /> Following Feed
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#6B6B6B]">Loading your profile...</div>
        ) : (
          <>
            {/* Reading List Tab */}
            {activeTab === 'bookmarks' && (
              <>
                {bookmarks.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-xs flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#FAF6EF] rounded-2xl flex items-center justify-center mb-4 text-[#6B6B6B]">
                      <Bookmark className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No saved articles</h3>
                    <p className="text-[#6B6B6B] mb-6 max-w-sm text-sm">
                      Articles you bookmark will appear here so you can read them later.
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#F2861D] text-white font-semibold hover:bg-[#D9740F] transition-colors text-sm">
                      Explore Articles
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {bookmarks.map(article => (
                      <div key={article.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_20px_32px_-6px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row gap-5 items-start group transition-all">
                        {article.featured_image && (
                          <Link to={`/article/${article.slug || article.id}`} className="w-full sm:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-black/5 block">
                            <img 
                              src={article.featured_image} 
                              alt={article.title || "Bookmarked article"} 
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" 
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </Link>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <Link to={`/article/${article.slug || article.id}`}>
                                <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] hover:text-[#F2861D] transition-colors mb-2 line-clamp-2">
                                  {article.title}
                                </h3>
                              </Link>
                              <p className="text-[#6B6B6B] line-clamp-2 text-sm mb-4 font-normal">
                                {article.subtitle || article.content?.replace(/<[^>]+>/g, '').substring(0, 150)}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-[#6B6B6B] font-medium">
                                <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                                {article.reading_time && (
                                  <>
                                    <span>·</span>
                                    <span>{article.reading_time}</span>
                                  </>
                                )}
                                <span>·</span>
                                <span>Saved {new Date(article.bookmarked_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => removeBookmark(article.id)}
                              className="p-2 sm:p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shrink-0 self-start sm:self-auto flex items-center justify-center cursor-pointer"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Following Feed Tab */}
            {activeTab === 'following' && (
              <>
                {feed.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-xs flex flex-col items-center">
                    <div className="w-14 h-14 bg-[#FAF6EF] rounded-2xl flex items-center justify-center mb-4 text-[#6B6B6B]">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No updates yet</h3>
                    <p className="text-[#6B6B6B] mb-6 max-w-sm text-sm">
                      Follow authors to see their latest articles appear here in your feed.
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#F2861D] text-white font-semibold hover:bg-[#D9740F] transition-colors text-sm">
                      Find Authors
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-5">
                    {feed.map(article => (
                      <Link key={article.id} to={`/article/${article.slug || article.id}`} className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.03),0_8px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_20px_32px_-6px_rgba(0,0,0,0.06)] transition-all group flex flex-col h-full">
                        {article.featured_image && (
                          <div className="aspect-[16/9] mb-4 rounded-xl overflow-hidden bg-black/5 shrink-0">
                            <img 
                              src={article.featured_image} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" 
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="text-xs text-[#6B6B6B] font-medium mb-2">
                          <span>{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#F2861D] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-[#6B6B6B] line-clamp-2 mb-4 flex-1 text-sm font-normal">
                          {article.subtitle || article.content?.replace(/<[^>]+>/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex items-center font-semibold text-xs text-[#F2861D] group-hover:gap-2 gap-1.5 transition-all mt-auto">
                          Read article <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

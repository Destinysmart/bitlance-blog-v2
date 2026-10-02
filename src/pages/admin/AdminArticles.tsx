import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, AlertTriangle, X, Globe, Sparkles, ExternalLink } from "lucide-react";
import { ArticleSeoMetaModal } from "../../components/ArticleSeoMetaModal";

export function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [seoArticleId, setSeoArticleId] = useState<string | null>(null);

  const fetchArticles = () => {
    fetch("/api/articles")
      .then(r => r.json())
      .then(setArticles);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const confirmDelete = () => {
    if (!deleteId) return;
    setIsDeleting(true);
    fetch(`/api/articles/${deleteId}`, { method: "DELETE" })
      .then(() => {
        fetchArticles();
        setDeleteId(null);
        setIsDeleting(false);
      })
      .catch((err) => {
        console.error(err);
        setIsDeleting(false);
      });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight heading-display">Articles</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage all published and drafted content, SEO metadata, and social previews.</p>
        </div>
        <Link to="/admin/editor/new" className="bg-brand-500 text-white px-5 py-2.5 rounded-full font-bold hover:bg-brand-600 transition-colors shadow-sm self-start sm:self-auto text-sm">
          Write Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-150">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Title & SEO Snippet</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-bold text-gray-950 hover:text-brand-600 transition-colors">
                          <Link to={`/admin/editor/${article.id}`}>{article.title || "Untitled"}</Link>
                        </div>
                        <div className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                          <span>Last updated: {new Date(article.updated_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {article.canonical_url && (
                            <span className="text-brand-600 font-mono text-[10px] bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
                              Custom Canonical
                            </span>
                          )}
                          {article.seo_title && (
                            <span className="text-emerald-700 text-[10px] font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              SEO Tagged
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      article.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-sm font-semibold">
                    {(article.view_count || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      {/* SEO Meta-tags Manager Quick Action Button */}
                      <button
                        onClick={() => setSeoArticleId(article.id)}
                        className="px-2.5 py-1.5 hover:text-brand-600 hover:bg-brand-50 text-brand-600 bg-brand-50/50 rounded-lg transition-colors border border-brand-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        title="Manage SEO Meta-Tags, Canonical URL & Social Cards"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>SEO Meta</span>
                      </button>

                      <Link 
                        to={`/admin/editor/${article.id}`} 
                        className="p-2 hover:text-brand-500 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                        title="Edit article"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </Link>
                      <button 
                        onClick={() => setDeleteId(article.id)} 
                        className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete article"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-400 font-medium">
                    No articles found. Start writing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern, elegant Custom Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-xs transition-opacity" onClick={() => setDeleteId(null)} />
          
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all animate-scale-up">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setDeleteId(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-4 items-start mb-6">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-950 mb-1">Delete Article</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Are you sure you want to delete this article? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 border border-transparent rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article SEO Meta-Tags Management Modal */}
      <ArticleSeoMetaModal
        articleId={seoArticleId}
        isOpen={Boolean(seoArticleId)}
        onClose={() => setSeoArticleId(null)}
        onSaved={fetchArticles}
      />
    </div>
  );
}

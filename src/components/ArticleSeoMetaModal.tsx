import React, { useState, useEffect } from "react";
import { ArticleSeoMetaManager, SeoMetaFields } from "./ArticleSeoMetaManager";
import { X, CheckCircle2 } from "lucide-react";

interface ArticleSeoMetaModalProps {
  articleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function ArticleSeoMetaModal({
  articleId,
  isOpen,
  onClose,
  onSaved,
}: ArticleSeoMetaModalProps) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [fields, setFields] = useState<SeoMetaFields>({
    seoTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    slug: "",
    robotsMeta: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    focusKeyword: "",
    schemaData: "",
  });

  // Fetch article whenever articleId changes
  useEffect(() => {
    if (!isOpen || !articleId) {
      setArticle(null);
      return;
    }

    setLoading(true);
    fetch(`/api/articles/${articleId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setFields({
          seoTitle: data.seo_title || data.title || "",
          metaDescription: data.meta_description || data.subtitle || "",
          canonicalUrl: data.canonical_url || "",
          slug: data.slug || "",
          robotsMeta: data.robots_meta || "index, follow",
          ogTitle: data.og_title || "",
          ogDescription: data.og_description || "",
          ogImage: data.og_image || data.featured_image || "",
          twitterCard: data.twitter_card || "summary_large_image",
          focusKeyword: data.focus_keyword || "",
          schemaData: data.schema_data || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load article for SEO management:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articleId, isOpen]);

  const handleChange = (field: keyof SeoMetaFields, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!articleId || !article) return;
    setIsSaving(true);
    try {
      const payload = {
        ...article,
        seo_title: fields.seoTitle || article.title,
        meta_description: fields.metaDescription || article.subtitle,
        canonical_url: fields.canonicalUrl,
        slug: fields.slug || article.slug,
        robots_meta: fields.robotsMeta,
        og_title: fields.ogTitle,
        og_description: fields.ogDescription,
        og_image: fields.ogImage,
        twitter_card: fields.twitterCard,
        focus_keyword: fields.focusKeyword,
        schema_data: fields.schemaData,
      };

      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update SEO tags");

      const updated = await res.json();
      setArticle(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      if (onSaved) {
        onSaved();
      }
    } catch (e) {
      console.error("Failed to save SEO meta tags", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-5xl my-auto animate-scale-up">
        {saveSuccess && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="h-4 w-4" /> SEO Meta-tags successfully saved & updated!
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading article SEO parameters...</p>
          </div>
        ) : article ? (
          <ArticleSeoMetaManager
            fields={fields}
            onChange={handleChange}
            article={article}
            onSave={handleSave}
            isSaving={isSaving}
            variant="modal"
            onClose={onClose}
          />
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500 shadow-2xl">
            <p className="text-sm font-semibold mb-4">Could not load article metadata.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

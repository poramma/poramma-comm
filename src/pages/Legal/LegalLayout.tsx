import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { EMBASSY_CONTACT } from "../../config/contact";

export const LEGAL_VERSION = "1.0";
export const LEGAL_UPDATED_AT = "19 septembre 2026";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

/**
 * Habillage commun des pages légales (conditions d'utilisation, politique de
 * confidentialité) : publiques — lisibles sans compte —, avec sommaire.
 */
export default function LegalLayout({ title, intro, sections, metaDescription }: { title: string; intro: string; sections: LegalSection[]; metaDescription: string }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageMeta title={title} description={metaDescription} />
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" aria-label="Poramma — accueil">
            <img src="/images/poramma-logo.png" alt="Poramma" className="h-14 w-auto" />
          </Link>
          <button type="button" onClick={() => (window.history.length > 1 ? window.history.back() : (window.location.href = "/"))} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 dark:text-gray-400">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Version {LEGAL_VERSION} — dernière mise à jour : {LEGAL_UPDATED_AT}
        </p>
        <p className="mt-4 max-w-3xl text-gray-700 dark:text-gray-300">{intro}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Sommaire" className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Sommaire</p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-gray-600 hover:text-brand-600 dark:text-gray-400">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {i + 1}. {s.title}
                </h2>
                <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">{s.body}</div>
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} Poramma — {EMBASSY_CONTACT.name}
          </span>
          <span className="flex gap-4">
            <Link to="/conditions-utilisation" className="hover:text-brand-600">
              Conditions d'utilisation
            </Link>
            <Link to="/politique-confidentialite" className="hover:text-brand-600">
              Politique de confidentialité
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

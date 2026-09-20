/**
 * Nettoyage du HTML des annonces avant affichage (`dangerouslySetInnerHTML`).
 * Le contenu est rédigé par l'ambassade, mais on ne fait jamais confiance à du
 * HTML brut : le document est analysé dans un DOM inerte (DOMParser — aucun
 * script ne s'exécute) puis RECONSTRUIT balise par balise à partir d'une liste
 * blanche. Tout ce qui n'y figure pas (script, iframe, style, gestionnaires
 * on*, URLs javascript:…) disparaît ; les balises inconnues sont « dépliées »
 * (leur texte est conservé).
 */
const ALLOWED_TAGS = new Set([
  "P", "BR", "HR", "DIV", "SPAN", "STRONG", "B", "EM", "I", "U", "S", "CODE", "PRE", "BLOCKQUOTE",
  "H1", "H2", "H3", "H4", "UL", "OL", "LI", "A", "IMG", "TABLE", "THEAD", "TBODY", "TR", "TH", "TD",
]);

/** Balises supprimées AVEC leur contenu (jamais dépliées). */
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "NOSCRIPT", "TEMPLATE", "SVG", "MATH", "LINK", "META", "FRAME", "FRAMESET"]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ["href", "title"],
  IMG: ["src", "alt", "title"],
  TD: ["colspan", "rowspan"],
  TH: ["colspan", "rowspan"],
};

function isSafeLink(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:") || v.startsWith("tel:");
}

function isSafeImage(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://") || /^data:image\/(png|jpe?g|gif|webp);base64,/.test(v);
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out = document.createElement("div");

  const walk = (src: Node, dst: Node) => {
    src.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        dst.appendChild(document.createTextNode(node.textContent ?? ""));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as Element;
      const tag = el.tagName.toUpperCase();
      if (DROP_WITH_CONTENT.has(tag)) return;
      if (!ALLOWED_TAGS.has(tag)) {
        walk(el, dst);
        return;
      }

      const clean = document.createElement(tag.toLowerCase());
      for (const name of ALLOWED_ATTRS[tag] ?? []) {
        const value = el.getAttribute(name);
        if (value == null) continue;
        if (name === "href" && !isSafeLink(value)) continue;
        if (name === "src" && !isSafeImage(value)) continue;
        clean.setAttribute(name, value);
      }
      if (tag === "A" && clean.hasAttribute("href")) {
        clean.setAttribute("target", "_blank");
        clean.setAttribute("rel", "noopener noreferrer nofollow");
      }
      if (tag === "IMG") {
        if (!clean.hasAttribute("src")) return; // image sans source sûre : on l'ignore
        clean.setAttribute("loading", "lazy");
      }
      walk(el, clean);
      dst.appendChild(clean);
    });
  };

  walk(doc.body, out);
  return out.innerHTML;
}

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";

const processor = unified().use(remarkParse).use(remarkGfm);

/**
 * Parses markdown body text and returns only true prose paragraph text and word counts.
 * It filters out paragraphs that are nested inside lists (tight or loose lists)
 * to prevent false positives where bullet lists are evaluated as long paragraphs.
 *
 * @param {string} bodyText - The markdown body text (with frontmatter already stripped)
 * @returns {Array<{text: string, wordCount: number}>}
 */
export function getProseParagraphs(bodyText) {
  const ast = processor.parse(bodyText);
  const paragraphs = [];

  function traverse(node, insideList = false) {
    const isList = node.type === "list" || node.type === "listItem";
    const currentInsideList = insideList || isList;

    if (node.type === "paragraph" && !currentInsideList) {
      const text = toString(node).trim();
      if (text) {
        const words = text.split(/\s+/).filter(Boolean);
        paragraphs.push({
          text,
          wordCount: words.length,
        });
      }
      return;
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child, currentInsideList);
      }
    }
  }

  traverse(ast);
  return paragraphs;
}

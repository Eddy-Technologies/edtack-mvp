import katex from 'katex';

/**
 * Renders inline math expressions in plain text using KaTeX
 * Supports $...$ and \(...\) delimiters
 */
export function renderInlineMath(text: string): string {
  if (!text) return '';

  let result = text;

  // Replace display math $$...$$ first (to avoid conflict with inline)
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return `$$${math}$$`;
    }
  });

  // Replace inline math $...$
  result = result.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `$${math}$`;
    }
  });

  // Replace \(...\) inline math
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `\\(${math}\\)`;
    }
  });

  return result;
}

/**
 * Check if text contains math delimiters
 */
export function containsMath(text: string): boolean {
  if (!text) return false;
  return /\$[^$]+\$|\\\([^)]+\\\)|\$\$[^$]+\$\$/.test(text);
}

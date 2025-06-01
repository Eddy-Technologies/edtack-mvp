import renderMathInElement from 'katex/contrib/auto-render/auto-render.js';

export function renderMath(element) {
  try {
    return renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: false },
        { left: '\\(', right: '\\)', display: false },
        // LaTeX uses $…$, but it ruins the display of normal `$` in text:
        { left: '\\newline', right: '\\newline', display: true },
        // $ must come after $$
        // Render AMS environments even if outside $$…$$ delimiters.
        { left: '\\begin{equation}', right: '\\end{equation}', display: false },
        { left: '\\begin{align}', right: '\\end{align}', display: false },
        { left: '\\begin{alignat}', right: '\\end{alignat}', display: false },
        { left: '\\begin{gather}', right: '\\end{gather}', display: false },
        { left: '\\begin{CD}', right: '\\end{CD}', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  } catch (error) {
    console.error('KaTeX rendering error:', error);
    return element;
  }
}

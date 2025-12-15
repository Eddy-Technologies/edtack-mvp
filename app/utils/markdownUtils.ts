// Protect math delimiters during preprocessing to prevent conflicts
export function protectMathDelimiters(raw: string): {
  protected: string;
  restore: (s: string) => string;
} {
  const mathExpressions: string[] = [];

  // Protect display math $$...$$ and \[...\]
  let processed = raw.replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]/g, (match) => {
    mathExpressions.push(match);
    return `__MATH_BLOCK_${mathExpressions.length - 1}__`;
  });

  // Protect inline math $...$ and \(...\)
  processed = processed.replace(/\$[^$\n]+\$|\\\([^)]+\\\)/g, (match) => {
    mathExpressions.push(match);
    return `__MATH_INLINE_${mathExpressions.length - 1}__`;
  });

  const restore = (s: string): string => {
    return s.replace(/__MATH_(BLOCK|INLINE)_(\d+)__/g, (match: string, _type: string, index: string) => {
      return mathExpressions[parseInt(index)] ?? match;
    });
  };

  return { protected: processed, restore };
}

// Convert ::color[text] markers to MDC inline span syntax
export function convertHighlights(raw: string): string {
  const { protected: safeContent, restore } = protectMathDelimiters(raw);
  const converted = safeContent.replace(
    /::(\w+)\[(.*?)\]/g,
    (match, color, text) => {
      const colorMap: Record<string, string> = {
        yellow: '.bg-yellow-200',
        green: '.bg-green-200',
        blue: '.bg-blue-200',
        red: '.bg-red-200',
        purple: '.bg-purple-200',
        pink: '.bg-pink-200',
        orange: '.bg-orange-200',
        primary: '.bg-primary-100',
      };
      const classes = colorMap[color] || '.bg-yellow-200';
      return `[${text}]{${classes} .px-1 .py-0\\.5 .rounded .font-medium}`;
    }
  );
  return restore(converted);
}

// Convert &&img&& markers to HTML img tags
export function convertImages(raw: string, alt: string = 'Image'): string {
  return raw.replace(
    /&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g,
    `<img src="$1" alt="${alt}" class="my-2 max-w-full rounded-md"/>`
  );
}

// Strip &&img&& markers to [Image] placeholder
export function stripImages(raw: string): string {
  return raw.replace(/&&img&&\s*(https?:\/\/[^\s]+)\s*&&img&&/g, '[Image]');
}

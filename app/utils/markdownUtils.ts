// Convert ::color[text] markers to MDC inline span syntax
export function convertHighlights(raw: string): string {
  return raw.replace(
    /::(\w+)\[(.*?)\]/g,
    (match, color, text) => {
      const colorMap: Record<string, string> = {
        yellow: '.bg-yellow-200 .text-yellow-900',
        green: '.bg-green-200 .text-green-900',
        blue: '.bg-blue-200 .text-blue-900',
        red: '.bg-red-200 .text-red-900',
        purple: '.bg-purple-200 .text-purple-900',
        pink: '.bg-pink-200 .text-pink-900',
        orange: '.bg-orange-200 .text-orange-900',
        primary: '.bg-primary-100 .text-primary-700',
      };
      const classes = colorMap[color] || '.bg-yellow-200 .text-yellow-900';
      return `[${text}]{${classes} .px-1 .py-0\\.5 .rounded .font-medium}`;
    }
  );
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

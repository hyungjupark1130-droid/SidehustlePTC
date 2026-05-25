import React from 'react';

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    const key = `${keyPrefix}-${idx++}`;

    // Bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(<strong key={key}>{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text* (not **)
    const italicMatch = remaining.match(/^([\s\S]*?)(?<!\*)\*(?!\*)([^*]+)(?<!\*)\*(?!\*)/);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(italicMatch[1]);
      parts.push(<em key={key}>{italicMatch[3]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      if (linkMatch[1]) parts.push(linkMatch[1]);
      parts.push(
        <a key={key} href={linkMatch[3]} target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2">
          {linkMatch[2]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    parts.push(remaining);
    break;
  }

  return parts;
}

export function renderMarkdown(body: string): React.ReactNode[] {
  const blocks = body.split('\n\n');

  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // H1: # heading
    if (/^# /.test(trimmed)) {
      return (
        <h2 key={i} className="font-display font-black text-2xl leading-tight mt-10 mb-4">
          {trimmed.slice(2)}
        </h2>
      );
    }

    // H2: ## heading
    if (/^## /.test(trimmed)) {
      return (
        <h3 key={i} className="font-display font-black text-xl leading-tight mt-8 mb-3">
          {trimmed.slice(3)}
        </h3>
      );
    }

    // Standalone image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <figure key={i} className="my-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full" />
          {imgMatch[1] && (
            <figcaption className="font-body font-light text-xs opacity-60 mt-2">
              {imgMatch[1]}
            </figcaption>
          )}
        </figure>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="font-body font-light text-base leading-relaxed">
        {parseInline(trimmed, String(i))}
      </p>
    );
  }).filter(Boolean);
}

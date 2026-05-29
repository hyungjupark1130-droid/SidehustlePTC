'use client';

import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TiptapImage from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';

/* ── Custom inline style extensions ─────────────────────────────────── */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize:     { setFontSize: (v: string) => ReturnType; unsetFontSize: () => ReturnType };
    fontWeight:   { setFontWeight: (v: string) => ReturnType; unsetFontWeight: () => ReturnType };
    letterSpacing:{ setLetterSpacing: (v: string) => ReturnType; unsetLetterSpacing: () => ReturnType };
    lineHeightExt:{ setLineHeight: (v: string) => ReturnType };
    indentExt:    { increaseIndent: () => ReturnType; decreaseIndent: () => ReturnType };
  }
}

function inlineStyleExtension(name: string, cssProp: string) {
  return Extension.create({
    name,
    addOptions: () => ({ types: ['textStyle'] }),
    addGlobalAttributes() {
      return [{
        types: ['textStyle'],
        attributes: {
          [name]: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.getPropertyValue(cssProp) || null,
            renderHTML: (attrs) => attrs[name] ? { style: `${cssProp}: ${attrs[name]}` } : {},
          },
        },
      }];
    },
    addCommands() {
      return {
        [`set${name.charAt(0).toUpperCase() + name.slice(1)}`]: (v: string) => ({ chain }: any) =>
          chain().setMark('textStyle', { [name]: v }).run(),
        [`unset${name.charAt(0).toUpperCase() + name.slice(1)}`]: () => ({ chain }: any) =>
          chain().setMark('textStyle', { [name]: null }).removeEmptyTextStyle().run(),
      } as any;
    },
  });
}

const FontSize     = inlineStyleExtension('fontSize', 'font-size');
const FontWeight   = inlineStyleExtension('fontWeight', 'font-weight');
const LetterSpacing = inlineStyleExtension('letterSpacing', 'letter-spacing');

const LineHeightExt = Extension.create({
  name: 'lineHeightExt',
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading', 'blockquote'],
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.lineHeight || null,
          renderHTML: (attrs) => attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setLineHeight: (v: string) => ({ commands }: any) => {
        ['paragraph', 'heading', 'blockquote'].forEach((t) => commands.updateAttributes(t, { lineHeight: v }));
        return true;
      },
    } as any;
  },
});

const IndentExt = Extension.create({
  name: 'indentExt',
  addGlobalAttributes() {
    return [{
      types: ['paragraph', 'heading', 'blockquote'],
      attributes: {
        indent: {
          default: 0,
          parseHTML: (el) => parseInt((el as HTMLElement).style.paddingLeft) / 24 || 0,
          renderHTML: (attrs) => attrs.indent > 0 ? { style: `padding-left: ${attrs.indent * 24}px` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      increaseIndent: () => ({ editor, commands }: any) => {
        const attrs = editor.getAttributes('paragraph') || editor.getAttributes('heading');
        const cur = attrs.indent || 0;
        return ['paragraph', 'heading'].some((t) => commands.updateAttributes(t, { indent: Math.min(cur + 1, 8) }));
      },
      decreaseIndent: () => ({ editor, commands }: any) => {
        const attrs = editor.getAttributes('paragraph') || editor.getAttributes('heading');
        const cur = attrs.indent || 0;
        return ['paragraph', 'heading'].some((t) => commands.updateAttributes(t, { indent: Math.max(cur - 1, 0) }));
      },
    } as any;
  },
});

/* ── Constants ───────────────────────────────────────────────────────── */

const FONT_FAMILIES = [
  { label: 'Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: 'ui-serif, Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, monospace' },
  { label: 'Disp', value: 'var(--font-display), sans-serif' },
];

const FONT_SIZES = ['0.75rem','0.875rem','1rem','1.125rem','1.25rem','1.5rem','1.75rem','2rem','2.5rem','3rem'];
const SIZE_LABELS = ['10','12','14','16','18','20','24','28','32','36','42','48'].slice(0, FONT_SIZES.length);

const FONT_WEIGHTS = [
  { label: 'Thin', value: '200' },
  { label: 'Reg', value: '400' },
  { label: 'Med', value: '500' },
  { label: 'Bold', value: '700' },
  { label: 'XBold', value: '900' },
];

const LINE_HEIGHTS = [
  { label: 'Tight', value: '1.25' },
  { label: 'Norm', value: '1.5' },
  { label: 'Relax', value: '1.75' },
  { label: 'Loose', value: '2' },
];

const LETTER_SPACINGS = [
  { label: 'Tight', value: '-0.05em' },
  { label: 'Norm', value: '0' },
  { label: 'Wide', value: '0.05em' },
  { label: 'Wider', value: '0.1em' },
];

/* ── Component ───────────────────────────────────────────────────────── */

export function RichTextEditor({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (html: string) => void;
}) {
  const colorRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'blockquote'] }),
      TextStyle,
      Underline,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TiptapImage.configure({ inline: true, allowBase64: false }),
      FontSize,
      FontWeight,
      LetterSpacing,
      LineHeightExt,
      IndentExt,
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const act = (active: boolean, extra = '') =>
    `px-2 py-1 text-[10px] font-body tracking-widest uppercase border select-none cursor-pointer transition-colors ${extra} ${
      active
        ? 'bg-black text-white border-black'
        : 'bg-transparent text-black border-black/30 hover:border-black hover:bg-black/5'
    }`;

  const sep = <span className="w-px h-4 bg-black/20 self-center mx-0.5 shrink-0" />;

  const curFontSize = editor.getAttributes('textStyle').fontSize ?? null;
  const curFontWeight = editor.getAttributes('textStyle').fontWeight ?? null;
  const curLetterSpacing = editor.getAttributes('textStyle').letterSpacing ?? null;
  const curLineHeight = editor.getAttributes('paragraph').lineHeight
    ?? editor.getAttributes('heading').lineHeight
    ?? null;

  /* Style dropdown value */
  const styleLabel = editor.isActive('blockquote') ? 'Quote'
    : editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3'
    : editor.isActive('heading', { level: 4 }) ? 'H4'
    : editor.isActive('heading', { level: 5 }) ? 'H5'
    : editor.isActive('heading', { level: 6 }) ? 'H6'
    : editor.isActive({ 'data-style': 'caption' }) ? 'Caption'
    : 'Normal';

  const applyStyle = (v: string) => {
    const c = editor.chain().focus();
    if (v === 'Normal') c.setParagraph().updateAttributes('paragraph', { 'data-style': null }).run();
    else if (v === 'Quote') c.setBlockquote().run();
    else if (v === 'Caption') c.setParagraph().updateAttributes('paragraph', { 'data-style': 'caption' }).run();
    else {
      const level = parseInt(v.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
      c.toggleHeading({ level }).run();
    }
  };

  const insertImage = () => {
    const url = prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div>
      {/* ── Row 1: Style + Font Family + Font Size ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-b-0 border-black bg-white">
        {/* Style select */}
        <select
          value={styleLabel}
          onChange={(e) => applyStyle(e.target.value)}
          className="text-[10px] font-body tracking-widest uppercase border border-black/30 bg-transparent px-2 py-1 cursor-pointer focus:outline-none hover:border-black"
        >
          {['Normal','H1','H2','H3','H4','H5','H6','Quote','Caption'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {sep}

        {/* Font family */}
        {FONT_FAMILIES.map(({ label, value }) => (
          <button key={label} type="button"
            className={act(editor.isActive('textStyle') && editor.getAttributes('textStyle').fontFamily === value)}
            onClick={() => editor.chain().focus().setFontFamily(value).run()}>
            {label}
          </button>
        ))}

        {sep}

        {/* Font size */}
        <select
          value={curFontSize ?? ''}
          onChange={(e) => {
            if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          className="text-[10px] font-body tracking-widest border border-black/30 bg-transparent px-2 py-1 cursor-pointer focus:outline-none hover:border-black"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((v, i) => (
            <option key={v} value={v}>{SIZE_LABELS[i]}px</option>
          ))}
        </select>

        {sep}

        {/* Font weight */}
        {FONT_WEIGHTS.map(({ label, value }) => (
          <button key={value} type="button"
            className={act(curFontWeight === value)}
            onClick={() => curFontWeight === value
              ? editor.chain().focus().unsetFontWeight().run()
              : editor.chain().focus().setFontWeight(value).run()}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Row 2: Inline marks + Color + Letter spacing ── */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-x border-black bg-white">
        <button type="button" className={act(editor.isActive('bold'), 'font-bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={act(editor.isActive('italic'), 'italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={act(editor.isActive('underline'), 'underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button type="button" className={act(editor.isActive('strike'), 'line-through')}
          onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>

        {sep}

        {/* Text color */}
        <button type="button" title="Text color"
          className="px-2 py-1 text-[10px] font-body uppercase border border-black/30 hover:border-black cursor-pointer flex items-center gap-1"
          onClick={() => colorRef.current?.click()}>
          <span>A</span>
          <span
            className="w-3 h-1 block"
            style={{ background: editor.getAttributes('textStyle').color ?? '#000' }}
          />
        </button>
        <input ref={colorRef} type="color" className="sr-only" defaultValue="#000000"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />

        {/* Highlight */}
        <button type="button" title="Highlight"
          className="px-2 py-1 text-[10px] font-body uppercase border border-black/30 hover:border-black cursor-pointer flex items-center gap-1"
          onClick={() => highlightRef.current?.click()}>
          <span>H</span>
          <span
            className="w-3 h-1 block"
            style={{ background: editor.getAttributes('highlight').color ?? '#ffff00' }}
          />
        </button>
        <input ref={highlightRef} type="color" className="sr-only" defaultValue="#ffff00"
          onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()} />
        <button type="button" className={act(false, 'text-[9px]')}
          onClick={() => editor.chain().focus().unsetHighlight().run()}>No HI</button>

        {sep}

        {/* Letter spacing */}
        <span className="text-[9px] font-body tracking-widest uppercase opacity-40 self-center">LS</span>
        {LETTER_SPACINGS.map(({ label, value }) => (
          <button key={value} type="button"
            className={act(curLetterSpacing === value)}
            onClick={() => curLetterSpacing === value
              ? editor.chain().focus().unsetLetterSpacing().run()
              : editor.chain().focus().setLetterSpacing(value).run()}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Row 3: Alignment + Lists + Indent + Line height ── */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-x border-black bg-white">
        {[['left','L'],['center','C'],['right','R'],['justify','J']].map(([v, l]) => (
          <button key={v} type="button"
            className={act(editor.isActive({ textAlign: v }))}
            onClick={() => editor.chain().focus().setTextAlign(v).run()}>{l}</button>
        ))}

        {sep}

        <button type="button" className={act(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={act(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>

        {sep}

        <button type="button" className={act(false)}
          onClick={() => editor.chain().focus().increaseIndent().run()}>→ In</button>
        <button type="button" className={act(false)}
          onClick={() => editor.chain().focus().decreaseIndent().run()}>← Out</button>

        {sep}

        <span className="text-[9px] font-body tracking-widest uppercase opacity-40 self-center">LH</span>
        {LINE_HEIGHTS.map(({ label, value }) => (
          <button key={value} type="button"
            className={act(curLineHeight === value)}
            onClick={() => editor.chain().focus().setLineHeight(value).run()}>
            {label}
          </button>
        ))}

        {sep}

        <button type="button" className={act(false)}
          onClick={insertImage}>+ Img</button>
        {editor.isActive('image') && (
          <>
            {[['left','Img L'],['center','Img C'],['right','Img R']].map(([v, l]) => (
              <button key={v} type="button"
                className={act(editor.isActive({ textAlign: v }))}
                onClick={() => editor.chain().focus().setTextAlign(v).run()}>{l}</button>
            ))}
          </>
        )}
      </div>

      {/* ── Editor ── */}
      <EditorContent editor={editor} className="tiptap-editor border border-black" />
    </div>
  );
}

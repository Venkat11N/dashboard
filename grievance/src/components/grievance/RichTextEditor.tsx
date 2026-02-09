import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { useEffect } from "react";

const CHARACTER_LIMIT = 4000;

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const buttons = [
    { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: 'Bold' },
    { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: 'Italic' },
    { action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List, label: 'Bullet List' },
    { action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered, label: 'Ordered List' },
  ];

  const characterCount = editor.storage.characterCount?.characters() || 0;
  const percentage = Math.round((characterCount / CHARACTER_LIMIT) * 100);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80">
      <div className="flex items-center gap-1">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.label}
            className={`p-2 rounded-md transition-all ${
              btn.isActive 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            <btn.icon size={16} />
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${
            percentage > 90 ? 'text-red-500' : percentage > 70 ? 'text-amber-500' : 'text-slate-400'
          }`}>
            {characterCount}/{CHARACTER_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RichTextEditor = ({ onChange }: { onChange: (html: string, text: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Provide a detailed description of your grievance. Include relevant dates, names, locations, and any other important information...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount.configure({
        limit: CHARACTER_LIMIT,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-sm max-w-none focus:outline-none min-h-[180px] p-4 text-slate-700',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
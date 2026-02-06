import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Bold, Italic, List, ListOrdered } from "lucide-react";

const CHARACTER_LIMIT = 4000;

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const characterCount = editor.storage.characterCount.characters();
  const percentage = Math.round((characterCount / CHARACTER_LIMIT) * 100);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/80">
      <div className="flex items-center gap-1">
        {[
          { action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), icon: Bold, label: 'Bold' },
          { action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), icon: Italic, label: 'Italic' },
          { action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), icon: List, label: 'Bullet List' },
          { action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), icon: ListOrdered, label: 'Ordered List' },
        ].map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            className={`p-2 rounded-md transition-all ${btn.isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <btn.icon size={16} />
          </button>
        ))}
      </div>
      <div className="text-xs font-medium text-slate-400">
        {characterCount}/{CHARACTER_LIMIT}
      </div>
    </div>
  );
};

export const RichTextEditor = ({ content, onChange }: { content: string, onChange: (html: string, text: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Placeholder.configure({ placeholder: 'Provide a detailed description...' }),
      CharacterCount.configure({ limit: CHARACTER_LIMIT }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    editorProps: { attributes: { class: 'prose prose-slate focus:outline-none min-h-[180px] p-4 text-slate-700' } },
  });

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
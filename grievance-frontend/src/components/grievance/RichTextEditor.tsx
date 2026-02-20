import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Bold, Italic, List, ListOrdered, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

const CHAR_LIMIT = 4000;

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 bg-slate-50/50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 text-slate-600 ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 text-slate-600 ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 text-slate-600 ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-200 text-slate-600 ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

export default function DescriptionEditor({ description, onDescriptionChange }: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Provide detailed description...' }),
      CharacterCount.configure({ limit: CHAR_LIMIT }),
    ],
    content: description, 
    onUpdate: ({ editor }) => {
      onDescriptionChange(editor.getHTML()); 
    },
  });


  useEffect(() => {
    if (editor && description !== editor.getHTML()) {
      // 
    }
  }, [description, editor]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <label className="font-semibold text-slate-800">Grievance Description</label>
        <span className="text-xs text-slate-400 font-bold">
          {editor?.storage.characterCount.characters() || 0} / {CHAR_LIMIT}
        </span>
      </div>

      <MenuBar editor={editor} />
      
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
        <AlertCircle size={14} />
        <span>Be specific about vessel names, dates, and locations.</span>
      </div>

      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        /* REQUIRED FOR LISTS TO WORK */
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
        .ProseMirror li { margin: 0.25rem 0; }
      `}</style>
    </div>
  );
}
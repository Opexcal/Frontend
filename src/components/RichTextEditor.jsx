import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect } from "react"

const RichTextEditor = ({ value, onChange, placeholder, maxLength }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        blockquote: true,
        bulletList: true,
        orderedList: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something...",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  // Sync external value → editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false)
    }
  }, [value, editor])

  if (!editor) return null

  const textLength = editor.getText().length

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border rounded-md p-2 bg-muted">
        <ToolbarButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>

        <Divider />

        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          S
        </ToolbarButton>

        <Divider />

        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => {
            const url = prompt("Enter link")
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()}>
          Unlink
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="min-h-[16rem] rounded-md border p-3 prose prose-sm max-w-none focus:outline-none"
      />

      {/* Character counter */}
      {maxLength && (
        <div className={`text-xs text-right ${textLength > maxLength ? "text-red-500" : "text-muted-foreground"}`}>
          {textLength} / {maxLength} characters
        </div>
      )}
    </div>
  )
}

export default RichTextEditor

/* ---------------------------------- */
/* Toolbar Helpers                    */
/* ---------------------------------- */

const ToolbarButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 text-sm rounded border ${
      active ? "bg-primary text-primary-foreground" : "bg-background"
    }`}
  >
    {children}
  </button>
)

const Divider = () => <span className="mx-1 h-6 w-px bg-border" />

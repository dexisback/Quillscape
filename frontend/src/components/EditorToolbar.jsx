import { Bold, Italic, Highlighter, Eraser, Pencil } from 'lucide-react'
import { useSlate, ReactEditor } from 'slate-react'
import { isMarkActive, toggleMark, clearFormatting } from './editorTools'

export default function EditorToolbar({ onDoodleClick }) {
    const editor = useSlate()

    function handleBold(e) {
        e.preventDefault()
        toggleMark(editor, 'bold')
        ReactEditor.focus(editor)
    }

    function handleItalic(e) {
        e.preventDefault()
        toggleMark(editor, 'italic')
        ReactEditor.focus(editor)
    }

    function handleHighlight(e) {
        e.preventDefault()
        toggleMark(editor, 'highlight')
        ReactEditor.focus(editor)
    }

    function handleEraser(e) {
        e.preventDefault()
        clearFormatting(editor)
        ReactEditor.focus(editor)
    }

    function handleDoodle(e) {
        e.preventDefault()
        if (onDoodleClick) {
            onDoodleClick()
        }
    }

    const isBoldActive = isMarkActive(editor, 'bold')
    const isItalicActive = isMarkActive(editor, 'italic')
    const isHighlightActive = isMarkActive(editor, 'highlight')

    return (
        <div
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
            style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(12px) saturate(150%)',
                WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
        >
            <ToolbarButton onClick={handleBold} isActive={isBoldActive} title="Bold (Ctrl+B)">
                <Bold className="w-3.5 h-3.5" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton onClick={handleItalic} isActive={isItalicActive} title="Italic (Ctrl+I)">
                <Italic className="w-3.5 h-3.5" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton onClick={handleHighlight} isActive={isHighlightActive} title="Highlight (Ctrl+H)">
                <Highlighter className="w-3.5 h-3.5" strokeWidth={2} />
            </ToolbarButton>

            <div className="w-5 h-px my-0.5" style={{ backgroundColor: 'rgba(82, 82, 82, 0.15)' }} />

            <ToolbarButton onClick={handleEraser} isActive={false} title="Clear Formatting">
                <Eraser className="w-3.5 h-3.5" strokeWidth={2} />
            </ToolbarButton>

            <ToolbarButton onClick={handleDoodle} isActive={false} title="Draw a Doodle">
                <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
            </ToolbarButton>
        </div>
    )
}

function ToolbarButton({ children, onClick, isActive, title }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{
                color: isActive ? '#ffffff' : '#525252',
                backgroundColor: isActive ? '#3d3d3d' : 'transparent',
                boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(82, 82, 82, 0.1)'
                }
            }}
            onMouseLeave={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                }
            }}
        >
            {children}
        </button>
    )
}

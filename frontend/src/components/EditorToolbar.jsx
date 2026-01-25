import { Bold, Italic, Highlighter, Eraser, PenTool } from 'lucide-react'
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
            className="flex flex-col items-center gap-2 p-3 rounded-xl"
            style={{
                backgroundColor: 'rgba(139, 115, 85, 0.08)',
                border: '1px solid rgba(139, 115, 85, 0.15)',
            }}
        >
            <ToolbarButton onClick={handleBold} isActive={isBoldActive} title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={handleItalic} isActive={isItalicActive} title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={handleHighlight} isActive={isHighlightActive} title="Highlight (Ctrl+H)">
                <Highlighter className="w-4 h-4" />
            </ToolbarButton>

            <div className="w-6 h-px my-1" style={{ backgroundColor: 'rgba(139, 115, 85, 0.25)' }} />

            <ToolbarButton onClick={handleEraser} isActive={false} title="Clear Formatting (Ctrl+Shift+X)">
                <Eraser className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={handleDoodle} isActive={false} title="Draw a Doodle">
                <PenTool className="w-4 h-4" />
            </ToolbarButton>
        </div>
    )
}

function ToolbarButton({ children, onClick, isActive, title }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
                color: isActive ? 'oklch(0.95 0.02 80)' : 'oklch(0.35 0.1 35)',
                backgroundColor: isActive ? 'oklch(0.45 0.12 40)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(100, 80, 60, 0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 115, 85, 0.15)'
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

"use client"

import { useRef } from "react"
import { Bold, Italic, Highlighter, Eraser, Pencil, ImagePlus } from "lucide-react"
import { ReactEditor } from "slate-react"
import type { BaseEditor } from "slate"
import type { HistoryEditor } from "slate-history"
import { isMarkActive, toggleMark, clearFormatting } from "./editorTools"

type RichEditor = BaseEditor & ReactEditor & HistoryEditor

type Props = {
    editor: RichEditor
    onDoodleClick?: () => void
    onImageUpload?: (file: File) => void
}

export default function EditorToolbar({ editor, onDoodleClick, onImageUpload }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    function handleBold(e: React.MouseEvent) {
        e.preventDefault(); toggleMark(editor, "bold"); ReactEditor.focus(editor)
    }
    function handleItalic(e: React.MouseEvent) {
        e.preventDefault(); toggleMark(editor, "italic"); ReactEditor.focus(editor)
    }
    function handleHighlight(e: React.MouseEvent) {
        e.preventDefault(); toggleMark(editor, "highlight"); ReactEditor.focus(editor)
    }
    function handleEraser(e: React.MouseEvent) {
        e.preventDefault(); clearFormatting(editor); ReactEditor.focus(editor)
    }
    function handleDoodle(e: React.MouseEvent) {
        e.preventDefault(); onDoodleClick?.()
    }
    function handleImageClick(e: React.MouseEvent) {
        e.preventDefault(); fileInputRef.current?.click()
    }
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file && onImageUpload) onImageUpload(file)
        e.target.value = ""
    }

    const isBoldActive = isMarkActive(editor, "bold")
    const isItalicActive = isMarkActive(editor, "italic")
    const isHighlightActive = isMarkActive(editor, "highlight")

    return (
        <div
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl"
            style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(12px) saturate(150%)", WebkitBackdropFilter: "blur(12px) saturate(150%)", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)" }}
        >
            <ToolbarButton onClick={handleBold} isActive={isBoldActive} title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>
            <ToolbarButton onClick={handleItalic} isActive={isItalicActive} title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>
            <ToolbarButton onClick={handleHighlight} isActive={isHighlightActive} title="Highlight (Ctrl+H)"><Highlighter className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>

            <div className="w-5 h-px my-0.5" style={{ backgroundColor: "rgba(82, 82, 82, 0.15)" }} />

            <ToolbarButton onClick={handleEraser} isActive={false} title="Clear Formatting"><Eraser className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>
            <ToolbarButton onClick={handleDoodle} isActive={false} title="Draw a Doodle"><Pencil className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>
            <ToolbarButton onClick={handleImageClick} isActive={false} title="Upload Image"><ImagePlus className="w-3.5 h-3.5" strokeWidth={2} /></ToolbarButton>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
    )
}

function ToolbarButton({ children, onClick, isActive, title }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; isActive: boolean; title?: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: isActive ? "#ffffff" : "#525252", backgroundColor: isActive ? "#3d3d3d" : "transparent", boxShadow: isActive ? "0 2px 6px rgba(0, 0, 0, 0.15)" : "none" }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "rgba(82, 82, 82, 0.1)" }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent" }}
        >
            {children}
        </button>
    )
}

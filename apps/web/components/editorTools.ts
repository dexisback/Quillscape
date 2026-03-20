import { Editor, Range } from "slate"

export function isMarkActive(editor: any, format: string): boolean {
    const marks = Editor.marks(editor) as Record<string, unknown> | null
    return marks ? marks[format] === true : false
}

export function toggleMark(editor: any, format: string) {
    if (isMarkActive(editor, format)) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

export function clearFormatting(editor: any) {
    for (const format of ["bold", "italic", "highlight"]) {
        Editor.removeMark(editor, format)
    }
}

export function handleKeyboardShortcuts(event: React.KeyboardEvent, editor: any): boolean {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    if (!isCtrlOrCmd) return false

    if (event.key === "b") { event.preventDefault(); toggleMark(editor, "bold"); return true }
    if (event.key === "i") { event.preventDefault(); toggleMark(editor, "italic"); return true }
    if (event.key === "h") { event.preventDefault(); toggleMark(editor, "highlight"); return true }
    if (event.key === "x" && event.shiftKey) { event.preventDefault(); clearFormatting(editor); return true }
    return false
}

export function hasTextSelection(editor: any): boolean {
    const { selection } = editor
    if (!selection) return false
    return !Range.isCollapsed(selection)
}

export function getSelectedText(editor: any): string {
    const { selection } = editor
    if (!selection) return ""
    return Editor.string(editor, selection)
}

import { Editor } from 'slate'

export function isMarkActive(editor, format) {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
}

export function toggleMark(editor, format) {
    const isActive = isMarkActive(editor, format)
    if (isActive) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

export function clearFormatting(editor) {
    const formats = ['bold', 'italic', 'highlight']
    for (let i = 0; i < formats.length; i++) {
        Editor.removeMark(editor, formats[i])
    }
}

export function handleKeyboardShortcuts(event, editor) {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    if (!isCtrlOrCmd) return false

    if (event.key === 'b') {
        event.preventDefault()
        toggleMark(editor, 'bold')
        return true
    }
    if (event.key === 'i') {
        event.preventDefault()
        toggleMark(editor, 'italic')
        return true
    }
    if (event.key === 'h') {
        event.preventDefault()
        toggleMark(editor, 'highlight')
        return true
    }
    if (event.key === 'x' && event.shiftKey) {
        event.preventDefault()
        clearFormatting(editor)
        return true
    }
    return false
}

export function hasTextSelection(editor) {
    const { selection } = editor
    if (!selection) return false
    return !Editor.isCollapsed(editor, selection)
}

export function getSelectedText(editor) {
    const { selection } = editor
    if (!selection) return ''
    return Editor.string(editor, selection)
}

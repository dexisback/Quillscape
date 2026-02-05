import { Editor, Transforms, Range, Point } from 'slate'

const MARKDOWN_SHORTCUTS = {
    '*': 'bulleted-list',
    '-': 'bulleted-list',
    '+': 'bulleted-list',
    '>': 'block-quote',
    '#': 'heading-one',
    '##': 'heading-two',
    '###': 'heading-three',
    '1.': 'numbered-list',
}

export function withMarkdownShortcuts(editor) {
    const { insertText, deleteBackward } = editor

    editor.insertText = (text) => {
        const { selection } = editor

        if (text === ' ' && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection
            const block = Editor.above(editor, {
                match: n => Editor.isBlock(editor, n),
            })
            const path = block ? block[1] : []
            const start = Editor.start(editor, path)
            const range = { anchor, focus: start }
            const beforeText = Editor.string(editor, range)
            const type = MARKDOWN_SHORTCUTS[beforeText]

            if (type) {
                Transforms.select(editor, range)
                Transforms.delete(editor)
                const newProperties = { type }
                Transforms.setNodes(editor, newProperties, {
                    match: n => Editor.isBlock(editor, n),
                })

                if (type === 'bulleted-list' || type === 'numbered-list') {
                    const list = { type, children: [] }
                    Transforms.wrapNodes(editor, list, {
                        match: n => n.type === type,
                    })
                }

                return
            }
        }

        if (selection && Range.isCollapsed(selection)) {
            const inlineResult = handleInlineMarkdown(editor, text)
            if (inlineResult) return
        }

        insertText(text)
    }

    editor.deleteBackward = (...args) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: n => Editor.isBlock(editor, n),
            })

            if (match) {
                const [block, path] = match
                const start = Editor.start(editor, path)

                if (
                    block.type !== 'paragraph' &&
                    Point.equals(selection.anchor, start)
                ) {
                    Transforms.setNodes(editor, { type: 'paragraph' })

                    if (block.type === 'bulleted-list' || block.type === 'numbered-list') {
                        Transforms.unwrapNodes(editor, {
                            match: n => n.type === block.type,
                            split: true,
                        })
                    }

                    return
                }
            }
        }

        deleteBackward(...args)
    }

    return editor
}

function handleInlineMarkdown(editor, text) {
    const { selection } = editor
    if (!selection) return false

    const { anchor } = selection
    const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
    })

    if (!block) return false

    const path = block[1]
    const start = Editor.start(editor, path)
    const range = { anchor, focus: start }
    const beforeText = Editor.string(editor, range)

    if (text === '*' && beforeText.endsWith('*') && !beforeText.endsWith('**')) {
        const match = beforeText.match(/\*([^*]+)$/)
        if (match) {
            const textToFormat = match[1]
            const startOffset = anchor.offset - textToFormat.length - 1

            Transforms.delete(editor, {
                at: {
                    anchor: { path: anchor.path, offset: startOffset },
                    focus: anchor
                }
            })

            Transforms.insertNodes(editor, [
                { text: textToFormat, italic: true }
            ])

            return true
        }
    }

    if (text === '*' && beforeText.endsWith('**')) {
        const match = beforeText.match(/\*\*([^*]+)\*$/)
        if (match) {
            const textToFormat = match[1]
            const startOffset = anchor.offset - textToFormat.length - 3

            Transforms.delete(editor, {
                at: {
                    anchor: { path: anchor.path, offset: startOffset },
                    focus: anchor
                }
            })

            Transforms.insertNodes(editor, [
                { text: textToFormat, bold: true }
            ])

            return true
        }
    }

    if (text === '`' && beforeText.includes('`') && !beforeText.endsWith('``')) {
        const lastBacktick = beforeText.lastIndexOf('`')
        const textToFormat = beforeText.slice(lastBacktick + 1)

        if (textToFormat.length > 0) {
            const startOffset = anchor.offset - textToFormat.length - 1

            Transforms.delete(editor, {
                at: {
                    anchor: { path: anchor.path, offset: startOffset },
                    focus: anchor
                }
            })

            Transforms.insertNodes(editor, [
                { text: textToFormat, code: true }
            ])

            return true
        }
    }

    return false
}

export function withImages(editor) {
    const { isVoid } = editor

    editor.isVoid = (element) => {
        return element.type === 'image' ? true : isVoid(element)
    }

    return editor
}

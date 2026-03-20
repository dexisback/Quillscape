import { Editor, Transforms, Range, Point } from "slate"

const MARKDOWN_SHORTCUTS: Record<string, string> = {
    "*": "bulleted-list", "-": "bulleted-list", "+": "bulleted-list",
    ">": "block-quote", "#": "heading-one", "##": "heading-two",
    "###": "heading-three", "1.": "numbered-list",
}

export function withMarkdownShortcuts(editor: any): any {
    const { insertText, deleteBackward } = editor

    editor.insertText = (text: any) => {
        const { selection } = editor

        if (text === " " && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection
            const block = Editor.above(editor, { match: (n: any) => Editor.isBlock(editor, n) })
            const path = block ? block[1] : []
            const start = Editor.start(editor, path)
            const range = { anchor, focus: start }
            const beforeText = Editor.string(editor, range)
            const type = MARKDOWN_SHORTCUTS[beforeText]

            if (type) {
                Transforms.select(editor, range)
                Transforms.delete(editor)
                Transforms.setNodes(editor, { type } as any, { match: (n: any) => Editor.isBlock(editor, n) })
                if (type === "bulleted-list" || type === "numbered-list") {
                    Transforms.wrapNodes(editor, { type, children: [] } as any, { match: (n: any) => n.type === type })
                }
                return
            }
        }

        if (selection && Range.isCollapsed(selection)) {
            if (handleInlineMarkdown(editor, text)) return
        }

        insertText(text)
    }

    editor.deleteBackward = (...args: any[]) => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, { match: (n: any) => Editor.isBlock(editor, n) })

            if (match) {
                const [block, path] = match as [any, any]
                const start = Editor.start(editor, path)

                if (block.type !== "paragraph" && Point.equals(selection.anchor, start)) {
                    Transforms.setNodes(editor, { type: "paragraph" } as any)
                    if (block.type === "bulleted-list" || block.type === "numbered-list") {
                        Transforms.unwrapNodes(editor, { match: (n: any) => n.type === block.type, split: true })
                    }
                    return
                }
            }
        }

        deleteBackward(...args)
    }

    return editor
}

function handleInlineMarkdown(editor: any, text: string): boolean {
    const { selection } = editor
    if (!selection) return false

    const { anchor } = selection
    const block = Editor.above(editor, { match: (n: any) => Editor.isBlock(editor, n) })
    if (!block) return false

    const path = block[1]
    const start = Editor.start(editor, path)
    const range = { anchor, focus: start }
    const beforeText = Editor.string(editor, range)

    if (text === "*" && beforeText.endsWith("*") && !beforeText.endsWith("**")) {
        const match = beforeText.match(/\*([^*]+)$/)
        if (match) {
            const textToFormat = match[1]
            const startOffset = anchor.offset - textToFormat.length - 1
            Transforms.delete(editor, { at: { anchor: { path: anchor.path, offset: startOffset }, focus: anchor } })
            Transforms.insertNodes(editor, [{ text: textToFormat, italic: true }] as any)
            return true
        }
    }

    if (text === "*" && beforeText.endsWith("**")) {
        const match = beforeText.match(/\*\*([^*]+)\*$/)
        if (match) {
            const textToFormat = match[1]
            const startOffset = anchor.offset - textToFormat.length - 3
            Transforms.delete(editor, { at: { anchor: { path: anchor.path, offset: startOffset }, focus: anchor } })
            Transforms.insertNodes(editor, [{ text: textToFormat, bold: true }] as any)
            return true
        }
    }

    if (text === "`" && beforeText.includes("`") && !beforeText.endsWith("``")) {
        const lastBacktick = beforeText.lastIndexOf("`")
        const textToFormat = beforeText.slice(lastBacktick + 1)
        if (textToFormat.length > 0) {
            const startOffset = anchor.offset - textToFormat.length - 1
            Transforms.delete(editor, { at: { anchor: { path: anchor.path, offset: startOffset }, focus: anchor } })
            Transforms.insertNodes(editor, [{ text: textToFormat, code: true }] as any)
            return true
        }
    }

    return false
}

export function withImages(editor: any): any {
    const { isVoid, insertData } = editor

    editor.isVoid = (element: any) => element.type === "image" ? true : isVoid(element)

    editor.insertData = (data: any) => {
        const files = data.files
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader()
                    reader.onload = () => {
                        Transforms.insertNodes(editor, { type: "image", url: reader.result, children: [{ text: "" }] } as any)
                    }
                    reader.readAsDataURL(file)
                    return
                }
            }
        }
        insertData(data)
    }

    return editor
}

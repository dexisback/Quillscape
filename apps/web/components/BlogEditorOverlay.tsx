"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createBlog, updateBlog } from "@/lib/api/blogs"
import { useAuth } from "@/context/AuthContext"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { createEditor, Transforms, type Descendant } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"

import { handleKeyboardShortcuts } from "./editorTools"
import EditorToolbar from "./EditorToolbar"
import DoodleCanvas from "./DoodleCanvas"

import { withMarkdownShortcuts, withImages, slateToMarkdown, markdownToSlate } from "@/lib/slate"

type Props = {
    readOnly?: boolean
    isOpen: boolean
    onClose: () => void
    onBlogCreated?: () => void | Promise<void>
    editMode?: boolean
    blogId?: string | null
    initialTitle?: string
    initialBody?: string
    onBlogUpdated?: (data: any) => void
}

const EMPTY_PARAGRAPH: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] } as Descendant]

export default function BlogEditorOverlay({
    readOnly,
    isOpen,
    onClose,
    onBlogCreated,
    editMode = false,
    blogId = null,
    initialTitle = "",
    initialBody = "",
    onBlogUpdated,
}: Props) {
    const { user } = useAuth()
    const [title, setTitle] = useState(initialTitle)
    const [body, setBody] = useState(initialBody)
    const [loading, setLoading] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isDoodleOpen, setIsDoodleOpen] = useState(false)
    const bodyEditorRef = useRef<HTMLDivElement>(null)

    const titleEditor = useMemo(() => withHistory(withReact(createEditor())), [])
    const bodyEditor = useMemo(() => withMarkdownShortcuts(withImages(withHistory(withReact(createEditor())))), [])

    const getInitialSlateValue = useCallback((text: string): Descendant[] => {
        if (!text) return EMPTY_PARAGRAPH
        return markdownToSlate(text)
    }, [])

    const [titleSlateValue, setTitleSlateValue] = useState<Descendant[]>(() => [{ type: "paragraph", children: [{ text: initialTitle || "" }] } as Descendant])
    const [bodySlateValue, setBodySlateValue] = useState<Descendant[]>(() => getInitialSlateValue(initialBody))

    useEffect(() => {
        setTitle(initialTitle)
        setBody(initialBody)
        const newBodyValue = getInitialSlateValue(initialBody)
        const newTitleValue: Descendant[] = [{ type: "paragraph", children: [{ text: initialTitle || "" }] } as Descendant]
        setBodySlateValue(newBodyValue)
        setTitleSlateValue(newTitleValue)
        bodyEditor.children = newBodyValue
        titleEditor.children = newTitleValue
        try { Transforms.select(bodyEditor, { path: [0, 0], offset: 0 }) } catch {}
    }, [initialTitle, initialBody, bodyEditor, titleEditor, getInitialSlateValue])

    useEffect(() => {
        if (!isOpen) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => { document.body.style.overflow = previousOverflow }
    }, [isOpen])

    const handleBodyKeyDown = useCallback((event: React.KeyboardEvent) => {
        handleKeyboardShortcuts(event, bodyEditor)
    }, [bodyEditor])

    function handleDoodleSave(dataUrl: string) {
        Transforms.insertNodes(bodyEditor, { type: "image", url: dataUrl, children: [{ text: "" }] } as any)
        Transforms.insertNodes(bodyEditor, { type: "paragraph", children: [{ text: "" }] } as any)
    }

    function handleImageUpload(file: File) {
        if (!file || !file.type.startsWith("image/")) return
        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            Transforms.insertNodes(bodyEditor, { type: "image", url: dataUrl, children: [{ text: "" }] } as any)
            Transforms.insertNodes(bodyEditor, { type: "paragraph", children: [{ text: "" }] } as any)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (status?: string | null) => {
        if (!title.trim() || !body.trim()) { alert("Please fill both title and body before submitting."); return }
        if (!user) { alert("You must be logged in."); return }
        setLoading(true)
        try {
            if (editMode && blogId) {
                const data: any = { title: title.trim(), body: body.trim() }
                if (status) data.status = status
                await updateBlog(blogId, data)
                onBlogUpdated?.({ _id: blogId, ...data })
                onClose()
            } else {
                const data = { title: title.trim(), body: body.trim(), status }
                await createBlog(data)
                setTitle(""); setBody("")
                setTitleSlateValue(EMPTY_PARAGRAPH); setBodySlateValue(EMPTY_PARAGRAPH)
                if (onBlogCreated) await Promise.resolve(onBlogCreated())
                onClose()
            }
        } catch {
            alert("Failed to save. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (title.trim() !== initialTitle || body.trim() !== initialBody) {
            if (!confirm("You have unsaved changes. Are you sure you want to close?")) return
        }
        if (!editMode) { setTitle(""); setBody("") }
        setIsFullscreen(false)
        onClose()
    }

    const handleTitleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault()
            try { Transforms.select(bodyEditor, { path: [0, 0], offset: 0 }); bodyEditorRef.current?.focus() } catch {}
        }
    }, [bodyEditor])

    const handleRenderElement = useCallback((props: any) => {
        const { attributes, children, element } = props
        switch (element.type) {
            case "heading-one": return <h1 {...attributes} style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem", marginTop: "1rem", fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: "#262626" }}>{children}</h1>
            case "heading-two": return <h2 {...attributes} style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", marginTop: "0.75rem", fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em", color: "#262626" }}>{children}</h2>
            case "heading-three": return <h3 {...attributes} style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", marginTop: "0.5rem", fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em", color: "#262626" }}>{children}</h3>
            case "block-quote": return <blockquote {...attributes} style={{ borderLeft: "3px solid #d4a574", paddingLeft: "1rem", marginLeft: 0, marginTop: "0.5rem", marginBottom: "0.5rem", color: "#525252", fontStyle: "italic" }}>{children}</blockquote>
            case "bulleted-list": return <ul {...attributes} style={{ marginLeft: "1.5rem", marginTop: "0.5rem", marginBottom: "0.5rem", listStyleType: "disc", paddingLeft: "0.5rem" }}>{children}</ul>
            case "numbered-list": return <ol {...attributes} style={{ marginLeft: "1.5rem", marginTop: "0.5rem", marginBottom: "0.5rem", listStyleType: "decimal", paddingLeft: "0.5rem" }}>{children}</ol>
            case "list-item": return <li {...attributes} style={{ marginBottom: "0.25rem", display: "list-item" }}>{children}</li>
            case "code-block": return <pre {...attributes} style={{ backgroundColor: "rgba(38, 38, 38, 0.06)", padding: "1rem", borderRadius: "0.5rem", fontFamily: "monospace", fontSize: "0.875rem", overflow: "auto", marginTop: "0.5rem", marginBottom: "0.5rem" }}><code>{children}</code></pre>
            case "image": return <div {...attributes} contentEditable={false} style={{ margin: "1rem 0" }}><img src={element.url} alt={element.alt || "Image"} style={{ maxWidth: "100%", borderRadius: "8px", border: "1px solid rgba(38, 38, 38, 0.1)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)" }} />{children}</div>
            case "link": return <a {...attributes} href={element.url} style={{ color: "#d4a574", textDecoration: "underline", textUnderlineOffset: "2px" }}>{children}</a>
            default: return <p {...attributes} style={{ marginBottom: "0.5rem" }}>{children}</p>
        }
    }, [])

    const handleRenderLeaf = useCallback((props: any) => {
        const { attributes, leaf } = props
        let { children } = props
        if (leaf.bold) children = <strong style={{ fontWeight: 700 }}>{children}</strong>
        if (leaf.italic) children = <em style={{ fontStyle: "italic" }}>{children}</em>
        if (leaf.code) children = <code style={{ backgroundColor: "rgba(38, 38, 38, 0.08)", padding: "0.15rem 0.3rem", borderRadius: "3px", fontFamily: "monospace", fontSize: "0.9em" }}>{children}</code>
        if (leaf.strikethrough) children = <s>{children}</s>
        if (leaf.highlight) children = <mark style={{ backgroundColor: "oklch(0.88 0.12 80)", padding: "0.1em 0.2em", borderRadius: "2px" }}>{children}</mark>
        return <span {...attributes}>{children}</span>
    }, [])

    if (!isOpen) return null

    return (
        <div className={`fixed inset-0 z-50 flex ${isFullscreen ? "items-stretch justify-stretch p-0" : "items-center justify-center p-2 sm:p-4 md:p-6"}`}>
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={handleClose} aria-hidden />

            <div
                className={`relative flex w-full flex-col overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 ${isFullscreen ? "h-[100dvh] max-h-[100dvh] max-w-[100vw] rounded-none" : "max-h-[min(92dvh,900px)] max-w-4xl rounded-2xl md:rounded-3xl"}`}
                style={{
                    backgroundColor: "#fef9c3",
                    backgroundImage:
                        "radial-gradient(ellipse at 20% 15%, rgba(255, 255, 255, 0.45) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(253, 224, 71, 0.14) 0%, transparent 50%)",
                }}
            >
                {/* Header: title + window actions (aligned with other app shells) */}
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-800/10 px-4 pt-4 pb-3.5 md:px-8 md:pt-7 md:pb-5">
                    <div className="min-w-0 flex-1 pr-2">
                        <Slate editor={titleEditor} initialValue={titleSlateValue} onChange={(v) => { setTitleSlateValue(v); setTitle((v[0] as any)?.children[0]?.text || "") }}>
                            <Editable
                                readOnly={loading || readOnly}
                                placeholder="Untitled"
                                onKeyDown={handleTitleKeyDown}
                                className="inter-tight"
                                style={{
                                    outline: "none",
                                    fontSize: "clamp(1.35rem, 4vw, 2.125rem)",
                                    fontWeight: 600,
                                    fontFamily: "Inter, system-ui, sans-serif",
                                    letterSpacing: "-0.02em",
                                    color: "var(--color-foreground, #262626)",
                                    textAlign: "left",
                                    lineHeight: 1.25,
                                }}
                            />
                        </Slate>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pt-0.5">
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="rounded-full p-2.5 text-muted-foreground transition-all hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" strokeWidth={1.5} /> : <Maximize2 className="h-4 w-4" strokeWidth={1.5} />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full p-2.5 text-muted-foreground transition-all hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                            aria-label="Close editor"
                        >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                    </div>
                </header>

                {/* Scrollable editor body */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
                    <Slate editor={bodyEditor} initialValue={bodySlateValue} onChange={(v) => { setBodySlateValue(v); setBody(slateToMarkdown(v)) }}>
                        <div className="flex gap-5 lg:gap-6">
                            <div className="min-w-0 flex-1">
                                <Editable
                                    ref={bodyEditorRef}
                                    readOnly={loading || readOnly}
                                    placeholder="Tell your story..."
                                    onKeyDown={handleBodyKeyDown}
                                    renderLeaf={handleRenderLeaf}
                                    renderElement={handleRenderElement}
                                    className="inter-tight"
                                    style={{
                                        outline: "none",
                                        minHeight: "min(50vh, 380px)",
                                        fontSize: "1.0625rem",
                                        lineHeight: 1.75,
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        letterSpacing: "-0.01em",
                                        color: "var(--color-foreground, #404040)",
                                        textAlign: "left",
                                    }}
                                />
                            </div>

                            {!readOnly && (
                                <aside className="sticky top-2 hidden h-fit shrink-0 self-start md:block">
                                    <EditorToolbar editor={bodyEditor} onDoodleClick={() => setIsDoodleOpen(true)} onImageUpload={handleImageUpload} />
                                </aside>
                            )}
                        </div>

                        {!readOnly && (
                            <div className="mt-5 border-t border-neutral-800/10 pt-4 md:hidden">
                                <EditorToolbar editor={bodyEditor} onDoodleClick={() => setIsDoodleOpen(true)} onImageUpload={handleImageUpload} />
                            </div>
                        )}
                    </Slate>

                    <style>{`[data-slate-placeholder]{position:absolute!important;left:0!important;top:0!important;text-align:left!important;width:100%!important;opacity:0.4!important;pointer-events:none!important;}`}</style>
                </div>

                {!readOnly && (
                    <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-neutral-800/10 bg-white/35 px-4 py-3.5 backdrop-blur-sm dark:bg-black/20 md:gap-3 md:px-8 md:py-4">
                        <button
                            type="button"
                            onClick={() => handleSubmit(editMode ? null : "draft")}
                            disabled={loading}
                            className="rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.08]"
                        >
                            {loading ? "…" : editMode ? "Save" : "Draft"}
                        </button>
                        {!editMode && (
                            <button
                                type="button"
                                onClick={() => handleSubmit("published")}
                                disabled={loading}
                                className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ backgroundColor: "#3d3d3d" }}
                            >
                                {loading ? "…" : "Publish"}
                            </button>
                        )}
                    </footer>
                )}
            </div>

            <DoodleCanvas isOpen={isDoodleOpen} onClose={() => setIsDoodleOpen(false)} onSave={handleDoodleSave} />
        </div>
    )
}

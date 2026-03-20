import { unified } from "unified"
import remarkParse from "remark-parse"
// @ts-ignore — remark-slate has no type declarations
import remarkSlate from "remark-slate"
import type { Descendant } from "slate"

function transformNodes(nodes: any[]): any[] {
    if (!Array.isArray(nodes)) return nodes
    return nodes.map((node) => {
        if (node.type === "img" || node.type === "image") {
            return {
                type: "image",
                url: node.url || node.link || node.src || "",
                alt: node.alt || "image",
                children: [{ text: "" }],
            }
        }
        if (node.children && Array.isArray(node.children)) {
            return { ...node, children: transformNodes(node.children) }
        }
        return node
    })
}

export function markdownToSlate(markdown: string): Descendant[] {
    if (!markdown || typeof markdown !== "string") {
        return [{ type: "paragraph", children: [{ text: "" }] } as Descendant]
    }
    try {
        const processor = unified().use(remarkParse).use(remarkSlate)
        const result = processor.processSync(markdown)
        const slateNodes = result.result as any[]
        if (!slateNodes || slateNodes.length === 0) {
            return [{ type: "paragraph", children: [{ text: "" }] } as Descendant]
        }
        return transformNodes(slateNodes) as Descendant[]
    } catch {
        return [{ type: "paragraph", children: [{ text: markdown }] } as Descendant]
    }
}

export function slateToMarkdown(slateNodes: Descendant[]): string {
    if (!slateNodes || !Array.isArray(slateNodes)) return ""
    return slateNodes.map(serializeNode).join("\n")
}

function serializeNode(node: any): string {
    if (!node) return ""
    if (node.type === "paragraph") return serializeChildren(node.children)
    if (node.type === "heading-one" || node.type === "heading_one") return `# ${serializeChildren(node.children)}`
    if (node.type === "heading-two" || node.type === "heading_two") return `## ${serializeChildren(node.children)}`
    if (node.type === "heading-three" || node.type === "heading_three") return `### ${serializeChildren(node.children)}`
    if (node.type === "block-quote" || node.type === "blockquote") return `> ${serializeChildren(node.children)}`
    if (node.type === "bulleted-list" || node.type === "ul_list") return node.children.map((li: any) => `- ${serializeChildren(li.children)}`).join("\n")
    if (node.type === "numbered-list" || node.type === "ol_list") return node.children.map((li: any, i: number) => `${i + 1}. ${serializeChildren(li.children)}`).join("\n")
    if (node.type === "code-block" || node.type === "code_block") return "```\n" + serializeChildren(node.children) + "\n```"
    if (node.type === "image") return `![${node.alt || "image"}](${node.url || ""})`
    if (node.type === "link") return `[${serializeChildren(node.children)}](${node.url || ""})`
    if (node.children) return serializeChildren(node.children)
    if (node.text !== undefined) return serializeLeaf(node)
    return ""
}

function serializeChildren(children: any[]): string {
    if (!children || !Array.isArray(children)) return ""
    return children.map((child) => (child.text !== undefined ? serializeLeaf(child) : serializeNode(child))).join("")
}

function serializeLeaf(leaf: any): string {
    let text = leaf.text || ""
    if (leaf.bold) text = `**${text}**`
    if (leaf.italic) text = `*${text}*`
    if (leaf.code) text = "`" + text + "`"
    if (leaf.strikethrough) text = `~~${text}~~`
    return text
}

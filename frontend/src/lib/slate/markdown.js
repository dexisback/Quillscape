import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkSlate from 'remark-slate'

export function markdownToSlate(markdown) {
    if (!markdown || typeof markdown !== 'string') {
        return [{ type: 'paragraph', children: [{ text: '' }] }]
    }

    try {
        const processor = unified().use(remarkParse).use(remarkSlate)
        const result = processor.processSync(markdown)
        const slateNodes = result.result

        if (!slateNodes || slateNodes.length === 0) {
            return [{ type: 'paragraph', children: [{ text: '' }] }]
        }

        return slateNodes
    } catch (error) {
        console.error('Markdown to Slate conversion error:', error)
        return [{ type: 'paragraph', children: [{ text: markdown }] }]
    }
}

export function slateToMarkdown(slateNodes) {
    if (!slateNodes || !Array.isArray(slateNodes)) {
        return ''
    }

    const lines = []

    for (const node of slateNodes) {
        lines.push(serializeNode(node))
    }

    return lines.join('\n')
}

function serializeNode(node) {
    if (!node) return ''

    if (node.type === 'paragraph') {
        return serializeChildren(node.children)
    }

    if (node.type === 'heading-one' || node.type === 'heading_one') {
        return `# ${serializeChildren(node.children)}`
    }

    if (node.type === 'heading-two' || node.type === 'heading_two') {
        return `## ${serializeChildren(node.children)}`
    }

    if (node.type === 'heading-three' || node.type === 'heading_three') {
        return `### ${serializeChildren(node.children)}`
    }

    if (node.type === 'block-quote' || node.type === 'blockquote') {
        return `> ${serializeChildren(node.children)}`
    }

    if (node.type === 'bulleted-list' || node.type === 'ul_list') {
        return node.children.map(li => `- ${serializeChildren(li.children)}`).join('\n')
    }

    if (node.type === 'numbered-list' || node.type === 'ol_list') {
        return node.children.map((li, i) => `${i + 1}. ${serializeChildren(li.children)}`).join('\n')
    }

    if (node.type === 'code-block' || node.type === 'code_block') {
        return '```\n' + serializeChildren(node.children) + '\n```'
    }

    if (node.type === 'image') {
        return `![${node.alt || 'image'}](${node.url || ''})`
    }

    if (node.type === 'link') {
        return `[${serializeChildren(node.children)}](${node.url || ''})`
    }

    if (node.children) {
        return serializeChildren(node.children)
    }

    if (node.text !== undefined) {
        return serializeLeaf(node)
    }

    return ''
}

function serializeChildren(children) {
    if (!children || !Array.isArray(children)) return ''
    return children.map(child => {
        if (child.text !== undefined) {
            return serializeLeaf(child)
        }
        return serializeNode(child)
    }).join('')
}

function serializeLeaf(leaf) {
    let text = leaf.text || ''

    if (leaf.bold) {
        text = `**${text}**`
    }
    if (leaf.italic) {
        text = `*${text}*`
    }
    if (leaf.code) {
        text = '`' + text + '`'
    }
    if (leaf.strikethrough) {
        text = `~~${text}~~`
    }

    return text
}

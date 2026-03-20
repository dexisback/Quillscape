export function renderElement({ attributes, children, element }) {
    switch (element.type) {
        case 'heading-one':
        case 'heading_one':
            return (
                <h1
                    {...attributes}
                    style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        marginTop: '1rem',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.02em',
                        color: '#262626'
                    }}
                >
                    {children}
                </h1>
            )

        case 'heading-two':
        case 'heading_two':
            return (
                <h2
                    {...attributes}
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        marginTop: '0.75rem',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.02em',
                        color: '#262626'
                    }}
                >
                    {children}
                </h2>
            )

        case 'heading-three':
        case 'heading_three':
            return (
                <h3
                    {...attributes}
                    style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        marginTop: '0.5rem',
                        fontFamily: 'Inter, sans-serif',
                        letterSpacing: '-0.01em',
                        color: '#262626'
                    }}
                >
                    {children}
                </h3>
            )

        case 'block-quote':
        case 'blockquote':
            return (
                <blockquote
                    {...attributes}
                    style={{
                        borderLeft: '3px solid #d4a574',
                        paddingLeft: '1rem',
                        marginLeft: 0,
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem',
                        color: '#525252',
                        fontStyle: 'italic'
                    }}
                >
                    {children}
                </blockquote>
            )

        case 'bulleted-list':
        case 'ul_list':
            return (
                <ul
                    {...attributes}
                    style={{
                        marginLeft: '1.5rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem',
                        listStyleType: 'disc'
                    }}
                >
                    {children}
                </ul>
            )

        case 'numbered-list':
        case 'ol_list':
            return (
                <ol
                    {...attributes}
                    style={{
                        marginLeft: '1.5rem',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem',
                        listStyleType: 'decimal'
                    }}
                >
                    {children}
                </ol>
            )

        case 'list-item':
        case 'li':
            return (
                <li
                    {...attributes}
                    style={{
                        marginBottom: '0.25rem'
                    }}
                >
                    {children}
                </li>
            )

        case 'code-block':
        case 'code_block':
            return (
                <pre
                    {...attributes}
                    style={{
                        backgroundColor: 'rgba(38, 38, 38, 0.05)',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        marginTop: '0.5rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    <code>{children}</code>
                </pre>
            )

        case 'image':
            return (
                <div {...attributes} contentEditable={false} style={{ margin: '1rem 0' }}>
                    <img
                        src={element.url}
                        alt={element.alt || 'Image'}
                        style={{
                            maxWidth: '100%',
                            borderRadius: '8px',
                            border: '1px solid rgba(38, 38, 38, 0.1)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                        }}
                    />
                    {children}
                </div>
            )

        case 'link':
            return (
                <a
                    {...attributes}
                    href={element.url}
                    style={{
                        color: '#d4a574',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px'
                    }}
                >
                    {children}
                </a>
            )

        case 'paragraph':
        default:
            return <p {...attributes}>{children}</p>
    }
}

export function renderLeaf({ attributes, children, leaf }) {
    if (leaf.bold) {
        children = <strong style={{ fontWeight: 700 }}>{children}</strong>
    }

    if (leaf.italic) {
        children = <em style={{ fontStyle: 'italic' }}>{children}</em>
    }

    if (leaf.code) {
        children = (
            <code
                style={{
                    backgroundColor: 'rgba(38, 38, 38, 0.08)',
                    padding: '0.15rem 0.3rem',
                    borderRadius: '3px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.9em'
                }}
            >
                {children}
            </code>
        )
    }

    if (leaf.strikethrough) {
        children = <s>{children}</s>
    }

    if (leaf.highlight) {
        children = (
            <mark
                style={{
                    backgroundColor: 'oklch(0.88 0.12 80)',
                    padding: '0.1em 0.2em',
                    borderRadius: '2px',
                }}
            >
                {children}
            </mark>
        )
    }

    return <span {...attributes}>{children}</span>
}

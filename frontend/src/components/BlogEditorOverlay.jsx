//NOTE; logic for converting the title into a SlateComponent present, we just choose to go with the default cursor for now
//dump place for all text editor logic related -- i will implement all the fts i wanted organically for the text editor modal


import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createBlog, updateBlog } from '../api/blogs.api'
import { useAuth } from '../context/AuthContext'
import { X, Maximize2, Minimize2 } from 'lucide-react'

//slate related stuff:
import { createEditor, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

// Rich text editing tools
import { handleKeyboardShortcuts } from './editorTools'
import EditorToolbar from './EditorToolbar'
import DoodleCanvas from './DoodleCanvas'



export default function BlogEditorOverlay({
  isOpen,
  onClose,
  onBlogCreated,
  editMode = false, //blog ka edit mode on/off 
  blogId = null,
  initialTitle = '',
  initialBody = '',
  onBlogUpdated
}) {
  //all stuff init
  const { user } = useAuth() //getting the user 
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [loading, setLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDoodleOpen, setIsDoodleOpen] = useState(false)


  const titleEditor = useMemo(() => withHistory(withReact(createEditor())), []) //title editor slate instance//on mount, create a title editor instance. so the title is NOT just a input field anymore
  const bodyEditor = useMemo(() => withHistory(withReact(createEditor())), []) //body editor slate instance



  // string to array converter so that slate stores it 
  const getInitialSlateValue = useCallback((text) => {
    if (!text) {
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    }
    //else if paragraphs ARE there || something IS written
    const paragraphs = text.split('\n').map(line => ({
      type: 'paragraph',
      children: [{ text: line }]
    }))
    return paragraphs.length > 0 ? paragraphs : [{ type: 'paragraph', children: [{ text: '' }] }]
  }, [])
  //now that title is also a slate, use this:
  const [titleSlateValue, setTitleSlateValue] = useState(() => [{ type: "paragraph", children: [{ text: initialTitle || '' }] }])

  //imp:
  const [bodySlateValue, setBodySlateValue] = useState(() => getInitialSlateValue(initialBody))





  //on moounting, init all the "sets"
  useEffect(() => {
    setTitle(initialTitle)
    setBody(initialBody)
    const newBodyValue = getInitialSlateValue(initialBody)
    const newTitleValue = [{ type: "paragraph", children: [{ text: initialTitle || '' }] }]

    setBodySlateValue(newBodyValue);
    setTitleSlateValue(newTitleValue);
    bodyEditor.children = newBodyValue;
    titleEditor.children = newTitleValue;
    try {
      Transforms.select(bodyEditor, { path: [0, 0], offset: 0 })
    } catch (e) {
      console.log("nothing, ignoring selection errors on init load")
    }
  }, [initialTitle, initialBody, bodyEditor, titleEditor, getInitialSlateValue])

  const renderLeaf = useCallback(({ attributes, children, leaf }) => {
    if (leaf.bold) {
      children = <strong style={{ fontWeight: 700 }}>{children}</strong>
    }
    if (leaf.italic) {
      children = <em style={{ fontStyle: 'italic' }}>{children}</em>
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
  }, [])


  const handleBodyKeyDown = useCallback((event) => {
    handleKeyboardShortcuts(event, bodyEditor)
  }, [bodyEditor])

  function openDoodle() {
    setIsDoodleOpen(true)
  }

  function closeDoodle() {
    setIsDoodleOpen(false)
  }

  function handleDoodleSave(dataUrl) {
    const imageNode = {
      type: 'image',
      url: dataUrl,
      children: [{ text: '' }]
    }
    Transforms.insertNodes(bodyEditor, imageNode)
    Transforms.insertNodes(bodyEditor, {
      type: 'paragraph',
      children: [{ text: '' }]
    })
  }


  const handleSubmit = async (status) => {
    if (!title.trim() || !body.trim()) {
      return alert('Please fill both title and body before submitting.')
    }

    if (!user) {
      return alert('You must be logged in.')
    }
    setLoading(true)
    try {
      if (editMode && blogId) {
        // Update existing blog
        const data = { title: title.trim(), body: body.trim() }
        if (status) {
          data.status = status
        }
        await updateBlog(blogId, data)

        if (onBlogUpdated) {
          onBlogUpdated({ _id: blogId, ...data })
        }
        onClose()
      } else {
        // Create new blog
        const data = { title: title.trim(), body: body.trim(), status }
        const response = await createBlog(data)
        setTitle('')
        setBody('')
        //setting slate values to empty:
        setTitleSlateValue([{ type: "paragraph", children: [{ text: "" }] }]);
        setBodySlateValue([{ type: "paragraph", children: [{ text: "" }] }]);

        if (onBlogCreated && response.data) {
          onBlogCreated(response.data.blog)
        }
        onClose()
      }
    } catch (err) {
      console.error('failed to submit and heres the error', err)
      alert('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (title.trim() !== initialTitle || body.trim() !== initialBody) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return
      }
    }
    if (!editMode) {
      setTitle('')
      setBody('')
    }
    setIsFullscreen(false)
    onClose()
  }

  //extra: only one line title allowed, enter key pressing doesnt do anything
  const handleTitleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }, [])

  if (!isOpen) { return null }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Editor Modal - Old crumbled paper aesthetic */}
      <div
        className={`relative mx-4 shadow-2xl flex flex-col overflow-hidden rounded-2xl transition-all duration-500 ease-out ${isFullscreen
          ? 'w-full h-full max-w-full max-h-full rounded-none'
          : 'w-full max-w-4xl h-[100vh] max-h-[100vh]'
          }`}
        style={{
          // Crumbled paper background color
          backgroundColor: 'oklch(0.94 0.03 80)',
          // Crumbled paper texture
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 3px,
              rgba(139, 115, 85, 0.03) 3px,
              rgba(139, 115, 85, 0.03) 6px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 3px,
              rgba(139, 115, 85, 0.02) 3px,
              rgba(139, 115, 85, 0.02) 6px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 115, 85, 0.015) 2px,
              rgba(139, 115, 85, 0.015) 4px
            ),
            radial-gradient(ellipse at 20% 30%, rgba(139, 115, 85, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(139, 115, 85, 0.02) 0%, transparent 70%)
          `
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(139, 115, 85, 0.2)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'oklch(0.35 0.1 35)' }}>
            {editMode ? 'Edit your story' : 'Write your story'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                color: 'oklch(0.35 0.1 35)',
                backgroundColor: 'rgba(139, 115, 85, 0.1)'
              }}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                color: 'oklch(0.35 0.1 35)',
                backgroundColor: 'rgba(139, 115, 85, 0.1)'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Area - Minimal writing space */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Title - Slate Editor */}
          <div
            style={{ position: 'relative', marginBottom: '1.5rem' }}
          >
            <Slate
              editor={titleEditor}
              initialValue={titleSlateValue}  // You need to create this state
              onChange={(newValue) => {
                setTitleSlateValue(newValue)
                const text = newValue[0]?.children[0]?.text || ''
                setTitle(text)
              }}
            >
              <Editable
                readOnly={loading}
                placeholder="Untitled"
                onKeyDown={handleTitleKeyDown}
                style={{
                  outline: 'none',
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  fontFamily: 'Inter, sans-serif',
                  color: 'oklch(0.25 0.05 40)',
                  textAlign: 'left',
                }}
              />
            </Slate>
          </div>

          {/* Decorative divider - like paper fold line */}
          <div
            className="w-20 h-0.5 rounded mb-8"
            style={{ backgroundColor: 'rgba(139, 115, 85, 0.3)' }}
          />


          <div
            style={{ position: 'relative', flex: 1, minHeight: '400px' }}
          >
            <Slate
              editor={bodyEditor}
              initialValue={bodySlateValue}
              onChange={(newBodyValue) => {
                setBodySlateValue(newBodyValue)
                const text = newBodyValue
                  .map(node => {
                    if (node.type === 'image') return '[doodle]'
                    return node.children.map(child => child.text).join('')
                  })
                  .join('\n')
                setBody(text)
              }}
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <Editable
                    readOnly={loading}
                    placeholder="Tell your story..."
                    onKeyDown={handleBodyKeyDown}
                    renderLeaf={renderLeaf}
                    renderElement={({ attributes, children, element }) => {
                      if (element.type === 'image') {
                        return (
                          <div {...attributes} contentEditable={false} style={{ margin: '1rem 0' }}>
                            <img
                              src={element.url}
                              alt="Doodle"
                              style={{
                                maxWidth: '100%',
                                borderRadius: '8px',
                                border: '2px solid rgba(139, 115, 85, 0.2)',
                                boxShadow: '0 2px 8px rgba(100, 80, 60, 0.1)'
                              }}
                            />
                            {children}
                          </div>
                        )
                      }
                      return <p {...attributes}>{children}</p>
                    }}
                    style={{
                      outline: 'none',
                      minHeight: '400px',
                      fontSize: '18px',
                      lineHeight: '1.7',
                      fontFamily: 'Inter, sans-serif',
                      color: 'oklch(0.3 0.03 40)',
                      textAlign: 'left',
                    }}
                  />
                </div>

                <div className="sticky top-0 self-start">
                  <EditorToolbar onDoodleClick={openDoodle} />
                </div>
              </div>
            </Slate>

            <style>{`
              [data-slate-placeholder] {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                text-align: left !important;
                width: 100% !important;
                opacity: 0.4 !important;
              }
            `}</style>
          </div>
        </div>

        <div
          className="flex items-center justify-end px-6 py-3 border-t gap-2"
          style={{
            borderColor: 'rgba(139, 115, 85, 0.15)',
          }}
        >
          <button
            onClick={() => handleSubmit(editMode ? null : 'draft')}
            disabled={loading}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'rgba(139, 115, 85, 0.12)',
              color: 'oklch(0.35 0.1 35)',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '...' : 'Draft'}
          </button>
          {!editMode && (
            <button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'oklch(0.40 0.12 40)',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {/* Doodle Canvas Overlay */}
      <DoodleCanvas
        isOpen={isDoodleOpen}
        onClose={closeDoodle}
        onSave={handleDoodleSave}
      />
    </div>
  )
}

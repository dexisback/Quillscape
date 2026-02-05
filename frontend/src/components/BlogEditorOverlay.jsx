import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createBlog, updateBlog } from '../api/blogs.api'
import { useAuth } from '../context/AuthContext'
import { X, Maximize2, Minimize2 } from 'lucide-react'

import { createEditor, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

import { handleKeyboardShortcuts } from './editorTools'
import EditorToolbar from './EditorToolbar'
import DoodleCanvas from './DoodleCanvas'

import {
  withMarkdownShortcuts,
  withImages,
  renderElement,
  renderLeaf,
  slateToMarkdown,
  markdownToSlate
} from '../lib/slate'



export default function BlogEditorOverlay({
  isOpen,
  onClose,
  onBlogCreated,
  editMode = false,
  blogId = null,
  initialTitle = '',
  initialBody = '',
  onBlogUpdated
}) {
  const { user } = useAuth()
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [loading, setLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDoodleOpen, setIsDoodleOpen] = useState(false)
  const bodyEditorRef = useRef(null)


  const titleEditor = useMemo(() => withHistory(withReact(createEditor())), [])
  const bodyEditor = useMemo(() => withMarkdownShortcuts(withImages(withHistory(withReact(createEditor())))), [])


  const getInitialSlateValue = useCallback((text) => {
    if (!text) {
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    }
    return markdownToSlate(text)
  }, [])

  const [titleSlateValue, setTitleSlateValue] = useState(() => [{ type: "paragraph", children: [{ text: initialTitle || '' }] }])
  const [bodySlateValue, setBodySlateValue] = useState(() => getInitialSlateValue(initialBody))


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
        const data = { title: title.trim(), body: body.trim(), status }
        const response = await createBlog(data)
        setTitle('')
        setBody('')
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

  const handleTitleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      try {
        Transforms.select(bodyEditor, { path: [0, 0], offset: 0 })
        bodyEditorRef.current?.focus()
      } catch (e) {
        console.log("focus error")
      }
    }
  }, [bodyEditor])

  const handleRenderElement = useCallback((props) => renderElement(props), [])
  const handleRenderLeaf = useCallback((props) => renderLeaf(props), [])

  if (!isOpen) { return null }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Editor Modal - Yellow paper aesthetic */}
      <div
        className={`relative mx-4 shadow-2xl flex flex-col overflow-hidden ${isFullscreen
          ? 'w-full h-full max-w-full max-h-full rounded-none'
          : 'w-full max-w-4xl h-[90vh] max-h-[90vh] rounded-2xl'
          }`}
        style={{
          backgroundColor: '#fef9c3',
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 80%, rgba(253, 224, 71, 0.12) 0%, transparent 50%)
          `
        }}
      >
        {/* Minimal Header - just the controls */}
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                color: '#525252',
                backgroundColor: 'rgba(82, 82, 82, 0.08)'
              }}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" strokeWidth={1.5} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.5} />}
            </button>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                color: '#525252',
                backgroundColor: 'rgba(82, 82, 82, 0.08)'
              }}
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-6">
          {/* Title - Slate Editor */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Slate
              editor={titleEditor}
              initialValue={titleSlateValue}
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
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '-0.02em',
                  color: '#262626',
                  textAlign: 'left',
                }}
              />
            </Slate>
          </div>

          {/* Minimal divider */}
          <div
            className="w-16 h-0.5 rounded mb-6"
            style={{ backgroundColor: 'rgba(38, 38, 38, 0.15)' }}
          />


          <div style={{ position: 'relative', flex: 1, minHeight: '350px' }}>
            <Slate
              editor={bodyEditor}
              initialValue={bodySlateValue}
              onChange={(newBodyValue) => {
                setBodySlateValue(newBodyValue)
                const markdown = slateToMarkdown(newBodyValue)
                setBody(markdown)
              }}
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <Editable
                    ref={bodyEditorRef}
                    readOnly={loading}
                    placeholder="Tell your story..."
                    onKeyDown={handleBodyKeyDown}
                    renderLeaf={handleRenderLeaf}
                    renderElement={handleRenderElement}
                    style={{
                      outline: 'none',
                      minHeight: '350px',
                      fontSize: '1.125rem',
                      lineHeight: '1.8',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '-0.01em',
                      color: '#404040',
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
                opacity: 0.35 !important;
              }
            `}</style>
          </div>
        </div>

        {/* Footer with buttons */}
        <div
          className="flex items-center justify-end px-6 py-4 gap-3"
          style={{
            borderTop: '1px solid rgba(38, 38, 38, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <button
            onClick={() => handleSubmit(editMode ? null : 'draft')}
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor: 'rgba(82, 82, 82, 0.08)',
              color: '#525252',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '...' : (editMode ? 'Save' : 'Draft')}
          </button>
          {!editMode && (
            <button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: '#3d3d3d',
                color: '#ffffff',
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

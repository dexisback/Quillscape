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


  const titleEditor = useMemo(() => withHistory(withReact(createEditor())), []) //title editor slate instance//on mount, create a title editor instance. so the title is NOT just a input field anymore
  const bodyEditor = useMemo(() => withHistory(withReact(createEditor())), []) //body editor slate instance



  const bodyContainerRef = useRef(null)
  const titleContainerRef = useRef(null)
  const activeContainerRef = useRef(null)


  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, height: 24 })
  const [isAnimating, setIsAnimating] = useState(true)
  const lastLineTopRef = useRef(0)
  const [showCursor, setShowCursor] = useState(false)
  const [activeField, setActiveField] = useState(null) // 'title' or 'body'



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




  // Function to update cursor position based on browser selection (x and y blocky animations)
  const updateCursorPosition = useCallback(() => {
    const containerRef = activeContainerRef.current
    if (!containerRef) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = containerRef.getBoundingClientRect()


    const defaultHeight = activeField === 'title' ? 48 : 30


    // If rect has no dimensions, cursor starts from top left
    if (rect.width === 0 && rect.height === 0) {
      setCursorPosition({ x: 0, y: 0, height: defaultHeight })
      setShowCursor(true)
      return
    }

    const x = rect.left - containerRect.left
    const y = rect.top - containerRect.top
    const height = Math.min(rect.height, activeField === 'title' ? 48 : 30) || (activeField === 'title' ? 48 : 30) //height of the cursor (earlier it occupied the full height of the cursor)


    //checker for NOT allowing animation for y jumps
    const lineChanged = Math.abs(y - lastLineTopRef.current) > 5
    if (lineChanged) {
      setIsAnimating(false) // disabled animation for y jumps, i dont like neovim 
      lastLineTopRef.current = y
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true) // as soon as it jumps, enable animation
        })
      })
    }


    setCursorPosition({ x, y, height })
    setShowCursor(true)
  }, [activeField])





  // custom block cursor will always follows the real cursor w this
  useEffect(() => {
    const handleSelectionChange = () => {
      requestAnimationFrame(updateCursorPosition)
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [updateCursorPosition])



  const cursorHider = useCallback(() => { //hide cursor when any field loses focus
    setShowCursor(false)
    setActiveField(null)
    activeContainerRef.current = null
  }, [])


  const handleBodyFocus = useCallback(() => { // only show cursor when body gains focus
    setActiveField('body') //marking body as active so that the activeContainerRef knows which one is active rn
    activeContainerRef.current = bodyContainerRef.current  //point activeContainerRef to body
    setShowCursor(true) //shows custom cursor
    requestAnimationFrame(updateCursorPosition)
  }, [updateCursorPosition])



  const handleTitleFocus = useCallback(() => {  // Show cursor when title gains focus
    setActiveField('title')
    activeContainerRef.current = titleContainerRef.current
    setShowCursor(true)
    requestAnimationFrame(updateCursorPosition)
  }, [updateCursorPosition])



  const handleSubmit = async (status) => {
    if (!title.trim() || !body.trim()) {
      return alert('Please fill both title and body before submitting.')
    }

    if (!user) {
      return alert('You must be logged in.')
    }
    //add edge case of when a user tries to write an empty character in the title, i would block em here ⚠️⚠️⚠️⚠️⚠️⚠️⚠️
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
        setTitleSlateValue([{type: "paragraph", children: [{text: ""}]}]);
        setBodySlateValue([{type: "paragraph", children: [{text: ""}]}]);

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
          : 'w-full max-w-4xl h-[85vh]'
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
            ref={titleContainerRef}
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


          {/* Body - Slate Editor with Custom Blocky Cursor */}
          <div
            ref={bodyContainerRef}
            style={{ position: 'relative', flex: 1, minHeight: '400px' }}
          >
            <Slate
              editor={bodyEditor}
              initialValue={bodySlateValue}
              onChange={(newBodyValue) => {
                setBodySlateValue(newBodyValue)
                // Convert Slate value back to plain text for body state
                const text = newBodyValue
                  .map(node => node.children.map(child => child.text).join(''))
                  .join('\n')
                setBody(text)
              }}
            >
              <Editable
                readOnly={loading}
                placeholder="Tell your story..."
                onBlur={cursorHider}
                onFocus={handleBodyFocus}
                style={{
                  outline: 'none',
                  minHeight: '400px',
                  fontSize: '18px',
                  lineHeight: '1.7',
                  fontFamily: 'Inter, sans-serif',
                  color: 'oklch(0.3 0.03 40)',
                  caretColor: 'transparent', // Hide native cursor
                  textAlign: 'left',
                }}
              />
            </Slate>

            {/* Custom Block Cursor for Body */}
            {showCursor && activeField === 'body' && (
              <div
                style={{
                  position: 'absolute',
                  left: cursorPosition.x,
                  top: cursorPosition.y,
                  width: '0.55rem',
                  height: cursorPosition.height,
                  backgroundColor: '#000000',
                  opacity: 0.9,
                  pointerEvents: 'none',
                  transition: isAnimating ? 'left 80ms ease-out' : 'none',
                  animation: 'cursorBlink 1s step-end infinite',
                  borderRadius: '1px',
                }}
              />
            )}

            {/* CSS for cursor blink animation and placeholder */}
            <style>{`
              @keyframes cursorBlink {
                0%, 45% { opacity: 0.9; }
                50%, 100% { opacity: 0; }
              }
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

        {/* Footer with actions - Brown themed buttons */}
        <div
          className="flex items-center justify-between px-8 py-5 border-t"
          style={{
            borderColor: 'rgba(139, 115, 85, 0.2)',
            backgroundColor: 'rgba(139, 115, 85, 0.05)'
          }}
        >
          <div className="text-sm" style={{ color: 'oklch(0.48 0.03 40)' }}>
            {title.trim() || body.trim() ? 'Unsaved changes' : 'Start writing...'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(editMode ? null : 'draft')}
              disabled={loading}
              className="px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
              style={{
                backgroundColor: 'oklch(0.82 0.06 45)',
                color: 'oklch(0.35 0.1 35)',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : (editMode ? 'Save Changes' : 'Save Draft')}
            </button>
            {!editMode && (
              <button
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className="px-5 py-2.5 rounded-full font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
                style={{
                  backgroundColor: 'oklch(0.35 0.1 35)',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { createBlog, updateBlog } from '../api/blogs.api'
import { useAuth } from '../context/AuthContext'
import { X, Maximize2, Minimize2 } from 'lucide-react'

export default function BlogEditorOverlay({
  isOpen,
  onClose,
  onBlogCreated,
  // For editing existing blogs
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

  // Update form when initial values change (for edit mode)
  useEffect(() => {
    setTitle(initialTitle)
    setBody(initialBody)
  }, [initialTitle, initialBody])

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

        if (onBlogCreated && response.data) {
          onBlogCreated(response.data.blog)
        }

        onClose()
      }
    } catch (err) {
      console.error('Failed:', err)
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

  if (!isOpen) return null

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
          {/* Title */}
          <input
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full text-4xl font-bold placeholder-opacity-40 border-none outline-none mb-6 bg-transparent"
            style={{
              color: 'oklch(0.25 0.05 40)',
              '::placeholder': { color: 'rgba(139, 115, 85, 0.4)' }
            }}
          />

          {/* Decorative divider - like paper fold line */}
          <div
            className="w-20 h-0.5 rounded mb-8"
            style={{ backgroundColor: 'rgba(139, 115, 85, 0.3)' }}
          />

          {/* Body */}
          <textarea
            placeholder="Tell your story..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={loading}
            className="w-full h-full min-h-[400px] text-lg border-none outline-none resize-none bg-transparent leading-relaxed"
            style={{
              color: 'oklch(0.3 0.03 40)',
              fontFamily: 'Georgia, serif'
            }}
          />
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

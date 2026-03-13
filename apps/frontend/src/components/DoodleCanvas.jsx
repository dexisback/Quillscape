import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Check, Undo2 } from 'lucide-react'

const PEN_COLORS = [
    { name: 'Ink', color: 'oklch(0.25 0.05 40)' },
    { name: 'Sepia', color: 'oklch(0.40 0.10 50)' },
    { name: 'Brown', color: 'oklch(0.50 0.12 45)' },
    { name: 'Amber', color: 'oklch(0.65 0.15 75)' },
]

const BRUSH_SIZES = [
    { name: 'Fine', size: 2 },
    { name: 'Medium', size: 5 },
    { name: 'Thick', size: 10 },
]

export default function DoodleCanvas({ isOpen, onClose, onSave }) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [currentColor, setCurrentColor] = useState(PEN_COLORS[0].color)
    const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size)
    const [hasDrawn, setHasDrawn] = useState(false)
    const historyRef = useRef([])

    useEffect(() => {
        if (!isOpen) return
        const canvas = canvasRef.current
        if (!canvas) return
        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasDrawn(false)
        historyRef.current = []
    }, [isOpen])

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const imageData = canvas.toDataURL()
        historyRef.current.push(imageData)
        if (historyRef.current.length > 20) {
            historyRef.current.shift()
        }
    }, [])

    function handleUndo() {
        const canvas = canvasRef.current
        if (!canvas || historyRef.current.length === 0) return
        const ctx = canvas.getContext('2d')
        historyRef.current.pop()

        if (historyRef.current.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            setHasDrawn(false)
        } else {
            const prevState = historyRef.current[historyRef.current.length - 1]
            const img = new Image()
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
            }
            img.src = prevState
        }
    }

    function getPosition(e) {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    function startDrawing(e) {
        e.preventDefault()
        saveToHistory()
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const pos = getPosition(e)
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = currentColor
        ctx.lineWidth = brushSize
        setIsDrawing(true)
        setHasDrawn(true)
    }

    function draw(e) {
        if (!isDrawing) return
        e.preventDefault()
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const pos = getPosition(e)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
    }

    function stopDrawing(e) {
        if (e) e.preventDefault()
        setIsDrawing(false)
    }

    function handleSave() {
        const canvas = canvasRef.current
        if (!canvas || !hasDrawn) {
            onClose()
            return
        }
        const dataUrl = canvas.toDataURL('image/png')
        if (onSave) {
            onSave(dataUrl)
        }
        onClose()
    }

    function handleCancel() {
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[60] flex flex-col"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                ref={containerRef}
                className="flex-1 m-6 mb-0 rounded-t-2xl overflow-hidden"
                style={{
                    backgroundColor: 'oklch(0.97 0.015 80)',
                    backgroundImage: `
                        repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 27px,
                            rgba(139, 115, 85, 0.08) 27px,
                            rgba(139, 115, 85, 0.08) 28px
                        )
                    `,
                    boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.2)',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            <div
                className="mx-6 px-6 py-4 rounded-b-2xl flex items-center justify-between gap-4 flex-wrap"
                style={{
                    backgroundColor: 'rgba(245, 240, 230, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderTop: '1px solid rgba(139, 115, 85, 0.2)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium mr-2" style={{ color: 'oklch(0.40 0.08 45)' }}>
                        Ink:
                    </span>
                    {PEN_COLORS.map((pen, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentColor(pen.color)}
                            title={pen.name}
                            className="w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
                            style={{
                                backgroundColor: pen.color,
                                border: currentColor === pen.color
                                    ? '3px solid oklch(0.75 0.12 80)'
                                    : '2px solid rgba(139, 115, 85, 0.3)',
                                boxShadow: currentColor === pen.color
                                    ? '0 0 0 2px rgba(255, 255, 255, 0.8)'
                                    : 'none',
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium mr-2" style={{ color: 'oklch(0.40 0.08 45)' }}>
                        Size:
                    </span>
                    {BRUSH_SIZES.map((brush, index) => (
                        <button
                            key={index}
                            onClick={() => setBrushSize(brush.size)}
                            title={brush.name}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: brushSize === brush.size
                                    ? 'oklch(0.45 0.12 40)'
                                    : 'rgba(139, 115, 85, 0.1)',
                            }}
                        >
                            <div
                                className="rounded-full"
                                style={{
                                    width: brush.size + 4,
                                    height: brush.size + 4,
                                    backgroundColor: brushSize === brush.size
                                        ? 'oklch(0.95 0.02 80)'
                                        : 'oklch(0.35 0.1 35)',
                                }}
                            />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleUndo}
                        title="Undo"
                        className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: 'rgba(139, 115, 85, 0.1)',
                            color: 'oklch(0.35 0.1 35)',
                        }}
                    >
                        <Undo2 className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleCancel}
                        title="Cancel"
                        className="p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: 'rgba(180, 100, 100, 0.15)',
                            color: 'oklch(0.45 0.15 25)',
                        }}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleSave}
                        title="Save Doodle"
                        className="px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
                        style={{
                            backgroundColor: 'oklch(0.45 0.12 40)',
                            color: 'oklch(0.95 0.02 80)',
                        }}
                    >
                        <Check className="w-5 h-5" />
                        <span>Insert</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

import { useEffect, useRef } from "react"
import gsap from "gsap"

const StickyNotes = () => {
    const containerRef = useRef(null)
    const notesRef = useRef([])

    useEffect(() => {
        if (!containerRef.current) return

        const notes = notesRef.current

        notes.forEach((note, index) => {
            gsap.fromTo(
                note,
                {
                    x: -300,
                    opacity: 0,
                    rotate: -25 + Math.random() * 15,
                    scale: 0.8,
                },
                {
                    x: 0,
                    opacity: 1,
                    rotate: -8 + Math.random() * 5,
                    scale: 1,
                    duration: 1.2,
                    delay: index * 0.25,
                    ease: "back.out(1.4)",
                },
            )
        })
    }, [])

    const noteTexts = [
        "Write your thoughts\nand ideas here",
        "Organize your\ninspirations",
        "Capture creative\nmoments",
        "Share your\nstories",
    ]

    return (
        <div ref={containerRef} className="relative h-full w-full flex items-center justify-center">
            <div className="relative w-full h-96">
                {noteTexts.map((text, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            if (el) notesRef.current[index] = el
                        }}
                        className="sticky-note absolute w-48 h-56 p-5 rounded-xl"
                        style={{
                            left: `${index * 20}px`,
                            top: `${index * 18}px`,
                            zIndex: index,
                            backgroundColor: ["#fef3c7", "#fef08a", "#fde047", "#facc15"][index % 4],
                            boxShadow: "0 10px 24px rgba(0,0,0,0.12), 3px 6px 12px rgba(0,0,0,0.1)",
                        }}
                    >
                        {/* Pin */}
                        <div
                            className="sticky-pin"
                            style={{
                                left: `${20 + Math.random() * 120}px`,
                                backgroundColor: index % 2 === 0 ? "#dc2626" : "#991b1b",
                            }}
                        />

                        {/* Text */}
                        <p className="text-sm text-gray-800 mt-8 leading-relaxed whitespace-pre-line font-medium">{text}</p>

                        {/* Decorative lines */}
                        <div className="absolute bottom-4 left-5 right-5 border-t border-gray-300/50" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StickyNotes

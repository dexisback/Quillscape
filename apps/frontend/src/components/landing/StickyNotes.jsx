import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
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
        "Share your thoughts",
        "Pour your heart out",
        "aesthetic writing\nexperience",
        "Write and save on\nthe internet anonymously"
    ]

    return (
        <div ref={containerRef} className="relative h-full w-full flex items-center justify-center">
            <div className="relative w-full h-60 sm:h-72 md:h-96">
                {noteTexts.map((text, index) => (
                    <motion.div
                        key={index}
                        ref={(el) => {
                            if (el) notesRef.current[index] = el
                        }}
                        className="sticky-note absolute w-32 h-40 sm:w-40 sm:h-48 md:w-48 md:h-56 p-3 sm:p-4 md:p-5 rounded-xl cursor-pointer"
                        style={{
                            left: `${index * 12}px`,
                            top: `${index * 12}px`,
                            zIndex: index,
                            backgroundColor: ["#fef9c7", "#fef3c7", "#fde047", "#facc15"][index % 4],
                            boxShadow: "0 10px 24px rgba(0,0,0,0.12), 3px 6px 12px rgba(0,0,0,0.1)",
                        }}
                        whileHover={{
                            y: -35,
                            boxShadow: "0 20px 40px rgba(0,0,0,0.2), 6px 12px 24px rgba(0,0,0,0.15)",
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {/* Pin - centered */}
                        <div
                            className="sticky-pin"
                            style={{
                                left: "50%",
                                transform: "translateX(-50%)",
                                backgroundColor: index % 2 === 0 ? "#dc2626" : "#991b1b",
                            }}
                        />

                        {/* Text */}
                        <p className="text-xs sm:text-sm text-gray-800 mt-6 sm:mt-8 leading-relaxed whitespace-pre-line font-medium italic">{text}</p>

                        {/* Decorative lines */}
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-5 right-3 sm:right-5 border-t border-gray-300/50" />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default StickyNotes


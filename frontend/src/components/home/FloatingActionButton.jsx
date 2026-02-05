import { useEffect, useRef } from "react"
import { Pencil } from "lucide-react"
import gsap from "gsap"

export default function FloatingActionButton({ onClick }) {
    const fabRef = useRef(null)

    useEffect(() => {
        if (!fabRef.current) return

        gsap.fromTo(
            fabRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
        )
    }, [])

    return (
        <button
            ref={fabRef}
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40"
            style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
            aria-label="Create new post"
        >
            <Pencil className="w-6 h-6" />
        </button>
    )
}

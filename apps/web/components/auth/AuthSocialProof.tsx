"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

export type AuthTestimonial = {
    id: string
    text: string
    author: string
    handle?: string
    /** X/Twitter profile image URL (e.g. https://pbs.twimg.com/profile_images/...). Leave empty to use a placeholder avatar. */
    imageUrl?: string
}

/** Edit quotes, names, handles, and `imageUrl` here (X/Twitter profile image URLs). */
const items: AuthTestimonial[] = [
    {
        id: "1",
        text: "Finally, a writing app that just gets out of the way. Pure focus.",
        author: "A friend",
    },
    {
        id: "2",
        text: "The aesthetic is unmatched. Makes me want to write more.",
        author: "Beta tester",
    },
    {
        id: "3",
        text: "Anonymous drafts? Game changer for journaling.",
        author: "Early user",
    },
    {
        id: "4",
        text: "Clean editor, no clutter — I actually finish posts now.",
        author: "Indie author",
    },
    {
        id: "5",
        text: "Feels like paper and ink, but with modern polish.",
        author: "Designer",
    },
    {
        id: "6",
        text: "My go-to for morning pages and public notes alike.",
        author: "Creator",
    },
]

function avatarSrc(item: AuthTestimonial) {
    if (item.imageUrl?.trim()) return item.imageUrl.trim()
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`quill-${item.id}`)}`
}

/** Negative margin between avatars (~half the diameter ≈ 50% of each face visible, rest covered). */
const AVATAR_SIZE = 52
const STACK_OVERLAP = 26

export default function AuthSocialProof() {
    const [hovered, setHovered] = useState<number | null>(null)

    return (
        <motion.div
            className="auth-social-sticky relative w-full max-w-md mx-auto overflow-visible px-6 pt-10 pb-8 md:px-8 md:pt-11 md:pb-9 text-center cursor-pointer"
            style={{ transformOrigin: "16px 10px" }}
            initial={{ opacity: 0, y: 20, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            whileHover={{ rotate: 0, scale: 1.02, transition: { duration: 0.4, ease: "easeOut" } }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
            <div
                className="sticky-pin z-20 pointer-events-none"
                style={{
                    left: "14px",
                    top: "10px",
                    transform: "none",
                    backgroundColor: "#dc2626",
                }}
                aria-hidden
            />

            <div className="relative flex flex-col items-center pt-0">
                <div className="relative flex items-center justify-center pl-2 pr-14 min-h-[88px]">
                    {items.map((item, i) => {
                        const src = avatarSrc(item)
                        const isActive = hovered === i
                        const label = item.handle ? `${item.author} (${item.handle})` : item.author

                        return (
                            <motion.div
                                key={item.id}
                                className="relative shrink-0"
                                style={{
                                    zIndex: isActive ? 50 : i + 1,
                                    marginLeft: i === 0 ? 0 : -STACK_OVERLAP,
                                }}
                                initial={{ opacity: 0, scale: 0.75, y: 8 }}
                                animate={{
                                    opacity: 1,
                                    scale: isActive ? 1.08 : 1,
                                    y: isActive ? -20 : 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 420,
                                    damping: 28,
                                    delay: i * 0.06,
                                }}
                                onHoverStart={() => setHovered(i)}
                                onHoverEnd={() => setHovered((h) => (h === i ? null : h))}
                                onFocus={() => setHovered(i)}
                                onBlur={() => setHovered((h) => (h === i ? null : h))}
                            >
                                <motion.button
                                    type="button"
                                    aria-label={`Testimonial from ${label}`}
                                    className="relative block rounded-full border-2 border-white shadow-md outline-none focus-visible:ring-2 focus-visible:ring-amber-600/70 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100 overflow-hidden cursor-pointer bg-white"
                                    style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                >
                                    <Image
                                        src={src}
                                        alt=""
                                        width={AVATAR_SIZE}
                                        height={AVATAR_SIZE}
                                        className="object-cover"
                                        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                                        unoptimized={src.includes("dicebear.com")}
                                    />
                                </motion.button>

                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            className="absolute left-1/2 bottom-[calc(100%+14px)] -translate-x-1/2 w-[min(280px,calc(100vw-8rem))] rounded-xl px-3.5 py-3 text-left pointer-events-none border border-amber-200/90 dark:border-amber-800/50 bg-[#fffbeb] dark:bg-amber-950/90"
                                            style={{
                                                zIndex: 60,
                                                boxShadow:
                                                    "0 12px 28px rgba(0,0,0,0.12), 3px 6px 12px rgba(0,0,0,0.08)",
                                            }}
                                            initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                                        >
                                            <p className="text-[13px] leading-snug text-gray-800 dark:text-amber-50 italic">&ldquo;{item.text}&rdquo;</p>
                                            <p className="text-[11px] text-gray-600 dark:text-amber-200/80 mt-2 font-medium">
                                                — {item.author}
                                                {item.handle ? <span className="text-gray-500 dark:text-amber-300/70"> {item.handle}</span> : null}
                                            </p>
                                            <div className="mt-2.5 border-t border-amber-200/60 dark:border-amber-700/40" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}

                    <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.35 }}
                    >
                        {[0, 1, 2, 3, 4].map((s) => (
                            <motion.div
                                key={s}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + s * 0.05, type: "spring", stiffness: 500, damping: 22 }}
                            >
                                <Star className="w-4 h-4 md:w-[18px] md:h-[18px] fill-amber-500 text-amber-500" strokeWidth={0} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 md:left-5 md:right-5 border-t border-gray-400/35 dark:border-neutral-500/35" />
        </motion.div>
    )
}

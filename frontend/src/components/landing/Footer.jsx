import { Github, ExternalLink } from "lucide-react"
import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function Footer() {
    const footerRef = useRef(null)

    useEffect(() => {
        if (footerRef.current) {
            gsap.fromTo(
                footerRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                },
            )
        }
    }, [])

    return (
        <footer
            ref={footerRef}
            className="py-16 px-6 mt-24 bg-gradient-to-b from-transparent to-muted/20"
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col gap-12">
                    {/* Top Section - Brand and Tagline */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">Quillscape</h3>
                        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                            A minimal, thoughtful space to capture your creativity. Open source, community-driven.
                        </p>
                    </div>

                    {/* Bottom Section - Links and Social */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 pt-8">
                        <div className="flex flex-col gap-4">
                            {/* Developer Link */}
                            <a
                                href="#"
                                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors duration-200 group"
                            >
                                Know more about the developer
                                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                            </a>

                            {/* Copyright */}
                            <p className="text-xs text-muted-foreground">© 2026 Quillscape. Open source project.</p>
                        </div>

                        {/* GitHub Link */}
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-all duration-300 group"
                            aria-label="GitHub repository"
                        >
                            <Github className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
                            <span className="text-sm font-medium text-foreground">View on GitHub</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

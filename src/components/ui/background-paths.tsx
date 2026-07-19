import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function FloatingPaths({ position }: { position: number }) {
  const reduceMotion = useReducedMotion();
  const paths = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    d: `M-${380 - index * 5 * position} -${189 + index * 6}C-${380 - index * 5 * position} -${189 + index * 6} -${312 - index * 5 * position} ${216 - index * 6} ${152 - index * 5 * position} ${343 - index * 6}C${616 - index * 5 * position} ${470 - index * 6} ${684 - index * 5 * position} ${875 - index * 6} ${684 - index * 5 * position} ${875 - index * 6}`,
    width: 0.5 + index * 0.03,
  }));

  return <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <svg className="h-full w-full text-white" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
      {paths.map((path) => <motion.path
        key={path.id}
        d={path.d}
        stroke="currentColor"
        strokeWidth={path.width}
        strokeOpacity={0.025 + path.id * 0.008}
        initial={{ pathLength: 0.25, opacity: 0.35 }}
        animate={reduceMotion ? { pathLength: 1, opacity: 0.22 } : {
          pathLength: 1,
          opacity: [0.12, 0.42, 0.12],
          pathOffset: [0, 1, 0],
        }}
        transition={reduceMotion ? { duration: 0 } : {
          duration: 20 + (path.id % 10),
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />)}
    </svg>
  </div>;
}

interface BackgroundPathsProps {
  title: string;
  eyebrow: string;
  description: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function BackgroundPaths({
  title,
  eyebrow,
  description,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
}: BackgroundPathsProps) {
  const words = title.split(" ");

  return <section className="relative flex min-h-[86vh] w-full items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <FloatingPaths position={1}/>
      <FloatingPaths position={-1}/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_72%)]"/>
    </div>

    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-6">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"/> {eyebrow}
      </motion.p>

      <h1 className="mx-auto mt-8 max-w-6xl text-balance font-heading text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-[108px]">
        {words.map((word, wordIndex) => <span key={`${word}-${wordIndex}`} className="mr-[0.18em] inline-block last:mr-0">
          {word.split("").map((letter, letterIndex) => <motion.span
            key={`${wordIndex}-${letterIndex}`}
            initial={{ y: 80, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{
              delay: wordIndex * 0.08 + letterIndex * 0.025,
              type: "spring",
              stiffness: 145,
              damping: 24,
            }}
            className="inline-block bg-gradient-to-b from-white to-white/55 bg-clip-text text-transparent"
          >{letter}</motion.span>)}
        </span>)}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.8 }}
        className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-white/45 sm:text-lg"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, duration: 0.8 }}
        className="mt-9 flex flex-wrap justify-center gap-3"
      >
        <div className="group rounded-2xl bg-gradient-to-b from-white/25 to-white/5 p-px shadow-[0_24px_80px_-34px_rgba(255,255,255,0.55)]">
          <Button variant="wallet" size="lg" className="rounded-[15px] px-8" onClick={onPrimaryAction}>
            {primaryLabel} <ArrowRight className="transition-transform group-hover:translate-x-1"/>
          </Button>
        </div>
        {secondaryLabel && onSecondaryAction && <Button variant="outline" size="lg" className="rounded-2xl px-8 backdrop-blur-xl" onClick={onSecondaryAction}>{secondaryLabel}</Button>}
      </motion.div>
    </div>
  </section>;
}

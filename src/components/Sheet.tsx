import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-abyss/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="glass-strong fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ice/30 sm:hidden" />
            {title && <h3 className="display mb-3 text-3xl text-ice">{title}</h3>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

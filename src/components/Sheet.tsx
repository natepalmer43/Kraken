import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-navy/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="card90 fixed! inset-x-2 bottom-2 z-50 mx-auto max-h-[90vh] w-auto max-w-lg overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-0 sm:bottom-auto sm:top-1/2 sm:w-full sm:-translate-y-1/2 sm:p-5"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="stripe-band -mx-4 -mt-4 mb-4 h-3 border-b-[3px] border-ink sm:-mx-5 sm:-mt-5" />
            <button onClick={onClose} aria-label="Close" className="display absolute right-2 top-5 grid h-8 w-8 place-items-center border-2 border-ink bg-white text-lg leading-none shadow-hard-sm active:translate-x-px active:translate-y-px active:shadow-none">
              ×
            </button>
            {title && <h3 className="display mb-3 text-3xl">{title}</h3>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

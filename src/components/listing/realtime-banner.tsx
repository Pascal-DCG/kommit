import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface RealtimeBannerProps {
  count: number;
  onShow: () => void;
}

export function RealtimeBanner({ count, onShow }: RealtimeBannerProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onShow}
          className="mx-auto flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          {count} {count === 1 ? "neuer Eintrag" : "neue Eintraege"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

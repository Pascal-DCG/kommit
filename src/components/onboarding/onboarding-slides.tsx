import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, MessageCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Car,
    title: "Mitfahrgelegenheiten in der Community.",
    body: "Finde Mitfahrer oder eine Mitfahrt — alles an einem Ort.",
  },
  {
    icon: Target,
    title: "Wir matchen automatisch.",
    body: "Wenn du eine Anfrage stellst und schon ein passendes Angebot da ist, sagen wir Bescheid.",
  },
  {
    icon: MessageCircle,
    title: "Direkter Kontakt.",
    body: "Per Telegram oder Anruf — kein extra Chat, keine Umwege.",
  },
];

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [index, setIndex] = useState(0);
  const slide = slides[index]!;
  const isLast = index === slides.length - 1;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex max-w-sm flex-col items-center gap-6 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <slide.icon className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">{slide.title}</h2>
          <p className="text-muted-foreground">{slide.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setIndex(index + 1);
            }
          }}
        >
          {isLast ? "Los geht's" : "Weiter"}
        </Button>
        {!isLast && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={onComplete}
          >
            Ueberspringen
          </Button>
        )}
      </div>
    </div>
  );
}

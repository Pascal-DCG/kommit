import { useNavigate } from "react-router";
import { ArrowRight, Clock, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatTime, relativeDay } from "@/lib/format";
import type { MatchResult } from "@/hooks/use-matches";

interface MatchSheetProps {
  matches: MatchResult[];
  open: boolean;
  onClose: () => void;
}

export function MatchSheet({ matches, open, onClose }: MatchSheetProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">
                {matches.length === 1
                  ? "Es gibt schon 1 passendes Ergebnis!"
                  : `Es gibt schon ${matches.length} passende Ergebnisse!`}
              </h2>
            </div>

            <div className="space-y-3">
              {matches.map((match) => (
                <Card
                  key={match.listing_id}
                  className="cursor-pointer p-4 transition-shadow hover:shadow-md"
                  onClick={() => {
                    onClose();
                    navigate(`/listing/${match.listing_id}`);
                  }}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="truncate">{match.origin_label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{match.destination_label}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {relativeDay(match.departure_at)},{" "}
                      {formatTime(match.departure_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {match.seats}{" "}
                      {match.seats === 1 ? "Platz" : "Plaetze"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full"
              onClick={onClose}
            >
              Mein Eintrag bleibt aktiv
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

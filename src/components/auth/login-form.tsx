import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enableDemoMode } from "@/lib/demo";

interface LoginFormProps {
  onSendOtp: (phone: string) => Promise<{ request_id: string }>;
  onVerifyOtp: (phone: string, code: string, requestId: string) => Promise<void>;
}

type Step = "phone" | "otp";

export function LoginForm({ onSendOtp, onVerifyOtp }: LoginFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+49 ");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRef = useRef<HTMLInputElement>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      const result = await onSendOtp(cleanPhone);
      setRequestId(result.request_id);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err) {
      setError((err as Error).message || "Code konnte nicht gesendet werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    enableDemoMode();
    window.location.reload();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      await onVerifyOtp(cleanPhone, code, requestId);
    } catch (err) {
      setError((err as Error).message || "Hm, der Code passt nicht. Nochmal?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <img
          src="/kommit_wordmark.svg"
          alt="Kommit"
          className="mx-auto h-12"
        />
        <p className="text-lg text-muted-foreground">
          Hey — schoen, dass du da bist.
        </p>
      </div>

      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Wie lautet deine Nummer?</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 170 1234567"
              autoComplete="tel"
              required
            />
            <p className="text-xs text-muted-foreground">
              Wir schicken dir den Code via Telegram.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird gesendet..." : "Code anfordern"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Code eingeben</Label>
            <Input
              ref={otpRef}
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              autoComplete="one-time-code"
              required
            />
            <p className="text-xs text-muted-foreground">
              Check deine Telegram-Nachrichten.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Wird geprueft..." : "Bestaetigen"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError("");
            }}
          >
            Andere Nummer verwenden
          </Button>
        </form>
      )}

      <div className="space-y-2 border-t pt-4 text-center">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemo}
        >
          Ohne Login ausprobieren →
        </Button>
        <p className="text-xs text-muted-foreground">
          Zum Reinschnuppern — ganz ohne Telefonnummer.
        </p>
      </div>
    </div>
  );
}

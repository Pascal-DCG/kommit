import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useGeocoding, type GeocodingResult } from "@/hooks/use-geocoding";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeocodingResult) => void;
  placeholder?: string;
  id?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder,
  id,
}: AutocompleteInputProps) {
  const { suggestions, search, clearSuggestions } = useGeocoding();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        search(value);
        setOpen(true);
      }, 300);
    } else {
      clearSuggestions();
      setOpen(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [value, search, clearSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-card shadow-md">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onSelect(s);
                  onChange(s.label);
                  setOpen(false);
                  clearSuggestions();
                }}
              >
                <span className="font-medium">{s.label}</span>
                {s.city && (
                  <span className="ml-1 text-muted-foreground">({s.city})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

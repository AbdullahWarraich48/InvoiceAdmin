import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useSettings<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSetting(key)
      .then((data) => {
        // Backend stores MySQL JSON column values, which are commonly returned as strings.
        // Normalize so components always receive an object/array (not a string).
        const raw = data?.value;
        if (raw === undefined || raw === null) {
          setValue(defaultValue);
        } else if (typeof raw === 'string') {
          try {
            setValue(JSON.parse(raw) as T);
          } catch {
            // If it's not valid JSON, fall back to defaults to avoid undefined shape crashes.
            setValue(defaultValue);
          }
        } else {
          setValue(raw as T);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [key]);

  const save = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      try {
        await api.updateSetting(key, newValue);
        toast.success("Settings saved");
        return true;
      } catch (error: any) {
        toast.error(error.message || "Failed to save settings");
        return false;
      }
    },
    [key]
  );

  return { value, setValue, save, loading };
}

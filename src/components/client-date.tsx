"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

interface ClientDateProps {
  date: string;
  formatStr?: string;
}

export function ClientDate({ date, formatStr = "dd/MM/yyyy" }: ClientDateProps) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    try {
      setFormatted(format(new Date(date), formatStr));
    } catch (error) {
      console.error("Date format error:", error);
      setFormatted(date);
    }
  }, [date, formatStr]);

  return <>{formatted}</>;
}

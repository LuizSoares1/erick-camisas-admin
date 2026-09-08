"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione uma data",
  required = false,
  className,
}: DatePickerProps) {
  const [aberto, setAberto] = React.useState(false);
  const data = value ? parseISO(value) : undefined;

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        tabIndex={-1}
        required={required}
        value={value}
        onChange={() => undefined}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px opacity-0"
      />
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-left font-normal"
            aria-label={placeholder}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className={cn(!value && "text-muted-foreground")}>
              {data ? format(data, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={data}
            onSelect={(selecionada) => {
              onChange(selecionada ? format(selecionada, "yyyy-MM-dd") : "");
              setAberto(false);
            }}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
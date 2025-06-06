"use client"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Materiau {
  id: string
  name: string
  prix: number
}

interface Props {
  value: string
  onChange: (val: string) => void
  materiaux: Materiau[]
  placeholder?: string
}

export function ComboboxMateriau({
  value,
  onChange,
  materiaux,
  placeholder = "Sélectionner un matériau",
}: Props) {
  const selected = materiaux.find((m) => m.id === value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between")}
        >
          {selected ? `${selected.name} - ${selected.prix} $` : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder="Rechercher un matériau..." />
          <CommandList>
            <CommandEmpty>Aucun résultat</CommandEmpty>
            {materiaux.map((m) => (
              <CommandItem
                key={m.id}
                value={`${m.name} ${m.prix}`}
                onSelect={() => onChange(m.id)}
              >
                {m.name} - {m.prix} $
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

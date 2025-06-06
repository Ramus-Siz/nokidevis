'use client'

import { useState } from "react"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"

type Client = {
  id: string
  name: string
}

interface ComboboxClientProps {
  clients: Client[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ComboboxClient({ clients, value, onChange, placeholder }: ComboboxClientProps) {
  const [open, setOpen] = useState(false)
  const selected = clients.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected?.name || placeholder || "Sélectionner"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher un client..." />
          <CommandList>
            {clients.map((client) => (
              <CommandItem
                key={client.id}
                onSelect={() => {
                  onChange(client.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === client.id ? "opacity-100" : "opacity-0"}`}
                />
                {client.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

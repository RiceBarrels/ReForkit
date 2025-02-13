"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Breadcrumb } from "./breadcrumb"

// const datas = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ]

export function Combobox({ datas = [], datasName = "item", defaultValue = "", valueNow = "", onSelect, ...props}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(valueNow)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          {...props}
        >
          {value
            ? datas.find((framework) => framework.value === value)?.label
            : `Select ${datasName}...`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${datasName}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>No {datasName} found.</CommandEmpty>
            <CommandGroup>
              {datas.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    // Call the onSelect callback if provided
                    if (onSelect) {
                      onSelect(currentValue === value ? "" : currentValue)
                    }
                  }}
                >
                  {framework.label}
                  {framework.value === defaultValue && (<Badge className="text-[0.6rem] px-1.5 py-[0px] leading-4">default</Badge>)}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

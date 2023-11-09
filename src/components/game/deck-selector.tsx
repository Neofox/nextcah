"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function DeckSelector({ className, decks }: { decks: Deck[]; className: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Deck[]>([decks[0]]);
    const [inputValue, setInputValue] = useState("");

    const handleUnselect = useCallback((deck: Deck) => {
        setSelected(prev => prev.filter(s => s.name !== deck.name));
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
            if (e.key === "Delete" || e.key === "Backspace") {
                if (input.value === "") {
                    setSelected(prev => {
                        const newSelected = [...prev];
                        newSelected.pop();
                        return newSelected;
                    });
                }
            }
            // This is not a default behaviour of the <input /> field
            if (e.key === "Escape") {
                input.blur();
            }
        }
    }, []);

    const selectables = decks.filter(deck => !selected.includes(deck));

    return (
        <>
            {/* create the checkbox for the form */}
            {selected.map(deck => {
                return (
                    <input
                        key={deck.id}
                        name="decks"
                        type="checkbox"
                        className="hidden"
                        readOnly
                        value={deck.id}
                        checked
                    />
                );
            })}
            <Command onKeyDown={handleKeyDown} className={cn("overflow-visible bg-transparent", className)}>
                <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <div className="flex gap-1 flex-wrap">
                        {selected.map(deck => {
                            return (
                                <Badge key={deck.id} variant="secondary">
                                    {deck.name}
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleUnselect(deck);
                                            }
                                        }}
                                        onMouseDown={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => handleUnselect(deck)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            );
                        })}
                        {/* Avoid having the "Search" Icon */}
                        <CommandPrimitive.Input
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            onBlur={() => setOpen(false)}
                            onFocus={() => setOpen(true)}
                            placeholder="Select decks..."
                            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
                        />
                    </div>
                </div>
                <div className="relative mt-2">
                    {open && selectables.length > 0 ? (
                        <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            <CommandGroup className="h-full overflow-auto">
                                {selectables.map(deck => {
                                    return (
                                        <CommandItem
                                            key={deck.id}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={value => {
                                                setInputValue("");
                                                setSelected(prev => [...prev, deck]);
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            {deck.name}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </div>
                    ) : null}
                </div>
            </Command>
        </>
    );
}

"use client";

import { useState } from "react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  icon,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Click-away backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Toggle Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card-darker hover:bg-card-hover/20 border border-card-border hover:border-card-border/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-secondary text-xs focus:outline-none transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 select-none z-40 relative active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-muted shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <IconChevronDown
          className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "transform rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Options Panel Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 bg-card border border-card-border rounded-xl shadow-xl shadow-black/20 overflow-hidden z-40 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-card-border scrollbar-track-transparent"
          >
            <div className="py-1">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-450 font-bold hover:bg-emerald-500/15"
                        : "text-secondary hover:bg-card-hover/20 hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

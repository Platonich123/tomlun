"use client";

import * as React from "react";
import { cn } from "./utils";

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

function Switch({ 
  className, 
  checked, 
  onCheckedChange, 
  defaultChecked = false,
  disabled,
  ...props 
}: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(defaultChecked);
  
  const checkedState = checked !== undefined ? checked : isChecked;
  
  const handleClick = () => {
    if (disabled) return;
    
    const newChecked = !checkedState;
    if (checked === undefined) {
      setIsChecked(newChecked);
    }
    onCheckedChange?.(newChecked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checkedState}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checkedState 
          ? "bg-primary" 
          : "bg-input bg-switch-background",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checkedState ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export { Switch };
import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
};

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value = '', onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange: onValueChange || (() => {}), open, setOpen }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300',
          'bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#E6007E] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = useSelect();
  return <span>{value || placeholder}</span>;
};

type SelectContentProps = React.HTMLAttributes<HTMLDivElement>;

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }) => {
    const { open, setOpen } = useSelect();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          'absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg',
          'max-h-60 overflow-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelect();
    const isSelected = value === selectedValue;

    return (
      <div
        ref={ref}
        onClick={() => {
          onValueChange(value);
          setOpen(false);
        }}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
          'text-sm outline-none hover:bg-gray-100',
          isSelected && 'bg-[#E6007E]/10',
          className
        )}
        {...props}
      >
        {isSelected && <Check className="h-4 w-4 mr-2 text-[#E6007E]" />}
        {!isSelected && <span className="w-4 mr-2" />}
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

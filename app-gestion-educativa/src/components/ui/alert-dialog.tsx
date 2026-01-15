import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './button';

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | undefined>(
  undefined
);

const useAlertDialog = () => {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within an AlertDialog');
  }
  return context;
};

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  open = false,
  onOpenChange,
  children,
}) => {
  return (
    <AlertDialogContext.Provider
      value={{ open, onOpenChange: onOpenChange || (() => {}) }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
};

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  AlertDialogTriggerProps
>(({ onClick, asChild, children, ...props }, ref) => {
  const { onOpenChange } = useAlertDialog();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(true);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
      { onClick: handleClick }
    );
  }

  return <button ref={ref} onClick={handleClick} {...props}>{children}</button>;
});
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

type AlertDialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  AlertDialogContentProps
>(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = useAlertDialog();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* AlertDialog */}
      <div
        ref={ref}
        className={cn(
          'relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
AlertDialogContent.displayName = 'AlertDialogContent';

export const AlertDialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex items-start gap-3 mb-4', className)} {...props}>
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
      <AlertTriangle className="h-5 w-5 text-red-600" />
    </div>
    <div className="flex-1">{props.children}</div>
  </div>
);

export const AlertDialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />;

export const AlertDialogDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ...props }) => (
  <p className={cn('text-sm text-gray-500', className)} {...props} />
);

export const AlertDialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn('flex items-center justify-end gap-2 mt-6', className)} {...props} />
);

export const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = useAlertDialog();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenChange(false);
    onClick?.(e);
  };

  return <Button ref={ref} variant="outline" onClick={handleClick} {...props} />;
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

export const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = useAlertDialog();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onOpenChange(false);
  };

  return <Button ref={ref} variant="destructive" onClick={handleClick} {...props} />;
});
AlertDialogAction.displayName = 'AlertDialogAction';

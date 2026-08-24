import { Icon } from "@/components/dashboard/icon";

interface AIErrorStateProps {
  title?: string;
  message: string;
  nextAvailableAt?: string;
  onRetry?: () => void;
}

export function AIErrorState({ 
  title = "Analysis Unavailable", 
  message, 
  nextAvailableAt,
  onRetry 
}: AIErrorStateProps) {
  return (
    <div className="flex min-h-[300px] items-center justify-center border-4 border-black bg-orange-50 p-12 shadow-hard">
      <div className="max-w-md text-center">
        <Icon name="warning" className="mx-auto text-6xl text-orange-600" />
        
        <h3 className="mt-4 font-headline text-xl font-bold uppercase">
          {title}
        </h3>
        
        <p className="mt-3 text-sm">
          {message}
        </p>

        {nextAvailableAt && (
          <p className="mt-2 text-xs opacity-70">
            Next available: {new Date(nextAvailableAt).toLocaleString()}
          </p>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 border-2 border-black bg-brand px-6 py-2 font-bold uppercase shadow-hard transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

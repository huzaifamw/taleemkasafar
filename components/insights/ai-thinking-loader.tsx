import { Icon } from "@/components/dashboard/icon";

export function AIThinkingLoader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center border-4 border-black bg-gradient-to-br from-purple-100 to-blue-100 p-12 shadow-hard">
      <div className="text-center">
        {/* Animated AI Brain Icon */}
        <div className="relative mx-auto h-20 w-20">
          <Icon name="psychology" className="animate-pulse text-7xl text-brand" />
          
          {/* Thinking dots */}
          <div className="absolute -right-2 top-0 flex gap-1">
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '0ms' }}></span>
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '150ms' }}></span>
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>

        {/* Main heading */}
        <h3 className="mt-6 font-headline text-2xl font-bold uppercase text-brand">
          AI Analyzing Performance...
        </h3>

        {/* Progress steps */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-center gap-2 opacity-70">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand"></span>
            <span>Analyzing subject performance</span>
          </div>
          <div className="flex items-center justify-center gap-2 opacity-70" style={{ animationDelay: '500ms' }}>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" style={{ animationDelay: '500ms' }}></span>
            <span>Identifying weak topics</span>
          </div>
          <div className="flex items-center justify-center gap-2 opacity-70" style={{ animationDelay: '1000ms' }}>
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" style={{ animationDelay: '1000ms' }}></span>
            <span>Generating personalized recommendations</span>
          </div>
        </div>

        {/* Time estimate */}
        <p className="mt-8 text-xs opacity-50">
          This takes 3-5 seconds...
        </p>
      </div>
    </div>
  );
}

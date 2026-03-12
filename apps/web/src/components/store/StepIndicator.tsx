export interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="申込ステップ" className="flex items-center gap-2">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;
        return (
          <div key={index} className="flex items-center">
            <div
              className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium
                ${isActive ? 'bg-iris-100 text-white' : ''}
                ${isPast ? 'bg-iris-60 text-white' : ''}
                ${!isActive && !isPast ? 'border border-iris-60 bg-white text-grey3' : ''}
              `}
              aria-current={isActive ? 'step' : undefined}
            >
              {index + 1}
            </div>
            <span
              className={`
                ml-2 hidden text-sm sm:inline
                ${isActive ? 'font-medium text-black' : ''}
                ${isPast ? 'text-grey3' : ''}
                ${!isActive && !isPast ? 'text-grey3' : ''}
              `}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-2 h-px w-4 bg-iris-60 sm:mx-3" aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}

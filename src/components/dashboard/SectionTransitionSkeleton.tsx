import { Skeleton } from "@/components/ui/skeleton";

interface SectionTransitionSkeletonProps {
  showTabs?: boolean;
}

const skeletonStyle = { background: "var(--dash-muted-surface-hover)" };

const SectionTransitionSkeleton = ({ showTabs = true }: SectionTransitionSkeletonProps) => {
  return (
    <div className="pointer-events-none max-w-4xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-7 w-32 rounded-full" style={skeletonStyle} />
        <Skeleton className="h-3 w-56 rounded-full" style={skeletonStyle} />
      </div>

      {showTabs && (
        <div className="flex gap-3 mb-8" style={{ borderBottom: "1px solid var(--dash-border)" }}>
          <Skeleton className="h-10 w-24 rounded-full" style={skeletonStyle} />
          <Skeleton className="h-10 w-24 rounded-full" style={skeletonStyle} />
        </div>
      )}

      <div
        className="rounded-2xl p-5 md:p-6 space-y-4"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-full" style={skeletonStyle} />
            <Skeleton className="h-9 w-28 rounded-full" style={skeletonStyle} />
          </div>
          <Skeleton className="h-9 w-24 rounded-full" style={skeletonStyle} />
        </div>

        <Skeleton className="h-3 w-40 rounded-full" style={skeletonStyle} />

        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl px-4 py-4 md:px-5"
              style={{ background: "var(--dash-muted-surface)", border: "1px solid var(--dash-border)" }}
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-[18px] w-[18px] rounded-md" style={skeletonStyle} />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/5 rounded-full" style={skeletonStyle} />
                  <Skeleton className="h-3 w-4/5 rounded-full" style={skeletonStyle} />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" style={skeletonStyle} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionTransitionSkeleton;
"use client";

export function BuildVersion() {
  const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT || "dev";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;

  return (
    <div className="fixed bottom-2 right-2 text-[10px] text-muted-foreground/50 font-mono z-50">
      {commit}
      {buildTime && (
        <span className="ml-1">
          ({new Date(buildTime).toLocaleDateString("fr-FR")})
        </span>
      )}
    </div>
  );
}

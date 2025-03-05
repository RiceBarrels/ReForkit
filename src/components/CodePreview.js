import { useEffect, useState } from "react";

export default function CodePreview() {
  // Use a state flag to prevent server/client mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="relative mx-auto max-w-3xl">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex gap-2 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <pre className="text-left overflow-x-auto">
          <code className="text-sm text-muted-foreground">
            {`<!DOCTYPE html>
<html>
  <head>
    <title>My Project</title>
  </head>
  <body>
    <h1>Hello, Reforkit!</h1>
  </body>
</html>`}
          </code>
        </pre>
      </div>
    </div>
  );
} 
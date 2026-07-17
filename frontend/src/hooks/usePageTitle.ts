import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — ReviewLenzAI`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}

import { useEffect, useState } from "react";

export function useMobileVH() {
  const [vh, setVh] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  useEffect(() => {
    const update = () => {
      // Always use visual viewport when available
      const viewport = window.visualViewport;
      setVh(viewport ? viewport.height : window.innerHeight);
    };

    update();

    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener("resize", update);
      viewport.addEventListener("scroll", update);
    }

    window.addEventListener("resize", update);

    return () => {
      if (viewport) {
        viewport.removeEventListener("resize", update);
        viewport.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
    };
  }, []);

  return vh;
}

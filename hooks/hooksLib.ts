import React, { useState } from "react";

export function useMobileResponsive() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  React.useEffect(() => {
    setWindowWidth(() => window.innerWidth);

    const handleScroll = () => {
      setWindowHeight(() => window.scrollY);
    };

    if (windowWidth <= 768) {
      setIsMobile(() => true);
    }
    if (windowWidth >= 768) {
      setIsMobile(() => false);
    }

    window.addEventListener(`scroll`, handleScroll);

    window.addEventListener(`resize`, () =>
      setWindowWidth(() => window.innerWidth)
    );

    return () => window.removeEventListener(`scroll`, handleScroll);
  }, [windowWidth, isMobile]);

  return { isMobile, windowWidth, windowHeight };
}

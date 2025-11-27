// import React from "react";
// import { NavLink } from "react-router-dom";
// import { Home, Heart, Calendar, Briefcase } from "lucide-react";

// const SubNavigation: React.FC = () => {
//   const navItems = [
//     { name: "Home", path: "/", icon: Home },
//     { name: "Desi Favorites", path: "/favorites", icon: Heart },
//     { name: "Events", path: "/events", icon: Calendar },
//     { name: "Services", path: "/services", icon: Briefcase },
//   ];

//   return (
//     <div className="bg-white border-b border-t  border-gray-200 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <nav className="flex space-x-1 justify-center overflow-x-auto scrollbar-hide py-2">
//           {navItems.map(item => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               end={item.path === "/"}
//               className={({ isActive }) =>
//                 `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
//                   isActive
//                     ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
//                     : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
//                 }`
//               }
//             >
//               <item.icon className="h-4 w-4" />
//               <span>{item.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default SubNavigation;

import React, { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Heart, Calendar, Briefcase } from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Desi Favorites", path: "/favorites", icon: Heart },
  { name: "Events", path: "/events", icon: Calendar },
  { name: "Services", path: "/services", icon: Briefcase },
];

const SCROLL_PADDING = 12; // small breathing space from edges

export default function SubNavigation(): JSX.Element {
  const navRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Helper: clamp number between min and max
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  // Scroll math: center the active tab when possible, otherwise clamp to show fully
  const scrollActiveIntoView = () => {
    const nav = navRef.current;
    if (!nav) return;

    const active = nav.querySelector<HTMLAnchorElement>('a[data-active="true"]');
    if (!active) return;

    const navClientW = nav.clientWidth;
    const navScrollW = nav.scrollWidth;

    // If nothing to scroll, ensure nav is centered (class toggling handled elsewhere)
    if (navScrollW <= navClientW) {
      nav.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const activeOffsetLeft = (active as HTMLElement).offsetLeft;
    const activeWidth = (active as HTMLElement).offsetWidth;

    // Desired scroll so that active is centered within visible nav
    const desiredLeft = Math.round(activeOffsetLeft - (navClientW - activeWidth) / 2);

    // But we must ensure the active element is fully visible - compute min/max allowed scroll
    const minLeftToFullyShowActive = activeOffsetLeft + activeWidth - navClientW + SCROLL_PADDING; // if too far right
    const maxLeftToFullyShowActive = activeOffsetLeft - SCROLL_PADDING; // if too far left

    // clamp the desiredLeft between 0 and max scroll
    const maxScrollLeft = navScrollW - navClientW;
    let finalLeft = clamp(desiredLeft, 0, maxScrollLeft);

    // If centering would cut the element on the left, adjust so it's fully visible
    if (finalLeft > maxLeftToFullyShowActive) {
      finalLeft = clamp(maxLeftToFullyShowActive, 0, maxScrollLeft);
    }
    // If centering would cut it on the right, adjust
    if (finalLeft < minLeftToFullyShowActive) {
      finalLeft = clamp(minLeftToFullyShowActive, 0, maxScrollLeft);
    }

    nav.scrollTo({ left: finalLeft, behavior: "smooth" });
  };

  // Toggle justify class depending on overflow. Keep centered when no overflow, start when overflow.
  const updateJustifyClass = () => {
    const nav = navRef.current;
    if (!nav) return;
    const container = nav.parentElement; // .max-w wrapper
    if (!container) return;

    // calculate overflow
    const overflow = nav.scrollWidth > nav.clientWidth + 1; // small buffer
    // use tailwind utility classes toggled on the nav element
    if (overflow) {
      nav.classList.remove("justify-center");
      nav.classList.add("justify-start");
    } else {
      nav.classList.remove("justify-start");
      nav.classList.add("justify-center");
      // reset scroll (centered layout doesn't need horizontal scroll)
      nav.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // initial detection + scroll
    updateJustifyClass();
    // small timeout to ensure DOM styles applied
    setTimeout(() => scrollActiveIntoView(), 50);

    // recompute on window resize (debounced)
    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateJustifyClass();
        scrollActiveIntoView();
      }, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // run when route changes to ensure active tab is visible
  useEffect(() => {
    // small delay to allow React to update active class/attributes
    requestAnimationFrame(() => {
      updateJustifyClass();
      scrollActiveIntoView();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="bg-white border-b border-t border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* navRef is on the <nav> so we can measure scrollWidth / clientWidth */}
        <nav
          ref={navRef}
          className="flex space-x-1 justify-center overflow-x-auto scrollbar-hide py-2 scroll-smooth"
        >
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              data-active={location.pathname === item.path ? "true" : "false"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-orange-600"
                }`
              }
              aria-current={location.pathname === item.path ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

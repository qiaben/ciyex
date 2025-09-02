"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
    BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    ListIcon,
    PageIcon,
    PieChartIcon,
    PlugInIcon,
    SettingsIcon, // ensure this exists in ../icons/index
    TableIcon,
} from "../icons/index";

// ===== Types (nested) =====
type SubItem = {
    name: string;
    path?: string;
    pro?: boolean;
    new?: boolean;
    subItems?: SubItem[]; // allow nesting
};

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: SubItem[];
};

// ===== Data =====
const navItems: NavItem[] = [

  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },

    // Settings with nested Forms -> Lists
    {
        icon: <SettingsIcon />,
        name: "Settings",
        subItems: [
            { name: "Providers", path: "/settings/providers" },
            {name:"Insurance companies", path:"/settings/insurance"},

            {
                name: "Forms",
                subItems: [{ name: "Lists", path: "/settings/forms/lists" },
                    { name: "Form Admin", path: "/settings/forms/admin" },],
            },

        ],
    },

    {
        name: "Forms",
        icon: <ListIcon />,
        subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
    },
    {
        name: "Tables",
        icon: <TableIcon />,
        subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    },
    {
        name: "Pages",
        icon: <PageIcon />,
        subItems: [
            { name: "Blank Page", path: "/blank", pro: false },
            { name: "404 Error", path: "/error-404", pro: false },
        ],
    },

];

const othersItems: NavItem[] = [
    {
        icon: <PieChartIcon />,
        name: "Charts",
        subItems: [
            { name: "Line Chart", path: "/line-chart", pro: false },
            { name: "Bar Chart", path: "/bar-chart", pro: false },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "UI Elements",
        subItems: [
            { name: "Alerts", path: "/alerts", pro: false },
            { name: "Avatar", path: "/avatars", pro: false },
            { name: "Badge", path: "/badge", pro: false },
            { name: "Buttons", path: "/buttons", pro: false },
            { name: "Images", path: "/images", pro: false },
            { name: "Videos", path: "/videos", pro: false },
        ],
    },
    {
        icon: <PlugInIcon />,
        name: "Authentication",
        subItems: [
            { name: "Sign In", path: "/signin", pro: false },
            { name: "Sign Up", path: "/signup", pro: false },
        ],
    },
];

// ===== Component =====
const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const pathname = usePathname();

    // Safe isActive (handles undefined, ignores query)
    const isActive = useCallback(
        (path?: string) => {
            if (!path) return false;
            try {
                const u = new URL(path, "http://local");
                return u.pathname === pathname;
            } catch {
                return path.split("?")[0] === pathname;
            }
        },
        [pathname]
    );

    // Open state:
    // - top: which top-level group is open (main/others + index)
    // - l2: which level-2 (within a top group) is open
    const [openTop, setOpenTop] = useState<{ type: "main" | "others"; index: number } | null>(null);
    const [openL2, setOpenL2] = useState<Record<string, boolean>>({}); // key = "type-index-subIndex"

    const toggleTop = (type: "main" | "others", index: number) => {
        setOpenTop((prev) => (prev && prev.type === type && prev.index === index ? null : { type, index }));
    };

    const toggleL2 = (key: string) => {
        setOpenL2((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const keyL2 = (type: "main" | "others", topIdx: number, subIdx: number) => `${type}-${topIdx}-${subIdx}`;

    // Auto-open parents when current route is inside them
    useEffect(() => {
        let topFound = false;

        const checkDescActive = (items: SubItem[]): boolean => {
            for (const it of items) {
                if (it.path && isActive(it.path)) return true;
                if (it.subItems && checkDescActive(it.subItems)) return true;
            }
            return false;
        };

        (["main", "others"] as const).forEach((type) => {
            const items = type === "main" ? navItems : othersItems;
            items.forEach((nav, topIdx) => {
                if (!nav.subItems) return;
                if (checkDescActive(nav.subItems)) {
                    setOpenTop({ type, index: topIdx });
                    topFound = true;

                    // open any level-2 that contains active descendant
                    nav.subItems.forEach((sub, subIdx) => {
                        if (sub.subItems && checkDescActive(sub.subItems)) {
                            const k = keyL2(type, topIdx, subIdx);
                            setOpenL2((prev) => ({ ...prev, [k]: true }));
                        }
                    });
                }
            });
        });

        if (!topFound) setOpenTop(null);
    }, [pathname, isActive]);

    // Renderer
    const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
        <ul className="flex flex-col gap-4">
            {items.map((nav, topIdx) => {
                const topOpen = openTop?.type === type && openTop.index === topIdx;

                return (
                    <li key={nav.name}>
                        {/* Top row (button or link) */}
                        {nav.subItems ? (
                            <button
                                onClick={() => toggleTop(type, topIdx)}
                                className={`menu-item group ${
                                    topOpen ? "menu-item-active" : "menu-item-inactive"
                                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                            >
                <span className={`${topOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <ChevronDownIcon
                                        className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                            topOpen ? "rotate-180 text-brand-500" : ""
                                        }`}
                                    />
                                )}
                            </button>
                        ) : nav.path ? (
                            <Link
                                href={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                                }`}
                            >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className="menu-item-text">{nav.name}</span>
                                )}
                            </Link>
                        ) : null}

                        {/* Top-level dropdown (simple show/hide) */}
                        {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                            <div className={`${topOpen ? "block" : "hidden"}`}>
                                <ul className="mt-2 space-y-1 ml-9">
                                    {nav.subItems.map((sub, subIdx) => {
                                        const hasKids = !!sub.subItems?.length;
                                        const k = keyL2(type, topIdx, subIdx);
                                        const l2Open = !!openL2[k];

                                        return (
                                            <li key={sub.name}>
                                                {hasKids ? (
                                                    <>
                                                        {/* Level-2 toggle row with chevron */}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleL2(k)}
                                                            className={`menu-dropdown-item ${
                                                                l2Open ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                                                            } w-full flex items-center`}
                                                        >
                                                            <span>{sub.name}</span>
                                                            <ChevronDownIcon
                                                                className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                                                                    l2Open ? "rotate-180 text-brand-500" : ""
                                                                }`}
                                                            />
                                                        </button>

                                                        {/* Level-3 (simple show/hide) */}
                                                        <div className={`${l2Open ? "block" : "hidden"}`}>
                                                            <ul className="ml-6 mt-1 space-y-1">
                                                                {sub.subItems!.map((g) => (
                                                                    <li key={g.name}>
                                                                        {g.path ? (
                                                                            <Link
                                                                                href={g.path}
                                                                                className={`menu-dropdown-item ${
                                                                                    isActive(g.path)
                                                                                        ? "menu-dropdown-item-active"
                                                                                        : "menu-dropdown-item-inactive"
                                                                                }`}
                                                                            >
                                                                                {g.name}
                                                                                <span className="flex items-center gap-1 ml-auto">
                                          {g.new && (
                                              <span
                                                  className={`${
                                                      isActive(g.path)
                                                          ? "menu-dropdown-badge-active"
                                                          : "menu-dropdown-badge-inactive"
                                                  } menu-dropdown-badge`}
                                              >
                                              new
                                            </span>
                                          )}
                                                                                    {g.pro && (
                                                                                        <span
                                                                                            className={`${
                                                                                                isActive(g.path)
                                                                                                    ? "menu-dropdown-badge-active"
                                                                                                    : "menu-dropdown-badge-inactive"
                                                                                            } menu-dropdown-badge`}
                                                                                        >
                                              pro
                                            </span>
                                                                                    )}
                                        </span>
                                                                            </Link>
                                                                        ) : (
                                                                            <div className="menu-dropdown-item menu-dropdown-item-inactive cursor-default">
                                                                                {g.name}
                                                                            </div>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </>
                                                ) : sub.path ? (
                                                    // Level-2 link with path
                                                    <Link
                                                        href={sub.path}
                                                        className={`menu-dropdown-item ${
                                                            isActive(sub.path)
                                                                ? "menu-dropdown-item-active"
                                                                : "menu-dropdown-item-inactive"
                                                        }`}
                                                    >
                                                        {sub.name}
                                                        <span className="flex items-center gap-1 ml-auto">
                              {sub.new && (
                                  <span
                                      className={`${
                                          isActive(sub.path)
                                              ? "menu-dropdown-badge-active"
                                              : "menu-dropdown-badge-inactive"
                                      } menu-dropdown-badge`}
                                  >
                                  new
                                </span>
                              )}
                                                            {sub.pro && (
                                                                <span
                                                                    className={`${
                                                                        isActive(sub.path)
                                                                            ? "menu-dropdown-badge-active"
                                                                            : "menu-dropdown-badge-inactive"
                                                                    } menu-dropdown-badge`}
                                                                >
                                  pro
                                </span>
                                                            )}
                            </span>
                                                    </Link>
                                                ) : (
                                                    // Level-2 plain label (rare)
                                                    <div className="menu-dropdown-item menu-dropdown-item-inactive cursor-default">
                                                        {sub.name}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <aside
            className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                <Link href="/dashboard">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <Image
                                className="dark:hidden"
                                src="/images/logo/Ciyex.png"
                                alt="Ciyex Dashboard"
                                width={130}
                                height={25}
                            />
                            <Image
                                className="hidden dark:block"
                                src="/images/logo/Ciyex.png"
                                alt="Ciyex Dashboard"
                                width={130}
                                height={25}
                            />
                        </>
                    ) : (
                        <Image src="/images/logo/Ciyex.png" alt="Ciyex Dashboard" width={32} height={32} />
                    )}
                </Link>
            </div>

            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
                            </h2>
                            {renderMenuItems(navItems, "main")}
                        </div>

                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}
                            </h2>
                            {renderMenuItems(othersItems, "others")}
                        </div>
                    </div>
                </nav>
                {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
            </div>
        </aside>
    );
};

export default AppSidebar;

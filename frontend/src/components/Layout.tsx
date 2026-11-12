
import { useState } from "react";
import {
  NavLink,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  X,
  Siren,
} from "lucide-react";
import { api } from "../lib/mockApi";

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Live Map",
    path: "/live-map",
    icon: Map,
  },
  {
    label: "Incidents",
    path: "/history",
    icon: ClipboardList,
  },
  {
    label: "Responders",
    path: "/responders",
    icon: Users,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Layout() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!api.isAuthed()) {
    return <Navigate to="/login" replace />;
  }

  let userName = "Administrator";

  try {
    const storedUser = sessionStorage.getItem("rt_user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userName =
        parsedUser.name ||
        parsedUser.fullName ||
        parsedUser.username ||
        parsedUser.email ||
        "Administrator";
    }
  } catch {
    userName = "Administrator";
  }

  const initials = userName
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join("");

  const filteredNavigation = navigation.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  function signOut() {
    sessionStorage.removeItem("rt_user");
    setUserMenuOpen(false);
    navigate("/login", { replace: true });
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="rt-app min-h-screen">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`rt-sidebar fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rt-sidebar-image" />

        {/* Brand */}
        <div className="rt-sidebar-brand">
          <div className="rt-logo">
            <ShieldCheck size={25} strokeWidth={2} />
          </div>

          <div>
            <div className="rt-brand-name">RescueTrack</div>
            <div className="rt-brand-caption">
              Safer Roads. Faster Help.
            </div>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            className="ml-auto text-white/70 lg:hidden"
            onClick={closeMobileMenu}
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="rt-navigation">
          <p className="px-3 pb-3 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Operations
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `rt-nav-link ${
                    isActive ? "rt-nav-link-active" : ""
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="rt-sidebar-bottom">
          <div className="rt-sidebar-quote">
            <div className="mb-3 flex items-center gap-2 text-white/80">
              <Siren size={17} />
              <span className="text-xs font-semibold">
                Every second matters.
              </span>
            </div>

            <p>
              Coordinated response. Safer roads. Better outcomes.
            </p>
          </div>

          <button
            type="button"
            className="rt-logout"
            onClick={signOut}
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>

          <div className="rt-sidebar-footer">
            RescueTrack · Emergency Management
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="rt-main min-w-0 flex-1">
        {/* Top bar */}
        <header className="rt-topbar">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rt-icon-button shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full max-w-[440px]">
              <div className="rt-global-search">
                <Search size={17} />

                <input
                  type="search"
                  placeholder="Search pages..."
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearchOpen(false);
                    }

                    if (
                      event.key === "Enter" &&
                      filteredNavigation.length > 0
                    ) {
                      navigate(filteredNavigation[0].path);
                      setSearchText("");
                      setSearchOpen(false);
                    }
                  }}
                />

                {searchText && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearchText("");
                      setSearchOpen(false);
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {searchOpen && searchText.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                  {filteredNavigation.length > 0 ? (
                    filteredNavigation.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.path}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            navigate(item.path);
                            setSearchText("");
                            setSearchOpen(false);
                          }}
                        >
                          <Icon size={17} />
                          {item.label}
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-500">
                      No matching pages found.
                    </p>
                  )}

                  <button
                    type="button"
                    aria-label="Close search results"
                    className="mt-1 w-full px-3 py-2 text-left text-xs text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchOpen(false)}
                  >
                    Close results
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Header actions */}
          <div className="rt-topbar-actions">
            <span className="hidden items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 sm:inline-flex">
              <Activity size={14} />
              Development
            </span>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                className="rt-icon-button rt-notification-button"
                onClick={() =>
                  setNotificationsOpen(!notificationsOpen)
                }
              >
                <Bell size={19} />
                <span className="rt-notification-dot" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-800">
                      Notifications
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                      Demo
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Operations dashboard
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Monitoring interface is ready.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Incident management
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Review the latest incident records.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("/history");
                    }}
                  >
                    View incidents
                  </button>
                </div>
              )}
            </div>

            <div className="rt-topbar-divider" />

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                className="rt-user-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="rt-avatar">
                  {initials || "AD"}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-800">
                    {userName}
                  </span>
                  <span className="block text-[11px] text-gray-500">
                    Administrator
                  </span>
                </span>

                <ChevronDown size={15} className="hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[200px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Operations account
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <UserRound size={17} />
                    My Profile
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={signOut}
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Current page */}
        <section
          className="rt-content"
          onClick={() => {
            setSearchOpen(false);
            setNotificationsOpen(false);
            setUserMenuOpen(false);
          }}
        >
          <Outlet />
        </section>
      </main>
    </div>
  );
}

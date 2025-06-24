import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HeartPulse, Menu, X, BookOpen, Stethoscope, Info, ChevronDown, Building, Mail, User, LogOut, LayoutDashboard, Microscope, UserCircle, ClipboardList, CalendarCheck, Facebook, Instagram, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton, UserButton, useAuth, useUser, useClerk } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

const NavLink = ({
  href,
  children,
  className,
  onClick,
  isActive = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 relative",
      isActive && "text-primary dark:text-primary border-b-2 border-primary",
      !isActive && "hover:border-b-2 hover:border-primary border-b-2 border-transparent",
      className
    )}
    onClick={onClick}
  >
    {children}
  </Link>
);

const SignInDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignIn = (role: 'patient' | 'doctor') => {
    setIsOpen(false);
    router.push(`/sign-in?role=${role}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700"
        >
          Sign in
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-center font-semibold">
          Sign in as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleSignIn('patient')}
          className="cursor-pointer p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-medium">Patient</div>
              <div className="text-xs text-gray-500">Book appointments & manage health</div>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSignIn('doctor')}
          className="cursor-pointer p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-medium">Doctor</div>
              <div className="text-xs text-gray-500">Manage practice & consultations</div>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AnimatedUserButton = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const userRole = user?.publicMetadata?.role as string;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 }
  };

  const handleSignOut = () => {
    signOut().then(() => {
      window.location.href = '/';
    });
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            label: 'Admin Dashboard',
            path: '/admin',
            icon: LayoutDashboard
          },
          {
            label: 'Admin Elab',
            path: '/admin/admin-elab',
            icon: Microscope
          }
        ];
      case 'doctor':
        return [
          {
            label: 'Doctor Dashboard',
            path: '/doctor',
            icon: LayoutDashboard
          },
          {
            label: 'Services',
            path: '/services',
            icon: ClipboardList
          }
        ];
      case 'patient':
      case 'user':
        return [
          {
            label: 'Patient Dashboard',
            path: '/patient',
            icon: LayoutDashboard
          },
          {
            label: 'Patient Elab',
            path: '/Elabs',
            icon: Microscope
          }
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative"
        >
          <motion.div
            animate={{
              rotate: isHovered ? 360 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut"
            }}
            className="relative w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 p-[2px] cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 blur-sm opacity-50" />
            <div className="relative w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <Avatar className="w-full h-full">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  <AvatarFallback className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
                    {user.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserCircle className="w-6 h-6 text-emerald-500" />
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1 : 0 }}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"
          />
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2"
        asChild
      >
        <motion.div
          variants={menuVariants}
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <DropdownMenuLabel className="p-2">
            <motion.div variants={itemVariants} className="flex flex-col gap-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 capitalize">
                {userRole || 'User'}
              </p>
            </motion.div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navigationItems.map((item, index) => (
            <motion.div key={item.path} variants={itemVariants}>
              <DropdownMenuItem 
                onClick={() => handleNavigation(item.path)}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuItem>
            </motion.div>
          ))}
          <DropdownMenuSeparator />
          <motion.div variants={itemVariants}>
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="cursor-pointer p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = ({ hideBookInstantly = false }: { hideBookInstantly?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const closeMenu = () => setIsOpen(false);

  const containerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05,
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { 
        duration: 0.2,
        when: "afterChildren",
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
  };

  const handleBookInstantlyClick = (e: React.MouseEvent) => {
    setLoading(true);
    router.push('/quick-registration');
  };

  return (
    <TooltipProvider>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md"
            : "py-4 bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="OurTopClinic logo" className="h-28 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList>
                {!hideBookInstantly && (
                  <NavigationMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleBookInstantlyClick}
                          className="mr-2 px-5 py-2 font-bold text-emerald-700 dark:text-emerald-200 !bg-transparent !border-none !shadow-none !rounded-none focus:ring-0 outline-none active:bg-transparent hover:underline hover:text-emerald-900 dark:hover:text-emerald-100 transition-all duration-200 flex items-center gap-2 animate-pulse-soft"
                          aria-label="Book Instantly"
                        >
                          <span className="relative flex items-center">
                            <CalendarCheck className="h-5 w-5 text-emerald-600 animate-bounce-slow" />
                          </span>
                          <span className="font-bold tracking-wide">Book Instantly</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Book an appointment without signing up!</TooltipContent>
                    </Tooltip>
                  </NavigationMenuItem>
                )}
                <NavigationMenuItem>
                  <NavLink href="/" isActive={isActive('/')}>
                      Home
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavLink href="/about_us" isActive={isActive('/about_us')}>
                      About Us
                  </NavLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavLink href="/blog" isActive={isActive('/blog')}>
                      Blog
                  </NavLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavLink href="/partner-with-us" isActive={isActive('/partner-with-us')}>
                      Partner With Us
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavLink href="/contact" isActive={isActive('/contact')}>
                      Contact
                  </NavLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  {isSignedIn ? (
                    <div className="flex items-center">
                      <AnimatedUserButton />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SignInDropdown />
                    </div>
                  )}
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-4">
            <ThemeToggle />
            {!hideBookInstantly && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleBookInstantlyClick}
                    className="px-4 py-2 font-bold text-emerald-700 dark:text-emerald-200 !bg-transparent !border-none !shadow-none !rounded-none focus:ring-0 outline-none active:bg-transparent hover:underline hover:text-emerald-900 dark:hover:text-emerald-100 transition-all duration-200 flex items-center gap-2 animate-pulse-soft"
                    aria-label="Book Instantly"
                  >
                    <span className="relative flex items-center">
                      <CalendarCheck className="h-4 w-4 text-emerald-600 animate-bounce-slow" />
                    </span>
                    <span className="font-bold tracking-wide">Book Instantly</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Book an appointment without signing up!</TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-700 dark:text-gray-300"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div 
                className="absolute top-[72px] right-0 w-[320px] max-w-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl h-[calc(100vh-72px)] overflow-y-auto rounded-l-3xl p-0 flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 pb-2 flex-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-200">Menu</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <motion.div variants={itemVariants}>
                    <NavLink href="/" onClick={closeMenu} isActive={isActive('/')}> <div className="flex items-center gap-2 text-lg font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><HeartPulse className="h-5 w-5 mr-1" /> Home</div> </NavLink>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NavLink href="/about_us" onClick={closeMenu} isActive={isActive('/about_us')}> <div className="flex items-center gap-2 text-lg font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><Info className="h-5 w-5 mr-1" /> About Us</div> </NavLink>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NavLink href="/blog" onClick={closeMenu} isActive={isActive('/blog')}> <div className="flex items-center gap-2 text-lg font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><BookOpen className="h-5 w-5 mr-1" /> Blog</div> </NavLink>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NavLink href="/partner-with-us" onClick={closeMenu} isActive={isActive('/partner-with-us')}> <div className="flex items-center gap-2 text-lg font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><Building className="h-5 w-5 mr-1" /> Partner With Us</div> </NavLink>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <NavLink href="/contact" onClick={closeMenu} isActive={isActive('/contact')}> <div className="flex items-center gap-2 text-lg font-medium py-2 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><Mail className="h-5 w-5 mr-1" /> Contact</div> </NavLink>
                  </motion.div>
                  <div className="my-4"><hr className="border-t border-gray-200 dark:border-gray-700" /></div>
                  <motion.div variants={itemVariants}>
                    {isSignedIn ? (
                      <div className="flex items-center px-4 py-2">
                        <AnimatedUserButton />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <SignInDropdown />
                      </div>
                    )}
                  </motion.div>
                </div>
                {/* Social icons row at the bottom */}
                <div className="flex justify-center gap-4 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-3xl">
                  <a href="https://www.facebook.com/profile.php?id=61558999269602" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://www.instagram.com/ourtopclinic/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/ourtopclinic/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="https://www.tiktok.com/@ourtopclinic_health" aria-label="TikTok" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5"><path d="M28.5 10.7c-2.2 0-4-1.8-4-4V2.5c0-0.3-0.2-0.5-0.5-0.5h-3.2c-0.3 0-0.5 0.2-0.5 0.5v18.1c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c0.3 0 0.5-0.2 0.5-0.5v-3.2c0-0.3-0.2-0.5-0.5-0.5-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5 9.5-4.3 9.5-9.5v-7.3c1.2 0.7 2.6 1.1 4 1.1 0.3 0 0.5-0.2 0.5-0.5v-3.2c0-0.3-0.2-0.5-0.5-0.5z"/></svg>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;

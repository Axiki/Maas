import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@mas/utils';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconLibrary = LucideIcons as unknown as Record<string, LucideIcon>;

interface NavigationBranch {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  subItems?: NavigationBranch[];
}

interface BranchingNavigationProps {
  branches: NavigationBranch[];
  currentRoute: string;
  onNavigate: (route: string) => void;
  className?: string;
}

export const BranchingNavigation: React.FC<BranchingNavigationProps> = ({
  branches,
  currentRoute,
  onNavigate,
  className
}) => {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = (branchId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredBranch(branchId);
    setActiveBranch(branchId);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setHoveredBranch(null);
      setActiveBranch(null);
    }, 150);
  };

  const handleBranchClick = (branch: NavigationBranch) => {
    onNavigate(branch.route);
    setActiveBranch(branch.id);
  };

  const handleSubItemClick = (subItem: NavigationBranch) => {
    onNavigate(subItem.route);
    setActiveBranch(subItem.id);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {branches.map((branch) => {
        const Icon = iconLibrary[branch.icon] ?? LucideIcons.Package;
        const isActive = currentRoute.startsWith(branch.route);
        const isHovered = hoveredBranch === branch.id;
        const hasSubItems = branch.subItems && branch.subItems.length > 0;

        return (
          <div
            key={branch.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(branch.id)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main Branch Button */}
            <motion.button
              onClick={() => handleBranchClick(branch)}
              className={cn(
                'relative flex h-12 w-12 items-center justify-center rounded-xl border border-transparent text-muted transition-all duration-300',
                isActive
                  ? 'border-primary-200 bg-primary-100 text-primary-600 shadow-card'
                  : 'hover:border-line/80 hover:bg-surface-200/80 hover:text-ink'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Icon size={22} />
            </motion.button>

            {/* Branching Animation Container */}
            <AnimatePresence>
              {isHovered && hasSubItems && (
                <motion.div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                >
                  {/* Branching Lines */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-px h-4 bg-gradient-to-b from-primary-500/50 to-transparent" />
                  </div>

                  {/* Sub-items Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-surface-100/95 backdrop-blur-md rounded-2xl border border-line shadow-2xl">
                    {branch.subItems?.map((subItem, index) => {
                      const SubIcon = iconLibrary[subItem.icon] ?? LucideIcons.Package;
                      const isSubActive = currentRoute.startsWith(subItem.route);

                      return (
                        <motion.button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(subItem)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent transition-all duration-200 min-w-[100px]',
                            isSubActive
                              ? 'border-primary-200 bg-primary-100 text-primary-600'
                              : 'hover:border-line/80 hover:bg-surface-200/80 hover:text-ink'
                          )}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: index * 0.1 }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            isSubActive ? 'bg-primary-200' : 'bg-surface-200'
                          )}>
                            <SubIcon size={16} className={isSubActive ? 'text-primary-600' : 'text-muted'} />
                          </div>
                          <div className="text-center">
                            <p className={cn(
                              'text-xs font-medium truncate max-w-[80px]',
                              isSubActive ? 'text-primary-700' : 'text-ink'
                            )}>
                              {subItem.name}
                            </p>
                            <p className={cn(
                              'text-[10px] truncate max-w-[80px]',
                              isSubActive ? 'text-primary-600' : 'text-muted'
                            )}>
                              {subItem.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Indicator */}
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                layoutId="activeIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

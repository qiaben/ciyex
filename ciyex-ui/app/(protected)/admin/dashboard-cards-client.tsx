'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, BriefcaseBusiness, BriefcaseMedical, User, ArrowRight } from 'lucide-react';

const iconMap = {
  users: Users,
  user: User,
  briefcaseBusiness: BriefcaseBusiness,
  briefcaseMedical: BriefcaseMedical,
};

const themeMap = {
  users: {
    iconBg: 'bg-blue-500 dark:bg-blue-600',
    iconColor: 'text-white',
    border: 'border-t-4 border-blue-500 dark:border-blue-600',
    btn: 'bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-600 focus:ring-blue-400',
    btnIcon: 'text-blue-500 dark:text-blue-400 group-hover:text-white',
  },
  user: {
    iconBg: 'bg-rose-500 dark:bg-rose-600',
    iconColor: 'text-white',
    border: 'border-t-4 border-rose-500 dark:border-rose-600',
    btn: 'bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-500 focus:ring-rose-300',
    btnIcon: 'text-rose-500 dark:text-rose-400 group-hover:text-white',
  },
  briefcaseBusiness: {
    iconBg: 'bg-yellow-400 dark:bg-yellow-500',
    iconColor: 'text-white',
    border: 'border-t-4 border-yellow-400 dark:border-yellow-500',
    btn: 'bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-400 focus:ring-yellow-300',
    btnIcon: 'text-yellow-500 dark:text-yellow-400 group-hover:text-white',
  },
  briefcaseMedical: {
    iconBg: 'bg-emerald-500 dark:bg-emerald-600',
    iconColor: 'text-white',
    border: 'border-t-4 border-emerald-500 dark:border-emerald-600',
    btn: 'bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-500 focus:ring-emerald-400',
    btnIcon: 'text-emerald-500 dark:text-emerald-400 group-hover:text-white',
  },
};

interface CardData {
  title: string;
  value: string | number;
  iconKey: keyof typeof iconMap;
  note: string;
  link: string;
}

interface DashboardCardsClientProps {
  cardData: CardData[];
}

const DashboardCardsClient = ({ cardData }: DashboardCardsClientProps) => {
  return (
    <div className="w-full flex flex-wrap gap-4">
      {cardData?.map((el, index) => {
        const Icon = iconMap[el.iconKey];
        const theme = themeMap[el.iconKey];
        return (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`relative flex-1 min-w-[220px] max-w-[270px] rounded-2xl p-6 bg-white dark:bg-gradient-to-br dark:from-[#e5e7eb] dark:to-[#a3a3a3] shadow-lg border-none transition-all duration-200`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full shadow-inner ${theme.iconBg}`}> 
                {Icon && <Icon className={`w-7 h-7 ${theme.iconColor}`} />}
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-900">{el.title}</div>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{el.value}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{el.note}</div>
            <Link
              href={el.link}
              className={`absolute bottom-4 right-4 z-10 rounded-full bg-white dark:bg-[#2563eb] border-[#2563eb] dark:border-[#38bdf8] text-[#2563eb] dark:text-white hover:bg-[#f3f4f6] dark:hover:bg-[#3b82f6] hover:text-[#2563eb] dark:hover:text-white transition-colors shadow-md p-2 group focus:outline-none focus:ring-2`}
              aria-label={`See details for ${el.title}`}
            >
              <ArrowRight className={`w-5 h-5 text-[#2563eb] dark:text-white transition-colors`} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardCardsClient; 
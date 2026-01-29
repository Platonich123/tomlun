import { Home, Utensils, ShoppingBag, User, Lock } from 'lucide-react';
import React from 'react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkTheme: boolean;
  isAuthenticated: boolean;
}

export function BottomNavigation({ activeTab, onTabChange, isDarkTheme, isAuthenticated }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Home, requiresAuth: false },
    { id: 'food', label: 'Еда', icon: Utensils, requiresAuth: false },
    { id: 'orders', label: 'Заказы', icon: ShoppingBag, requiresAuth: true },
    { id: 'profile', label: 'Профиль', icon: User, requiresAuth: true }
  ];

  return (
    <div className={`border-t flex-shrink-0 w-full ${
      isDarkTheme 
        ? 'bg-black border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex w-full gap-2 px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 transition-all relative rounded-xl
                ${isActive
                  ? isDarkTheme
                    ? 'bg-gradient-to-r from-purple-800 to-pink-700 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : isDarkTheme
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'}
              `}
              style={{ minWidth: 0 }}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={24} className={`mb-1 transition-all ${isActive ? (isDarkTheme ? 'text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]' : 'text-white drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]') : (isDarkTheme ? 'text-gray-400' : 'text-gray-500')}`} />
              </div>
              <span className={`text-xs font-semibold transition-all ${isActive ? (isDarkTheme ? 'text-purple-200' : 'text-white') : (isDarkTheme ? 'text-gray-400' : 'text-gray-700')}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
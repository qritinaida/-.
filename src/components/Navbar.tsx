import React, { useState } from 'react';
import { Building2, UserCircle, Shield, Cloud, RotateCcw, Home, LogIn, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { Room, GoogleUser } from '../types';

interface NavbarProps {
  role: 'admin' | 'tenant';
  setRole: (role: 'admin' | 'tenant') => void;
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  rooms: Room[];
  currentUser: GoogleUser | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenGoogleAuth: () => void;
  onOpenDeployModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  setRole,
  activeRoomId,
  setActiveRoomId,
  rooms,
  currentUser,
  isDarkMode,
  onToggleTheme,
  onOpenGoogleAuth,
  onOpenDeployModal,
  onResetData
}) => {
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand with Sunflower Mascot */}
          <div className="flex items-center space-x-3">
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-300 via-yellow-400 to-orange-400 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 active:scale-95">
                <img 
                  src="/mascot/hello.png" 
                  alt="Sunflower Mascot" 
                  className="w-full h-full object-cover rounded-2xl bg-amber-50"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 text-[11px] animate-bounce">🌻</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">DormitoryOS</span>
                <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-amber-400/40 flex items-center space-x-1">
                  <span>🌻 ซันนี่ทานตะวัน</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">หอพักอบอุ่น สดใส อยู่สบายทุกวัน</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Role Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setRole('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>มุมมองแอดมิน</span>
              </button>

              <button
                onClick={() => setRole('tenant')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  role === 'tenant'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>มุมมองผู้เช่า</span>
              </button>
            </div>

            {/* Tenant Room Selector (Only shown if Tenant role) */}
            {role === 'tenant' && (
              <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1.5 rounded-xl">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium hidden md:inline">ห้อง:</span>
                <select
                  value={activeRoomId}
                  onChange={(e) => setActiveRoomId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer"
                >
                  {occupiedRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      ห้อง {room.number}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Google Authentication Button / Profile Pill */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={onOpenGoogleAuth}
                  className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 p-1.5 pr-2.5 rounded-2xl border border-slate-200 transition text-xs text-left"
                  title="จัดการบัญชี Google"
                >
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div className="hidden lg:block leading-tight">
                    <span className="font-bold text-slate-800 text-[11px] block truncate max-w-[100px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate max-w-[100px]">
                      {currentUser.role === 'admin' ? 'Admin' : `ห้อง ${currentUser.roomNumber || ''}`}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenGoogleAuth}
                className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 shadow-sm transition active:scale-95"
              >
                {/* Google Colored Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="hidden sm:inline">Google Login</span>
              </button>
            )}

            {/* Dark Mode / Light Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-2 rounded-xl transition shadow-xs active:scale-95 border ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">โหมดสว่าง</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="hidden md:inline">โหมดมืด</span>
                </>
              )}
            </button>

            {/* Cloudflare Deploy Button */}
            <button
              onClick={onOpenDeployModal}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-500/20 transition-all active:scale-95"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deploy Cloudflare</span>
            </button>

            {/* Reset Seed Data */}
            <button
              onClick={onResetData}
              title="รีเซ็ตข้อมูลเริ่มต้น (Reset Demo Data)"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

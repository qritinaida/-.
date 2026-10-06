import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  User, 
  KeyRound, 
  Copy, 
  Sparkles,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { GoogleUser } from '../types';
import { 
  initGoogleAuth, 
  getStoredGoogleClientId, 
  saveStoredGoogleClientId 
} from '../utils/googleAuth';

interface GoogleAuthModalProps {
  currentUser: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose
}) => {
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'tenant'>('tenant');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Google OAuth Client ID State
  const [clientId, setClientId] = useState<string>(() => getStoredGoogleClientId());
  const [isClientSaved, setIsClientSaved] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const originUrl = window.location.origin;

  // Initialize real Google Identity Services (GIS) if Client ID configured
  useEffect(() => {
    if (clientId && window.google?.accounts?.id) {
      initGoogleAuth(clientId, (user) => {
        onLogin(user);
        onClose();
      }, 'gsi-button-mount');
    }
  }, [clientId]);

  // Demo accounts for immediate access
  const demoAccounts: GoogleUser[] = [
    {
      id: 'g-admin-01',
      name: 'สมเกียรติ สิทธิชัย',
      email: 'somkiat.admin@gmail.com',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      role: 'admin'
    },
    {
      id: 'g-tenant-101',
      name: 'สมชาย ใจดี',
      email: 'somchai.tenant@gmail.com',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'tenant',
      roomId: 'r-101',
      roomNumber: '101'
    },
    {
      id: 'g-tenant-102',
      name: 'วิภาวรรณ สุขสมบัติ',
      email: 'wipawan.tenant@gmail.com',
      picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'tenant',
      roomId: 'r-102',
      roomNumber: '102'
    }
  ];

  const handleContinueWithGoogle = () => {
    // If real Google Client ID is configured, trigger Google prompt
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }

    // Default fast Google login
    const targetAccount = selectedRole === 'admin' ? demoAccounts[0] : demoAccounts[1];
    onLogin(targetAccount);
    onClose();
  };

  const handleContinueWithFacebook = () => {
    const fbUser: GoogleUser = {
      id: `fb-${Date.now()}`,
      name: selectedRole === 'admin' ? 'Facebook Admin User' : 'Facebook Tenant User',
      email: `facebook.user@facebook.com`,
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: selectedRole,
      roomId: selectedRole === 'tenant' ? 'r-101' : undefined,
      roomNumber: selectedRole === 'tenant' ? '101' : undefined
    };
    onLogin(fbUser);
    onClose();
  };

  const handleContinueWithApple = () => {
    const appleUser: GoogleUser = {
      id: `apple-${Date.now()}`,
      name: selectedRole === 'admin' ? 'Apple Admin User' : 'Apple Tenant User',
      email: `privaterelay@appleid.com`,
      picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      role: selectedRole,
      roomId: selectedRole === 'tenant' ? 'r-102' : undefined,
      roomNumber: selectedRole === 'tenant' ? '102' : undefined
    };
    onLogin(appleUser);
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const emailPrefix = email.split('@')[0];
    const formattedName = emailPrefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const newUser: GoogleUser = {
      id: `usr-${Date.now()}`,
      name: formattedName || 'ผู้ใช้งาน',
      email: email.includes('@') ? email : `${email}@gmail.com`,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      role: selectedRole,
      roomId: selectedRole === 'tenant' ? 'r-101' : undefined,
      roomNumber: selectedRole === 'tenant' ? '101' : undefined
    };

    onLogin(newUser);
    onClose();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    saveStoredGoogleClientId(clientId);
    setIsClientSaved(true);
    setTimeout(() => setIsClientSaved(false), 2500);

    initGoogleAuth(clientId, (user) => {
      onLogin(user);
      onClose();
    }, 'gsi-button-mount');
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(originUrl);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Main Authentication Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[400px] p-6 sm:p-8 text-slate-800 flex flex-col justify-between my-auto">
        
        {/* Subtle Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
          title="ปิด"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Current Logged In Banner (if any) */}
        {currentUser && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 truncate">
              <img
                src={currentUser.picture}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate">{currentUser.name}</span>
                <span className="text-slate-400 text-[10px] block truncate">{currentUser.email}</span>
              </div>
            </div>
            <button
              onClick={() => onLogout()}
              className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center space-x-1 shrink-0 ml-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออก</span>
            </button>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Top Logo & Brand */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
            
            {/* ACME Gradient Logo Icon */}
            <div className="flex items-center justify-center space-x-2.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-400 p-0.5 shadow-md shadow-violet-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center relative overflow-hidden">
                  {/* Geometric 4-point star / sparkle shape matching image */}
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z" />
                  </svg>
                </div>
              </div>
              <span className="font-black text-2xl tracking-wider text-[#635BFF]">
                ACME
              </span>
            </div>

            {/* Page Title */}
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isSignUpMode ? 'Create your account' : 'Sign in to your account'}
            </h1>

          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-2.5">
            
            {/* 1. Continue with Google */}
            <button
              onClick={handleContinueWithGoogle}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-xs text-slate-700 font-semibold text-xs sm:text-sm transition-all duration-150 active:scale-[0.99] group"
            >
              {/* Google 4-color 'G' icon */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* 2. Continue with Facebook */}
            <button
              onClick={handleContinueWithFacebook}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-xs text-slate-700 font-semibold text-xs sm:text-sm transition-all duration-150 active:scale-[0.99] group"
            >
              {/* Facebook Official Icon */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* 3. Continue with Apple */}
            <button
              onClick={handleContinueWithApple}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 rounded-2xl shadow-xs text-slate-700 font-semibold text-xs sm:text-sm transition-all duration-150 active:scale-[0.99] group"
            >
              {/* Apple Official Silhouette */}
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.35-.55.63-1.03 1.69-.9 2.73 1 .08 2.02-.51 2.58-1.23z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition shadow-xs"
              />
            </div>

            {/* Role Switcher Pill */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-500">
              <span className="text-[11px]">สิทธิ์การเข้าใช้งาน:</span>
              <div className="bg-slate-100 p-0.5 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setSelectedRole('tenant')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    selectedRole === 'tenant' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ผู้เช่า (Tenant)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    selectedRole === 'admin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  แอดมิน (Admin)
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#635BFF] hover:bg-[#5248f7] text-white font-semibold rounded-2xl shadow-md shadow-indigo-500/25 text-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <span>{isSignUpMode ? 'Create account' : 'Sign in'}</span>
            </button>

          </form>

          {/* Toggle Mode: Already have an account? Sign in */}
          <div className="text-center text-xs text-slate-500 pt-1">
            {isSignUpMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="font-bold text-[#635BFF] hover:underline"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className="font-bold text-[#635BFF] hover:underline"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>

          {/* Disclaimer Footer */}
          <p className="text-center text-[11px] text-slate-400 leading-relaxed px-2">
            By continuing, you agree to our{' '}
            <span className="font-semibold text-slate-700 underline cursor-pointer">Terms of Use</span>{' '}
            and{' '}
            <span className="font-semibold text-slate-700 underline cursor-pointer">Privacy Policy</span>.
          </p>

        </div>

        {/* Expandable Helper for Demo & Google Setup */}
        <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
          
          {/* Demo Profiles Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-700 font-medium py-1 transition"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>บัญชีทดสอบระบบสำเร็จรูป (1-Click Demo Profiles)</span>
              </div>
              {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoAccounts && (
              <div className="mt-2 space-y-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onLogin(acc);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-left transition"
                  >
                    <div className="flex items-center space-x-2">
                      <img src={acc.picture} alt={acc.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{acc.name}</span>
                        <span className="text-[10px] text-slate-400 block">{acc.email}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      acc.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {acc.role === 'admin' ? 'Admin' : `ห้อง ${acc.roomNumber}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Google OAuth Client ID Setup */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-700 font-medium py-1 transition"
            >
              <div className="flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                <span>ตั้งค่า Google OAuth 2.0 Client ID (Production)</span>
              </div>
              {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedSettings && (
              <form onSubmit={handleSaveClientId} className="mt-2 space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 font-bold">Google Client ID:</span>
                  {isClientSaved && <span className="text-[10px] text-emerald-600 font-bold">บันทึกแล้ว!</span>}
                </div>
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxx.apps.googleusercontent.com"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold"
                  >
                    บันทึก
                  </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="truncate mr-1">Origin: {originUrl}</span>
                  <button
                    type="button"
                    onClick={handleCopyOrigin}
                    className="text-indigo-600 hover:underline shrink-0 font-medium"
                  >
                    {copiedOrigin ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Hidden container for GIS button if SDK mounts */}
      <div id="gsi-button-mount" className="hidden"></div>

    </div>
  );
};

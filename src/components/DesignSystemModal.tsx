import React, { useState } from 'react';
import { 
  Palette, 
  X, 
  Check, 
  Type, 
  Sparkles, 
  Code, 
  Copy, 
  Sliders, 
  Layout, 
  Building2, 
  FileCode2, 
  Eye, 
  Zap, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { DesignSystemTheme, THEME_PRESETS, ThemeService } from '../utils/themeService';

interface DesignSystemModalProps {
  onClose: () => void;
  onThemeChanged?: (theme: DesignSystemTheme) => void;
}

export const DesignSystemModal: React.FC<DesignSystemModalProps> = ({ 
  onClose,
  onThemeChanged 
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'code_guide'>('visual');
  const [currentTheme, setCurrentTheme] = useState<DesignSystemTheme>(() => ThemeService.getTheme());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleSelectPreset = (preset: DesignSystemTheme) => {
    setCurrentTheme(preset);
    ThemeService.saveTheme(preset);
    onThemeChanged?.(preset);
  };

  const handleFontChange = (font: DesignSystemTheme['fontFamily']) => {
    const updated: DesignSystemTheme = { ...currentTheme, fontFamily: font };
    setCurrentTheme(updated);
    ThemeService.saveTheme(updated);
    onThemeChanged?.(updated);
  };

  const handleRoundnessChange = (radius: string, label: DesignSystemTheme['roundnessLabel']) => {
    const updated: DesignSystemTheme = { ...currentTheme, borderRadius: radius, roundnessLabel: label };
    setCurrentTheme(updated);
    ThemeService.saveTheme(updated);
    onThemeChanged?.(updated);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">คู่มือ & ปรับแต่ง Design System</h2>
                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Theme Studio
                </span>
              </div>
              <p className="text-xs text-slate-300">
                วิธีปรับแต่งสี ตัวอักษร รูปทรง และคอมโพเนนต์ ทั้งผ่านหน้าเว็บและในซอร์สโค้ด
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-white/10 p-1 rounded-xl flex text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center space-x-1.5 ${
                  activeTab === 'visual' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ปรับแต่งธีมสด (Live Theme)</span>
              </button>
              <button
                onClick={() => setActiveTab('code_guide')}
                className={`px-3 py-1.5 rounded-lg transition font-medium flex items-center space-x-1.5 ${
                  activeTab === 'code_guide' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>วิธีแก้ไขในโค้ด (Source Guide)</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
          
          {/* TAB 1: VISUAL THEME STUDIO */}
          {activeTab === 'visual' && (
            <div className="space-y-6">
              
              {/* Preset Palette Chooser */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  <span>1. เลือกชุดสีหลัก (Theme Presets):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = currentTheme.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left p-3.5 rounded-2xl border transition relative group ${
                          isSelected
                            ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">{preset.name.split('(')[0]}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {/* Gradient bar preview */}
                        <div className={`h-3 w-full rounded-full bg-gradient-to-r ${preset.gradient} mb-2`}></div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>ฟอนต์: <strong>{preset.fontFamily}</strong></span>
                          <span>{preset.roundnessLabel.split('(')[0]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography & Roundness Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Font Selector */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Type className="w-4 h-4 text-blue-600" />
                    <span>2. รูปแบบตัวอักษรภาษาไทย & อังกฤษ (Typography):</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    เปลี่ยนฟอนต์ของทั้งระบบแบบ Real-time (โหลดจาก Google Fonts):
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { font: 'Prompt', title: 'Prompt (พร้อม)', desc: 'โมเดิร์น ยอดนิยม สบายตา' },
                      { font: 'Sarabun', title: 'Sarabun (สารบรรณ)', desc: 'ทางการ เอกสารราชการ สุภาพ' },
                      { font: 'Kanit', title: 'Kanit (คณิต)', desc: 'หนักแน่น ดิจิทัล ชัดเจน' },
                      { font: 'Inter', title: 'Inter (อินเตอร์)', desc: 'เรียบหรู สากล อินเตอร์เนชันแนล' },
                    ].map(f => (
                      <button
                        key={f.font}
                        onClick={() => handleFontChange(f.font as any)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          currentTheme.fontFamily === f.font
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">{f.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roundness / Corner Radius */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Layout className="w-4 h-4 text-emerald-600" />
                    <span>3. ความโค้งมนของกล่องและปุ่ม (Border Radius):</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    ปรับความโค้งมนของ Card, Input, Button และ Modal:
                  </p>
                  <div className="space-y-2 pt-1">
                    {[
                      { val: '0.5rem', label: 'เหลี่ยมมนเบาๆ (8px)', desc: 'กระชับ ทางการ มินิมอล' },
                      { val: '1rem', label: 'โมเดิร์นมาตรฐาน (16px)', desc: 'กลมกลืน สบายตา มาตรฐาน iOS/SaaS' },
                      { val: '1.5rem', label: 'กลมมนพิเศษ (24px)', desc: 'นุ่มนวล ทันสมัย สไตล์ Gen-Z & App' }
                    ].map(r => (
                      <button
                        key={r.val}
                        onClick={() => handleRoundnessChange(r.val, r.label as any)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          currentTheme.borderRadius === r.val
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">{r.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Live Preview Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>ตัวอย่างการแสดงผลจริง (Live Component Preview):</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Font: {currentTheme.fontFamily} | Radius: {currentTheme.borderRadius}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  
                  {/* Sample Room Card */}
                  <div 
                    className="p-4 border border-slate-200 bg-slate-50/60 shadow-xs flex flex-col justify-between"
                    style={{ borderRadius: currentTheme.borderRadius }}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-800">ห้อง 201 (แอร์)</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          มีผู้เช่าแล้ว
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">ผู้เช่า: คุณวิภาดา รัตนพร</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">฿4,500/ด.</span>
                      <button 
                        className={`text-white text-[11px] px-3 py-1 font-semibold bg-gradient-to-r ${currentTheme.gradient} shadow-xs hover:opacity-90`}
                        style={{ borderRadius: currentTheme.borderRadius }}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>

                  {/* Sample Buttons & Badges */}
                  <div 
                    className="p-4 border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-center"
                    style={{ borderRadius: currentTheme.borderRadius }}
                  >
                    <button 
                      className={`w-full text-white text-xs py-2 font-bold bg-gradient-to-r ${currentTheme.gradient} shadow-sm flex items-center justify-center space-x-1.5`}
                      style={{ borderRadius: currentTheme.borderRadius }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Primary Action Button</span>
                    </button>

                    <button 
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-2 font-semibold border border-slate-200 transition"
                      style={{ borderRadius: currentTheme.borderRadius }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  {/* Sample Alert Card */}
                  <div 
                    className="p-4 border border-amber-200 bg-amber-50/60 flex flex-col justify-between"
                    style={{ borderRadius: currentTheme.borderRadius }}
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-900 flex items-center space-x-1 mb-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>การแจ้งเตือนระบบ</span>
                      </span>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        มิเตอร์ไฟห้อง 302 สูงกว่าค่าเฉลี่ย 45% กรุณาตรวจสอบ
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-mono mt-2">
                      สถานะ: จดบันทึกแล้ว
                    </span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CODE & SOURCE ARCHITECTURE GUIDE */}
          {activeTab === 'code_guide' && (
            <div className="space-y-6">
              
              {/* Introduction Banner */}
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-900 leading-relaxed">
                <div className="flex items-center space-x-2 font-bold mb-1">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>โครงสร้างสถาปัตยกรรม Design System ของโปรเจกต์นี้</span>
                </div>
                โปรเจกต์นี้สร้างด้วย <strong>Tailwind CSS 3 + React + TypeScript</strong> คุณสามารถแก้ไขไฟล์โค้ดได้โดยตรงตามจุดต่างๆ ด้านล่างนี้:
              </div>

              {/* Point 1: tailwind.config.js */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">1. แก้ไขชุดสีและโทนหลัก (Theme Colors):</span>
                    <span className="text-[11px] text-slate-500 font-mono">tailwind.config.js</span>
                  </div>
                  <button
                    onClick={() => handleCopy('tailwind', ThemeService.generateTailwindCode(currentTheme))}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center space-x-1"
                  >
                    {copiedSection === 'tailwind' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'tailwind' ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด Tailwind'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  เปิดไฟล์ <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">tailwind.config.js</code> เพื่อปรับ Palette สีหลัก เช่น <code className="font-mono">colors.brand</code>:
                </p>
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{ThemeService.generateTailwindCode(currentTheme)}
                </pre>
              </div>

              {/* Point 2: index.html & Fonts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">2. แก้ไขฟอนต์ตัวอักษร (Google Fonts):</span>
                    <span className="text-[11px] text-slate-500 font-mono">index.html</span>
                  </div>
                  <button
                    onClick={() => handleCopy('fonts', `<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700&display=swap" rel="stylesheet">`)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center space-x-1"
                  >
                    {copiedSection === 'fonts' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'fonts' ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด Font Link'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600">
                  เปิดไฟล์ <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">index.html</code> เพื่อเพิ่มฟอนต์อื่นๆ ที่ต้องการจาก Google Fonts ในแท็ก <code className="font-mono">&lt;head&gt;</code>:
                </p>
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{`<!-- ในไฟล์ index.html ในส่วน <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Kanit:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">`}
                </pre>
              </div>

              {/* Point 3: Global CSS variables */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-xs text-slate-900">3. กำหนดตัวแปรกลาง & Custom Scrollbar:</span>
                    <span className="text-[11px] text-slate-500 font-mono">src/index.css</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  เปิดไฟล์ <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">src/index.css</code> เพื่อกำหนดสไตล์พื้นหลัง (body background) หรือ Scrollbar ประจำระบบ
                </p>
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto">
{`/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased bg-slate-50 text-slate-800;
    font-family: var(--dms-font-family, 'Prompt', sans-serif);
  }
}`}
                </pre>
              </div>

              {/* Point 4: Branding and Name */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-xs text-slate-900">4. เปลี่ยนชื่อหอพัก โลโก้ และข้อมูลผู้ดูแล:</span>
                    <span className="text-[11px] text-slate-500 font-mono">src/mockData.ts & src/components/Navbar.tsx</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  สามารถเปลี่ยนชื่อหอพักเริ่มต้น ที่อยู่ และเลข PromptPay ได้ใน <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono">src/mockData.ts</code> ที่ตัวแปร <code className="font-mono">initialSettings</code>
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100/90 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>ธีมที่เลือกบันทึกอัตโนมัติลงเบราว์เซอร์ทันที</span>
          </div>
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-sm"
          >
            เสร็จสิ้น
          </button>
        </div>

      </div>
    </div>
  );
};

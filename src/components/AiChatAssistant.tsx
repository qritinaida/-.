import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Settings, 
  Key, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  Shield, 
  UserCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { 
  AiAssistantService, 
  ChatMessage, 
  DormContext 
} from '../services/aiAssistantService';

interface AiChatAssistantProps {
  context: DormContext;
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => AiAssistantService.getStoredApiKey());
  const [keySavedNotification, setKeySavedNotification] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'ai',
      text: `สวัสดีครับ! ผมคือ **DormAI** ผู้ช่วยอัจฉริยะประจำหอพัก ${context.settings.name} 🏢✨

ผมสามารถช่วยคุณ:
• 📊 **ช่วยคิด & วิเคราะห์ข้อมูลหอพัก:** สรุปยอดค้างชำระ, อัตราเข้าพัก, ห้องที่ใช้ไฟสูงผิดปกติ
• 📝 **ช่วยร่างประกาศและข้อความ:** ร่างประกาศงดส่งเสียงดัง, ร่างข้อความทวงค่าเช่าอย่างสุภาพ
• 💡 **ตอบคำถามทั่วไป:** อัตราค่าน้ำ-ไฟ (฿${context.settings.defaultElectricRate}/หน่วย), เงื่อนไขเงินประกัน, ขั้นตอนแจ้งซ่อม

ลองคลิกที่หัวข้อแนะนำด้านล่าง หรือพิมพ์คำถามที่ต้องการได้เลยครับ!`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      thoughtProcess: [
        'โหลดบริบทสถานะหอพักแบบ Real-time',
        `ตรวจพบบทบาทปัจจุบัน: ${context.role === 'admin' ? 'ผู้จัดการหอพัก (Admin)' : 'ผู้เช่า (Tenant)'}`,
        'พร้อมให้บริการตอบคำถามและวิเคราะห์ข้อมูล'
      ],
      quickReplies: context.role === 'admin' ? [
        'สรุปภาพรวมหอพักวันนี้',
        'มีห้องไหนค้างชำระบ้าง?',
        'ร่างประกาศงดส่งเสียงดัง',
        'วิเคราะห์มิเตอร์ไฟที่สูงผิดปกติ'
      ] : [
        'ค่าน้ำค่าไฟห้องฉันคิดยังไง?',
        'ขั้นตอนการแจ้งย้ายออกและคืนเงินประกัน',
        'แอร์ไม่เย็น แจ้งซ่อมต้องทำอย่างไร?',
        'กฎระเบียบการพาเพื่อนมาพัก'
      ]
    }
  ]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await AiAssistantService.askAi(query.trim(), context);
      setMessages(prev => [...prev, response]);
      // Expand thought process by default for rich insights
      if (response.thoughtProcess && response.thoughtProcess.length > 0) {
        setExpandedThoughts(prev => ({ ...prev, [response.id]: true }));
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    AiAssistantService.saveApiKey(geminiKey);
    setKeySavedNotification(true);
    setTimeout(() => setKeySavedNotification(false), 2500);
    setShowSettings(false);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('คุณต้องการล้างประวัติการสนทนานี้หรือไม่?')) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'ai',
          text: 'ล้างประวัติการสนทนาเรียบร้อยแล้วครับ มีเรื่องไหนให้ DormAI ช่วยคิดหรือตอบคำถามเพิ่มเติมไหมครับ?',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          quickReplies: [
            'สรุปภาพรวมหอพักวันนี้',
            'มีห้องไหนค้างชำระบ้าง?',
            'ร่างข้อความทวงค่าเช่าอย่างสุภาพ'
          ]
        }
      ]);
    }
  };

  const toggleThought = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 group border-2 border-white/40"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-none flex items-center space-x-1">
              <span>DormAI</span>
              <span className="text-[10px] bg-white/20 px-1 rounded font-normal">Co-Pilot</span>
            </div>
            <div className="text-[10px] text-white/80 leading-tight">ถาม-ตอบ & ช่วยคิด</div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-white shadow-2xl border border-slate-200 transition-all duration-300 flex flex-col ${
            isExpanded 
              ? 'inset-4 sm:inset-10 rounded-2xl' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] h-[620px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-3.5 sm:p-4 rounded-t-2xl flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm tracking-tight">DormAI ผู้ช่วยอัจฉริยะ</h3>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Real-time Context</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center space-x-1">
                  <span>หอพัก {context.settings.name}</span>
                  <span>•</span>
                  <span>{context.role === 'admin' ? 'โหมดผู้ดูแล' : 'โหมดผู้เช่า'}</span>
                </p>
              </div>
            </div>

            {/* Header Tools */}
            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="ตั้งค่า Gemini API Key"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                title="ล้างข้อความ"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'ย่อหน้าต่าง' : 'ขยายเต็มจอ'}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="ปิด"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Overlay for Gemini API */}
          {showSettings && (
            <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>ตั้งค่า Google Gemini API Key (ไม่บังคับ)</span>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ปิด
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                ใส่ Google Gemini API Key เพื่อให้ AI เชื่อมต่อกับ LLM โดยตรง หรือปล่อยว่างไว้เพื่อใช้ <strong>Intelligent Dorm Engine (ออฟไลน์ & ฟรี)</strong>
              </p>
              <div className="flex space-x-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium"
                >
                  บันทึก
                </button>
              </div>
              {keySavedNotification && (
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
                </div>
              )}
            </div>
          )}

          {/* Live Context Quick Bar */}
          <div className="bg-indigo-50/70 border-b border-indigo-100/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-indigo-900 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>ห้อง: <strong>{context.rooms.length}</strong> ห้อง (ว่าง {context.rooms.filter(r => r.status === 'vacant').length})</span>
              <span>•</span>
              <span>ค้างชำระ: <strong>{context.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length}</strong> บิล</span>
            </div>
            <span className="font-semibold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
              ⚡ ฿{context.settings.defaultElectricRate}/u | 💧 ฿{context.settings.defaultWaterRate}/u
            </span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[92%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? (
                      context.currentUser?.picture ? (
                        <img src={context.currentUser.picture} alt="User" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <UserCircle className="w-4 h-4" />
                      )
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}>
                    
                    {/* Collapsible AI Thought Process */}
                    {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                      <div className="mb-2 bg-indigo-50/80 border border-indigo-100 rounded-xl p-2 text-[11px] text-indigo-900">
                        <button
                          onClick={() => toggleThought(msg.id)}
                          className="w-full flex items-center justify-between font-semibold text-indigo-700 hover:text-indigo-900 transition"
                        >
                          <div className="flex items-center space-x-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            <span>กระบวนการคิดของ AI (Thought Process)</span>
                          </div>
                          {expandedThoughts[msg.id] ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        
                        {expandedThoughts[msg.id] && (
                          <div className="mt-1.5 pt-1.5 border-t border-indigo-200/60 space-y-1 text-slate-600 font-mono text-[10px]">
                            {msg.thoughtProcess.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start space-x-1">
                                <span className="text-indigo-500 font-bold">›</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content (Formatted Markdown) */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, lIdx) => {
                        // Bold parsing
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <div key={lIdx}>
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Copy Button for AI templates */}
                    {msg.sender === 'ai' && (msg.text.includes('ร่าง') || msg.text.includes('ประกาศ') || msg.text.includes('เรียน ผู้เช่า')) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="flex items-center space-x-1 text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">คัดลอกข้อความแล้ว!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>คัดลอกร่างข้อความ</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 mt-1 px-10">
                  {msg.timestamp}
                </span>

                {/* Quick replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => handleSendMessage(reply)}
                        className="text-[11px] bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-full shadow-xs transition hover:scale-102 active:scale-98 flex items-center space-x-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                        <span>{reply}</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm text-xs text-slate-500 flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="animate-pulse">DormAI กำลังวิเคราะห์ข้อมูลและคิดคำตอบ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar (Scrollable chips) */}
          <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-1.5 overflow-x-auto custom-scrollbar flex items-center space-x-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">ตัวอย่าง:</span>
            {[
              'สรุปภาพรวมหอพักวันนี้',
              'มีห้องไหนค้างชำระบ้าง?',
              'ร่างประกาศงดส่งเสียงดัง',
              'วิธีคำนวณเงินคืนประกันตอนย้ายออก',
              'อัตราค่าน้ำค่าไฟ'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="text-[10px] whitespace-nowrap bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 px-2 py-0.5 rounded-md transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder={
                  context.role === 'admin'
                    ? 'ถามข้อมูลหอพัก, ขอให้ช่วยคิด, ร่างประกาศ, ทวงค่าเช่า...'
                    : 'ถามค่าน้ำค่าไฟ, กฎหอพัก, แจ้งซ่อม, คืนเงินประกัน...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

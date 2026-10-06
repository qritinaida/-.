import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Brain, 
  Lightbulb, 
  MessageSquare, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Calendar, 
  FileText, 
  Calculator, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { DormContext, AiAssistantService, ChatMessage } from '../services/aiAssistantService';

interface AiCommandCenterProps {
  context: DormContext;
}

export const AiCommandCenter: React.FC<AiCommandCenterProps> = ({ context }) => {
  // Tabs within AI Command Center
  const [activeTool, setActiveTool] = useState<'chat' | 'announcements' | 'deposit_calc' | 'insights'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'cc-init',
      sender: 'ai',
      text: `สวัสดีครับผู้จัดการหอพัก! ยินดีต้อนรับสู่ **DormAI Command Center** 🏢✨

ผมเชื่อมต่อกับฐานข้อมูลหอพัก **${context.settings.name}** แบบ Real-time แล้ว:
• มีห้องพักทั้งหมด **${context.rooms.length} ห้อง** (มีผู้เช่า ${context.rooms.filter(r => r.status === 'occupied').length} ห้อง, ว่าง ${context.rooms.filter(r => r.status === 'vacant').length} ห้อง)
• มียอดบิลค้างชำระ **${context.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length} รายการ**
• มีงานซ่อมบำรุงค้างอยู่ **${context.tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length} รายการ**

คุณสามารถถามข้อมูล ให้ช่วยวิเคราะห์ตัวเลข หรือใช้เครื่องมือช่วยคิดและร่างข้อความด้านบนได้เลยครับ!`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      thoughtProcess: [
        'สแกนดัชนีฐานข้อมูลหอพักและสถิติรายเดือน',
        'วิเคราะห์ความเสี่ยงด้านกระแสเงินสดและมิเตอร์น้ำ-ไฟ',
        'พร้อมวิเคราะห์และตอบคำถามเชิงลึก'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Deposit Calculator State
  const [calcDeposit, setCalcDeposit] = useState<number>(7000);
  const [calcWaterElectric, setCalcWaterElectric] = useState<number>(850);
  const [calcCleaningFee, setCalcCleaningFee] = useState<number>(600);
  const [calcDamagesFee, setCalcDamagesFee] = useState<number>(0);
  const [calcOtherFee, setCalcOtherFee] = useState<number>(0);

  // Announcement Drafter State
  const [announceType, setAnnounceType] = useState<'noise' | 'water_tank' | 'power_cut' | 'rent_reminder' | 'pest_control'>('noise');
  const [announceDate, setAnnounceDate] = useState<string>('วันเสาร์ที่ 15 ต.ค. เวลา 09:00 - 15:00 น.');
  const [draftResult, setDraftResult] = useState<string>('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await AiAssistantService.askAi(text.trim(), context);
      setMessages(prev => [...prev, response]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งครับ',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnnouncement = () => {
    let content = '';
    if (announceType === 'noise') {
      content = `📢 ประกาศหอพัก ${context.settings.name}\nเรื่อง: ขอความร่วมมืองดส่งเสียงดังและรักษาความสงบเรียบร้อย\n\nเรียน ผู้พักอาศัยทุกท่าน\nเนื่องจากทางหอพักได้รับการร้องเรียนเรื่องเสียงรบกวนในช่วงยามวิกาล เพื่อสุขภาวะที่ดีและการพักผ่อนของส่วนรวม ทางหอพักจึงขอความร่วมมือ:\n1. งดเปิดเพลง ส่งเสียงดัง หรือจัดกิจกรรมสังสรรค์หลังเวลา 22:00 น.\n2. ปิดประตูห้องอย่างเบามือ\n3. ห้ามสูบบุหรี่บริเวณทางเดินและระเบียงห้องพัก\n\nหากมีการฝ่าฝืน ทางหอพักขอสงวนสิทธิ์ในการตักเตือนและปรับตามระเบียบสัญญาเช่า ขอบคุณทุกท่านที่ร่วมมือครับ 🙏`;
    } else if (announceType === 'water_tank') {
      content = `📢 ประกาศหอพัก ${context.settings.name}\nเรื่อง: กำหนดการล้างทำความสะอาดถังพักน้ำประปาประจำปี\n\nเรียน ผู้พักอาศัยทุกท่าน\nเพื่อความสะอาดถูกสุขอนามัยของน้ำประปา ทางหอพักจะดำเนินการล้างถังพักน้ำใน ${announceDate}\n\nในช่วงเวลาดังกล่าว ทางหอพักจำเป็นต้องงดจ่ายน้ำประปาชั่วคราว จึงขอความกรุณาผู้พักอาศัยทุกห้องสำรองน้ำไว้ใช้ล่วงหน้า ขออภัยในความไม่สะดวกมา ณ ที่นี้ครับ`;
    } else if (announceType === 'power_cut') {
      content = `📢 ประกาศหอพัก ${context.settings.name}\nเรื่อง: แจ้งดับกระแสไฟฟ้าเพื่อบำรุงรักษาหม้อแปลงและระบบตู้ไฟ\n\nเรียน ผู้พักอาศัยทุกท่าน\nทางเจ้าหน้าที่การไฟฟ้าจะเข้าดำเนินการตรวจเช็กและบำรุงรักษาระบบไฟฟ้ารวมของอาคารใน ${announceDate}\n\nส่งผลให้ไม่มีกระแสไฟฟ้าและอินเทอร์เน็ตใช้งานในช่วงเวลาดังกล่าว ขอให้ทุกท่านถอดปลั๊กเครื่องใช้ไฟฟ้าและสำรองอุปกรณ์สื่อสารไว้ล่วงหน้า ขอบคุณครับ`;
    } else if (announceType === 'pest_control') {
      content = `📢 ประกาศหอพัก ${context.settings.name}\nเรื่อง: กำหนดการฉีดพ่นกำจัดแมลงและสัตว์พาหะรอบอาคาร\n\nเรียน ผู้พักอาศัยทุกท่าน\nทางหอพักจะจัดให้มีบริษัทผู้เชี่ยวชาญเข้าฉีดพ่นยากำจัดแมลงและปลวกบริเวณพื้นที่ส่วนกลางและท่อระบายน้ำใน ${announceDate}\n\nขอความกรุณาปิดประตู-หน้าต่างให้มิดชิดในช่วงเวลาดังกล่าว เพื่อความปลอดภัยของทุกท่านครับ`;
    } else {
      content = `📢 ประกาศแจ้งเตือนกำหนดชำระค่าเช่าห้องพักประจำเดือน\n\nเรียน ผู้เช่าห้องพักทุกท่าน\nขอแจ้งเตือนกำหนดชำระค่าเช่าห้องพักและค่าน้ำ-ไฟ ประจำงวดนี้ กำหนดชำระภายในวันที่ ${context.settings.dueDayOfMonth} นี้\n\n💳 สแกนชำระผ่าน PromptPay: ${context.settings.promptpayNumber} (${context.settings.promptpayName})\nเมื่อชำระแล้วรบกวนแนบสลิปผ่านระบบ DormitoryOS เพื่อออกใบเสร็จรับเงินอัตโนมัติ ขอบคุณครับ`;
    }
    setDraftResult(content);
  };

  // Metrics
  const totalRooms = context.rooms.length;
  const occupiedRooms = context.rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = context.rooms.filter(r => r.status === 'vacant').length;
  const unpaidInvoices = context.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const netRefund = Math.max(0, calcDeposit - calcWaterElectric - calcCleaningFee - calcDamagesFee - calcOtherFee);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight">DormAI Co-Pilot & Command Center</h2>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Live AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ระบบปัญญาประดิษฐ์ช่วยผู้จัดการหอพักคิด วิเคราะห์ข้อมูล จัดการความเสี่ยง และร่างประกาศอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Action Tool Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10 backdrop-blur-sm text-xs font-medium">
          {[
            { id: 'chat', label: 'สนทนา & ถาม AI', icon: MessageSquare },
            { id: 'announcements', label: 'ร่างประกาศหอพัก', icon: FileText },
            { id: 'deposit_calc', label: 'คำนวณคืนเงินมัดจำ', icon: Calculator },
            { id: 'insights', label: 'วิเคราะห์ความเสี่ยง', icon: TrendingUp },
          ].map(tool => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
                  active 
                    ? 'bg-white text-indigo-950 font-bold shadow-sm' 
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TOOL 1: CHAT WITH AI */}
      {activeTool === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chat Stream */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-sm text-slate-800">สนทนากับ AI วิเคราะห์หอพัก</span>
              </div>
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ตแชท</span>
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-start space-x-2.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                    }`}>
                      {msg.sender === 'user' ? 'คุณ' : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}>
                      {/* Thought process */}
                      {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                        <div className="mb-2 bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 text-[11px] text-indigo-900 font-mono">
                          <div className="font-bold text-indigo-700 flex items-center space-x-1 mb-1">
                            <Sparkles className="w-3 h-3" />
                            <span>กระบวนการคิดและสแกนข้อมูลของ AI:</span>
                          </div>
                          {msg.thoughtProcess.map((step, sIdx) => (
                            <div key={sIdx} className="text-slate-600">› {step}</div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      <div className="whitespace-pre-wrap space-y-1">
                        {msg.text.split('\n').map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>

                      {/* Copy Draft button if applicable */}
                      {msg.sender === 'ai' && msg.text.includes('ประกาศ') && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center space-x-1 text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg"
                          >
                            {copiedKey === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === msg.id ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-11">{msg.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-xs text-indigo-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-pulse w-fit">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>DormAI กำลังวิเคราะห์ข้อมูลและคิดคำตอบ...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="พิมพ์คำถาม หรือขอให้ AI ช่วยคิดวิเคราะห์ เช่น 'สรุปห้องที่ค้างชำระเดือนนี้'..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Prompt Sidebar */}
          <div className="space-y-4">
            
            {/* Quick Prompts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>คำสั่งแนะนำเพื่อให้ AI ช่วยคิด (Quick Prompts)</span>
              </div>
              <div className="space-y-2">
                {[
                  { title: '📊 สรุปภาพรวมหอพักวันนี้', desc: 'ดูอัตราการเข้าพัก ยอดเงิน และงานซ่อม' },
                  { title: '⚠️ มีห้องไหนค้างชำระบ้าง?', desc: 'แจกแจงห้อง ยอดเงิน และวันครบกำหนด' },
                  { title: '📝 ร่างข้อความทวงค่าเช่าอย่างสุภาพ', desc: 'ร่างข้อความส่ง LINE สำหรับแจ้งเตือน' },
                  { title: '⚡ วิเคราะห์มิเตอร์ไฟที่สูงผิดปกติ', desc: 'ตรวจจับห้องที่มีหน่วยกระโดด' },
                  { title: '🚪 วิธีคำนวณเงินคืนประกันตอนย้ายออก', desc: 'สูตรหักลบค่าน้ำไฟและค่าทำความสะอาด' },
                  { title: '📜 กฎระเบียบมาตรฐานของหอพัก', desc: 'รวมข้อห้ามสัตว์เลี้ยง เสียงดัง และการจอดรถ' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.title)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                  >
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Context Widget */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 text-xs">
              <span className="font-bold text-indigo-900 block mb-2">📡 Live Data Context ที่ AI มองเห็น:</span>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• ห้องพักทั้งหมด: <strong>{totalRooms}</strong> ห้อง (เข้าพัก {occupiedRooms})</li>
                <li>• ยอดค้างชำระรวม: <strong className="text-rose-600">฿{totalUnpaid.toLocaleString()}</strong></li>
                <li>• อัตราค่าน้ำ: <strong>฿{context.settings.defaultWaterRate}</strong>/u | ค่าไฟ: <strong>฿{context.settings.defaultElectricRate}</strong>/u</li>
                <li>• ค่าปรับล่าช้า: <strong>฿{context.settings.lateFeePerDay}</strong>/วัน</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* TOOL 2: ANNOUNCEMENTS DRAFTER */}
      {activeTool === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">เครื่องมือช่วยร่างประกาศหอพักอัตโนมัติ</h3>
            </div>
            <p className="text-xs text-slate-500">
              เลือกประเภทประกาศที่ต้องการ ระบบจะร่างข้อความที่เป็นระเบียบ สุภาพ และถูกต้องตามกฎระเบียบให้ทันที
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทประกาศ:</label>
                <select
                  value={announceType}
                  onChange={(e) => setAnnounceType(e.target.value as any)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="noise">🔇 ขอความร่วมมืองดส่งเสียงดัง / ห้ามสูบบุหรี่</option>
                  <option value="water_tank">💧 แจ้งล้างถังพักน้ำประปา / งดจ่ายน้ำชั่วคราว</option>
                  <option value="power_cut">⚡ แจ้งดับกระแสไฟฟ้าเพื่อซ่อมบำรุงตู้ไฟ</option>
                  <option value="pest_control">🐜 แจ้งฉีดพ่นกำจัดแมลงและปลวก</option>
                  <option value="rent_reminder">💳 แจ้งเตือนกำหนดชำระค่าเช่าประจำเดือน</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">วันและเวลาที่ดำเนินการ:</label>
                <input
                  type="text"
                  value={announceDate}
                  onChange={(e) => setAnnounceDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  placeholder="เช่น วันเสาร์ที่ 15 ตุลาคม เวลา 09:00 - 15:00 น."
                />
              </div>

              <button
                onClick={generateAnnouncement}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>ให้ AI ร่างข้อความประกาศทันที</span>
              </button>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-slate-800">ข้อความประกาศที่ได้:</span>
              {draftResult && (
                <button
                  onClick={() => handleCopy('draft', draftResult)}
                  className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg"
                >
                  {copiedKey === 'draft' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'draft' ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap overflow-y-auto max-h-[300px]">
              {draftResult || 'กดปุ่ม "ให้ AI ร่างข้อความประกาศทันที" เพื่อสร้างเนื้อหา'}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: DEPOSIT SETTLEMENT CALCULATOR */}
      {activeTool === 'deposit_calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900">เครื่องมือช่วยคิดและคำนวณคืนเงินประกัน</h3>
            </div>
            <p className="text-xs text-slate-500">
              คำนวณหักลบค่าใช้จ่ายจริงตอนผู้เช่าแจ้งย้ายออก เพื่อความโปร่งใสและสร้างใบสรุปเงินประกัน
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">เงินประกันตั้งต้น (บาท):</label>
                <input
                  type="number"
                  value={calcDeposit}
                  onChange={(e) => setCalcDeposit(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">ค่าน้ำ-ไฟงวดสุดท้าย (บาท):</label>
                <input
                  type="number"
                  value={calcWaterElectric}
                  onChange={(e) => setCalcWaterElectric(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-rose-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">ค่าทำความสะอาดห้อง (บาท):</label>
                <input
                  type="number"
                  value={calcCleaningFee}
                  onChange={(e) => setCalcCleaningFee(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-rose-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">ค่าความเสียหายอุปกรณ์ (บาท):</label>
                <input
                  type="number"
                  value={calcDamagesFee}
                  onChange={(e) => setCalcDamagesFee(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-rose-600 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Calculation Summary */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block mb-3">สรุปรายการหักเงินประกัน:</span>
              <div className="space-y-2 text-xs border-b border-emerald-200 pb-3">
                <div className="flex justify-between text-slate-700">
                  <span>เงินประกันตั้งต้น:</span>
                  <span className="font-bold text-slate-900">+฿{calcDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>หัก ค่าน้ำ-ไฟงวดสุดท้าย:</span>
                  <span>-฿{calcWaterElectric.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>หัก ค่าทำความสะอาดห้อง:</span>
                  <span>-฿{calcCleaningFee.toLocaleString()}</span>
                </div>
                {calcDamagesFee > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>หัก ค่าซ่อมแซมความเสียหาย:</span>
                    <span>-฿{calcDamagesFee.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-bold text-emerald-950">ยอดเงินประกันสุทธิที่ต้องคืน:</span>
                <span className="text-2xl font-black text-emerald-700">฿{netRefund.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const summary = `🧾 ใบบันทึกสรุปคืนเงินประกันห้องพัก\nหอพัก: ${context.settings.name}\n\n1. เงินประกันเดิม: ฿${calcDeposit.toLocaleString()}\n2. หัก ค่าน้ำ-ไฟงวดสุดท้าย: -฿${calcWaterElectric.toLocaleString()}\n3. หัก ค่าทำความสะอาด: -฿${calcCleaningFee.toLocaleString()}${calcDamagesFee > 0 ? `\n4. หัก ค่าเสียหาย: -฿${calcDamagesFee.toLocaleString()}` : ''}\n\n👉 ยอดเงินประกันสุทธิที่โอนคืน: ฿${netRefund.toLocaleString()}\nกำหนดโอนคืนภายใน 7-15 วันทำการ`;
                handleCopy('deposit_sum', summary);
              }}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'deposit_sum' ? 'คัดลอกสรุปรายการแล้ว!' : 'คัดลอกสรุปส่งให้ผู้เช่าทาง LINE'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TOOL 4: RISK & INSIGHTS */}
      {activeTool === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>ความเสี่ยงการค้างชำระ (Credit Risk)</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ฿{totalUnpaid.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500">
              พบ {unpaidInvoices.length} บิลที่ยังไม่ชำระ แนะนำส่งข้อความเตือนก่อนครบกำหนดผ่อนผัน
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>ความผิดปกติมิเตอร์น้ำ-ไฟ (Spikes)</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {context.meterReadings.filter(m => m.isSpikeWarning || m.electricUnits > 250).length} ห้อง
            </div>
            <p className="text-[11px] text-slate-500">
              ห้องที่หน่วยไฟฟ้า/น้ำสูงกว่าค่าเฉลี่ย 50% อาจมีปัญหาน้ำรั่วซึมหรือลืมปิดแอร์
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>อัตราการเข้าพัก (Occupancy)</span>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-[11px] text-slate-500">
              มีห้องว่าง {vacantRooms} ห้อง แนะนำจัดโปรโมชันลดเงินประกันหรือฟรีค่าส่วนกลางเดือนแรก
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

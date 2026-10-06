import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  Check, 
  Copy, 
  Terminal, 
  GitBranch, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface CloudflareDeployModalProps {
  onClose: () => void;
}

export const CloudflareDeployModal: React.FC<CloudflareDeployModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const deployCmd = `npm.cmd run deploy`;
  const loginCmd = `npx.cmd wrangler login`;
  
  const githubWorkflowYaml = `name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=dorm-management
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 text-xs text-slate-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">การ Deploy สู่ Cloudflare Pages</h2>
              <p className="text-xs text-slate-500">เผยแพร่แอประบบจัดการหอพักขึ้นสู่ Cloudflare อัตโนมัติ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          
          {/* Method 1: Local Terminal */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs sm:text-sm">
              <Terminal className="w-4 h-4 text-orange-500" />
              <span>วิธีที่ 1: Deploy ผ่าน Terminal ด้วย Wrangler CLI (รวดเร็วที่สุด)</span>
            </div>
            <p className="text-slate-600 text-xs">
              ระบบได้ติดตั้งและตั้งค่า <code className="bg-white px-1.5 py-0.5 rounded border font-mono">wrangler.toml</code> และ build script ไว้พร้อมแล้ว:
            </p>

            {/* Step 1 Login */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">1. ล็อกอินเข้าสู่บัญชี Cloudflare ของคุณ (ทำครั้งแรกเพียงครั้งเดียว):</span>
              <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px]">
                <code>{loginCmd}</code>
                <button
                  onClick={() => copyToClipboard(loginCmd, 'login')}
                  className="text-slate-400 hover:text-white ml-2 flex items-center space-x-1"
                >
                  {copiedKey === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'login' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>
            </div>

            {/* Step 2 Deploy */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">2. รันคำสั่ง Build และ Deploy ขึ้น Cloudflare Pages ทันที:</span>
              <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-2.5 rounded-xl font-mono text-[11px]">
                <code>{deployCmd}</code>
                <button
                  onClick={() => copyToClipboard(deployCmd, 'deploy')}
                  className="text-slate-400 hover:text-white ml-2 flex items-center space-x-1"
                >
                  {copiedKey === 'deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'deploy' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Method 2: GitHub Actions CI/CD */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs sm:text-sm">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span>วิธีที่ 2: ตั้งค่า CI/CD Deploy อัตโนมัติทุกครั้งที่ Git Push</span>
            </div>
            <p className="text-slate-600 text-xs">
              ไฟล์เวิร์กโฟลว์ <code className="bg-white px-1.5 py-0.5 rounded border font-mono">.github/workflows/deploy-cloudflare.yml</code> ถูกสร้างไว้ในโปรเจกต์แล้ว สามารถนำไปใช้งานกับ GitHub Repo ได้ทันที:
            </p>

            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40 custom-scrollbar">
              <pre>{githubWorkflowYaml}</pre>
              <button
                onClick={() => copyToClipboard(githubWorkflowYaml, 'yaml')}
                className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-md text-[10px] flex items-center space-x-1"
              >
                {copiedKey === 'yaml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'yaml' ? 'คัดลอกแล้ว' : 'คัดลอก YAML'}</span>
              </button>
            </div>
          </div>

          {/* Features note */}
          <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl flex items-start space-x-2 text-orange-950 text-xs">
            <Globe className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">ประโยชน์เมื่อ Deploy บน Cloudflare Pages:</p>
              <p className="text-[11px] text-orange-800 mt-0.5">
                • ให้บริการด้วย Global Edge Network ทั่วโลกกว่า 300 เมือง โหลดไวภายในไม่กี่มิลลิวินาที<br/>
                • ฟรี SSL/TLS Certificate และการป้องกัน DDoS ระดับ Cloudflare WAF ตลอด 24 ชม.<br/>
                • ได้รับโดเมนใช้งานฟรีทันที เช่น <code className="font-mono bg-white/70 px-1 rounded">https://dorm-management.pages.dev</code>
              </p>
            </div>
          </div>

        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

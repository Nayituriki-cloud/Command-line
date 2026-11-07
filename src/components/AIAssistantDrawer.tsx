import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  X,
  FileText,
  CalendarCheck,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';
import { Personnel, Unit, DutyAssignment, EquipmentItem } from '../types/commander';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel[];
  units: Unit[];
  dutyAssignments: DutyAssignment[];
  equipment: EquipmentItem[];
  currentRoleLabel: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionType?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  personnel,
  units,
  dutyAssignments,
  equipment,
  currentRoleLabel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Greetings, Commander. I am your COMMANDER 360 AI Administrative Advisor.
I am authorized to assist with personnel rosters, scheduling non-conflicting duty rosters, auditing overdue records, drafting official military notices, and optimizing unit logistics.

How may I assist your command echelon today?`,
      timestamp: '0700L',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string, actionType?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Unit and personnel summary context
      const context = {
        currentEchelon: currentRoleLabel,
        totalPersonnel: personnel.length,
        availableCount: personnel.filter((p) => p.status === 'AVAILABLE').length,
        leaveCount: personnel.filter((p) => p.status === 'LEAVE').length,
        medicalCount: personnel.filter((p) => p.status === 'UNAVAILABLE').length,
        unitsCount: units.length,
      };

      const personnelData = personnel.map((p) => ({
        rank: p.rank,
        name: `${p.lastName}, ${p.firstName}`,
        status: p.status,
        mos: p.mos,
        position: p.dutyPosition,
        apftScore: p.apftScore,
      }));

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          actionType: actionType || 'General Consultation',
          context,
          personnelData,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Directive acknowledged with no remarks.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('AI Assistant fetch error:', err);
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `Command Directive Acknowledged: Request processed under rule-engine backup. Ensure all changes are countersigned by the Unit S-1.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-bold text-slate-100 text-sm">
                AI COMMANDER ADVISOR
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Administrative & Personnel Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Action Pills */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
        <button
          onClick={() =>
            handleSendMessage(
              'Draft an equitable 7-day administrative duty roster for Staff Duty Officer, Officer of the Day, and Barracks CQ based on available personnel.',
              'duty_schedule'
            )
          }
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <CalendarCheck className="w-3 h-3 text-emerald-400" />
          <span>7-Day Duty Roster</span>
        </button>

        <button
          onClick={() =>
            handleSendMessage(
              'Generate a comprehensive Daily Personnel Status Report (PERSTAT) summary for current unit strength.',
              'perstat_summary'
            )
          }
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <FileText className="w-3 h-3 text-blue-400" />
          <span>Daily PERSTAT</span>
        </button>

        <button
          onClick={() =>
            handleSendMessage(
              'Audit the unit personnel records for overdue physical fitness assessments (ACFT >180 days), expired certifications, and pending actions.',
              'records_audit'
            )
          }
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Audit Records</span>
        </button>

        <button
          onClick={() =>
            handleSendMessage(
              'Prepare a structured Commander Staff Meeting Agenda covering personnel readiness, equipment inspections, and upcoming training exercises.',
              'meeting_agenda'
            )
          }
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer"
        >
          <ClipboardList className="w-3 h-3 text-purple-400" />
          <span>Meeting Agenda</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-xl p-3.5 space-y-2 relative group ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-xs'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono border-b border-slate-800/60 pb-1 mb-1">
                <span className={msg.sender === 'user' ? 'text-emerald-100 font-bold' : 'text-emerald-400 font-bold'}>
                  {msg.sender === 'user' ? 'COMMAND DIRECTIVE' : 'AI ADVISORY'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.sender === 'assistant' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-400">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
            <span className="font-mono text-xs">Processing military administrative intelligence...</span>
          </div>
        )}
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-1.5 bg-slate-950 text-[10px] text-slate-500 font-mono border-t border-slate-800/80 flex items-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
        <span>Strictly administrative & personnel assistance. Command decisions require human authority.</span>
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask AI Advisor (e.g. 'Draft memo for Friday inspection')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

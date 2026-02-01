
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Send, FileCode, Clock, Plus, Target, Layout, Database, RefreshCw, 
  AlertTriangle, Copy, Orbit, Compass, Waves, FolderTree, Palette, Check,
  ChevronRight, Shield, Rocket, Cpu, Sparkles, Fingerprint, Terminal,
  Lock, Zap, Server, Code2, Activity, Globe, Zap as Flash
} from 'lucide-react';
import { 
  Message, CodeSnippet, ConnectionStatus, Project, ProjectStatus, ProjectPhase
} from './types';
import { 
  createAiClient, connectLiveSession, startTextChat 
} from './services/gemini';

// --- Types & Interfaces ---

interface AgentLog {
  id: string;
  agent: string;
  action: string;
  timestamp: Date;
  status: 'info' | 'success' | 'warning' | 'meta' | 'critical' | 'sim' | 'auto';
}

type IntelligenceState = 'idle' | 'listening' | 'thinking' | 'building';
type AgentID = 'architect' | 'builder' | 'reviewer';
type ThemeID = 'HYPER-DARK' | 'MATRIX-GREEN' | 'SOLAR-FLARE';

// --- Cinematic UI Components ---

const ThemeSelector: React.FC<{ current: ThemeID, onSelect: (id: ThemeID) => void }> = ({ current, onSelect }) => {
  const themes: { id: ThemeID, color: string }[] = [
    { id: 'HYPER-DARK', color: 'bg-cyan-400' },
    { id: 'MATRIX-GREEN', color: 'bg-green-500' },
    { id: 'SOLAR-FLARE', color: 'bg-amber-500' },
  ];

  return (
    <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${t.color} ${current === t.id ? 'scale-110 ring-2 ring-white' : 'opacity-40 hover:opacity-100'}`}
        >
          {current === t.id && <Check size={12} className="text-black" />}
        </button>
      ))}
    </div>
  );
};

const AgentPresenceBar: React.FC<{ activeAgents: AgentID[] }> = ({ activeAgents }) => {
  const agents = useMemo<{ id: AgentID; label: string }[]>(() => [
    { id: 'architect', label: 'Arch' },
    { id: 'builder', label: 'Build' },
    { id: 'reviewer', label: 'Rev' },
  ], []);

  return (
    <div className="flex gap-1.5 bg-black/40 backdrop-blur-3xl px-2.5 py-1 rounded-full border border-white/5 shadow-2xl relative overflow-hidden group">
      {agents.map(agent => (
        <div key={agent.id} className="flex items-center gap-1 relative z-10">
          <motion.div 
            animate={activeAgents.includes(agent.id) ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${activeAgents.includes(agent.id) ? 'bg-accent shadow-glow' : 'bg-white/10'}`} 
          />
          <span className={`text-[7px] font-black uppercase tracking-widest transition-all duration-700 ${activeAgents.includes(agent.id) ? 'text-white' : 'text-gray-700'}`}>
            {agent.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const TypewriterText: React.FC<{ text: string, delay?: number }> = ({ text, delay = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);
  return <span>{displayedText}</span>;
};

const OnboardingFlow: React.FC<{ onComplete: (name: string) => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'handshake' | 'identity' | 'protocols' | 'engage'>('handshake');
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState<string | null>(null);

  useEffect(() => {
    if (stage === 'handshake') {
      const timer = setTimeout(() => setStage('identity'), 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const protocols = [
    { id: 'perf', title: 'Performance First', desc: 'Ultra-low latency architectures.', icon: Zap },
    { id: 'scale', title: 'Scalable Core', desc: 'Microservices & event-driven logic.', icon: Globe },
    { id: 'rapid', title: 'Rapid Prototype', desc: 'Speed of thought implementation.', icon: Flash },
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 sm:p-10 bg-black/90 backdrop-blur-3xl overflow-y-auto">
      <AnimatePresence mode="wait">
        {stage === 'handshake' && (
          <motion.div 
            key="handshake"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-4 max-w-sm"
          >
            <div className="flex justify-center mb-6">
              <motion.div 
                animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full flex items-center justify-center"
              >
                <Orbit className="text-accent" size={32} />
              </motion.div>
            </div>
            <p className="text-xs font-mono text-accent uppercase tracking-[0.5em] animate-pulse">Establishing Uplink...</p>
            <div className="text-[10px] font-mono text-gray-500 text-left bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
              <p>> [OK] NEXUS-CORE ACTIVE</p>
              <p>> [OK] ENCRYPTION HANDSHAKE COMPLETE</p>
              <p>> [OK] BIOSENSORS SYNCHRONIZED</p>
              <p>> [WAIT] AWAITING OPERATOR IDENTITY</p>
            </div>
          </motion.div>
        )}

        {stage === 'identity' && (
          <motion.div 
            key="identity"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <Fingerprint size={12} className="text-accent" />
                <span className="text-[8px] font-black uppercase text-accent tracking-widest">Operator Identity</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Initialize Project Manifest</h2>
              <p className="text-gray-400 text-xs font-medium">Define the semantic anchor for this mission.</p>
            </div>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <input 
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="MISSION NAME..."
                className="relative w-full bg-black/80 border border-white/10 rounded-2xl px-6 py-5 text-sm sm:text-lg font-black uppercase tracking-widest outline-none focus:border-accent transition-all text-white placeholder:text-gray-800"
              />
            </div>
            <button 
              onClick={() => name && setStage('protocols')}
              disabled={!name}
              className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:grayscale"
            >
              Configure Protocols <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {stage === 'protocols' && (
          <motion.div 
            key="protocols"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl space-y-8"
          >
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <Shield size={12} className="text-accent" />
                <span className="text-[8px] font-black uppercase text-accent tracking-widest">Architecture Standards</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Select Mission Ethos</h2>
              <p className="text-gray-400 text-xs font-medium">Define the core engineering priority for this workspace.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {protocols.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setProtocol(p.id)}
                  className={`p-6 rounded-3xl border transition-all text-left space-y-4 group ${protocol === p.id ? 'bg-accent/10 border-accent shadow-glow-sm' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${protocol === p.id ? 'bg-accent text-black' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                    <p.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-black uppercase text-white tracking-tight">{p.title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => protocol && setStage('engage')}
              disabled={!protocol}
              className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-2xl shadow-glow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:grayscale"
            >
              Verify Engagement <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {stage === 'engage' && (
          <motion.div 
            key="engage"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-sm"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center shadow-glow">
                <Rocket className="text-black" size={40} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">Ready for Engagement</h2>
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                Mission <span className="text-accent font-black">"{name.toUpperCase()}"</span> is prepared. All agents are synced. Cockpit uplink is ready.
              </p>
            </div>
            <button 
              onClick={() => onComplete(name)}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              ENGAGE MISSION <Check size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const IntelligenceStatusBar: React.FC<{ state: IntelligenceState; message: string; activeAgent?: AgentID }> = ({ state, message, activeAgent }) => {
  if (state === 'idle') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 rounded-full bg-black/60 border border-white/10 flex items-center gap-3 sm:gap-4 shadow-2xl backdrop-blur-3xl pointer-events-none"
    >
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-accent shadow-glow" 
        />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-20" />
      </div>
      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2 sm:gap-3 whitespace-nowrap">
        {activeAgent && <span className="text-white/40 italic font-mono uppercase">{activeAgent}</span>}
        <span className="text-white/20">|</span>
        {message}
      </span>
    </motion.div>
  );
};

const DynamicCentralPromptGuide: React.FC<{ inputEmpty: boolean; onSelect: (prompt: string) => void }> = ({ inputEmpty, onSelect }) => {
  const suggestions = [
    { title: "Bootstrap UI", prompt: "Build a full-stack high-fidelity dashboard in React.", icon: Layout },
    { title: "Fix Code", prompt: "Help me debug this broken TypeScript function.", icon: AlertTriangle },
    { title: "Architect", prompt: "Design a scalable PostgreSQL schema for an e-commerce platform.", icon: Database },
    { title: "Refactor", prompt: "Optimise this component for performance.", icon: RefreshCw },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!inputEmpty) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % suggestions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [inputEmpty, suggestions.length]);

  if (!inputEmpty) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col items-center justify-center py-4 sm:py-10 px-6 text-center space-y-4 sm:space-y-8 pointer-events-none z-10"
    >
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">CodexPro AI Core</h1>
        <p className="text-[9px] sm:text-[11px] text-white/70 uppercase tracking-[0.3em] font-bold">Build. Fix. Architect. Ship.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-2xl w-full pointer-events-auto">
        {suggestions.map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => onSelect(item.prompt)}
            className={`flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-3 bg-white/[0.03] border border-white/5 rounded-full hover:bg-white/10 hover:border-accent/30 transition-all text-left group
              ${idx === currentIndex ? 'border-accent/20 bg-white/[0.05]' : 'opacity-60'}
            `}
          >
            <item.icon size={12} className={`group-hover:text-accent ${idx === currentIndex ? 'text-accent' : 'text-gray-500'}`} />
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-white tracking-tight">{item.title}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const MessageRenderer: React.FC<{ content: string; role: 'user' | 'assistant' }> = ({ content, role }) => {
  const segments = content.split(/(```[\s\S]*?```)/g);
  
  if (role === 'user') {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 sm:p-5 text-accent-light font-semibold tracking-wide text-[11px] sm:text-sm shadow-glow-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 font-mono text-[10px] sm:text-[13px] tracking-wide text-gray-300 leading-relaxed shadow-2xl backdrop-blur-xl">
      {segments.map((segment, sIdx) => {
        if (segment.startsWith('```')) {
          const match = segment.match(/```(\w+)?\n([\s\S]*?)```/);
          const lang = match?.[1] || 'code';
          const code = match?.[2] || '';
          return (
            <div key={sIdx} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-black/80 shadow-inner relative group">
              <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-rose-500/60" />
                  <div className="w-1 h-1 rounded-full bg-amber-500/60" />
                  <div className="w-1 h-1 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[7px] font-black uppercase text-gray-500 tracking-[0.2em]">{lang}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-[9px] sm:text-xs font-mono leading-relaxed text-accent/90 scrollbar-hide">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = segment.split('\n');
        return (
          <div key={sIdx} className="space-y-3">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed === '') return <div key={lIdx} className="h-1" />;
              if (trimmed.startsWith('# ')) return <h1 key={lIdx} className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter mb-2 text-white border-b border-white/5 pb-1">{trimmed.slice(2)}</h1>;
              if (trimmed.startsWith('## ')) return <h2 key={lIdx} className="text-md sm:text-xl font-bold italic uppercase tracking-tight mb-1 text-accent">{trimmed.slice(3)}</h2>;
              if (trimmed.startsWith('### ')) return <h3 key={lIdx} className="text-xs sm:text-lg font-black uppercase tracking-widest text-white/90">{trimmed.slice(4)}</h3>;
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <li key={lIdx} className="ml-3 list-disc marker:text-accent text-gray-400 pl-1">{trimmed.substring(2)}</li>;
              if (trimmed.startsWith('>')) return <div key={lIdx} className="bg-white/5 border-l-2 border-accent p-3 rounded-r-xl italic text-[10px] sm:text-xs text-accent/80 my-3 shadow-inner">{trimmed.substring(1).trim()}</div>;
              
              return <p key={lIdx} className="leading-relaxed tracking-wide opacity-90">{line}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

interface InputBarProps {
  onSend: (message: string) => void;
  onToggleLive: () => void;
  isLiveEnabled: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ 
  onSend, 
  onToggleLive, 
  isLiveEnabled, 
  disabled = false,
  placeholder = "Describe mission...",
  value = "",
  onChange
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (internalValue.trim() && !disabled) {
      onSend(internalValue.trim());
      setInternalValue("");
      if (onChange) onChange("");
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed lg:relative bottom-16 lg:bottom-0 left-0 right-0 p-3 sm:p-8 bg-black/60 backdrop-blur-3xl border-t border-white/[0.05] z-[999] pointer-events-auto shadow-[0_-10px_50px_rgba(0,0,0,0.8)]"
      onClick={handleContainerClick}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-4 touch-manipulation">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleLive(); }}
          className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all shadow-xl group pointer-events-auto flex-shrink-0 ${isLiveEnabled ? 'bg-rose-600 text-white animate-pulse shadow-glow' : 'bg-white/5 text-accent hover:bg-accent/10 border border-white/10'}`}
        >
          {isLiveEnabled ? <MicOff size={18} /> : <Mic size={18} className="group-hover:scale-110 transition-transform" />}
        </button>
        
        <div className="flex-1 relative flex items-center bg-black/80 border border-white/10 rounded-xl sm:rounded-[2rem] p-1.5 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10 transition-all shadow-2xl pointer-events-auto overflow-hidden">
          <input
            ref={inputRef}
            id="chat-input"
            type="text"
            value={internalValue}
            disabled={disabled}
            onChange={(e) => {
              setInternalValue(e.target.value);
              if (onChange) onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-2.5 text-white text-xs sm:text-base font-medium outline-none placeholder:text-gray-700 pointer-events-auto select-text -webkit-user-select-text z-[1000]"
            autoComplete="off"
            onFocus={() => {
              setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }}
          />
          
          <button
            type="submit"
            disabled={!internalValue.trim() || disabled}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-3xl transition-all pointer-events-auto flex-shrink-0 text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${internalValue.trim() && !disabled ? 'bg-accent text-black shadow-glow scale-105' : 'bg-white/5 text-gray-700 grayscale cursor-not-allowed opacity-50'}`}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  );
};

// --- Application Root ---

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview' | 'safehouse'>('safehouse');
  const [isLiveEnabled, setIsLiveEnabled] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [systemHealth, setSystemHealth] = useState(1.0);
  const [theme, setTheme] = useState<ThemeID>('HYPER-DARK');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [sessionStartTime] = useState(new Date());

  const [intelligenceState, setIntelligenceState] = useState<IntelligenceState>('idle');
  const [intelligenceMessage, setIntelligenceMessage] = useState('');
  const [activeAgents, setActiveAgents] = useState<AgentID[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  const sessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.className = `overflow-hidden crt-overlay h-dvh theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    const storedProjects = localStorage.getItem('codexpro_projects');
    if (storedProjects) setProjects(JSON.parse(storedProjects));
  }, []);

  const saveProjects = useCallback((list: Project[]) => {
    localStorage.setItem('codexpro_projects', JSON.stringify(list));
    setProjects(list);
  }, []);

  const createProject = useCallback((name?: string) => {
    const newProject: Project = {
      projectId: crypto.randomUUID(),
      name: name || `Mission ${projects.length + 1}`,
      description: 'Autonomous engineering session.',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'active',
      currentPhase: 'onboarding',
      aiPersona: 'CodexPro-Alpha',
      workspace: { messages: [], snippets: [], simulation: null, decisions: [], agentAssignments: {}, memoryContext: {} },
      snapshots: [],
      sync: { lastSyncedAt: null, checksum: null, cloudStatus: 'unsynced' }
    };
    const updatedList = [newProject, ...projects];
    saveProjects(updatedList);
    setCurrentProject(newProject);
    return newProject;
  }, [projects, saveProjects]);

  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string, projectOverride?: Project) => {
    const targetProject = projectOverride || currentProject;
    if (!targetProject) return;

    const newMsg: Message = { id: Date.now().toString(), role, content, timestamp: new Date() };
    const updatedProject: Project = {
      ...targetProject,
      lastModified: new Date().toISOString(),
      workspace: {
        ...targetProject.workspace,
        messages: [...targetProject.workspace.messages, newMsg],
      }
    };
    
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    const newSnippets: any[] = [];
    while ((match = regex.exec(content)) !== null) {
      const lang = match[1] || 'typescript';
      const code = match[2];
      const category = (code.match(/\/\/\s*Category:\s*(frontend|backend|database|config)/i)?.[1].toLowerCase() || 'frontend') as any;
      newSnippets.push({
        id: crypto.randomUUID(),
        filename: `${category}-${Date.now().toString().slice(-4)}.tsx`,
        language: lang,
        code: code,
        category,
        explanation: 'Synthesized.'
      });
      if (category === 'frontend') setPreviewContent(code);
    }

    if (newSnippets.length > 0) {
      updatedProject.workspace.snippets = [...updatedProject.workspace.snippets, ...newSnippets];
      setSelectedSnippetId(newSnippets[newSnippets.length - 1].id);
    }

    setCurrentProject(updatedProject);
    const updatedList = projects.map(p => p.projectId === updatedProject.projectId ? updatedProject : p);
    if (!projects.find(p => p.projectId === updatedProject.projectId)) updatedList.push(updatedProject);
    saveProjects(updatedList);
    return updatedProject;
  }, [currentProject, projects, saveProjects]);

  const handleSendMessage = async (text: string) => {
    if (isSynthesizing) return;
    
    let activeProject = currentProject;
    if (!activeProject) activeProject = createProject();
    
    const updatedProject = await addMessage('user', text, activeProject);
    if (!updatedProject) return;

    setIsSynthesizing(true);
    setIntelligenceState('thinking');
    setIntelligenceMessage('Analysing');
    setActiveAgents(['architect']);

    try {
      const ai = createAiClient();
      const chat = startTextChat(ai, updatedProject.workspace.messages);
      const res = await chat.sendMessage({ message: text });
      
      setIntelligenceState('building');
      setIntelligenceMessage('Compiling');
      setActiveAgents(['builder']);
      
      await new Promise(r => setTimeout(r, 1000));
      setActiveAgents(['reviewer']);
      setIntelligenceMessage('Reviewing');
      
      await addMessage('assistant', res.text || 'Mission analysis failed.', updatedProject);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
      setIntelligenceState('idle');
      setActiveAgents([]);
    }
  };

  const toggleLive = () => {
    if (isLiveEnabled) {
      sessionRef.current?.close();
      setIsLiveEnabled(false);
    } else {
      setIsLiveEnabled(true);
      const ai = createAiClient();
      connectLiveSession(ai, {
        onopen: () => setIntelligenceState('listening'),
        onmessage: (m: any) => console.debug('Live Msg'),
        onerror: (e: any) => console.error('Live Error', e),
        onclose: () => {
          setIsLiveEnabled(false);
          setIntelligenceState('idle');
        }
      }).then(s => sessionRef.current = s);
    }
  };

  useEffect(() => {
    const itv = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsedTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(itv);
  }, [sessionStartTime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentProject?.workspace.messages]);

  const showOnboarding = currentProject?.currentPhase === 'onboarding' && currentProject.workspace.messages.length === 0;
  const isEmptyState = !currentProject || (currentProject.workspace.messages.length === 0 && !showOnboarding);

  return (
    <div className="flex flex-col h-dvh bg-black text-gray-200 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="scan-line" />
      
      <nav className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-10 border-b border-white/[0.05] bg-black/40 backdrop-blur-3xl z-[300] relative">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('safehouse')}>
          <Orbit className="w-6 h-6 sm:w-8 sm:h-8 text-accent shadow-glow-sm" />
          <div className="flex flex-col">
            <h1 className="text-[10px] sm:text-sm font-black tracking-tight italic uppercase">CodexPro</h1>
            <span className="text-[5px] sm:text-[6px] font-black text-gray-600 uppercase tracking-widest">{currentProject ? currentProject.name : 'Cockpit'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          <ThemeSelector current={theme} onSelect={setTheme} />
          <div className="hidden sm:block"><AgentPresenceBar activeAgents={activeAgents} /></div>
          <div className="flex flex-col text-right">
            <span className="text-[5px] sm:text-[6px] font-black uppercase text-gray-600 tracking-widest">Sys OK</span>
            <span className="text-[8px] sm:text-[10px] font-mono text-accent">{Math.round(systemHealth * 100)}%</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden relative z-10">
        <div className={`flex flex-col border-r border-white/[0.05] bg-black/20 transition-all duration-700 relative ${activeTab === 'chat' ? 'w-full lg:w-[45%]' : 'hidden lg:flex lg:w-[40%]'}`}>
          <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 sm:py-10 space-y-8 sm:space-y-12 scrollbar-hide pb-40 lg:pb-16 relative">
            <AnimatePresence>
              <IntelligenceStatusBar state={intelligenceState} message={intelligenceMessage} activeAgent={activeAgents[activeAgents.length - 1]} />
            </AnimatePresence>
            
            {showOnboarding ? (
              <OnboardingFlow onComplete={(name) => {
                if (currentProject) {
                  const updated = { ...currentProject, name, currentPhase: 'architecture' as ProjectPhase };
                  setCurrentProject(updated);
                  saveProjects(projects.map(p => p.projectId === updated.projectId ? updated : p));
                }
              }} />
            ) : isEmptyState ? (
              <div className="h-full flex flex-col items-center justify-center">
                <DynamicCentralPromptGuide 
                  inputEmpty={inputValue.length === 0} 
                  onSelect={(p) => {
                    if (!currentProject) createProject();
                    setInputValue(p);
                    handleSendMessage(p);
                  }} 
                />
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                {currentProject?.workspace.messages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="max-w-[98%] sm:max-w-[95%]">
                      <MessageRenderer content={msg.content} role={msg.role} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <InputBar 
            onSend={handleSendMessage} 
            onToggleLive={toggleLive} 
            isLiveEnabled={isLiveEnabled} 
            disabled={isSynthesizing || showOnboarding} 
            value={inputValue}
            onChange={setInputValue}
          />
        </div>

        <div className={`flex-1 flex flex-col transition-all duration-700 ${activeTab === 'chat' ? 'hidden lg:flex' : 'w-full flex'} bg-black/40 overflow-hidden`}>
          {activeTab === 'safehouse' ? (
            <div className="flex-1 flex flex-col p-5 sm:p-20 space-y-6 sm:space-y-12 overflow-y-auto scrollbar-hide pb-32">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-6 sm:pb-10">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-5xl font-black italic uppercase tracking-tighter text-white">Vault</h2>
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-[7px] sm:text-xs">Intelligence Manifest</p>
                </div>
                <button onClick={() => { createProject(); setActiveTab('chat'); }} className="flex items-center gap-2 px-5 sm:px-10 py-2 sm:py-4 bg-accent text-black font-black uppercase tracking-widest text-[7px] sm:text-xs rounded-lg sm:rounded-2xl shadow-glow active:scale-95 transition-all">
                  <Plus size={14} /> New Mission
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10">
                {projects.map(p => (
                  <div key={p.projectId} onClick={() => { setCurrentProject(p); setActiveTab('chat'); }} className="group p-5 sm:p-10 bg-white/[0.02] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] hover:border-accent/30 transition-all cursor-pointer space-y-3 sm:space-y-6 relative overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-gray-700 font-black text-[6px] sm:text-[9px] uppercase tracking-widest"><Clock size={10} /> {new Date(p.lastModified).toLocaleDateString()}</div>
                    <h3 className="text-sm sm:text-3xl font-black italic uppercase tracking-tighter group-hover:text-accent transition-colors text-white">{p.name}</h3>
                    <p className="text-gray-500 italic text-[10px] sm:text-sm line-clamp-2 leading-snug">{p.description}</p>
                    <span className="inline-block text-accent text-[8px] sm:text-[10px] font-black uppercase tracking-widest group-hover:underline">Resume Mission</span>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-10 sm:py-20 text-center opacity-30 italic font-medium uppercase tracking-[0.3em] text-[8px] sm:text-[10px]">No encrypted data found.</div>
                )}
              </div>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="flex-1 bg-white relative flex flex-col">
              <iframe className="w-full flex-1" srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body className="bg-black text-white p-4"><div id="root"></div><script type="module">${previewContent}</script></body></html>`} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden p-5 sm:p-20 space-y-4 sm:space-y-8 pb-32">
              <div className="flex items-center justify-between px-4 py-3 sm:px-8 sm:py-5 bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-3xl">
                 <div className="flex items-center gap-3"><FileCode size={18} className="text-accent" /><span className="text-[9px] sm:text-xs font-black uppercase text-white tracking-widest">{currentProject?.workspace.snippets.find(s => s.id === selectedSnippetId)?.filename || 'MANIFEST'}</span></div>
              </div>
              <div className="flex-1 bg-black p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[4rem] border border-white/[0.03] overflow-auto scrollbar-hide shadow-inner">
                <pre className="text-[9px] sm:text-sm font-mono text-gray-300 leading-relaxed">
                  <code>{currentProject?.workspace.snippets.find(s => s.id === selectedSnippetId)?.code || '// No modules compiled.'}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="lg:hidden h-16 sm:h-20 bg-black/80 border-t border-white/[0.05] fixed bottom-0 left-0 right-0 z-[400] flex items-center justify-around pb-safe backdrop-blur-3xl shadow-2xl">
        {[
          { id: 'safehouse', label: 'Vault', icon: FolderTree },
          { id: 'chat', label: 'Cockpit', icon: Compass },
          { id: 'preview', label: 'Render', icon: Waves }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all duration-500 ${activeTab === tab.id ? 'text-accent scale-110' : 'text-gray-600'}`}>
            <tab.icon size={20} /><span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;

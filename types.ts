
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  meta?: MetaInsight;
  simulation?: SimulationResult;
}

export interface MetaInsight {
  confidence: number; 
  predictions: string[];
  alternatives?: string[];
  evaluation?: string;
  systemHealth?: number; 
  autonomousState?: 'planning' | 'executing' | 'validating' | 'deploying';
}

export interface SimulationNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'deployment';
  status: 'optimal' | 'bottleneck' | 'risk';
}

export interface SimulationLink {
  source: string;
  target: string;
  type: 'sync' | 'async';
  status: 'stable' | 'conflicting';
}

export interface SimulationResult {
  nodes: SimulationNode[];
  links: SimulationLink[];
  risks: string[];
  summary: string;
  architectureScore: number; 
  deploymentPath?: string;
}

export interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  code: string;
  category: 'frontend' | 'backend' | 'database' | 'config';
  explanation: string;
  confidence?: number;
  lineConfidences?: number[]; 
  testResults?: 'passed' | 'failed' | 'pending';
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

// --- SafeHouse System Models ---

export type ProjectStatus = 'active' | 'paused' | 'archived';
export type ProjectPhase = 'onboarding' | 'architecture' | 'build' | 'debug' | 'deploy';

export interface Snapshot {
  snapshotId: string;
  timestamp: string; // ISO Date
  reason: 'auto' | 'manual' | 'recovery';
  summary: string;
  state: {
    messages: Message[];
    snippets: CodeSnippet[];
    simulation: SimulationResult | null;
  };
}

export interface Workspace {
  messages: Message[];
  snippets: CodeSnippet[];
  simulation: SimulationResult | null;
  decisions: string[];
  agentAssignments: Record<string, string>;
  memoryContext: Record<string, any>;
}

// --- Cloud & Export Models ---

export interface SyncMetadata {
  lastSyncedAt: string | null;
  checksum: string | null;
  cloudStatus: 'synced' | 'unsynced' | 'syncing' | 'conflict';
}

export interface GitHubMetadata {
  repoName: string | null;
  visibility: 'public' | 'private';
  lastExportedAt: string | null;
  repoUrl: string | null;
}

export interface Project {
  projectId: string;
  name: string;
  description: string;
  createdAt: string; // ISO Date
  lastModified: string; // ISO Date
  status: ProjectStatus;
  currentPhase: ProjectPhase;
  aiPersona: string;
  workspace: Workspace;
  snapshots: Snapshot[];
  sync: SyncMetadata;
  export?: GitHubMetadata;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isCloudEnabled: boolean;
  githubToken?: string;
}

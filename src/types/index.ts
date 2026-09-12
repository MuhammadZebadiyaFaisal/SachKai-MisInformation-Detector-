export interface AgentLog {
  agentName: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  message: string;
}

export interface FactCheckResponse {
  claim: string;
  verdict: 'True' | 'False' | 'Misleading' | 'Unverified';
  trustScore: number;
  summary: string;
  sources: { title: string; url: string }[];
  agentLogs: AgentLog[];
}
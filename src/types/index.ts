export interface AgentLog {
  agentName: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  message: string;
}

export interface FactCheckResponse {
  claim_id: string;
  is_cached: boolean;
  verdict: 'True' | 'False' | 'Misleading' | 'Unverified';
  trust_score: number;
  summary: {
    english: string;
    urdu: string;
  };
  key_findings: string[];
  sources: {
    title: string;
    url: string;
    credibility: 'High' | 'Medium' | 'Low';
    snippet?: string | null;
    published_date?: string | null;
  }[];
  processing_time_seconds: number;
  warnings?: string[];
}

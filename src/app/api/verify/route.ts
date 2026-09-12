import { NextResponse } from 'next/server';
import { FactCheckResponse } from '@/types';

export async function POST(request: Request) {
const { claim } = await request.json();

  // Mock response for immediate UI testing
  const mockData: FactCheckResponse = {
    claim: claim || "Sample claim",
    verdict: "Misleading",
    trustScore: 42,
    summary: "The shared context alters original reported facts.",
    sources: [
      { title: "Official Geo News Report", url: "https://geonews.tv" },
      { title: "Press Information Department", url: "https://pid.gov.pk" }
    ],
    agentLogs: [
      { agentName: "Search Agent", status: "completed", message: "Found 4 source articles" },
      { agentName: "Reasoning Agent", status: "completed", message: "Timestamp verified; contradiction detected" }
    ]
  };

  return NextResponse.json(mockData);
}
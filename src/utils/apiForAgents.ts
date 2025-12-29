import { Octo } from '@/types';

interface AgentAPIResponse {
  metadata: {
    version: string;
    timestamp: string;
    totalCount: number;
    format: string;
    apiEndpoint: string;
    documentation: string;
    rateLimit: string;
    supportedFormats: string[];
    lastUpdated: string;
  };
  data: Array<Octo & {
    dataQuality: number;
    relevanceScore: number;
    lastVerified: string;
  }>;
}

export const generateAgentAPIResponse = (octos: Octo[], format: 'json' | 'xml' = 'json'): string => {
  const response: AgentAPIResponse = {
    metadata: {
      version: '1.0',
      timestamp: new Date().toISOString(),
      totalCount: octos.length,
      format: format,
      apiEndpoint: '/api/v1/octos',
      documentation: 'https://opendatahive.fr/api/docs',
      rateLimit: '1000 requests per hour',
      supportedFormats: ['json', 'xml', 'csv'],
      lastUpdated: new Date().toISOString()
    },
    data: octos.map(octo => ({
      ...octo,
      dataQuality: calculateDataQuality(octo),
      relevanceScore: calculateRelevanceScore(octo),
      lastVerified: new Date().toISOString()
    }))
  };

  if (format === 'xml') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <metadata>
    <version>${response.metadata.version}</version>
    <timestamp>${response.metadata.timestamp}</timestamp>
    <totalCount>${response.metadata.totalCount}</totalCount>
    <format>${response.metadata.format}</format>
  </metadata>
  <data>
    ${response.data.map(octo => `
    <octo>
      <id>${octo.id}</id>
      <title><![CDATA[${octo.title}]]></title>
      <description><![CDATA[${octo.description}]]></description>
      <tags>${octo.tags.join(',')}</tags>
      <link>${octo.link}</link>
      <access>${octo.access}</access>
      <format>${octo.format}</format>
      <addedAt>${octo.addedAt}</addedAt>
    </octo>`).join('')}
  </data>
</response>`;
  }

  return JSON.stringify(response, null, 2);
};

const calculateDataQuality = (octo: Octo): number => {
  let score = 0;
  if (octo.title && octo.title.length > 10) score += 25;
  if (octo.description && octo.description.length > 50) score += 25;
  if (octo.tags && octo.tags.length > 0) score += 25;
  if (octo.link && octo.link.startsWith('http')) score += 25;
  return score;
};

const calculateRelevanceScore = (octo: Octo): number => {
  const now = new Date();
  const addedDate = new Date(octo.addedAt);
  const daysSinceAdded = (now.getTime() - addedDate.getTime()) / (1000 * 3600 * 24);
  
  let score = Math.max(0, 100 - daysSinceAdded * 0.5);
  if (octo.tags.length > 3) score += 10;
  if (octo.format === 'JSON') score += 5;
  
  return Math.min(100, Math.round(score));
};

export const isAgentRequest = (userAgent: string): boolean => {
  const agentPatterns = [
    /bot/i, /crawler/i, /spider/i, /agent/i, /manus/i,
    /gpt/i, /claude/i, /anthropic/i, /openai/i,
    /gemini/i, /bard/i, /perplexity/i, /you\.com/i
  ];

  return agentPatterns.some(pattern => pattern.test(userAgent));
};
export async function analyzeDispute(disputeText: string): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: disputeText }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze dispute');
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.analysis;
}
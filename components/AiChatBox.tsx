import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperPlaneRight } from '@phosphor-icons/react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface AiChatBoxProps {
  disputeId: string;
}

export default function AiChatBox({ disputeId }: AiChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [partyNames, setPartyNames] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchDisputeDetails();
  }, [disputeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDisputeDetails = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select('party_names')
      .eq('id', disputeId)
      .single();

    if (error) {
      console.error('Error fetching dispute details:', error);
      return;
    }

    if (data?.party_names) {
      setPartyNames(data.party_names);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      // Get only the last message for context to reduce token count
      const context = messages.length > 0 
        ? `${messages[messages.length - 1].role}: ${messages[messages.length - 1].content}`
        : '';

      // Add user message to the database
      const { data: messageData, error: messageError } = await supabase
        .from('dispute_messages')
        .insert([
          {
            dispute_id: disputeId,
            content: newMessage,
            role: 'user',
          },
        ])
        .select()
        .single();

      if (messageError) throw messageError;

      // Get AI response with context
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newMessage,
          context: context,
          names: partyNames
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      
      const { analysis } = await response.json();

      // Add AI response to the database
      const { error: aiError } = await supabase
        .from('dispute_messages')
        .insert([
          {
            dispute_id: disputeId,
            content: analysis,
            role: 'assistant',
          },
        ]);

      if (aiError) throw aiError;

      // Refresh messages
      await fetchMessages();
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask Judge Watson a question..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            <PaperPlaneRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
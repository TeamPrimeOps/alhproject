import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { analyzeDispute } from '@/lib/openai';
import { Blockchain } from '@/lib/blockchain';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload } from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { extractTextFromDocument } from '@/lib/documentParser';

const blockchain = new Blockchain();

// Maximum content length for document analysis (roughly 4000 tokens)
const MAX_DOCUMENT_LENGTH = 12000;

export default function DisputeForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const uploadFile = async (disputeId: string) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    // Generate a unique filename using disputeId, timestamp, and a random string
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const fileName = `${disputeId}-${uniqueSuffix}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('dispute-documents')
      .upload(fileName, file, {
        onUploadProgress: (progress) => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        },
      });

    if (uploadError) {
      throw uploadError;
    }

    return data.path;
  };

  const analyzeDocument = async (fileContent: string): Promise<string> => {
    // Truncate file content if it exceeds the maximum length
    const truncatedContent = fileContent.length > MAX_DOCUMENT_LENGTH 
      ? fileContent.slice(0, MAX_DOCUMENT_LENGTH) + "\n\n[Document truncated due to length...]"
      : fileContent;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: truncatedContent,
        role: 'document_analysis'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze document');
    }

    const data = await response.json();
    return data.analysis;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Read file content if present
      let documentAnalysis = '';
      if (file) {
        try {
          const fileContent = await extractTextFromDocument(file);
          if (!fileContent || fileContent.trim().length === 0) {
            throw new Error('No text could be extracted from the document');
          }
          documentAnalysis = await analyzeDocument(fileContent);
        } catch (error) {
          console.error('Error reading or analyzing document:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze the uploaded document';
          throw new Error(`Document analysis failed: ${errorMessage}`);
        }
      }

      // Get AI analysis of the dispute description
      let aiAnalysis = '';
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: description,
            context: documentAnalysis // Pass document analysis as context
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get AI analysis');
        }

        const data = await response.json();
        aiAnalysis = data.analysis;

        if (documentAnalysis) {
          aiAnalysis = `${aiAnalysis}\n\nDocument Analysis:\n${documentAnalysis}`;
        }
      } catch (aiError) {
        console.error("AI Analysis Error:", aiError);
        throw new Error('Error analyzing dispute with AI. Please try again.');
      }

      // Create dispute record in Supabase
      const disputeId = uuidv4();
      const { data, error: supabaseError } = await supabase
        .from('disputes')
        .insert([
          {
            id: disputeId,
            title,
            description,
            description_hash: blockchain.calculateHash(0, '', Date.now(), description, 0),
            ai_analysis: aiAnalysis,
            user_id: userId,
            status: 'in_progress'
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Upload file if present and update dispute with document path
      if (file) {
        const documentPath = await uploadFile(disputeId);
        if (documentPath) {
          const { error: updateError } = await supabase
            .from('disputes')
            .update({ document_path: documentPath })
            .eq('id', disputeId);

          if (updateError) throw updateError;
        }
      }

      // Add to blockchain
      blockchain.mineBlock({
        dispute_id: disputeId,
        title,
        description_hash: data.description_hash,
        timestamp: new Date().toISOString(),
      });

      // Navigate to the dispute details page
      router.push(`/disputes/${disputeId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error submitting dispute. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Dispute Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Dispute Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Supporting Document (Optional)</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="document"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('document')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {file ? file.name : 'Upload Document'}
            </Button>
            {file && (
              <span className="text-sm text-muted-foreground">
                {uploadProgress > 0 ? `${uploadProgress}%` : 'Ready to upload'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit Dispute'}
        </Button>
      </form>
    </div>
  );
}
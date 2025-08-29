import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Wand2, Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DSAEntryData {
  id: string;
  title: string;
  intuition: string;
  approach: string[];
  dryRun: string;
  timeComplexity: string;
  spaceComplexity: string;
  quickRevision: string[];
  code: string;
  tags?: string[];
  images?: string[];
}

interface ContentFormProps {
  onSave: (entry: DSAEntryData) => void;
  initialData?: DSAEntryData;
  // This prop removes the save button when editing in reader view
  hideSaveButton?: boolean; 
}

export interface ContentFormHandle {
  submit: () => void;
}

export const ContentForm = forwardRef<ContentFormHandle, ContentFormProps>(
  ({ onSave, initialData, hideSaveButton = false }, ref) => {
  const [formData, setFormData] = useState<DSAEntryData>({
    id: initialData?.id || uuidv4(),
    title: initialData?.title || "",
    intuition: initialData?.intuition || "",
    approach: initialData?.approach || [""],
    dryRun: initialData?.dryRun || "",
    timeComplexity: initialData?.timeComplexity || "",
    spaceComplexity: initialData?.spaceComplexity || "",
    quickRevision: initialData?.quickRevision || [""],
    code: initialData?.code || "",
    tags: initialData?.tags || [],
    images: initialData?.images || []
  });

  const [bulkContent, setBulkContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const entry: DSAEntryData = {
      id: formData.id,
      title: formData.title || "Untitled",
      intuition: formData.intuition || "",
      approach: formData.approach?.filter(s => s.trim()) || [],
      dryRun: formData.dryRun || "",
      timeComplexity: formData.timeComplexity || "",
      spaceComplexity: formData.spaceComplexity || "",
      quickRevision: formData.quickRevision?.filter(s => s.trim()) || [],
      code: formData.code || "",
      tags: formData.tags || [],
      images: formData.images || []
    };
    onSave(entry);
  };

  // Expose the handleSave function via a ref
  useImperativeHandle(ref, () => ({
    submit: handleSave,
  }));
  
  // ... all other functions (handleApproachChange, addTag, etc.) remain the same
  const handleApproachChange = (index: number, value: string) => {
    const newApproach = [...(formData.approach || [])];
    newApproach[index] = value;
    setFormData(prev => ({ ...prev, approach: newApproach }));
  };

  const addApproachStep = () => {
    setFormData(prev => ({
      ...prev,
      approach: [...(prev.approach || []), ""]
    }));
  };

  const handleRevisionChange = (index: number, value: string) => {
    const newRevision = [...(formData.quickRevision || [])];
    newRevision[index] = value;
    setFormData(prev => ({ ...prev, quickRevision: newRevision }));
  };

  const addRevisionPoint = () => {
    setFormData(prev => ({
      ...prev,
      quickRevision: [...(prev.quickRevision || []), ""]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), result]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove) || []
    }));
  };
  
  const parseBulkContent = () => {
    const text = bulkContent;
    const sections = text.split('## ').slice(1);
    const parsedData: Partial<DSAEntryData> = {
      approach: [],
      quickRevision: [],
    };

    sections.forEach(section => {
      const lines = section.split('\n');
      const header = lines[0].trim().toLowerCase();
      const content = lines.slice(1).join('\n').trim();

      if (header.startsWith('title')) {
        parsedData.title = content;
      } else if (header.startsWith('intuition')) {
        parsedData.intuition = content;
      } else if (header.startsWith('approach')) {
        parsedData.approach = content.split('\n').map(s => s.trim().replace(/^[*-]?\s*\d*\.\s*/, '')).filter(Boolean);
      } else if (header.startsWith('dry run')) {
        parsedData.dryRun = content;
      } else if (header.startsWith('time complexity')) {
        parsedData.timeComplexity = content;
      } else if (header.startsWith('space complexity')) {
        parsedData.spaceComplexity = content;
      } else if (header.startsWith('quick revision')) {
        parsedData.quickRevision = content.split('\n').map(s => s.trim().replace(/^[*-]?\s*/, '')).filter(Boolean);
      } else if (header.startsWith('code')) {
        parsedData.code = content;
      }
    });

    setFormData(prev => ({ ...prev, ...parsedData }));
    setBulkContent("");
  };

  return (
    <div className="space-y-6">
      {/* Bulk Content Input */}
      <Card className="content-section">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Bulk Content Input</Label>
            <Button
              onClick={parseBulkContent}
              disabled={!bulkContent.trim()}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Parse Content
            </Button>
          </div>
          <Textarea
            value={bulkContent}
            onChange={(e) => setBulkContent(e.target.value)}
            placeholder="Paste your complete DSA content here using the ## heading format."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      </Card>

      {/* Individual Fields */}
      <div className="grid gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Binary Search Algorithm"
          />
        </div>

        {/* Intuition */}
        <div className="space-y-2">
          <Label htmlFor="intuition">Key Intuition</Label>
          <Tabs value={previewMode ? "preview" : "write"} onValueChange={(value) => setPreviewMode(value === "preview")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <Textarea
                id="intuition"
                value={formData.intuition}
                onChange={(e) => setFormData(prev => ({ ...prev, intuition: e.target.value }))}
                placeholder="Explain the core concept in simple terms... (Markdown supported)"
                className="min-h-[100px]"
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="min-h-[100px] p-3 border rounded-md prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.intuition || "Nothing to preview yet..."}</ReactMarkdown>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Approach */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Approach & Steps</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addApproachStep}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Step
            </Button>
          </div>
          <div className="space-y-2">
            {formData.approach?.map((step, index) => (
              <Textarea
                key={index}
                value={step}
                onChange={(e) => handleApproachChange(index, e.target.value)}
                placeholder={`Step ${index + 1}... (Markdown supported)`}
                className="min-h-[60px]"
              />
            ))}
          </div>
        </div>

        {/* Images */}
        <Card className="content-section">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Visual Examples (Images)</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Add Images
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {formData.images && formData.images.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-border-subtle">
                    <img 
                      src={image} 
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Dry Run */}
        <div className="space-y-2">
          <Label htmlFor="dryRun">Dry Run Example</Label>
          <Textarea
            id="dryRun"
            value={formData.dryRun}
            onChange={(e) => setFormData(prev => ({ ...prev, dryRun: e.target.value }))}
            placeholder="Walk through a step-by-step example... (Markdown supported)"
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        {/* Complexity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeComplexity">Time Complexity</Label>
            <Input
              id="timeComplexity"
              value={formData.timeComplexity}
              onChange={(e) => setFormData(prev => ({ ...prev, timeComplexity: e.target.value }))}
              placeholder="e.g., O(log n)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spaceComplexity">Space Complexity</Label>
            <Input
              id="spaceComplexity"
              value={formData.spaceComplexity}
              onChange={(e) => setFormData(prev => ({ ...prev, spaceComplexity: e.target.value }))}
              placeholder="e.g., O(1)"
            />
          </div>
        </div>

        {/* Quick Revision */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quick Revision Points</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRevisionPoint}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Point
            </Button>
          </div>
          <div className="space-y-2">
            {formData.quickRevision?.map((point, index) => (
              <Textarea
                key={index}
                value={point}
                onChange={(e) => handleRevisionChange(index, e.target.value)}
                placeholder={`Revision point ${index + 1}... (Markdown supported)`}
                className="min-h-[50px]"
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addTag}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Code Implementation</Label>
          <Textarea
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="// C++ implementation..."
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        {/* Conditionally render the Save Button */}
        {!hideSaveButton && (
           <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            size="lg"
           >
            {initialData ? "Update Entry" : "Save Entry"}
           </Button>
        )}
      </div>
    </div>
  );
});
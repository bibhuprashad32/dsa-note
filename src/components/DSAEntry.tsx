import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, BookOpen, Code, Lightbulb, Target } from "lucide-react"
import ReactMarkdown from 'react-markdown'

interface DSAEntryProps {
  entry: {
    id: string
    title: string
    intuition: string
    approach: string[]
    dryRun: string
    timeComplexity: string
    spaceComplexity: string
    quickRevision: string[]
    code: string
    tags?: string[]
    images?: string[]
  }
  pageNumber?: number
}

export function DSAEntry({ entry, pageNumber }: DSAEntryProps) {
  const formatCode = (code: string) => {
    return code
      .replace(/(#include|using|namespace|int|string|vector|class|struct|public|private|void|return|if|else|for|while|do|switch|case|break|continue)/g, 
        '<span class="text-syntax-keyword font-medium">$1</span>')
      .replace(/"([^"]*)"/g, '<span class="text-syntax-string">\"$1\"</span>')
      .replace(/(\/\/.*$)/gm, '<span class="text-syntax-comment italic">$1</span>')
  }

  return (
    <div className="reader-page p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-heading mb-1">
            {entry.title}
          </h1>
          {entry.tags && (
            <div className="flex gap-1">
              {entry.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {pageNumber && (
          <div className="text-sm text-muted-text no-print">
            Page {pageNumber}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        
        {/* Intuition */}
        <div className="intuition-box">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-intuition-border" />
            <h2 className="text-lg font-heading font-medium text-heading">Key Intuition</h2>
          </div>
          <div className="text-body-text leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{entry.intuition}</ReactMarkdown>
          </div>
        </div>

        {/* Approach */}
        <div className="approach-box">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-approach-border" />
            <h2 className="text-lg font-heading font-medium text-heading">Approach & Steps</h2>
          </div>
          <ul className="space-y-1">
            {entry.approach.map((step, index) => (
              <li key={index} className="flex items-start gap-2 text-body-text">
                <span className="font-mono text-xs bg-approach-border text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <div className="leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{step}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Two Column Layout for Examples and Complexity */}
        <div className="two-column-layout">
          {/* Dry Run Example */}
          <div className="example-box">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-example-border" />
              <h2 className="text-lg font-heading font-medium text-heading">Dry Run Example</h2>
            </div>
            <div className="text-body-text leading-relaxed prose prose-sm max-w-none">
              <div className="font-mono text-xs whitespace-pre-wrap">
                <ReactMarkdown>{entry.dryRun}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Complexity Analysis */}
          <div className="complexity-box">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-complexity-border" />
              <h2 className="text-lg font-heading font-medium text-heading">Complexity</h2>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-complexity-border" />
                <span className="font-mono font-medium text-sm">Time: {entry.timeComplexity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-complexity-border" />
                <span className="font-mono font-medium text-sm">Space: {entry.spaceComplexity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Revision */}
        <div className="revision-box">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-revision-border" />
            <h2 className="text-lg font-heading font-medium text-heading">Quick Revision</h2>
          </div>
          <ul className="space-y-0.5">
            {entry.quickRevision.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-body-text">
                <span className="text-revision-border mt-1">•</span>
                <div className="leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{point}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Images */}
        {entry.images && entry.images.length > 0 && (
          <div className="images-box">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-example-border" />
              <h2 className="text-lg font-heading font-medium text-heading">Visual Examples</h2>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {entry.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-border-subtle">
                  <img 
                    src={image} 
                    alt={`Visual example ${index + 1}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code */}
        <div className="code-box">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-code-border" />
            <h2 className="text-lg font-heading font-medium text-heading">Implementation</h2>
          </div>
          <pre 
            className="text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: formatCode(entry.code) }}
          />
        </div>
      </div>
    </div>
  )
}
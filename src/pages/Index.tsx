import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DSAEntry } from "@/components/DSAEntry";
import { ContentForm, ContentFormHandle } from "@/components/ContentForm";
import { PrintOrganizer } from "@/components/PrintOrganizer";
import { toast } from "@/components/ui/sonner";
import {
  BookOpen,
  Plus,
  List,
  FileText,
  Printer,
  Download,
  Upload,
  Edit,
  Save
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'http://localhost:3001/api/entries';

interface DSAEntryData {
  _id?: string; // MongoDB's unique ID
  id: string;   // Your client-side UUID
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

const Index = () => {
  const [entries, setEntries] = useState<DSAEntryData[]>([]);
  const [currentView, setCurrentView] = useState<"list" | "reader" | "create" | "edit" | "print">("list");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<DSAEntryData | null>(null);
  const [isEditingInReader, setIsEditingInReader] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<ContentFormHandle>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch entries');
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error("Error fetching entries:", error);
        toast.error("Could not fetch entries from the database.");
      }
    };
    fetchEntries();
  }, []);

  const handleSaveEntry = async (entryData: DSAEntryData) => {
    const isUpdating = !!(editingEntry || isEditingInReader);

    // If we're updating, we need the MongoDB _id
    const entryToUpdate = isUpdating ? entries.find(e => e.id === entryData.id) : null;
    const url = isUpdating ? `${API_BASE_URL}/${entryToUpdate?._id}` : API_BASE_URL;
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) throw new Error(`Failed to ${isUpdating ? 'update' : 'save'} entry`);
      const savedEntry = await response.json();

      if (isUpdating) {
        setEntries(prev => prev.map(e => e._id === savedEntry._id ? savedEntry : e));
      } else {
        setEntries(prev => [...prev, savedEntry]);
      }

      toast.success(`Entry "${savedEntry.title}" has been ${isUpdating ? 'updated' : 'saved'}.`);
      
      if (isEditingInReader) {
        setSelectedEntryId(savedEntry._id!);
        setIsEditingInReader(false);
      } else {
        setCurrentView("list");
      }
      setEditingEntry(null);

    } catch (error) {
      console.error(`Error saving/updating entry:`, error);
      toast.error(`Could not ${isUpdating ? 'update' : 'save'} the entry.`);
    }
  };

  const handleReaderEditToggle = () => {
    if (isEditingInReader) {
      formRef.current?.submit();
    } else {
      setIsEditingInReader(true);
    }
  };
  
  const handleEditEntry = (entry: DSAEntryData) => {
    setEditingEntry(entry);
    setCurrentView("edit");
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa-notebook-backup.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  const handleImportClick = () => importFileRef.current?.click();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedEntries = JSON.parse(text) as DSAEntryData[];
        
        // This is a simple import; for robustness, you might add more validation
        for (const entry of importedEntries) {
          // This will add or update entries based on whether they are already in the DB
          await handleSaveEntry(entry);
        }
        toast.success(`Import complete!`);
      } catch (error) {
        toast.error("Import failed. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-semibold text-heading">DSA Notebook</h1>
          <p className="text-muted-text mt-2">Your structured collection of algorithms and data structures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setCurrentView("create")} className="flex items-center gap-2"><Plus className="h-4 w-4" />New Entry</Button>
          <ThemeToggle />
        </div>
      </div>
      <Card className="content-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><span className="font-medium text-heading">{entries.length} Entries</span></div>
          <div className="flex items-center gap-2">
            <input type="file" ref={importFileRef} onChange={handleImport} accept="application/json" className="hidden" />
            <Button variant="outline" onClick={handleImportClick} className="flex items-center gap-2"><Upload className="h-4 w-4" />Import</Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2"><Download className="h-4 w-4" />Export</Button>
            <Button variant="outline" onClick={() => setCurrentView("print")} className="flex items-center gap-2"><Printer className="h-4 w-4" />Organize & Print</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-4">
        {entries.map((entry) => (
          <Card key={entry._id || entry.id} className="content-section hover:shadow-content transition-shadow cursor-pointer">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-heading font-medium text-heading">{entry.title}</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedEntryId(entry._id!); setCurrentView("reader"); }}><BookOpen className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-body-text line-clamp-2">{entry.intuition}</p>
              <div className="flex items-center justify-between text-sm text-muted-text">
                <div className="flex items-center gap-4"><span>Time: {entry.timeComplexity}</span><span>Space: {entry.spaceComplexity}</span></div>
                {entry.tags && (<div className="flex gap-1">{entry.tags.slice(0, 2).map((tag, index) => <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">{tag}</span>)}</div>)}
              </div>
            </div>
          </Card>
        ))}
        {entries.length === 0 && (<Card className="content-section text-center py-12"><div className="space-y-4"><FileText className="h-12 w-12 text-muted-text mx-auto" /><h3 className="text-xl font-heading font-medium text-heading">No entries yet</h3><p className="text-muted-text">Create your first DSA entry to get started</p><Button onClick={() => setCurrentView("create")} className="flex items-center gap-2"><Plus className="h-4 w-4" />Create First Entry</Button></div></Card>)}
      </div>
    </div>
  );

  const renderReaderView = () => {
    const currentEntry = entries.find(e => e._id === selectedEntryId);
    const currentIndex = entries.findIndex(e => e._id === selectedEntryId);
    if (!currentEntry) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
          <Button variant="outline" onClick={() => { setCurrentView("list"); setIsEditingInReader(false); }} className="flex items-center gap-2"><List className="h-4 w-4" />Back to List</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReaderEditToggle} className="flex items-center gap-2">{isEditingInReader ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}{isEditingInReader ? "Save Changes" : "Edit"}</Button>
            <Button variant="outline" disabled={currentIndex === 0} onClick={() => { const prev = entries[currentIndex - 1]; if (prev) setSelectedEntryId(prev._id!); }}>Previous</Button>
            <span className="text-sm text-muted-text px-3">{currentIndex + 1} of {entries.length}</span>
            <Button variant="outline" disabled={currentIndex === entries.length - 1} onClick={() => { const next = entries[currentIndex + 1]; if (next) setSelectedEntryId(next._id!); }}>Next</Button>
            <ThemeToggle />
          </div>
        </div>
        {isEditingInReader ? (<ContentForm ref={formRef} onSave={handleSaveEntry} initialData={currentEntry} hideSaveButton={true} />) : (<DSAEntry entry={currentEntry} pageNumber={currentIndex + 1} />)}
      </div>
    );
  };
  
  const renderCreateView = () => (<div className="space-y-6"><div className="flex justify-between items-center"><h1 className="text-3xl font-heading font-semibold text-heading">Create New Entry</h1><div className="flex items-center gap-2"><Button variant="outline" onClick={() => setCurrentView("list")}>Cancel</Button><ThemeToggle /></div></div><ContentForm onSave={handleSaveEntry} /></div>);
  const renderEditView = () => (<div className="space-y-6"><div className="flex justify-between items-center"><h1 className="text-xl font-heading font-semibold text-heading">Edit Entry</h1><div className="flex items-center gap-2"><Button variant="outline" onClick={() => { setCurrentView("list"); setEditingEntry(null); }}>Cancel</Button><ThemeToggle /></div></div>{editingEntry && <ContentForm onSave={handleSaveEntry} initialData={editingEntry} />}</div>);
  const renderPrintView = () => (<PrintOrganizer entries={entries} onBack={() => setCurrentView("list")} />);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {currentView === "list" && renderListView()}
        {currentView === "reader" && renderReaderView()}
        {currentView === "create" && renderCreateView()}
        {currentView === "edit" && renderEditView()}
        {currentView === "print" && renderPrintView()}
      </div>
    </div>
  );
};

export default Index;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DSAEntry } from "@/components/DSAEntry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Printer, Eye, List, ChevronsDown, ChevronsUp, Folder, Plus, FolderPlus, Send, Save, RotateCcw } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/sonner";

// Interfaces
interface DSAEntryData {
  _id?: string;
  id: string;
  title: string;
  parentId: string;
  printOrder: number;
  [key: string]: any;
}

interface Group {
  id: string;
  name: string;
  printOrder: number;
}

interface PrintOrganizerProps {
  entries: DSAEntryData[];
  onBack: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

// --- Components ---
const SortableEntry = ({ entry, isSelected, onSelectionChange }: { entry: DSAEntryData, isSelected: boolean, onSelectionChange: (id: string, selected: boolean) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id, data: { type: 'entry', parentId: entry.parentId } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center gap-2 bg-background p-2 rounded-md border">
      <div {...listeners} className="cursor-grab p-2"><GripVertical className="h-5 w-5 text-muted-text" /></div>
      <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelectionChange(entry.id, !!checked)} />
      <div className="flex-1 text-left"><h4 className="font-medium text-heading">{entry.title}</h4></div>
    </div>
  );
};

const SortableGroup = ({ group, entries, onSelectionChange, selectedEntries }: { group: Group, entries: DSAEntryData[], onSelectionChange: (id: string, selected: boolean) => void, selectedEntries: string[] }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, data: { type: 'group' } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <AccordionItem value={group.id} className="mb-4 border rounded-lg bg-card shadow-soft">
        <AccordionTrigger className="p-4 hover:no-underline">
          <div className="flex items-center gap-3 w-full">
            {group.id !== 'unorganized' && <div {...listeners} className="cursor-grab p-2"><GripVertical className="h-5 w-5 text-muted-text" /></div>}
            <Folder className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-heading font-medium text-heading">{group.name}</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 pt-0">
          <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {entries.map(entry => <SortableEntry key={entry.id} entry={entry} isSelected={selectedEntries.includes(entry.id)} onSelectionChange={onSelectionChange} />)}
              {entries.length === 0 && <p className="text-muted-text text-sm p-2">Drag entries to this folder.</p>}
            </div>
          </SortableContext>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
};

// --- Main Component ---
export function PrintOrganizer({ entries, onBack }: PrintOrganizerProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [entryState, setEntryState] = useState(entries);
  const [newGroupName, setNewGroupName] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [moveToGroupId, setMoveToGroupId] = useState<string>('');

  const sensors = useSensors(useSensor(PointerSensor));

  const fetchData = async () => {
    try {
        const [groupsRes, entriesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/groups`),
            fetch(`${API_BASE_URL}/entries`),
        ]);
        const groupsData = await groupsRes.json();
        const entriesData = await entriesRes.json();
        setGroups([{ id: 'unorganized', name: 'Unorganized', printOrder: -1 }, ...groupsData]);
        setEntryState(entriesData);
        setOpenGroups(['unorganized', ...groupsData.map((g: Group) => g.id)]);
    } catch (error) {
        toast.error("Failed to load organization data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addNewGroup = async () => {
    if (newGroupName.trim()) {
      const newGroup = { id: uuidv4(), name: newGroupName.trim(), printOrder: groups.length };
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if(response.ok) {
        setGroups(g => [...g, newGroup]);
        setNewGroupName("");
        setOpenGroups(og => [...og, newGroup.id]);
        toast.success(`Folder "${newGroup.name}" created.`);
      } else {
        toast.error("Failed to create folder.");
      }
    }
  };
  
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedEntries(prev => selected ? [...prev, id] : prev.filter(entryId => entryId !== id));
  };

  const handleMoveSelected = () => {
    if (!moveToGroupId || selectedEntries.length === 0) {
      toast.warning("Please select a folder and at least one entry.");
      return;
    }
    setEntryState(prev => prev.map(e => selectedEntries.includes(e.id) ? { ...e, parentId: moveToGroupId } : e));
    setSelectedEntries([]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = groups.find(g => g.id === active.id) || entryState.find(e => e.id === active.id);
    setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIsGroup = active.data.current?.type === 'group';
    const overIsGroup = over.data.current?.type === 'group';

    if (activeId === overId) return;

    // Reordering groups
    if (activeIsGroup && overIsGroup) {
      setGroups(items => arrayMove(items, items.findIndex(i => i.id === activeId), items.findIndex(i => i.id === overId)));
      return;
    }

    // Reordering entries
    const activeParent = active.data.current?.parentId;
    const overParent = over.data.current?.parentId ?? (overIsGroup ? overId : null);

    if (!activeParent || !overParent) return;

    if (activeParent === overParent) { // Reorder within same group
      setEntryState(items => {
        const itemsInGroup = items.filter(i => i.parentId === activeParent);
        const otherItems = items.filter(i => i.parentId !== activeParent);
        const oldIndex = itemsInGroup.findIndex(i => i.id === activeId);
        const newIndex = itemsInGroup.findIndex(i => i.id === overId);
        return [...otherItems, ...arrayMove(itemsInGroup, oldIndex, newIndex)];
      });
    } else { // Move to a different group
        setEntryState(items => items.map(item => item.id === activeId ? {...item, parentId: overParent} : item));
    }
  };
  
  const handleSaveOrder = async () => {
    const entriesToSave = entryState.map((entry, index) => ({
      id: entry.id,
      printOrder: index,
      parentId: entry.parentId,
    }));
    const groupsToSave = groups.filter(g => g.id !== 'unorganized').map((group, index) => ({
      id: group.id,
      printOrder: index,
    }));

    const response = await fetch(`${API_BASE_URL}/save-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: entriesToSave, groups: groupsToSave }),
    });

    if(response.ok) {
        toast.success("Organization saved successfully!");
    } else {
        toast.error("Failed to save organization.");
    }
  };
  
  const handleResetOrder = async () => {
    const response = await fetch(`${API_BASE_URL}/reset-order`, { method: 'POST' });
    if(response.ok) {
        toast.success("Organization has been reset.");
        fetchData(); // Reload data from server
    } else {
        toast.error("Failed to reset organization.");
    }
  };

  const toggleGroup = (id: string) => setOpenGroups(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const handlePrintAll = () => window.print();
  const expandAll = () => setOpenGroups(groups.map(g => g.id));
  const collapseAll = () => setOpenGroups([]);

  const flattenedEntriesForPrint = groups.flatMap(group => entryState.filter(e => e.parentId === group.id).sort((a,b) => a.printOrder - b.printOrder));

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print"><Button variant="outline" onClick={() => setPreviewMode(false)} className="flex items-center gap-2"><List className="h-4 w-4" />Back to Organizer</Button><Button onClick={handlePrintAll} className="flex items-center gap-2"><Printer className="h-4 w-4" />Print All ({flattenedEntriesForPrint.length} pages)</Button></div>
        <div className="print-preview">{flattenedEntriesForPrint.map((entry, index) => entry && <DSAEntry key={entry.id} entry={entry} pageNumber={index + 1} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-heading font-semibold text-heading">Print Organizer</h1><p className="text-muted-text mt-2">Create folders and drag entries to build your custom print order.</p></div>
        <div className="flex items-center gap-2">
            <Button variant="destructive" onClick={handleResetOrder} className="flex items-center gap-2"><RotateCcw className="h-4 w-4" />Reset to Default</Button>
            <Button onClick={handleSaveOrder} className="flex items-center gap-2"><Save className="h-4 w-4" />Save Order</Button>
            <Button variant="outline" onClick={() => setPreviewMode(true)} className="flex items-center gap-2"><Eye className="h-4 w-4" />Preview</Button>
            <Button onClick={handlePrintAll} className="flex items-center gap-2"><Printer className="h-4 w-4" />Print All</Button>
        </div>
      </div>
      
      <Card className="content-section p-4 space-y-4">
        <div className="flex gap-2"><Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="New folder name..." /><Button onClick={addNewGroup} className="flex items-center gap-2"><FolderPlus className="h-4 w-4" />Add Folder</Button></div>
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Select onValueChange={setMoveToGroupId}>
                    <SelectTrigger className="w-[280px]"><SelectValue placeholder="Move selected entries to..." /></SelectTrigger>
                    <SelectContent>
                        {groups.filter(g => g.id !== 'unorganized').map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button onClick={handleMoveSelected} disabled={selectedEntries.length === 0} className="flex items-center gap-2"><Send className="h-4 w-4" />Move ({selectedEntries.length})</Button>
            </div>
            <div className="flex items-center gap-2"><Button variant="ghost" size="sm" onClick={expandAll} className="flex items-center gap-2"><ChevronsDown className="h-4 w-4" />Expand All</Button><Button variant="ghost" size="sm" onClick={collapseAll} className="flex items-center gap-2"><ChevronsUp className="h-4 w-4" />Collapse All</Button></div>
        </div>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Accordion type="multiple" value={openGroups} onValueChange={setOpenGroups}>
          <SortableContext items={groups.filter(g => g.id !== 'unorganized').map(g => g.id)} strategy={verticalListSortingStrategy}>
            {groups.filter(g => g.id !== 'unorganized').map(group => (
                <SortableGroup key={group.id} group={group} entries={entryState.filter(e => e.parentId === group.id)} onSelectionChange={handleSelectionChange} selectedEntries={selectedEntries} />
            ))}
          </SortableContext>
          
          {/* Unorganized group is not sortable itself, but its items are */}
          <SortableGroup group={{id: 'unorganized', name: 'Unorganized', printOrder: -1}} entries={entryState.filter(e => e.parentId === 'unorganized')} onSelectionChange={handleSelectionChange} selectedEntries={selectedEntries} />
        </Accordion>
        <DragOverlay>{activeItem && <div className="flex items-center gap-2 bg-background p-2 rounded-md border shadow-lg"><GripVertical className="h-5 w-5 text-muted-text" /><h4>{activeItem.title || activeItem.name}</h4></div>}</DragOverlay>
      </DndContext>
    </div>
  );
}
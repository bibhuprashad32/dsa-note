const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ObjectId } = mongoose.Types;

// --- Basic Setup ---
const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:8080' })); 
app.use(express.json({ limit: '10mb' }));

// --- Database Connection ---
const MONGODB_URI = 'mongodb://localhost:27017/dsa-notebook';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schemas & Models ---
const DSAEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  intuition: String,
  approach: [String],
  dryRun: String,
  timeComplexity: String,
  spaceComplexity: String,
  quickRevision: [String],
  code: String,
  tags: [String],
  images: [String],
  // New fields for organization
  printOrder: { type: Number, default: 0 },
  parentId: { type: String, default: 'unorganized' },
});

const GroupSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: String,
    printOrder: { type: Number, default: 0 },
});

const DSAEntry = mongoose.model('DSAEntry', DSAEntrySchema);
const Group = mongoose.model('Group', GroupSchema);

// --- API Endpoints ---

// Entries
app.get('/api/entries', async (req, res) => res.json(await DSAEntry.find().sort({ printOrder: 1 })));
app.post('/api/entries', async (req, res) => res.status(201).json(await new DSAEntry(req.body).save()));
app.put('/api/entries/:id', async (req, res) => res.json(await DSAEntry.findByIdAndUpdate(req.params.id, req.body, { new: true })));

// Groups
app.get('/api/groups', async (req, res) => res.json(await Group.find().sort({ printOrder: 1 })));
app.post('/api/groups', async (req, res) => res.status(201).json(await new Group(req.body).save()));

// Bulk Update for Organization
app.post('/api/save-order', async (req, res) => {
    const { entries, groups } = req.body;
    try {
        // Use bulk operations for efficiency
        const entryOperations = entries.map(e => ({
            updateOne: {
                filter: { id: e.id },
                update: { $set: { printOrder: e.printOrder, parentId: e.parentId } }
            }
        }));
        const groupOperations = groups.map(g => ({
            updateOne: {
                filter: { id: g.id },
                update: { $set: { printOrder: g.printOrder } }
            }
        }));

        if (entryOperations.length > 0) await DSAEntry.bulkWrite(entryOperations);
        if (groupOperations.length > 0) await Group.bulkWrite(groupOperations);
        
        res.status(200).json({ message: 'Order saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save order', error: error.message });
    }
});

// Reset Order
app.post('/api/reset-order', async (req, res) => {
    try {
        // Reset all entries to default
        await DSAEntry.updateMany({}, { $set: { printOrder: 0, parentId: 'unorganized' } });
        // Delete all custom groups
        await Group.deleteMany({});
        res.status(200).json({ message: 'Order has been reset.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reset order', error: error.message });
    }
});


app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
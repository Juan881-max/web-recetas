import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_PATH = path.join(__dirname, 'data', 'recipes.json');

app.use(cors());
app.use(express.json());

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read recipes' });
  }
});

// Save all recipes (bulk update)
app.post('/api/recipes', async (req, res) => {
  try {
    const recipes = req.body;
    await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

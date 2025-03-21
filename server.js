import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add a function to read JSON files
const readJsonFile = (filePath) => {
  try {
    const absolutePath = path.join(__dirname, '..', 'src', 'data', filePath);
    const data = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

// Helper function to save data to file
const saveDataToFile = (filePath, data) => {
  try {
    const absolutePath = path.join(__dirname, '..', 'src', 'data', filePath);
    fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving to file:', error);
    throw error;
  }
};

// Root endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Services endpoints
app.get('/api/services', (req, res) => {
  try {
    const servicesData = readJsonFile('services.json');
    if (!servicesData || !servicesData.services) {
      return res.json({ services: [] });
    }
    res.json({ services: servicesData.services });
  } catch (error) {
    console.error('Error reading services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', (req, res) => {
  try {
    const servicesData = readJsonFile('services.json') || { services: [] };
    const newService = { id: req.body.id || Date.now().toString(), ...req.body };
    servicesData.services.push(newService);
    saveDataToFile('services.json', servicesData);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const servicesData = readJsonFile('services.json');
  servicesData.services = servicesData.services.filter(service => service.id !== id);
  saveDataToFile('services.json', servicesData);
  res.status(204).send();
});

// Team endpoints
app.get('/api/team', (req, res) => {
  const teamData = readJsonFile('team.json');
  res.json({ team: teamData.team || [] });
});

app.post('/api/team', (req, res) => {
  try {
    const teamData = readJsonFile('team.json');
    const newMember = { id: Date.now().toString(), ...req.body };
    teamData.team.push(newMember);
    saveDataToFile('team.json', teamData);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  const { id } = req.params;
  const teamData = readJsonFile('team.json');
  teamData.team = teamData.team.filter(member => member.id !== id);
  saveDataToFile('team.json', teamData);
  res.status(204).send();
});

// Work endpoints
app.get('/api/work', (req, res) => {
  const workData = readJsonFile('work.json');
  res.json({ works: workData.works || [] });
});

app.post('/api/work', (req, res) => {
  try {
    const workData = readJsonFile('work.json');
    const newWork = { id: req.body.id || Date.now().toString(), ...req.body };
    workData.works.push(newWork);
    saveDataToFile('work.json', workData);
    res.status(201).json(newWork);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save work item' });
  }
});

app.delete('/api/work/:id', (req, res) => {
  const { id } = req.params;
  const workData = readJsonFile('work.json');
  workData.works = workData.works.filter(item => item.id !== id);
  saveDataToFile('work.json', workData);
  res.status(204).send();
});

// Serve static files from the frontend build folder
const frontendPath = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendPath));

// Serve the frontend app for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

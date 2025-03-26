import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);

const app = express();
app.use(cors({
  origin: 'https://web-fawn-nine.vercel.app/'
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readJsonFile = (filePath) => {
  try {  
    const absolutePath = path.join(__dirname, '..', filePath);
    console.log(`Reading JSON file from: ${absolutePath}`); 
    
    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      return null;
    }
    
    const data = fs.readFileSync(absolutePath, 'utf8');
    console.log("Raw JSON Data:", data); // Log file content
    
    const parsedData = JSON.parse(data);

    if (!parsedData || typeof parsedData !== 'object') {
      console.error(`Invalid JSON structure in file: ${absolutePath}`);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Error reading file:', error.message);
    return null;
  }
};




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
    const servicesData = readJsonFile('src/data/services.json');
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
    const servicesData = readJsonFile('src/data/services.json') || { services: [] };
    if (!servicesData.services) {
      servicesData.services = [];
    }
    
    const newService = {
      id: req.body.id || Date.now().toString(),
      title: req.body.title || '',
      shortDescription: req.body.shortDescription || '',
      description: req.body.description || '',
      icon: req.body.icon || '/placeholder.svg',
      image: req.body.image || '/placeholder.svg',
      features: req.body.features || [],
      portfolioItems: req.body.portfolioItems || []
    };
    
    servicesData.services.push(newService);
    saveDataToFile('src/data/services.json', servicesData);
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const servicesData = readJsonFile('src/data/services.json');
  servicesData.services = servicesData.services.filter(service => service.id !== id);
  saveDataToFile('src/data/services.json', servicesData);
  res.status(204).send();
});

// Team endpoints
app.get('/api/team', (req, res) => {
  const teamData = readJsonFile('src/data/team.json');
  res.json({ team: teamData.team || [] });
});

app.post('/api/team', (req, res) => {
  try {
    const teamData = readJsonFile('src/data/team.json');
    const newMember = { id: Date.now().toString(), ...req.body };
    teamData.team.push(newMember);
    saveDataToFile('src/data/team.json', teamData);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  const { id } = req.params;
  const teamData = readJsonFile('src/data/team.json');
  teamData.team = teamData.team.filter(member => member.id !== id);
  saveDataToFile('src/data/team.json', teamData);
  res.status(204).send();
});

// Work endpoints
app.get('/api/work', (req, res) => {
  const workData = readJsonFile('src/data/work.json');
  res.json({ works: workData.works || [] });
});

app.post('/api/work', (req, res) => {
  try {
    const workData = readJsonFile('src/data/work.json');
    const newWork = { 
      ...req.body,
      id: req.body.id || Date.now().toString() // Ensure ID is never empty
    };
    if (!workData.works) workData.works = [];
    
    // Don't add if ID is empty
    if (!newWork.id) {
      return res.status(400).json({ error: 'Work item must have an ID' });
    }
    
    workData.works.push(newWork);
    saveDataToFile('src/data/work.json', workData);
    res.status(201).json(newWork);
  } catch (error) {
    console.error('Error in POST /api/work:', error);
    res.status(500).json({ error: 'Failed to save work item' });
  }
});

app.put('/api/work/:id', (req, res) => {
  try {
    const { id } = req.params;
    const workData = readJsonFile('src/data/work.json');
    if (!workData.works) workData.works = [];
    
    const index = workData.works.findIndex(item => item.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    workData.works[index] = { ...workData.works[index], ...req.body };
    
    // Save to file
    saveDataToFile('src/data/work.json', workData);
    
    res.json(workData.works[index]);
  } catch (error) {
    console.error('Error in PUT /api/work:', error);
    res.status(500).json({ error: 'Failed to update work item' });
  }
});

app.delete('/api/work/:id', (req, res) => {
  try {
    const { id } = req.params;
    // Don't process if ID is empty
    if (!id) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    
    const workData = readJsonFile('src/data/work.json');
    if (!workData.works) workData.works = [];
    
    workData.works = workData.works.filter(item => item.id && item.id !== id);
    saveDataToFile('src/data/work.json', workData);
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /api/work:', error);
    res.status(500).json({ error: 'Failed to delete work item' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

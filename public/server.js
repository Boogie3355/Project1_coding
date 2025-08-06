const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/process-assessment', (req, res) => {
    const userResponses = req.body;
    // Mock response
    res.json({
        jobs: [
            {
                title: "Software Developer",
                description: "Design and develop software applications",
                matchScore: 95,
                applyLink: "#"
            }
        ],
        skills: [
            {
                name: "JavaScript",
                description: "Essential for web development"
            }
        ]
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
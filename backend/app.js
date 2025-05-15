const express = require('express');
const cors = require('cors');
const bodyAnalysisRoutes = require('./routes/bodyAnalysis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/body-analysis', bodyAnalysisRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
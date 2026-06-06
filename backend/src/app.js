const express = require('express');
const cors = require('cors');

const alumniRoutes = require('./routes/alumniRoutes');
const authRoutes = require('./routes/authRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const healthRoutes = require('./routes/healthRoutes');
const matchRoutes = require('./routes/matchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

function buildCorsOptions() {
	const configuredOrigins = process.env.CORS_ORIGIN
		? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
		: [];

	if (!configuredOrigins.length) {
		return { origin: true };
	}

	return {
		origin(origin, callback) {
			if (!origin || configuredOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error('Origin not allowed by CORS'));
		},
	};
}

app.use(cors(buildCorsOptions()));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Bonded API is running successfully'
  });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/connections', connectionRoutes);
app.use((req, res) => {
	res.status(404).json({
		error: 'Route not found',
	});
});
app.use(errorHandler);

module.exports = app;
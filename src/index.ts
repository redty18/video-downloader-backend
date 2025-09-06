import express from "express";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import cors from "cors";
import { downloadRouter } from "./routes/download";

// Environment configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR || "downloads";
const AUDIOS_DIR = process.env.AUDIOS_DIR || "audios";
const DATA_DIR = process.env.DATA_DIR || "data";

const app = express();

// Enable CORS for all routes
const corsOrigins = process.env.NODE_ENV === 'production' 
	? [process.env.FRONTEND_URL || 'http://localhost:3000']
	: ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
	origin: corsOrigins,
	credentials: true
}));

// Custom logging middleware
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const start = Date.now();
	const requestId = Math.random().toString(36).substring(7);
	
	// Add request ID to request object
	(req as any).requestId = requestId;
	
	// Log request
	console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} - Started`);
	
	// Override res.end to log response
	const originalEnd = res.end;
	res.end = function(chunk?: any, encoding?: any, cb?: any) {
		const duration = Date.now() - start;
		const status = res.statusCode;
		const statusEmoji = status < 300 ? '✅' : status < 400 ? '⚠️' : '❌';
		
		console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} - ${statusEmoji} ${status} (${duration}ms)`);
		
		return originalEnd.call(this, chunk, encoding, cb);
	};
	
	next();
};

// Enhanced Morgan logging with custom format
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(morganFormat, {
	stream: {
		write: (message: string) => {
			console.log(`[${new Date().toISOString()}] ${message.trim()}`);
		}
	}
}));

// Request logging middleware
app.use(requestLogger);

// Body parsing without file size limits
app.use(express.json());

// Ensure directories exist (using relative paths)
const downloadsDir = path.join(process.cwd(), DOWNLOADS_DIR);
const dataDir = path.join(process.cwd(), DATA_DIR);
const audiosDir = path.join(process.cwd(), AUDIOS_DIR);

[downloadsDir, dataDir, audiosDir].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`[${new Date().toISOString()}] 📁 Created directory: ${dir}`);
	}
});

// Static serve downloaded files
app.use("/downloads", express.static(downloadsDir));
app.use("/audios", express.static(audiosDir));

// Health check with system info
app.get("/health", (_req, res) => {
	try {
		// Check if directories are accessible
		const dirChecks = {
			downloads: fs.existsSync(downloadsDir) && fs.statSync(downloadsDir).isDirectory(),
			audios: fs.existsSync(audiosDir) && fs.statSync(audiosDir).isDirectory(),
			data: fs.existsSync(dataDir) && fs.statSync(dataDir).isDirectory()
		};
		
		// Check disk space (basic check)
		const diskSpace = {
			downloads: fs.existsSync(downloadsDir) ? fs.statSync(downloadsDir).size : 0,
			audios: fs.existsSync(audiosDir) ? fs.statSync(audiosDir).size : 0,
			data: fs.existsSync(dataDir) ? fs.statSync(dataDir).size : 0
		};
		
		const stats = {
			status: "ok",
			timestamp: new Date().toISOString(),
			environment: process.env.NODE_ENV || "development",
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			directories: {
				downloads: `./${DOWNLOADS_DIR}`,
				audios: `./${AUDIOS_DIR}`,
				data: `./${DATA_DIR}`
			},
			health: {
				directories: dirChecks,
				diskSpace: diskSpace
			}
		};
		
		res.json(stats);
	} catch (error) {
		console.error(`[${new Date().toISOString()}] ❌ Health check failed:`, error);
		res.status(500).json({
			status: "error",
			timestamp: new Date().toISOString(),
			error: "Health check failed",
			details: String(error)
		});
	}
});

// API routes
app.use("/api", downloadRouter);

// API documentation
app.get("/api", (_req, res) => {
	res.type("text/plain").send(
		`Vid Downloader API v1.0.0\n` +
		`Environment: ${process.env.NODE_ENV || "development"}\n` +
		`- GET /health - System status and health\n` +
		`- POST /api/download { url } - Download video and extract audio\n` +
		`- GET /downloads/<file> - Access downloaded videos\n` +
		`- GET /audios/<file> - Access extracted audio files\n` +
		`\nDocumentation: GET /health for system status`
	);
});

// Enhanced error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
	const requestId = (req as any).requestId || 'unknown';
	const timestamp = new Date().toISOString();
	
	// Log error with context
	console.error(`[${timestamp}] [${requestId}] ❌ Unhandled error:`, {
		error: err,
		request: {
			method: req.method,
			path: req.path,
			headers: req.headers,
			body: req.body
		},
		stack: err instanceof Error ? err.stack : undefined
	});
	
	// Determine error type and appropriate response
	let statusCode = 500;
	let errorMessage = "Internal server error";
	let errorDetails = String(err);
	
	if (err instanceof SyntaxError && 'body' in err) {
		statusCode = 400;
		errorMessage = "Invalid JSON in request body";
		errorDetails = "The request body contains malformed JSON";
	} else if (err instanceof Error) {
		if (err.message.includes('validation')) {
			statusCode = 400;
			errorMessage = "Validation error";
		} else if (err.message.includes('not found')) {
			statusCode = 404;
			errorMessage = "Resource not found";
		}
	}
	
	res.status(statusCode).json({ 
		error: errorMessage,
		message: errorDetails,
		timestamp,
		requestId,
		path: req.path,
		method: req.method
	});
});

// 404 handler
app.use((req, res) => {
	const requestId = (req as any).requestId || 'unknown';
	const timestamp = new Date().toISOString();
	
	console.log(`[${timestamp}] [${requestId}] ⚠️ 404 Not Found: ${req.method} ${req.path}`);
	
	res.status(404).json({ 
		error: "Not found", 
		message: "The requested endpoint does not exist",
		timestamp,
		requestId,
		path: req.path,
		method: req.method,
		availableEndpoints: [
			"GET /",
			"GET /health", 
			"POST /api/download",
			"GET /downloads/*",
			"GET /audios/*"
		]
	});
});

// Serve built frontend in production (after all API routes)
if (process.env.NODE_ENV === 'production') {
	const frontendBuildPath = path.join(__dirname, '../frontend/dist');
	console.log(`[${new Date().toISOString()}] 🔍 Checking frontend build path: ${frontendBuildPath}`);
	console.log(`[${new Date().toISOString()}] 📁 Frontend build exists: ${fs.existsSync(frontendBuildPath)}`);
	
	if (fs.existsSync(frontendBuildPath)) {
		console.log(`[${new Date().toISOString()}] 🎨 Serving frontend from: ${frontendBuildPath}`);
		app.use(express.static(frontendBuildPath));
		
		// Serve index.html for all non-API routes
		app.get('*', (req, res) => {
			console.log(`[${new Date().toISOString()}] 🌐 Catch-all route hit: ${req.path}`);
			if (!req.path.startsWith('/api') && !req.path.startsWith('/downloads') && !req.path.startsWith('/audios') && !req.path.startsWith('/health')) {
				console.log(`[${new Date().toISOString()}] 📄 Serving frontend for: ${req.path}`);
				res.sendFile(path.join(frontendBuildPath, 'index.html'));
			}
		});
	} else {
		console.log(`[${new Date().toISOString()}] ❌ Frontend build not found at: ${frontendBuildPath}`);
	}
}

app.listen(PORT, () => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] 🚀 Vid Downloader API started`);
	console.log(`[${timestamp}] 📍 Server: http://localhost:${PORT}`);
	console.log(`[${timestamp}] 🌍 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(`[${timestamp}] 📁 Downloads: ./${DOWNLOADS_DIR}`);
	console.log(`[${timestamp}] 🎵 Audios: ./${AUDIOS_DIR}`);
	console.log(`[${timestamp}] 💾 Data: ./${DATA_DIR}`);
	console.log(`[${timestamp}] 📊 Health Check: http://localhost:${PORT}/health`);
});

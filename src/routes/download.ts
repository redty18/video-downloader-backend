import express from "express";
import { z } from "zod";
import { downloadVideoAndExtractAudio } from "../services/ytDlpService";
import { saveRecord } from "../storage/jsonStore";

export const downloadRouter = express.Router();

const requestSchema = z.object({
	url: z.string().url("Please provide a valid URL"),
});

downloadRouter.post("/download", async (req, res) => {
	const requestId = (req as any).requestId || 'unknown';
	const startTime = Date.now();
	
	try {
		// Validate request body
		const parseResult = requestSchema.safeParse(req.body);
		if (!parseResult.success) {
			const timestamp = new Date().toISOString();
			console.log(`[${timestamp}] [${requestId}] ⚠️ Validation failed:`, parseResult.error.errors);
			
			return res.status(400).json({ 
				error: "Validation Error",
				message: "Invalid request format",
				details: parseResult.error.errors.map(err => ({
					field: err.path.join('.'),
					message: err.message
				})),
				timestamp,
				requestId,
				path: req.path
			});
		}
		
		const { url } = parseResult.data;
		console.log(`[${new Date().toISOString()}] [${requestId}] 🎬 Starting download for: ${url}`);
		
		// Download video and extract audio
		const result = await downloadVideoAndExtractAudio(url);
		console.log(`[${new Date().toISOString()}] [${requestId}] ✅ Download completed for: ${result.platform}`);
		
		// Save record
		const record = await saveRecord(result);
		console.log(`[${new Date().toISOString()}] [${requestId}] 💾 Record saved with ID: ${record.id}`);
		
		const duration = Date.now() - startTime;
		console.log(`[${new Date().toISOString()}] [${requestId}] 🎉 Download request completed in ${duration}ms`);
		
		return res.json({
			success: true,
			message: `Successfully downloaded ${result.platform} video and extracted audio`,
			data: record,
			metadata: {
				requestId,
				duration: `${duration}ms`,
				timestamp: new Date().toISOString(),
				platform: result.platform,
				fileSize: {
					video: result.videoPath ? 'Available' : 'Not available',
					audio: result.audioPath ? 'Available' : 'Not available'
				}
			}
		});
		
	} catch (error: any) {
		const timestamp = new Date().toISOString();
		const duration = Date.now() - startTime;
		
		// Categorize error for better user experience
		let statusCode = 500;
		let errorType = "DownloadError";
		let userMessage = "Failed to process download request";
		let technicalDetails = error.message || String(error);
		
		if (error.message?.includes("yt-dlp") || error.message?.includes("yt_dlp")) {
			errorType = "ExtractionError";
			userMessage = "Video extraction failed. The content may be private, unavailable, or the platform may be blocking access.";
			statusCode = 422; // Unprocessable Entity
		} else if (error.message?.includes("network") || error.message?.includes("connection") || error.message?.includes("timeout")) {
			errorType = "NetworkError";
			userMessage = "Network error occurred. Please check your connection and try again.";
			statusCode = 503; // Service Unavailable
		} else if (error.message?.includes("not found") || error.message?.includes("404")) {
			errorType = "NotFoundError";
			userMessage = "The requested content could not be found. Please verify the URL is correct and accessible.";
			statusCode = 404;
		} else if (error.message?.includes("permission") || error.message?.includes("access")) {
			errorType = "AccessError";
			userMessage = "Access denied. The content may be private or require authentication.";
			statusCode = 403;
		}
		
		// Log error with context
		console.error(`[${timestamp}] [${requestId}] ❌ ${errorType}:`, {
			error: error.message || String(error),
			stack: error.stack,
			url: req.body?.url,
			duration: `${duration}ms`,
			statusCode,
			userMessage
		});
		
		return res.status(statusCode).json({ 
			error: errorType,
			message: userMessage,
			details: technicalDetails,
			timestamp,
			requestId,
			path: req.path,
			duration: `${duration}ms`,
			suggestions: [
				"Verify the URL is correct and accessible",
				"Check if the content is public",
				"Ensure you have a stable internet connection",
				"Try again in a few minutes"
			]
		});
	}
});

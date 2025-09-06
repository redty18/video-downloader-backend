import { spawn } from "child_process";
import path from "path";
import { randomUUID } from "crypto";

export type DownloadResult = {
	id: string;
	platform: "instagram" | "tiktok" | "unknown";
	inputUrl: string;
	videoPath: string;
	filename: string;
	thumbnailUrl?: string;
	audioUrl?: string;
	audioPath?: string;
	title?: string;
	publishedAt?: string;
	createdAt: string;
};

function detectPlatform(url: string): DownloadResult["platform"] {
	if (url.includes("tiktok.com")) return "tiktok";
	if (url.includes("instagram.com")) return "instagram";
	return "unknown";
}

function getAugmentedEnv(): NodeJS.ProcessEnv {
	const env = { ...process.env };
	const appData = process.env.APPDATA;
	if (process.platform === "win32" && appData) {
		const scriptsDir = path.join(appData, "Python", "Python312", "Scripts");
		env.PATH = env.PATH ? `${scriptsDir};${env.PATH}` : scriptsDir;
	}
	return env;
}

function getPythonCommand(): string {
	if (process.platform === "win32") {
		// Use the Windows Store Python path
		return "C:\\Users\\aditp\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe";
	}
	return "python";
}

function getFFmpegLocation(): string {
	if (process.platform === "win32") {
		// Use the WinGet FFmpeg path
		return "C:\\Users\\aditp\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-full_build\\bin";
	}
	return "";
}

function run(command: string, args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }>
{
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			shell: false,
			env: getAugmentedEnv(),
		});
		
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (d) => (stdout += d.toString()));
		child.stderr.on("data", (d) => (stderr += d.toString()));
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) resolve({ stdout, stderr });
			else reject(new Error(`Command failed (${code}): ${command} ${args.join(" ")}\n${stderr}`));
		});
	});
}

async function runYtDlpRaw(args: string[], cwd?: string) {
	try {
		return await run("yt-dlp", args, cwd);
	} catch (_e) {
		const pythonCmd = getPythonCommand();
		return await run(pythonCmd, ["-m", "yt_dlp", ...args], cwd);
	}
}

const MODERN_UA = "Instagram 219.0.0.12.117 Android";

function buildCommonArgs(url: string): string[] {
	const base = ["--geo-bypass", "--user-agent", MODERN_UA];
	const ffmpegLocation = getFFmpegLocation();
	if (ffmpegLocation) {
		base.push("--ffmpeg-location", ffmpegLocation);
	}
	if (url.includes("tiktok.com")) {
		// Enhanced TikTok args for better content access without cookies
		base.push("--extractor-args", "tiktok:player_url=1,music_download=1,age_restricted=1,bypass_age_gate=1");
		base.push("--no-check-certificates"); // Sometimes helps with TikTok
		base.push("--ignore-errors"); // Continue on some errors

	}
	if (url.includes("instagram.com")) {
		base.push("--referer", "https://www.instagram.com/");
		base.push("--extractor-args", "instagram:api=0");
		base.push("--sleep-requests", "10");
		base.push("--sleep-interval", "10");
		base.push("--no-check-certificates");
		base.push("--ignore-errors");
		base.push("--extractor-retries", "5");
	}
	return base;
}

async function runYtDlpWithFallbacks(url: string, args: string[], cwd?: string) {
	const common = buildCommonArgs(url);
	
	// Simple approach - just use enhanced args without complex fallbacks
	return await runYtDlpRaw([...common, ...args], cwd);
}

// Clean Instagram URL and try alternative formats
function cleanInstagramUrl(url: string): string {
	if (url.includes("instagram.com")) {
		// Remove tracking parameters that might cause issues
		return url.split('?')[0];
	}
	return url;
}

// Try alternative Instagram URL formats
function getAlternativeInstagramUrls(url: string): string[] {
	if (!url.includes("instagram.com")) return [url];
	
	const cleanUrl = url.split('?')[0];
	const alternatives = [cleanUrl];
	
	// Try embed format
	if (cleanUrl.includes('/reel/')) {
		const reelId = cleanUrl.split('/reel/')[1].split('/')[0];
		alternatives.push(`https://www.instagram.com/reel/${reelId}/embed/`);
	}
	
	// Try p/ format
	if (cleanUrl.includes('/reel/')) {
		const reelId = cleanUrl.split('/reel/')[1].split('/')[0];
		alternatives.push(`https://www.instagram.com/p/${reelId}/`);
	}
	
	return alternatives;
}

export async function downloadVideoAndExtractAudio(url: string): Promise<DownloadResult> {
	const id = randomUUID();
	const platform = detectPlatform(url);
	const cleanUrl = cleanInstagramUrl(url);
	const downloadsDir = path.resolve(process.cwd(), "downloads");
	const audiosDir = path.resolve(process.cwd(), "audios");
	const outputTemplate = path.join(downloadsDir, `${id}-%(title)s.%(ext)s`);

	// Try multiple URL formats for Instagram
	const urlsToTry = getAlternativeInstagramUrls(url);
	let jsonStdout = "";
	let lastError: Error | null = null;

	for (const tryUrl of urlsToTry) {
		try {
			const result = await runYtDlpWithFallbacks(tryUrl, [
				"-J",
				"--no-playlist",
				tryUrl,
			]);
			jsonStdout = result.stdout;
			break; // Success, exit loop
		} catch (error) {
			lastError = error as Error;
			console.log(`[${new Date().toISOString()}] ⚠️ Failed with URL: ${tryUrl}, trying next...`);
			continue; // Try next URL
		}
	}

	if (!jsonStdout) {
		throw lastError || new Error("All Instagram URL formats failed");
	}

	let metadata: any;
	try { metadata = JSON.parse(jsonStdout); } catch { metadata = undefined; }

	const title: string | undefined = metadata?.title;
	const thumbnailUrl: string | undefined = Array.isArray(metadata?.thumbnails)
		? metadata.thumbnails[metadata.thumbnails.length - 1]?.url
		: metadata?.thumbnail;
	const publishedAt: string | undefined = metadata?.upload_date;

	let audioUrl: string | undefined;
	if (metadata?.formats) {
		const audioOnly = metadata.formats
			.filter((f: any) => f.acodec && f.vcodec === "none")
			.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));
		if (audioOnly.length > 0) audioUrl = audioOnly[0].url;
	}
	if (!audioUrl && platform === "tiktok") {
		const music = metadata?.music || metadata?.track || metadata?.song;
		const candidates = [
			music?.playUrl,
			music?.downloadUrl,
			music?.url,
			Array.isArray(music?.playUrl) ? music.playUrl[0] : undefined,
			Array.isArray(music?.downloadUrl) ? music.downloadUrl[0] : undefined,
			Array.isArray(music?.url) ? music.url[0] : undefined,
		];
		audioUrl = candidates.find((u) => typeof u === "string" && u.startsWith("http"));
	}

	// Use the URL that worked for metadata
	const workingUrl = urlsToTry.find(url => {
		try {
			runYtDlpWithFallbacks(url, ["-J", "--no-playlist", url]);
			return true;
		} catch {
			return false;
		}
	}) || cleanUrl;

	await runYtDlpWithFallbacks(workingUrl, [
		"-f", "bv*+ba/best",
		"--remux-video", "mp4",
		"-o", outputTemplate,
		workingUrl,
	]);

	const fsMod = await import("fs");
	const files = fsMod.readdirSync(downloadsDir).filter((f) => f.startsWith(id + "-"));
	if (files.length === 0) throw new Error("Downloaded file not found");
	const filename = files[0];
	const videoPath = path.join(downloadsDir, filename);

	// Extract audio to audios/
	const audioTemplate = path.join(audiosDir, `${id}-audio.%(ext)s`);
	await runYtDlpWithFallbacks(workingUrl, [
		"-x",
		"--audio-format", "mp3",
		"--audio-quality", "0",
		"-o", audioTemplate,
		workingUrl,
	]);
	const audioFile = fsMod.readdirSync(audiosDir).find((f) => f.startsWith(id + "-audio") && f.endsWith(".mp3"));
	const audioPath = audioFile ? path.join(audiosDir, audioFile) : undefined;

	return {
		id,
		platform,
		inputUrl: url,
		videoPath: path.relative(process.cwd(), videoPath),
		filename,
		thumbnailUrl,
		audioUrl,
		audioPath: audioPath ? path.relative(process.cwd(), audioPath) : undefined,
		title,
		publishedAt,
		createdAt: new Date().toISOString(),
	};
}

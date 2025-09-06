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

const MODERN_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

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
		base.push("--no-check-certificates");
		base.push("--ignore-errors");
		base.push("--extractor-args", "instagram:api=1");
		base.push("--sleep-requests", "2"); // Increased delay
		base.push("--sleep-interval", "2"); // Increased delay
		base.push("--http-headers", "X-Requested-With: XMLHttpRequest");
		base.push("--http-headers", "X-IG-App-ID: 936619743392459");
	}
	return base;
}

async function runYtDlpWithFallbacks(url: string, args: string[], cwd?: string) {
	const common = buildCommonArgs(url);
	
	// Simple approach - just use enhanced args without complex fallbacks
	return await runYtDlpRaw([...common, ...args], cwd);
}

export async function downloadVideoAndExtractAudio(url: string): Promise<DownloadResult> {
	const id = randomUUID();
	const platform = detectPlatform(url);
	const downloadsDir = path.resolve(process.cwd(), "downloads");
	const audiosDir = path.resolve(process.cwd(), "audios");
	const outputTemplate = path.join(downloadsDir, `${id}-%(title)s.%(ext)s`);

	const { stdout: jsonStdout } = await runYtDlpWithFallbacks(url, [
		"-J",
		"--no-playlist",
		url,
	]);

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

	await runYtDlpWithFallbacks(url, [
		"-f", "bv*+ba/best",
		"--remux-video", "mp4",
		"-o", outputTemplate,
		url,
	]);

	const fsMod = await import("fs");
	const files = fsMod.readdirSync(downloadsDir).filter((f) => f.startsWith(id + "-"));
	if (files.length === 0) throw new Error("Downloaded file not found");
	const filename = files[0];
	const videoPath = path.join(downloadsDir, filename);

	// Extract audio to audios/
	const audioTemplate = path.join(audiosDir, `${id}-audio.%(ext)s`);
	await runYtDlpWithFallbacks(url, [
		"-x",
		"--audio-format", "mp3",
		"--audio-quality", "0",
		"-o", audioTemplate,
		url,
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

import fs from "fs";
import path from "path";
import type { DownloadResult } from "../services/ytDlpService";

export type StoredRecord = DownloadResult & { storedAt: string };

const dataDir = path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "records.json");

function ensureDb() {
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
	if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ records: [] }, null, 2));
}

export async function saveRecord(record: DownloadResult): Promise<StoredRecord> {
	ensureDb();
	const raw = fs.readFileSync(dbPath, "utf-8");
	const json = JSON.parse(raw) as { records: StoredRecord[] };
	const stored: StoredRecord = { ...record, storedAt: new Date().toISOString() };
	json.records.unshift(stored);
	fs.writeFileSync(dbPath, JSON.stringify(json, null, 2));
	return stored;
}

export function listRecords(): StoredRecord[] {
	ensureDb();
	const raw = fs.readFileSync(dbPath, "utf-8");
	const json = JSON.parse(raw) as { records: StoredRecord[] };
	return json.records;
}

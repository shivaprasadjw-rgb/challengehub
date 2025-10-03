import fs from "fs";
import path from "path";
import type { Registration } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const REG_FILE = path.join(DATA_DIR, "registrations.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REG_FILE)) fs.writeFileSync(REG_FILE, "[]", "utf8");
}

export function readAllRegistrations(): Registration[] {
  ensureStore();
  const raw = fs.readFileSync(REG_FILE, "utf8");
  try {
    return JSON.parse(raw) as Registration[];
  } catch {
    return [];
  }
}

export function writeAllRegistrations(list: Registration[]) {
  ensureStore();
  fs.writeFileSync(REG_FILE, JSON.stringify(list, null, 2), "utf8");
}

export function appendRegistration(reg: Registration) {
  ensureStore();
  const list = readAllRegistrations();
  list.push(reg);
  fs.writeFileSync(REG_FILE, JSON.stringify(list, null, 2), "utf8");
}

export function updateRegistrationById(id: string, update: Partial<Registration>): Registration | null {
  const list = readAllRegistrations();
  let updated: Registration | null = null;
  const next = list.map(item => {
    if (item.id === id) {
      updated = { ...item, ...update } as Registration;
      return updated;
    }
    return item;
  });
  if (!updated) return null;
  writeAllRegistrations(next);
  return updated;
}

export function deleteRegistrationById(id: string): boolean {
  const list = readAllRegistrations();
  const next = list.filter(item => item.id !== id);
  const changed = next.length !== list.length;
  if (changed) writeAllRegistrations(next);
  return changed;
}

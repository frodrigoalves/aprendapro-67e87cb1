// Lightweight CSV/TSV parser (RFC-4180 subset). Auto-detects delimiter.
export function detectDelimiter(text: string): "," | ";" | "\t" {
  const head = text.split(/\r?\n/, 5).join("\n");
  const tabs = (head.match(/\t/g) || []).length;
  const semis = (head.match(/;/g) || []).length;
  const commas = (head.match(/,/g) || []).length;
  if (tabs > Math.max(semis, commas)) return "\t";
  if (semis > commas) return ";";
  return ",";
}

export function parseCsv(text: string, delim?: string): string[][] {
  const d = delim || detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === d) { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c && c.trim().length));
}

export function fromPasted(text: string): { headers: string[]; rows: string[][] } {
  const all = parseCsv(text);
  if (!all.length) return { headers: [], rows: [] };
  const [headers, ...rows] = all;
  return { headers: headers.map((h) => h.trim()), rows };
}

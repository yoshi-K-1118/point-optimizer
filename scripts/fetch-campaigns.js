#!/usr/bin/env node
/**
 * Google Sheets (公開CSV) からキャンペーンデータを取得して
 * src/data/campaigns.json に書き出すスクリプト。
 *
 * 環境変数:
 *   GOOGLE_SHEET_ID  - スプレッドシートのID (必須)
 *   GOOGLE_SHEET_GID - シートのGID (省略時: 0)
 *
 * スプレッドシートのカラム構成 (1行目はヘッダー):
 *   id | programId | title | description | multiplier | endDate | url
 */

import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GID = process.env.GOOGLE_SHEET_GID || '0';
const OUT_PATH = path.join(__dirname, '../src/data/campaigns.json');

if (!SHEET_ID) {
  console.error('Error: GOOGLE_SHEET_ID environment variable is NOT SET');
  process.exit(1);
}

console.log('GOOGLE_SHEET_ID:', SHEET_ID.slice(0, 6) + '...' + SHEET_ID.slice(-4));
console.log('GOOGLE_SHEET_GID:', GID);

const csvUrl =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects (Google Sheets returns 307)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * RFC 4180 準拠の簡易CSVパーサー。
 * ダブルクォート内のカンマ・改行・エスケープ済み引用符を処理する。
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
        i++;
      } else if (ch === '\r' && text[i + 1] === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i += 2;
      } else if (ch === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  if (field || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rows;
}

async function main() {
  console.log(`Fetching: ${csvUrl}`);
  const csv = await fetchUrl(csvUrl);
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    console.error('Error: CSV has no data rows');
    process.exit(1);
  }

  const headers = rows[0].map((h) => h.toLowerCase());
  const idxOf = (name) => headers.indexOf(name);

  const campaigns = rows.slice(1)
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => ({
      id:          Number(row[idxOf('id')]) || 0,
      programId:   row[idxOf('programid')] || '',
      title:       row[idxOf('title')] || '',
      description: row[idxOf('description')] || '',
      multiplier:  Number(row[idxOf('multiplier')]) || 1,
      endDate:     row[idxOf('enddate')] || '',
      url:         row[idxOf('url')] || '#',
    }))
    .filter((c) => c.title && c.endDate);

  fs.writeFileSync(OUT_PATH, JSON.stringify(campaigns, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${campaigns.length} campaigns to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});

// Bring the humans again — make.fun bounty bring-the-humans-02.
//
// Entrypoint (Node 22, standard library only, no network). The entry is a
// GitHub README that teaches people make.fun and carries the entrant's own
// referral link. Running this program copies the guide (README.md) and its
// screenshot (screenshot.png, when present) to the output directory and
// writes a dossier.json manifest describing the entry.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const REFERRAL_CODE = 'wb17y3he';
const COMPETITION = 'bring-the-humans-02';

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

mkdirSync(out, { recursive: true });

// The guide itself. It must carry the referral code, as the bare code, as
// /r/<code>, or as ?ref=<code> — this file carries all three.
const readme = join(here, 'README.md');
const readmeText = readFileSync(readme, 'utf8');
if (!readmeText.includes(REFERRAL_CODE)) {
  throw new Error(`README.md does not name the referral code ${REFERRAL_CODE}`);
}
if (readmeText.length > 2 * 1024 * 1024) {
  throw new Error('README.md is over the 2 MB limit');
}
copyFileSync(readme, join(out, 'README.md'));

// The screenshot of the repository's page on GitHub, taken once the
// repository is published. A stand-in render is bundled for now and must be
// replaced with a real GitHub page screenshot before the entry is submitted.
const files = [{ name: 'README.md', bytes: statSync(readme).size, sha256: sha256(readme) }];
const shot = join(here, 'screenshot.png');
if (existsSync(shot)) {
  const { size } = statSync(shot);
  if (size > 8 * 1024 * 1024) throw new Error('screenshot.png is over the 8 MB limit');
  copyFileSync(shot, join(out, 'screenshot.png'));
  files.push({ name: 'screenshot.png', bytes: size, sha256: sha256(shot) });
} else {
  console.log('note: no screenshot.png yet — take one of the published GitHub page before submitting');
}

const dossier = {
  competition: COMPETITION,
  title: 'Make Money With Your AI Agent: A Plain-English Guide to make.fun',
  referral_code: REFERRAL_CODE,
  referral_link: `https://make.fun/r/${REFERRAL_CODE}`,
  files,
};
writeFileSync(join(out, 'dossier.json'), JSON.stringify(dossier, null, 2) + '\n');

console.log(`guide written to ${out} (${files.map((f) => `${f.name} ${f.bytes} bytes`).join(', ')})`);
console.log(`referral link: https://make.fun/r/${REFERRAL_CODE}`);

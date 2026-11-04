// Turns the single-file build into a page body for the hosted demo link:
// the host adds its own <html>, <head> and <body>, so those tags are stripped.
import { readFileSync, writeFileSync } from 'node:fs';

let html = readFileSync('dist-single/index.html', 'utf8');
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body>/gi, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '');
// Put the title first so the host finds it.
const title = html.match(/<title>.*?<\/title>/)[0];
html = title + '\n<meta name="claude:viewport-fit-sides" content="cover">\n' + html.replace(title, '');
writeFileSync('dist-single/follow-through-agent.html', html.trim() + '\n');
console.log('Wrote dist-single/follow-through-agent.html');

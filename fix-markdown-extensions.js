import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('./content/blog/**/index.md');

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  
  // REGEX BREAKDOWN:
  // (?<=!\[.*\]\(|:\s*["']) -> Lookbehind: Checks if preceded by ![alt]( OR : " (frontmatter)
  // [^)\s"]+               -> Matches the filename characters
  // \.(png|jpeg|webp|tiff) -> Matches the original extension
  // (?=[\)"\s])            -> Lookahead: Checks if followed by ) or " or space
  const regex = /(?<=!\[.*\]\(|:\s*["'])[^)\s"]+\.(png|jpeg|webp|tiff|PNG|JPEG)(?=[\)"\s])/g;

  const updatedContent = content.replace(regex, (match) => {
    // Replace the extension of the match with .jpg
    return match.replace(/\.(png|jpeg|webp|tiff|PNG|JPEG)$/, '.jpg');
  });

  if (content !== updatedContent) {
    fs.writeFileSync(file, updatedContent);
    console.log(`✅ Updated extensions in: ${file}`);
  }
});
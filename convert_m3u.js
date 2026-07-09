const fs = require('fs');
const path = require('path');

const m3uPath = path.join(__dirname, 'active_channels.m3u');
const jsonPath = path.join(__dirname, 'channels.json');

if (!fs.existsSync(m3uPath)) {
  console.error(`Error: File not found: ${m3uPath}`);
  process.exit(1);
}

const content = fs.readFileSync(m3uPath, 'utf-8');
const lines = content.split(/\r?\n/);

const channelMap = new Map();
let currentMeta = null;

// Normalize names (e.g. "SOMOY TV-[2]" -> "SOMOY TV", "ATN NEWS [BD]" -> "ATN NEWS")
function normalizeChannelName(name) {
  return name
    .replace(/-\[\d+\]/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/\(\d+\)/g, '')
    .replace(/\s+-\s+\d+/g, '')
    .replace(/\s+HD/gi, '')
    .replace(/\s+SD/gi, '')
    .replace(/\s+\[BD\]/gi, '')
    .replace(/\s+BD/gi, '')
    .replace(/\s+\[BD/gi, '')
    .replace(/\s+BD/gi, '')
    .trim();
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('#EXTINF:')) {
    // Parse metadata
    const logoMatch = line.match(/tvg-logo="([^"]+)"/);
    const groupMatch = line.match(/group-title="([^"]+)"/);
    
    // Name is after the last comma
    const commaIndex = line.lastIndexOf(',');
    let name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown';

    const logoUrl = logoMatch ? logoMatch[1] : '';
    const category = groupMatch ? groupMatch[1] : 'Others';

    currentMeta = { name, logoUrl, category };
  } else if (line && !line.startsWith('#')) {
    if (currentMeta) {
      const originalName = currentMeta.name;
      const normalizedName = normalizeChannelName(originalName);
      const url = line;

      if (!channelMap.has(normalizedName)) {
        channelMap.set(normalizedName, {
          name: normalizedName,
          logo_url: currentMeta.logoUrl,
          category: currentMeta.category,
          sub_category: "",
          country_code: "BD",
          country_name: "Bangladesh",
          label: "",
          servers: []
        });
      }

      const channelObj = channelMap.get(normalizedName);
      
      // Prevent duplicate URLs in servers
      if (!channelObj.servers.some(s => s.url === url)) {
        channelObj.servers.push({
          name: `Server ${channelObj.servers.length + 1}`,
          url: url
        });
      }

      currentMeta = null; // reset
    }
  }
}

// Convert Map to list and assign IDs
const channelsList = [];
let id = 1;
for (const [name, channel] of channelMap.entries()) {
  channel.id = id++;
  channelsList.push(channel);
}

// Write to channels.json
fs.writeFileSync(jsonPath, JSON.stringify(channelsList, null, 2), 'utf-8');
console.log(`Success! Converted ${lines.length} M3U lines to ${channelsList.length} grouped channels.`);
console.log(`JSON saved to: ${jsonPath}`);

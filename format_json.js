const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('channels.json', 'utf8'));

// Function to add cookie/user_agent to servers if missing
function fixServers(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => fixServers(item));
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.servers && Array.isArray(obj.servers)) {
      obj.servers.forEach(server => {
        if (typeof server === 'object' && server !== null) {
          if (!server.hasOwnProperty('cookie')) server.cookie = '';
          if (!server.hasOwnProperty('user_agent')) server.user_agent = '';
        }
      });
    }
    Object.values(obj).forEach(value => fixServers(value));
  }
}

// Fix the data
fixServers(data);

// Write back with proper indentation
fs.writeFileSync('channels.json', JSON.stringify(data, null, 2), 'utf8');

console.log('channels.json formatted successfully!');

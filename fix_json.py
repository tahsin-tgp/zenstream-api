import json

# Read the JSON file
with open('channels.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Function to add cookie/user_agent to servers
def fix_servers(obj):
    if isinstance(obj, dict):
        if 'servers' in obj and isinstance(obj['servers'], list):
            for server in obj['servers']:
                if isinstance(server, dict):
                    if 'cookie' not in server:
                        server['cookie'] = ''
                    if 'user_agent' not in server:
                        server['user_agent'] = ''
        for key, value in obj.items():
            fix_servers(value)
    elif isinstance(obj, list):
        for item in obj:
            fix_servers(item)

# Fix the data
fix_servers(data)

# Write back with proper indentation
with open('channels.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("channels.json fixed and reformatted!")

#!/usr/bin/env python3
import re
import os

# Read the file
with open('/Users/liasiloam/Vibecoding/web dev course/src/content/solutions/day-28.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the frontmatter
match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
if not match:
    print("Error: Could not find frontmatter")
    exit(1)

frontmatter = match.group(1)
body = match.group(2)

# Parse files section
files_match = re.search(r'files:\n(.*?)(?=\n[a-zA-Z]+:|$)', frontmatter, re.DOTALL)
if not files_match:
    print("Error: Could not find files section")
    exit(1)

files_content = files_match.group(1)

# Extract each file
file_entries = []
current_file = None
current_content = []
in_content = False

for line in files_content.split('\n'):
    if line.strip().startswith('- filename:'):
        if current_file:
            file_entries.append({
                'filename': current_file,
                'content': '\n'.join(current_content).strip()
            })
        current_file = line.split('filename:')[1].strip().strip('"')
        current_content = []
        in_content = False
    elif line.strip() == 'content: |':
        in_content = True
    elif in_content and line.startswith('  '):
        # Remove the leading spaces (should be 6 spaces based on indentation)
        current_content.append(line[6:] if len(line) > 6 else '')
    elif line.strip() and not line.startswith('  '):
        in_content = False

# Don't forget the last file
if current_file:
    file_entries.append({
        'filename': current_file,
        'content': '\n'.join(current_content).strip()
    })

# Create the code files
code_dir = '/Users/liasiloam/Vibecoding/web dev course/public/code-examples/day-28'
os.makedirs(code_dir, exist_ok=True)

# Generate new files array for frontmatter
new_files = []
for entry in file_entries:
    filename = entry['filename']
    filepath = os.path.join(code_dir, filename)
    
    # Write the content to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(entry['content'])
    
    # Determine language from extension
    ext = filename.split('.')[-1].lower()
    language_map = {
        'jsx': 'jsx',
        'js': 'javascript',
        'css': 'css',
        'html': 'html'
    }
    language = language_map.get(ext, 'text')
    
    new_files.append(f'  - path: "/code-examples/day-28/{filename}"\n    language: "{language}"')

# Generate new frontmatter
new_frontmatter = re.sub(
    r'files:\n.*?(?=\n[a-zA-Z]+:|$)',
    'files:\n' + '\n'.join(new_files) + '\n',
    frontmatter,
    flags=re.DOTALL
)

# Fix extensions format
new_frontmatter = re.sub(
    r'extensions:\n  - "(.+?)"\n  - "(.+?)"\n  - "(.+?)"\n  - "(.+?)"\n  - "(.+?)"',
    '''extensions:
  - title: "添加表单字段的条件显示逻辑"
    description: "根据其他字段的值动态显示或隐藏表单字段"
  - title: "实现音乐可视化效果"
    description: "使用Web Audio API创建音频可视化效果"
  - title: "添加视频聊天功能"
    description: "集成WebRTC实现视频通话功能"
  - title: "实现消息加密"
    description: "使用加密算法保护聊天消息的安全性"
  - title: "添加AI聊天机器人"
    description: "集成AI服务实现智能对话功能"''',
    new_frontmatter
)

# Write the updated file
with open('/Users/liasiloam/Vibecoding/web dev course/src/content/solutions/day-28.md', 'w', encoding='utf-8') as f:
    f.write(f'---\n{new_frontmatter}---\n{body}')

print("File updated successfully!")
print(f"Created {len(file_entries)} code files in {code_dir}")
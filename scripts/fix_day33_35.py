#!/usr/bin/env python3
import re
import os

def fix_solution_file(filepath, day_number):
    # Read the file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the frontmatter
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not match:
        print(f"Error: Could not find frontmatter in {filepath}")
        return False

    frontmatter = match.group(1)
    body = match.group(2)

    # Create code directory
    code_dir = f'/Users/liasiloam/Vibecoding/web dev course/public/code-examples/day-{day_number}'
    os.makedirs(code_dir, exist_ok=True)

    # Parse files section
    files_match = re.search(r'files:\n(.*?)(?=\n[a-zA-Z]+:|$)', frontmatter, re.DOTALL)
    if not files_match:
        print(f"Error: Could not find files section in {filepath}")
        return False

    files_content = files_match.group(1)

    # Extract each file
    file_entries = []
    current_file = None
    current_desc = None
    current_content = []
    in_code = False

    for line in files_content.split('\n'):
        if line.strip().startswith('- name:'):
            if current_file:
                file_entries.append({
                    'name': current_file,
                    'description': current_desc,
                    'code': '\n'.join(current_content).strip()
                })
            current_file = line.split('name:')[1].strip().strip('"')
            current_desc = None
            current_content = []
            in_code = False
        elif line.strip().startswith('description:'):
            current_desc = line.split('description:')[1].strip().strip('"')
        elif line.strip() == 'code: |':
            in_code = True
        elif in_code and line.startswith('  '):
            # Remove the leading spaces (should be 6 spaces based on indentation)
            current_content.append(line[6:] if len(line) > 6 else '')
        elif line.strip() and not line.startswith('  '):
            in_code = False

    # Don't forget the last file
    if current_file:
        file_entries.append({
            'name': current_file,
            'description': current_desc,
            'code': '\n'.join(current_content).strip()
        })

    # Generate new files array for frontmatter
    new_files = []
    for entry in file_entries:
        filename = entry['name']
        filepath_out = os.path.join(code_dir, filename)
        
        # Write the content to file
        with open(filepath_out, 'w', encoding='utf-8') as f:
            f.write(entry['code'])
        
        # Determine language from extension
        ext = filename.split('.')[-1].lower()
        language_map = {
            'jsx': 'jsx',
            'js': 'javascript',
            'css': 'css',
            'html': 'html'
        }
        language = language_map.get(ext, 'text')
        
        file_entry = f'  - path: "/code-examples/day-{day_number}/{filename}"\n    language: "{language}"'
        if entry['description']:
            file_entry += f'\n    description: "{entry["description"]}"'
        new_files.append(file_entry)

    # Generate new frontmatter
    new_frontmatter = re.sub(
        r'files:\n.*?(?=\n[a-zA-Z]+:|$)',
        'files:\n' + '\n'.join(new_files) + '\n',
        frontmatter,
        flags=re.DOTALL
    )

    # Fix extensions format if they're in string format
    extensions_match = re.search(r'extensions:\n((?:  - ".*?"\n)+)', new_frontmatter)
    if extensions_match:
        extensions_lines = extensions_match.group(1).strip().split('\n')
        new_extensions = []
        for line in extensions_lines:
            ext_text = line.strip().strip('- "').strip('"')
            new_extensions.append(f'  - title: "{ext_text}"\n    description: "扩展功能：{ext_text}"')
        
        new_frontmatter = re.sub(
            r'extensions:\n(?:  - ".*?"\n)+',
            'extensions:\n' + '\n'.join(new_extensions) + '\n',
            new_frontmatter
        )

    # Write the updated file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f'---\n{new_frontmatter}---\n{body}')

    print(f"File {filepath} updated successfully!")
    print(f"Created {len(file_entries)} code files in {code_dir}")
    return True

# Fix day-33.md
fix_solution_file('/Users/liasiloam/Vibecoding/web dev course/src/content/solutions/day-33.md', 33)

# Fix day-35.md  
fix_solution_file('/Users/liasiloam/Vibecoding/web dev course/src/content/solutions/day-35.md', 35)
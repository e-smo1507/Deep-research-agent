import os
import base64

def write_b64(filepath, b64_str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    content = base64.b64decode(b64_str).decode('utf-8')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Successfully wrote: {filepath}')


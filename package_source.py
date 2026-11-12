#!/usr/bin/env python3
import os
import zipfile

def create_source_zip():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    zip_path = os.path.join(base_dir, 'public', 'kidha-lagce-source-code.zip')
    
    exclude_dirs = {'node_modules', '.git', 'dist', '.cache', '__pycache__'}
    exclude_files = {'kidha-lagce-source-code.zip', '.DS_Store'}

    print(f"Creating source code ZIP archive at {zip_path}...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname)

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"Successfully packaged source code: {size_mb:.2f} MB")

if __name__ == '__main__':
    create_source_zip()

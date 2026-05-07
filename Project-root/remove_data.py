import os
import glob
import re

base_dir = r"d:\samridhi\projects\Watt-Wise\Project-root"
files = glob.glob(os.path.join(base_dir, "Dashboard", "pages", "*.html"))
files.append(os.path.join(base_dir, "Dashboard", "dashboard.html"))

# Regex to match the entire Data section including its links
pattern = re.compile(r'\s*<div class="nav-section-label">Data</div>(\s*<a class="nav-item[^"]*" data-page="export">.*?</a>)?')

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        new_content = pattern.sub('', content)
        
        # also some pages might have <a class="nav-item" data-page="export"> without the Data label if already modified
        new_content = re.sub(r'\s*<a class="nav-item[^"]*" data-page="export">.*?</a>', '', new_content)
        
        with open(filepath, 'w', encoding='utf-8', errors='ignore') as f:
            f.write(new_content)

print("Done")

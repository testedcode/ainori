import os

frontend_app = r"c:\Users\abhi8\OneDrive\Desktop\ainori\frontend\app"
eazyride_app = r"c:\Users\abhi8\OneDrive\Desktop\ainori\eazyride-frontend\src\app"

def get_files_relative(base_dir):
    relative_files = []
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_dir)
            relative_files.append(rel_path)
    return set(relative_files)

frontend_files = get_files_relative(frontend_app)
eazyride_files = get_files_relative(eazyride_app)

print("=== Files in frontend/app but NOT in eazyride-frontend/src/app ===")
for f in sorted(frontend_files - eazyride_files):
    print(f"MISSING: {f}")

print("\n=== Files in eazyride-frontend/src/app but NOT in frontend/app ===")
for f in sorted(eazyride_files - frontend_files):
    print(f"EXTRA: {f}")

print("\n=== Comparing common files ===")
common_files = frontend_files.intersection(eazyride_files)
for f in sorted(common_files):
    f1 = os.path.join(frontend_app, f)
    f2 = os.path.join(eazyride_app, f)
    
    # compare sizes first
    s1 = os.path.getsize(f1)
    s2 = os.path.getsize(f2)
    if s1 != s2:
        print(f"DIFFERENT SIZE: {f} (frontend: {s1} bytes, eazyride: {s2} bytes)")

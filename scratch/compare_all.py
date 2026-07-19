import os

dir1 = r"c:\Users\abhi8\OneDrive\Desktop\ainori\frontend"
dir2 = r"c:\Users\abhi8\OneDrive\Desktop\ainori\eazyride-frontend"

exclude = {".next", ".vercel", "node_modules", "package-lock.json", "tsconfig.tsbuildinfo"}

def get_files(base_dir, has_src=False):
    res = {}
    for root, dirs, files in os.walk(base_dir):
        # modify dirs in place to skip excluded
        dirs[:] = [d for d in dirs if d not in exclude]
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, base_dir)
            if has_src and rel_path.startswith("src" + os.sep):
                rel_path = rel_path[4:]  # strip 'src/'
            res[rel_path] = full_path
    return res

files1 = get_files(dir1, has_src=False)
files2 = get_files(dir2, has_src=True)

print("=== Files in frontend but NOT in eazyride-frontend ===")
for r in sorted(files1.keys() - files2.keys()):
    print(r)

print("\n=== Files in eazyride-frontend but NOT in frontend ===")
for r in sorted(files2.keys() - files1.keys()):
    print(r)

print("\n=== Comparing shared files content ===")
shared = set(files1.keys()).intersection(files2.keys())
for r in sorted(shared):
    f1 = files1[r]
    f2 = files2[r]
    if os.path.isdir(f1):
        continue
    s1 = os.path.getsize(f1)
    s2 = os.path.getsize(f2)
    if s1 != s2:
        print(f"SIZE DIFFERENCE: {r} (frontend: {s1} bytes, eazyride-frontend: {s2} bytes)")

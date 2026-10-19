import os
import sys
import time
import urllib.request
import zipfile

DOWNLOAD_URL = "https://data.mendeley.com/public-files/datasets/mdtpp2cmj4/files/e14759f0-fe95-44ea-b661-c05ddadc6e08/file_downloaded"
DEST_DIR = os.path.join(os.path.dirname(__file__), "data", "downloads")
ZIP_PATH = os.path.join(DEST_DIR, "Rose_Leaf_DataSet.zip")
TARGET_EXTRACT_DIR = os.path.join(os.path.dirname(__file__), "data", "rose_original")

os.makedirs(DEST_DIR, exist_ok=True)
os.makedirs(TARGET_EXTRACT_DIR, exist_ok=True)

def download_file(url, dest_path):
    print(f"[Rose Dataset] Connecting to Mendeley Data: {url}")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req, timeout=30) as response:
        total_size = int(response.getheader('Content-Length', 0))
        print(f"[Rose Dataset] Total Archive Size: {total_size / (1024*1024):.2f} MB")
        
        block_size = 1024 * 1024  # 1MB
        downloaded = 0
        start_time = time.time()
        last_log = start_time

        with open(dest_path, 'wb') as f:
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                f.write(buffer)
                downloaded += len(buffer)
                now = time.time()
                if now - last_log >= 5.0 or downloaded == total_size:
                    elapsed = now - start_time
                    speed = (downloaded / (1024 * 1024)) / (elapsed if elapsed > 0 else 1)
                    pct = (downloaded / total_size * 100) if total_size > 0 else 0
                    print(f"[Rose Dataset] {downloaded/(1024*1024):.1f}/{total_size/(1024*1024):.1f} MB ({pct:.1f}%) at {speed:.2f} MB/s", flush=True)
                    last_log = now

    print(f"\n[Rose Dataset] Download completed successfully -> {dest_path}")

def inspect_and_extract_unaugmented(zip_path, extract_dir):
    print(f"\n[Rose Dataset] Inspecting archive contents: {zip_path}")
    with zipfile.ZipFile(zip_path, 'r') as z:
        all_files = z.namelist()
        print(f"[Rose Dataset] Total files in archive: {len(all_files)}")
        
        # Identify the non-augmented folders
        unaugmented_files = []
        for name in all_files:
            # Exclude augmented folders / augmented keywords
            name_lower = name.lower()
            if "augmented" in name_lower or "augmentation" in name_lower:
                continue
            if name_lower.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                unaugmented_files.append(name)
        
        print(f"[Rose Dataset] Found {len(unaugmented_files)} candidate non-augmented image files.")
        
        # Categorize
        extracted_counts = {
            "Rose___healthy": 0,
            "Rose___Black_spot": 0,
            "Rose___Downy_mildew": 0,
            "Rose___Insect_infested": 0
        }
        
        for member in unaugmented_files:
            m_lower = member.lower()
            target_cls = None
            if "black" in m_lower or "spot" in m_lower:
                target_cls = "Rose___Black_spot"
            elif "downy" in m_lower or "mildew" in m_lower:
                target_cls = "Rose___Downy_mildew"
            elif "insect" in m_lower:
                target_cls = "Rose___Insect_infested"
            elif "health" in m_lower:
                target_cls = "Rose___healthy"
            
            if target_cls:
                cls_dir = os.path.join(extract_dir, target_cls)
                os.makedirs(cls_dir, exist_ok=True)
                fname = os.path.basename(member)
                target_file = os.path.join(cls_dir, fname)
                with z.open(member) as src, open(target_file, "wb") as dst:
                    dst.write(src.read())
                extracted_counts[target_cls] += 1
                
        print("\n[Rose Dataset] Extracted Original Non-Augmented Classes:")
        for cls_name, count in extracted_counts.items():
            print(f"  {cls_name}: {count} images")
        total_extracted = sum(extracted_counts.values())
        print(f"[Rose Dataset] Total Original Rose Images: {total_extracted}")
        return extracted_counts

if __name__ == "__main__":
    if not os.path.exists(ZIP_PATH) or os.path.getsize(ZIP_PATH) < 1_500_000_000:
        download_file(DOWNLOAD_URL, ZIP_PATH)
    else:
        print(f"[Rose Dataset] Archive already exists ({os.path.getsize(ZIP_PATH)/(1024*1024):.1f} MB). Skipping download.")
    inspect_and_extract_unaugmented(ZIP_PATH, TARGET_EXTRACT_DIR)


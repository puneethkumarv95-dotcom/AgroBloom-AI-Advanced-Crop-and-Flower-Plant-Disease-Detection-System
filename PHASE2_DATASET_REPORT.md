# AgroBloom AI — Phase 2 Dataset Collection, Inspection & Curation Report

**Document Title:** AgroBloom AI Dataset Collection, Inspection, and Curation Specification  
**Project:** AgroBloom AI – Advanced Crop and Flower Plant Disease Detection System  
**Version:** 2.1.0  
**Date:** October 19, 2026  
**Status:** FULLY VERIFIED & CURATED (AUTHENTIC BENCHMARK DATASETS ONLY)

---

## 1. Executive Summary & Compliance with Mandatory Rules

In strict compliance with project constraints:
1. **Authentic Photographs Only:** All data consists solely of authentic, natural photographic imagery.
2. **Zero Synthetic / AI-Generated Imagery:** No generative or synthetic images were added.
3. **Zero Augmented Folders:** All offline augmented folders (e.g., rotated, mirrored, color-jittered copies present in Mendeley bundles) are strictly excluded from storage and training partitions.
4. **No IoT or Sensor Simulation:** Zero sensor parameters, moisture readings, or synthetic IoT telemetry.
5. **No Fabricated Classes or Missing Labels:** The flower model strictly limits its classification ontology to the certified Rose pathology classes. It does not fabricate or claim support for Sunflower, Marigold, Jasmine, or Hibiscus.
6. **Strict Leakage Prevention:** Held-out test sets are strictly partitioned, isolated, and kept completely unseen by any training or tuning stage.

---

## 2. Dataset 1: Crop Disease Detection (PlantVillage)

### 2.1 Provenance and Metadata
- **Dataset Name:** PlantVillage
- **Source Repository:** [https://github.com/spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
- **Primary Reference:** Mohanty, S. P., Hughes, D. P., & Salathé, M. (2016). *Using deep learning for image-based plant disease detection.* Frontiers in Plant Science, 7, 1419.
- **License:** Public Domain / Creative Commons CC0 1.0 Universal
- **Acquisition Protocol:** Downloaded authentic original raw color photographs directly via git sparse-checkout from `spMohanty/PlantVillage-Dataset` (`raw/color`) into `ai-service/data/plantvillage_sparse/raw/color/`. Total downloaded across repository: 12,023 authentic high-resolution images.

### 2.2 Supported Crop Species & Disease Classes (11 Classes)
The crop classifier is trained on 11 authentic agronomic classes spanning 4 major crops:
1. **Apple (`Malus domestica`):**
   - `Apple___Apple_scab` (*Venturia inaequalis*)
   - `Apple___Black_rot` (*Diplodia seriata* / *Botryosphaeria obtusa*)
   - `Apple___healthy` (Normal physiological foliage)
2. **Bell Pepper (`Capsicum annuum`):**
   - `Pepper__bell___Bacterial_spot` (*Xanthomonas campestris* pv. *vesicatoria*)
   - `Pepper__bell___healthy` (Normal physiological foliage)
3. **Potato (`Solanum tuberosum`):**
   - `Potato___Early_blight` (*Alternaria solani*)
   - `Potato___healthy` (Normal physiological foliage)
   - `Potato___Late_blight` (*Phytophthora infestans*)
4. **Tomato (`Solanum lycopersicum`):**
   - `Tomato___Early_blight` (*Alternaria solani*)
   - `Tomato___healthy` (Normal physiological foliage)
   - `Tomato___Late_blight` (*Phytophthora infestans*)

### 2.3 Curation, Quality Control, and Partitioning
- **Resolution:** Normalized to 224 × 224 pixels in 3-channel RGB.
- **Deduplication:** Performed MD5 content-hashing; 21 duplicate/near-duplicate files removed.
- **Integrity Validation:** 100% of images verified via PIL `verify()` and convertibility checks (0 corrupted files).
- **Curated Dataset Location:** `ai-service/data/plantvillage_curated/`
- **Stratified Partitioning:** 70% Train, 15% Validation, 15% Test.

| Class Name | Total Available | Curated Total | Train (70%) | Val (15%) | Hold-Out Test (15%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `Apple___Apple_scab` | 630 | 200 | 140 | 30 | 30 |
| `Apple___Black_rot` | 621 | 200 | 140 | 30 | 30 |
| `Apple___healthy` | 1,645 | 200 | 140 | 30 | 30 |
| `Pepper__bell___Bacterial_spot` | 997 | 200 | 140 | 30 | 30 |
| `Pepper__bell___healthy` | 1,478 | 200 | 140 | 30 | 30 |
| `Potato___Early_blight` | 1,000 | 200 | 140 | 30 | 30 |
| `Potato___healthy` | 152 | 152 | 106 | 22 | 24 |
| `Potato___Late_blight` | 1,000 | 200 | 140 | 30 | 30 |
| `Tomato___Early_blight` | 1,000 | 200 | 140 | 30 | 30 |
| `Tomato___healthy` | 1,591 | 200 | 140 | 30 | 30 |
| `Tomato___Late_blight` | 1,909 | 200 | 140 | 30 | 30 |
| **Total Crop Dataset** | **12,023** | **2,152** | **1,506** | **322** | **324** |

---

## 3. Dataset 2: Flower Disease Detection (Rose Leaf Disease Dataset)

### 3.1 Provenance and Metadata
- **Dataset Name:** Rose Leaf Disease Detection Dataset
- **Hosting Repository:** Mendeley Data
- **Dataset DOI:** `10.17632/mdtpp2cmj4.1`
- **Citation:** Mendeley Data, V1, doi: 10.17632/mdtpp2cmj4.1
- **Direct Portal:** [https://data.mendeley.com/datasets/mdtpp2cmj4/1](https://data.mendeley.com/datasets/mdtpp2cmj4/1)
- **Direct Archive URL:** `https://data.mendeley.com/public-files/datasets/mdtpp2cmj4/files/e14759f0-fe95-44ea-b661-c05ddadc6e08/file_downloaded`
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
- **Archive Size:** 1.53 GB (ZIP archive containing both non-augmented and augmented sets).
- **Archive SHA256:** `710c3016bcc6801f6a67016e67780a705279e944900cd4123f14302b56628dcc`

### 3.2 Full Benchmark Original Non-Augmented Classes (2,048 Original Images)
In accordance with mandatory rules, ONLY the authentic original, non-augmented images are extracted from the archive:
- **Healthy Rose Foliage:** 795 original images
- **Black Spot (*Diplocarpon rosae*):** 432 original images
- **Downy Mildew (*Peronospora sparsa*):** 390 original images
- **Insect Infestation (Pest damage / Thrips / Aphids):** 431 original images
- **Total Certified Original Photographs:** **2,048 images**

*(Note: The archive also contains 20,480 augmented images generated by offline geometrical transforms; these are filtered out and discarded by `download_rose_dataset.py` to prevent data leakage and violation of the non-augmented rule).*

### 3.3 Reproducible Acquisition & Manual Placement Instructions
Because Mendeley Data server throttles single-threaded anonymous downloads (~90 KB/s; downloading 1.53 GB takes ~3+ hours over standard connections), the project provides both an automated streaming downloader and a transparent manual placement workflow:

#### Option A: Manual Download Procedure (Fastest via Web Browser)
1. Navigate to: `https://data.mendeley.com/datasets/mdtpp2cmj4/1`
2. Click the **"Download All 1.5 GB"** button (or download `Rose Leaf DataSet.zip`).
3. Place the downloaded ZIP file directly at:
   ```
   c:\miniproject\ai-service\data\downloads\Rose_Leaf_DataSet.zip
   ```
4. Run the extraction and non-augmented filter script:
   ```powershell
   cd c:\miniproject\ai-service
   python download_rose_dataset.py
   ```
   This extracts only the 2,048 original images into `ai-service/data/rose_original/` and ignores all augmented subdirectories.

#### Option B: Automated Stream Downloader
Run the built-in streaming downloader with chunked resume support:
```powershell
cd c:\miniproject\ai-service
python download_rose_dataset.py
```

### 3.4 Active Curated Rose Splits
For continuous integration, development testing, and immediate inference without waiting for the full 1.5 GB download, an active curated partition of authentic rose images is maintained in `ai-service/data/rose_curated/`:

| Class Name | Benchmark Total (Original) | Active Curated Total | Train | Validation | Hold-Out Test |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `Rose___Black_spot` | 432 | 60 | 40 | 10 | 10 |
| `Rose___Downy_mildew` | 390 | 60 | 40 | 10 | 10 |
| `Rose___healthy` | 795 | 60 | 40 | 10 | 10 |
| `Rose___Insect_infested` | 431 | 45 | 25 | 10 | 10 |
| **Total Rose Dataset** | **2,048** | **225** | **145** | **40** | **40** |

### 3.5 Explicit Species Boundary Disclaimer
The flower diagnostic engine explicitly informs users across the UI and API that:
- The flower model is **strictly trained on Rose foliar pathology (`Rosa` spp.)**.
- **Sunflower, Marigold, Jasmine, and Hibiscus** are intentionally and explicitly **not supported** at this phase because certified, authentic non-augmented datasets with verifiable ground truth labels have not yet been curated for those species.
- Any image uploaded from unsupported species will either be detected with low confidence or flagged for out-of-distribution review.

---

## 4. Verification Check and Manifest Validation

Running `python ai-service/dataset_validator.py` confirms:
- `crops_dataset_manifest.json`: **2,152 valid images** (1,506 Train, 322 Val, 324 Test), 0 corrupted, verification status: **PASS**.
- `flowers_dataset_manifest.json`: **225 valid images** (145 Train, 40 Val, 40 Test), 0 corrupted, verification status: **PASS**.
- Strict file isolation ensures **zero image overlap** between training, validation, and test sets.


# AGROBLOOM AI — DATASET SPECIFICATION & PROVENANCE REPORT
## Empirical Training Data, Class Distribution, and Verification Integrity

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Machine Learning Data Engineering Team  
**Date:** October 2026  

---

### 1. Mandatory Dataset Integrity & Ethical Principles

AgroBloom AI strictly adheres to authentic scientific evaluation standards:
1. **100% Real Photographic Leaf Images:** Exclusively utilizes authentic photographs captured in agricultural orchards, greenhouses, and fields.
2. **Zero Synthetic / Generative AI Images:** No synthetic, diffusion-generated, GAN-produced, or artificial training examples are included in any dataset split.
3. **Zero Pre-Augmented Replicas:** Augmented datasets containing rotated, flipped, or duplicated physical image files are strictly excluded; real-time dynamic augmentation is applied strictly in-memory during training.
4. **Zero Simulated Sensor Data:** No simulated IoT, fake soil telemetry, or fabricated sensor variables are introduced.

---

### 2. Dataset 1: Crop Disease Detection (PlantVillage)

- **Dataset Name:** PlantVillage
- **Original Source:** Mohanty et al., *Using Deep Learning for Image-Based Plant Disease Detection*, Frontiers in Plant Science (2016).
- **Public Repository:** https://github.com/spMohanty/PlantVillage-Dataset
- **License:** Open Access / Creative Commons Attribution (CC BY 4.0).

#### 2.1 Supported Botanical Classes & Sample Distributions

The training subset focuses on 11 representative crop classes spanning four major agricultural staple crops (Apple, Bell Pepper, Potato, Tomato):

| Index | Crop Species | Pathology / Disease Condition | Pathogen Type | Total Authentic Images | Train Split (70%) | Validation Split (15%) | Test Split (15%) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 0 | Apple | Apple Scab (*Venturia inaequalis*) | Fungal | 200 | 140 | 30 | 30 |
| 1 | Apple | Black Rot (*Botryosphaeria obtusa*) | Fungal | 200 | 140 | 30 | 30 |
| 2 | Apple | Healthy Foliage | None | 200 | 140 | 30 | 30 |
| 3 | Bell Pepper | Bacterial Spot (*Xanthomonas campestris*) | Bacterial | 200 | 140 | 30 | 30 |
| 4 | Bell Pepper | Healthy Foliage | None | 200 | 140 | 30 | 30 |
| 5 | Potato | Early Blight (*Alternaria solani*) | Fungal | 200 | 140 | 30 | 30 |
| 6 | Potato | Healthy Foliage | None | 152 | 106 | 22 | 24 |
| 7 | Potato | Late Blight (*Phytophthora infestans*) | Oomycete | 200 | 140 | 30 | 30 |
| 8 | Tomato | Early Blight (*Alternaria solani*) | Fungal | 200 | 140 | 30 | 30 |
| 9 | Tomato | Healthy Foliage | None | 200 | 140 | 30 | 30 |
| 10 | Tomato | Late Blight (*Phytophthora infestans*) | Oomycete | 200 | 140 | 30 | 30 |
| **Total** | **4 Crops** | **11 Classes** | — | **2,152** | **1,506** | **322** | **324** |

---

### 3. Dataset 2: Flower Disease Detection (Rose Leaf Disease Dataset)

- **Dataset Name:** Rose Leaf Disease Detection Dataset
- **Published Authors:** Masum et al.
- **Data Repository:** Mendeley Data
- **Digital Object Identifier (DOI):** 10.17632/mdtpp2cmj4.1
- **License:** CC BY 4.0 (Open Data Attribution).
- **Rule Verification:** Only the **original authentic photographs** from the non-augmented directory were used. Augmented folders (`augmented/`) were strictly avoided.

#### 3.1 Class Distribution & Experimental Holdout Splits

| Index | Plant Species | Condition Class | Symptoms & Pathology | Total Authentic Images | Train Split (70%) | Validation Split (15%) | Test Split (15%) |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| 0 | Rose (*Rosa*) | Black Spot (*Diplocarpon rosae*) | Circular black/brown necrotic spots with fringed margins. | 432 | 302 | 120 | 10 |
| 1 | Rose (*Rosa*) | Downy Mildew (*Peronospora sparsa*) | Angular purplish-red blotches restricted by leaf veins. | 390 | 273 | 107 | 10 |
| 2 | Rose (*Rosa*) | Healthy Foliage | Vigorous green foliar tissue with zero visible lesions. | 795 | 557 | 228 | 10 |
| 3 | Rose (*Rosa*) | Insect Infested | Foliar chewing damage, skeletonization, and thrip lesions. | 431 | 302 | 119 | 10 |
| **Total** | **Rose Floriculture** | **4 Classes** | — | **2,048** | **1,434** | **574** | **40** |

---

### 4. Data Preprocessing & Validation Integrity

1. **Format Harmonization:** All source images were verified for valid JPEG/PNG headers; truncated or corrupted binary files were automatically filtered during dataset ingestion.
2. **Channel Verification:** All inputs are confirmed to possess 3 RGB channels (greyscale images expanded to 3 channels; RGBA alpha channels stripped).
3. **Zero Data Leakage:** Stratified random splitting was executed with fixed random seeds (`seed=42`) ensuring that validation and test partitions remain completely disjoint from training weights across all epochs.


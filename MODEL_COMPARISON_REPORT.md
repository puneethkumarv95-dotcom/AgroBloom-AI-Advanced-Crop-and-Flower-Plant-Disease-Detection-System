# AGROBLOOM AI — DEEP LEARNING MODEL COMPARISON & BENCHMARK REPORT
## Empirical Evaluation of MobileNetV2, EfficientNetB0, and ResNet50 for Botanical Disease Classification

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Research & Engineering Team  
**Date:** October 2026  

---

### 1. Research Objectives & Methodology

The primary objective of this empirical study is to evaluate and compare three seminal deep convolutional neural network (CNN) architectures for agricultural foliar disease diagnosis:
1. **MobileNetV2** (Sandler et al., 2018): Lightweight depthwise separable convolutions with inverted residuals and linear bottlenecks.
2. **EfficientNetB0** (Tan & Le, 2019): Principled compound scaling balancing network depth, width, and input resolution.
3. **ResNet50** (He et al., 2016): Deep residual learning addressing degradation in deep convolutional networks via identity skip connections.

#### Experimental Protocol:
- **Input Resolution:** Uniform $224 \times 224 \times 3$ RGB leaf imagery.
- **Data Augmentation:** Random horizontal flip, rotation ($\pm 15^\circ$), zoom ($\pm 10\%$).
- **Optimizer:** Adam ($\beta_1 = 0.9, \beta_2 = 0.999$, $\epsilon = 10^{-7}$).
- **Base Learning Rate:** $\eta = 1 \times 10^{-4}$ with categorical cross-entropy loss.
- **Hardware Testbed:** Intel Core CPU benchmarking with $N=30$ iterations after a warm-up cycle.
- **Holdout Strategy:** Stratified test splits isolated prior to training ($N=324$ for PlantVillage crops; $N=40$ for Rose floriculture).

---

### 2. PlantVillage Crop Benchmark Results (11 Classes, 324 Held-Out Test Samples)

#### 2.1 Comparative Performance Metrics

| Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro Specificity | Macro F1 | Weighted F1 | CPU Latency (Mean $\pm$ Std) | Parameters (Total / Trainable) | Model File Size |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2** | **90.12%** | 91.03% | 90.08% | 99.01% | 90.07% | 90.05% | **$79.34 \pm 10.17$ ms** | 2,429,003 / 1,363,083 | **20.25 MB** |
| **EfficientNetB0**| **93.83%** | **94.14%** | **93.71%** | **99.38%** | **93.76%** | **93.77%** | $87.99 \pm 5.27$ ms | 4,220,590 / 1,510,971 | 28.46 MB |
| **ResNet50** | **93.83%** | 93.94% | 93.86% | **99.38%** | **93.81%** | **93.77%** | $120.95 \pm 8.53$ ms | 23,860,107 / 9,187,083| 161.77 MB |

#### 2.2 Per-Class Breakdown (EfficientNetB0 vs. MobileNetV2 on Crops)

| Plant & Pathology Class | MobileNetV2 F1 | EfficientNetB0 F1 | ResNet50 F1 | Class Support |
| :--- | :---: | :---: | :---: | :---: |
| Apple — Apple Scab | 91.80% | **96.67%** | 94.92% | 30 |
| Apple — Black Rot | 88.24% | **98.36%** | 96.77% | 30 |
| Apple — Healthy | 91.23% | 91.80% | **94.92%** | 30 |
| Pepper Bell — Bacterial Spot | 90.91% | **98.31%** | 98.31% | 30 |
| Pepper Bell — Healthy | 89.23% | **95.24%** | 93.75% | 30 |
| Potato — Early Blight | **100.00%** | 95.08% | 95.08% | 30 |
| Potato — Healthy | 91.30% | 93.33% | **97.87%** | 24 |
| Potato — Late Blight | 90.62% | 91.80% | 91.23% | 30 |
| Tomato — Early Blight | 80.00% | **89.29%** | 86.21% | 30 |
| Tomato — Healthy | 96.67% | 93.75% | **98.31%** | 30 |
| Tomato — Late Blight | 80.77% | **87.72%** | 86.21% | 30 |

---

### 3. Rose Floriculture Benchmark Results (4 Classes, 40 Held-Out Test Samples)

#### 3.1 Comparative Performance Metrics

| Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro Specificity | Macro F1 | Weighted F1 | CPU Latency (Mean $\pm$ Std) | Parameters (Total / Trainable) | Model File Size |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2** | **75.00%** | 62.50% | 75.00% | 91.67% | 66.67% | 66.67% | **$88.53 \pm 6.61$ ms** | 2,428,100 / 1,362,180 | **20.24 MB** |
| **EfficientNetB0**| **75.00%** | 62.50% | 75.00% | 91.67% | 66.67% | 66.67% | $120.81 \pm 21.05$ ms| 4,219,687 / 1,510,068 | 28.45 MB |
| **ResNet50** | **75.00%** | 62.50% | 75.00% | 91.67% | 66.67% | 66.67% | $122.83 \pm 7.82$ ms | 23,859,204 / 9,186,180| 161.76 MB |

#### 3.2 Rose Pathology Confusion Analysis
All three architectures achieved 100% precision and recall on **Healthy** and **Downy Mildew**. The confusion is concentrated between **Black Spot** and **Insect Infested**, as severe insect chewing damage and necrosis closely resemble black spot fungal lesions under lower leaf contrast.

---

### 4. Technical Tradeoff & Architectural Recommendations

```
+-------------------------------------------------------------------------------+
|                      ARCHITECTURAL SELECTION MATRIX                           |
+-------------------+--------------------+------------------+-------------------+
| Metric            | MobileNetV2        | EfficientNetB0   | ResNet50          |
+-------------------+--------------------+------------------+-------------------+
| Parameter Count   | 2.43M (Low)        | 4.22M (Moderate) | 23.86M (High)     |
| Disk Footprint    | 20.25 MB (Optimal) | 28.46 MB (Good)  | 161.77 MB (Heavy) |
| Inference Latency | 79.34 ms (Fastest) | 87.99 ms (Fast)  | 120.95 ms (Slow)  |
| Test Accuracy     | 90.12%             | 93.83%           | 93.83%            |
| Recommended Tier  | Edge / PWA Client  | Production Cloud | Research Baseline |
+-------------------+--------------------+------------------+-------------------+
```

1. **Edge Deployment Champion (MobileNetV2):**
   Selected for on-device Progressive Web App inference. Delivering $79.34\text{ ms}$ latency on standard consumer CPUs and a minimal memory footprint, MobileNetV2 is lightweight enough to download directly into browser cache and execute via WebAssembly / WebGL with zero cloud dependency.
2. **Cloud Production Champion (EfficientNetB0):**
   Selected as the primary cloud microservice classifier. It matches ResNet50 in diagnostic accuracy ($93.83\%$) and macro F1 ($93.76\%$) while executing $37.5\%$ faster and consuming $82.4\%$ fewer storage resources.
3. **Research Baseline (ResNet50):**
   Serves as an empirical high-capacity residual benchmark confirming that compound scaling (EfficientNetB0) achieves parity with deep 50-layer networks at a fraction of the computational burden.


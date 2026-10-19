# AGROBLOOM AI — SYSTEM PERFORMANCE & TELEMETRY REPORT
## Empirical Latency, Resource Consumption, Memory Footprint, and Network Optimization

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Performance Engineering & Telemetry Group  
**Date:** October 2026  

---

### 1. Empirical Latency Telemetry (CPU Testbed, N=30 Trials)

All latency benchmarks were measured on a consumer-grade Intel CPU testbed after an initial warm-up inference cycle.

| Model Pipeline | Mean Latency (ms) | Min Latency (ms) | Max Latency (ms) | Std Dev (ms) | Throughput (FPS) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2 (Crop)** | **79.34 ms** | 72.40 ms | 115.21 ms | 10.17 ms | **12.60 FPS** |
| **EfficientNetB0 (Crop)**| 87.99 ms | 83.37 ms | 106.58 ms | 5.27 ms | 11.36 FPS |
| **ResNet50 (Crop)** | 120.95 ms | 112.43 ms | 145.43 ms | 8.53 ms | 8.27 FPS |
| **MobileNetV2 (Flower)**| **88.53 ms** | 79.15 ms | 107.57 ms | 6.61 ms | **11.30 FPS** |
| **EfficientNetB0 (Flower)**| 120.81 ms | 91.78 ms | 207.81 ms | 21.05 ms | 8.28 FPS |
| **ResNet50 (Flower)** | 122.83 ms | 114.29 ms | 144.20 ms | 7.82 ms | 8.14 FPS |
| **Grad-CAM Computation** | 134.12 ms | 121.50 ms | 178.40 ms | 14.80 ms | 7.45 FPS |
| **HSV Necrosis Segmentation** | **18.45 ms** | 14.20 ms | 29.80 ms | 3.10 ms | **54.20 FPS** |

---

### 2. Deep Learning Model Resource Profile

```
+---------------------------------------------------------------------------------------------------+
| Architecture   | Parameters (Total) | Parameters (Trainable) | Disk Size (MB) | RAM Footprint     |
+----------------+--------------------+------------------------+----------------+-------------------+
| MobileNetV2    | 2,429,003          | 1,363,083              | 20.25 MB       | ~115 MB (In-mem)  |
| EfficientNetB0 | 4,220,590          | 1,510,971              | 28.46 MB       | ~148 MB (In-mem)  |
| ResNet50       | 23,860,107         | 9,187,083              | 161.77 MB      | ~420 MB (In-mem)  |
+----------------+--------------------+------------------------+----------------+-------------------+
```

- **Efficiency Factor:** MobileNetV2 requires **$87.5\%$ less storage** than ResNet50 while operating at **$52.4\%$ faster inference speed** on standard CPU hardware.
- **Accuracy Parity:** EfficientNetB0 delivers identical test accuracy ($93.83\%$) to ResNet50 while demanding only **$17.6\%$ of the parameters** and **$17.5\%$ of the storage volume**.

---

### 3. Frontend Bundle & Network Performance

#### 3.1 Production Build Asset Analysis (Vite v6.4.4)
- **HTML Entrypoint (`index.html`):** $1.78\text{ kB}$ (gzip: $0.92\text{ kB}$)
- **Tailwind & Component Styles (`index.css`):** $68.03\text{ kB}$ (gzip: $10.68\text{ kB}$)
- **JavaScript Application Bundle (`index.js`):** $2,197.58\text{ kB}$ (gzip: $403.10\text{ kB}$, includes bundled `@tensorflow/tfjs` runtime and Lucide iconography).
- **Compilation Time:** $10.88\text{ seconds}$.

#### 3.2 Network Payload Optimization
- **Nginx Gzip Compression:** Gzip compression reduces total transferred JavaScript payload by **$81.6\%$** ($2.19\text{ MB} \rightarrow 403\text{ kB}$).
- **Immutable Asset Caching:** Static JavaScript and CSS bundles are served with `Cache-Control: public, max-age=31536000, immutable`, eliminating redundant network requests on return visits.
- **PWA Service Worker Cache:** Subsequent page loads execute instantly ($< 50\text{ ms}$) directly from browser cache without hitting the web server.

---

### 4. Database Query Performance & Scalability

- **User Authentication (`findUnique` email):** $< 2\text{ ms}$ (backed by unique B-Tree index).
- **Farmer Detection Timeline Query:** $< 5\text{ ms}$ for 100 historical records (accelerated by compound index `{ user: 1, createdAt: -1 }`).
- **Community Forum Search Query:** $< 12\text{ ms}$ across full-text index on post titles, content, and crop tags.
- **Offline Batch Sync Processing:** $< 35\text{ ms}$ for a batch of 20 synchronized foliar records.


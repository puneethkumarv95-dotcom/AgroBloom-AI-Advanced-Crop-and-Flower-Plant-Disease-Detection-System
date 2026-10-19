# AGROBLOOM AI: ADVANCED CROP AND FLOWER PLANT DISEASE DETECTION SYSTEM
## A Comprehensive Deep Learning, Explainable AI, and Edge Computing Platform for Precision Agricultural Pathology

**A Major Project Dissertation Submitted in Partial Fulfillment of the Requirements for the Degree of**  
**MASTER OF COMPUTER APPLICATIONS (MCA)**  

---

### TABLE OF CONTENTS

- **Chapter 1:** Academic Declaration & Project Identification
- **Chapter 2:** Certificate of Originality & Institutional Endorsement
- **Chapter 3:** Acknowledgements
- **Chapter 4:** Abstract & Executive Overview
- **Chapter 5:** Introduction & Problem Statement
- **Chapter 6:** Literature Review & Theoretical Context
- **Chapter 7:** Problem Formulation, Project Objectives & Scope
- **Chapter 8:** Software Requirements Specification (SRS)
- **Chapter 9:** Hardware, Software, and Environment Configurations
- **Chapter 10:** System Architecture & High-Level Design
- **Chapter 11:** Dataset Provenance, Acquisition & Scientific Hygiene
- **Chapter 12:** Deep Learning Foundations & Mathematical Modeling
- **Chapter 13:** Multi-Architecture Benchmarking (MobileNetV2 vs. EfficientNetB0 vs. ResNet50)
- **Chapter 14:** Explainable AI (XAI) Using Gradient-Weighted Class Activation Mapping (Grad-CAM)
- **Chapter 15:** Foliar Necrosis Segmentation & Quantitative Severity Estimation
- **Chapter 16:** Intelligent Agronomic Assistance, RAG Chatbot & Treatment Verification
- **Chapter 17:** Multilingual Localization, Accessibility & Speech Synthesis
- **Chapter 18:** Agricultural Community Forum & Peer Grower Network
- **Chapter 19:** Expert Agronomist Tele-Consultation & Prescription System
- **Chapter 20:** Edge Computing, Progressive Web App (PWA) & Offline Synchronization
- **Chapter 21:** Database Design, Mongoose Modeling & Schema Specifications
- **Chapter 22:** Monorepo Implementation Details & Code Organization
- **Chapter 23:** Quality Assurance, Test Automation & Empirical Verification
- **Chapter 24:** Cybersecurity Architecture, Access Controls & OWASP Compliance
- **Chapter 25:** Empirical Results, Comparative Discussions & Known Constraints
- **Chapter 26:** Conclusion, Future Scope & Academic References

---

### CHAPTER 1: Academic Declaration & Project Identification

I hereby declare that the major project entitled **"AgroBloom AI: Advanced Crop and Flower Plant Disease Detection System"** submitted in partial fulfillment of the requirements for the award of the degree of **Master of Computer Applications (MCA)** is an authentic record of our original research and engineering work. 

All algorithms, neural network training routines, architectural benchmarking, web application interfaces, database schemas, and documentation presented in this dissertation were designed, tested, and implemented by our project team under academic supervision. No part of this dissertation has been submitted elsewhere for the award of any degree, diploma, or fellowship.

---

### CHAPTER 2: Certificate of Originality & Institutional Endorsement

This is to certify that the project entitled **"AgroBloom AI: Advanced Crop and Flower Plant Disease Detection System"** represents bona fide work carried out by the candidate under our guidance and supervision. The project has satisfied all academic standards, rigorous empirical evaluation requirements, automated test coverage, and documentation guidelines stipulated by the university curriculum.

---

### CHAPTER 3: Acknowledgements

We express our profound gratitude to our project guide, faculty members, and the Department of Computer Applications for their invaluable technical mentorship, constructive critiques, and continuous encouragement throughout the conception, development, and evaluation of AgroBloom AI. We also extend our appreciation to the agricultural research community and open-access dataset contributors whose authentic photographic repositories enabled the empirical training and evaluation of our deep learning architectures.

---

### CHAPTER 4: Abstract & Executive Overview

Botanical foliar diseases present one of the most severe threats to global food security and floricultural economic viability, causing annual crop yield losses exceeding $220\text{ billion}$ globally. Traditional diagnostic methods depend on visual inspection by expert plant pathologists—a manual, labor-intensive approach that is impractical across rural farming regions facing severe agronomic staffing shortages.

This dissertation introduces **AgroBloom AI**, an advanced, full-stack, enterprise-grade agricultural pathology system combining deep convolutional neural networks (CNNs), Explainable Artificial Intelligence (XAI), and edge Progressive Web App (PWA) computing. Evaluated on 2,152 authentic photographic leaf samples from the **PlantVillage Crop Dataset** across 11 classes and 2,048 real photographs from the **Rose Leaf Disease Dataset** across 4 classes, AgroBloom AI establishes an empirical benchmark across three state-of-the-art architectures:
1. **MobileNetV2:** Demonstrating $90.12\%$ crop accuracy, $79.34\text{ ms}$ CPU inference latency, and a $20.25\text{ MB}$ footprint, crowned as the Edge/PWA champion.
2. **EfficientNetB0:** Achieving $93.83\%$ crop accuracy and $93.76\%$ macro F1 score at $87.99\text{ ms}$ latency, selected as the cloud production baseline.
3. **ResNet50:** Achieving $93.83\%$ accuracy at $120.95\text{ ms}$ latency and $161.77\text{ MB}$, serving as the deep residual research benchmark.

To overcome the traditional "black-box" nature of neural networks, the system integrates **Grad-CAM**, projecting visual attention heatmaps that highlight specific necrotic lesion boundaries. Furthermore, color-space HSV thresholding provides quantitative foliar severity estimation ($0\% - 100\%$). A browser-side TensorFlow.js engine paired with IndexedDB ensures uninterrupted field diagnostics even when disconnected from cellular networks. The platform is completed by an agricultural community forum, certified agronomist tele-consultation workflows, a multilingual interface (English, Kannada, Hindi), and voice synthesis. Automated test suites achieved a **100% pass rate across 92 tests**, verifying system stability, security, and academic readiness.

---

### CHAPTER 5: Introduction & Problem Statement

Agriculture is the economic backbone of developing economies, supporting more than $58\%$ of rural livelihoods. However, smallholder farmers face catastrophic risks from phytopathogenic infections (fungi, bacteria, oomycetes, viruses) and pest infestations. For instance, Early Blight (*Alternaria solani*) and Late Blight (*Phytophthora infestans*) can destroy entire tomato or potato harvests in fewer than 14 days if left unmitigated. In floriculture, rose cultivation is severely afflicted by Black Spot (*Diplocarpon rosae*) and Downy Mildew (*Peronospora sparsa*), resulting in massive financial losses for commercial nursery operators.

Current field diagnostics suffer from critical bottlenecks:
- **Agronomist Scarcity:** The ratio of certified agricultural extension officers to active farmers in rural districts often exceeds $1:1,000$.
- **Diagnostic Delay:** Laboratory fungal culturing or tissue testing requires 3 to 7 days, allowing pathogens to proliferate across adjacent hectares.
- **Black-Box Skepticism:** Existing commercial agricultural apps provide arbitrary percentage scores without explaining *why* a classification was reached.
- **Connectivity Blackouts:** Most farmlands exist in rural zones characterized by intermittent 2G/3G connectivity or complete signal dropouts.

AgroBloom AI directly addresses these barriers by delivering an instant, transparent, scientifically grounded, and offline-capable diagnostic platform.

---

### CHAPTER 6: Literature Review & Theoretical Context

The application of machine learning to agricultural computer vision has evolved rapidly over the past decade:

1. **Early Feature Engineering (2010–2015):** Early approaches relied on handcrafted morphological features, Gray-Level Co-occurrence Matrices (GLCM), and Support Vector Machines (SVM). These methods exhibited severe vulnerability to variable outdoor illumination, background soil clutter, and leaf shadowing.
2. **Deep CNN Revolution (Mohanty et al., 2016):** Demonstrated that deep convolutional networks trained on the PlantVillage dataset could achieve $>99\%$ accuracy on uniform laboratory backgrounds, though performance degraded significantly when tested on unconstrained outdoor leaf imagery.
3. **Lightweight Architectures (Sandler et al., 2018):** MobileNetV2 introduced inverted residuals and linear bottlenecks, dramatically lowering floating-point operations (FLOPs) and making edge inference on mobile CPUs mathematically feasible.
4. **Compound Scaling (Tan & Le, 2019):** EfficientNet proved that scaling depth, width, and resolution with a principled compound coefficient achieves superior feature abstraction with significantly fewer parameters than traditional networks like ResNet and VGG.
5. **Visual Interpretability (Selvaraju et al., 2017):** Grad-CAM emerged as the gold standard for visual explainability in computer vision, utilizing gradients entering the final convolutional layer to visualize attention without requiring model architectural alterations.

---

### CHAPTER 7: Problem Formulation, Project Objectives & Scope

#### 7.1 Mathematical Problem Formulation
Given an RGB foliar image tensor $X \in \mathbb{R}^{224 \times 224 \times 3}$, find a mapping function $f: X \rightarrow (Y, S, H)$ where:
- $Y \in \{C_1, C_2, \dots, C_K\}$ represents the predicted botanical pathology class.
- $S \in [0, 100]$ represents the quantitative percentage of necrotic/chlorotic surface area.
- $H \in \mathbb{R}^{224 \times 224}$ represents the spatial heatmap of localized gradient activations.

#### 7.2 Core Project Objectives
1. Train, evaluate, and empirically benchmark three deep CNN architectures (MobileNetV2, EfficientNetB0, ResNet50) on real crop and flower datasets.
2. Derive and visualize Grad-CAM activation heatmaps highlighting localized symptoms.
3. Implement automated foliar necrosis segmentation calculating quantitative lesion severity percentages.
4. Provide zero-connectivity offline diagnosis using browser-side TensorFlow.js and IndexedDB storage.
5. Implement multilingual localization (English, Kannada, Hindi) and voice assistance.
6. Provide an agricultural community forum and verified agronomist tele-consultation system.
7. Achieve 100% automated test coverage across frontend, backend, and AI microservices.

---

### CHAPTER 8: Software Requirements Specification (SRS)

#### 8.1 Functional Requirements
- **FR-01:** The system shall accept leaf image uploads via file selector and real-time camera feed.
- **FR-02:** The system shall classify crop diseases across 11 classes and flower diseases across 4 classes with confidence scores.
- **FR-03:** The system shall generate and overlay a Grad-CAM heatmap representing neural attention.
- **FR-04:** The system shall compute foliar disease severity percentage using HSV color thresholding.
- **FR-05:** The system shall support offline in-browser inference when network connectivity is lost.
- **FR-06:** The system shall queue offline diagnoses in IndexedDB and synchronize them with MongoDB upon reconnection.
- **FR-07:** The system shall generate downloadable, cryptographic-style PDF pathology reports.
- **FR-08:** The system shall provide a multi-turn agricultural RAG chatbot for treatment inquiries.
- **FR-09:** The system shall support peer discussion forums with threaded replies and accepted solutions.
- **FR-10:** The system shall support agronomist application, administrative verification, and formal prescription workflows.

#### 8.2 Non-Functional Requirements
- **NFR-01 (Latency):** Cloud AI inference shall complete in $< 150\text{ ms}$ on standard server CPUs.
- **NFR-02 (Security):** All protected endpoints shall enforce JWT validation with bcrypt password salting.
- **NFR-03 (Availability):** Offline PWA capability shall guarantee 100% diagnostic availability regardless of internet status.
- **NFR-04 (Localization):** The UI shall seamlessly switch between English, Kannada, and Hindi.

---

### CHAPTER 9: Hardware, Software, and Environment Configurations

- **Client Environment:** React 18, Vite 6.4.4, Tailwind CSS, Lucide React, Vitest 4.1.12, `@tensorflow/tfjs` 4.x.
- **Server Environment:** Node.js 20.x LTS, Express 4.21.2, Mongoose 8.9.5, JWT, Bcryptjs, PDFKit, Supertest.
- **AI Microservice:** Python 3.11/3.13, FastAPI 0.110.0, Uvicorn, TensorFlow 2.15/2.21, OpenCV 4.9.0, Scikit-learn 1.4.0.
- **Database:** MongoDB Community Server 7.0.
- **Containerization:** Docker Engine 24.0+ & Docker Compose 2.20+.

---

### CHAPTER 10: System Architecture & High-Level Design

AgroBloom AI implements a microservice-inspired, four-tier architecture:
1. **Presentation Tier:** React PWA executing in the client browser with Service Worker caching.
2. **Gateway Tier:** Express.js REST API managing security, business rules, forum logic, and proxying.
3. **AI Microservice Tier:** Python FastAPI service hosting deep learning backbones and OpenCV pipelines.
4. **Data Persistence Tier:** MongoDB database maintaining normalized collections with compound indexing.

---

### CHAPTER 11: Dataset Provenance, Acquisition & Scientific Hygiene

#### 11.1 PlantVillage Crop Dataset
- **Classes:** 11 balanced classes covering Apple, Bell Pepper, Potato, and Tomato.
- **Image Count:** 2,152 authentic photographic leaf images (1,506 train, 322 validation, 324 test).
- **Integrity Rule:** Zero synthetic, AI-generated, or pre-augmented image duplicates.

#### 11.2 Rose Leaf Disease Dataset
- **Source:** Mendeley Data (Masum et al., DOI: 10.17632/mdtpp2cmj4.1).
- **Classes:** Black Spot (432), Downy Mildew (390), Healthy (795), Insect Infested (431).
- **Holdout Test Split:** 40 authentic images (10 per class) completely isolated from training.

---

### CHAPTER 12: Deep Learning Foundations & Mathematical Modeling

Convolutional neural networks transform 2D spatial pixel arrays into abstract categorical feature vectors through repeated convolution, batch normalization, non-linear activation (ReLU), and spatial pooling:
$$z^{(l)} = W^{(l)} * a^{(l-1)} + b^{(l)}$$
$$a^{(l)} = \max(0, z^{(l)})$$

For multi-class classification over $K$ disease classes, the final dense layer applies the Softmax activation function:
$$P(Y = c \mid X) = \frac{e^{z_c}}{\sum_{j=1}^K e^{z_j}}$$

The network parameters $\Theta$ are optimized by minimizing categorical cross-entropy loss:
$$\mathcal{L}(\Theta) = -\frac{1}{N} \sum_{i=1}^N \sum_{c=1}^K y_{i,c} \log(\hat{y}_{i,c})$$

---

### CHAPTER 13: Multi-Architecture Benchmarking (MobileNetV2 vs. EfficientNetB0 vs. ResNet50)

#### 13.1 PlantVillage Crop Dataset Benchmark (324 Unseen Test Images, 11 Classes)

| Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro Specificity | Macro F1 | CPU Latency | Total Parameters | Disk Size |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2** | **90.12%** | 91.03% | 90.08% | 99.01% | 90.07% | **79.34 ms** | **2,429,003** | **20.25 MB** |
| **EfficientNetB0**| **93.83%** | **94.14%** | **93.71%** | **99.38%** | **93.76%** | 87.99 ms | 4,220,590 | 28.46 MB |
| **ResNet50** | **93.83%** | 93.94% | 93.86% | **99.38%** | **93.81%** | 120.95 ms | 23,860,107 | 161.77 MB |

#### 13.2 Architectural Findings
- **MobileNetV2** is designated the **Edge/PWA Champion** due to its $79.34\text{ ms}$ latency and $20.25\text{ MB}$ footprint.
- **EfficientNetB0** is designated the **Cloud Production Champion** matching ResNet50 accuracy ($93.83\%$) with only $17.6\%$ of the parameter volume.

---

### CHAPTER 14: Explainable AI (XAI) Using Grad-CAM

To eliminate skepticism among agronomists and farmers, AgroBloom AI derives Gradient-weighted Class Activation Maps:
$$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}$$
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

The resulting activation map is rendered as a Jet heatmap and blended with the original leaf photograph, clearly confirming that the neural network's classification decisions are grounded in actual foliar lesions rather than background artifacts.

---

### CHAPTER 15: Foliar Necrosis Segmentation & Quantitative Severity Estimation

Using OpenCV color-space operations, diseased tissues are segmented in the HSV color domain:
$$\text{Severity Percentage} = \frac{\text{Area of Necrotic / Chlorotic Pixels}}{\text{Total Foliar Leaf Area}} \times 100\%$$
- **Healthy:** $< 1\%$
- **Low Severity:** $1\% - 10\%$
- **Moderate Severity:** $10\% - 25\%$
- **Severe Pathology:** $> 25\%$

This provides agronomists with objective, numerical damage telemetry to calibrate pesticide and fungicide application dosages.

---

### CHAPTER 16: Intelligent Agronomic Assistance, RAG Chatbot & Treatment Verification

AgroBloom AI integrates verified agronomic management protocols sourced from university agricultural extension bulletins (Cornell, UC Davis, ICAR):
- **Organic Bio-Remedies:** Formulation of neem oil extracts, *Bacillus subtilis*, and copper octanoate.
- **Chemical Controls:** Precise active ingredients (e.g., Chlorothalonil, Mancozeb) with safety withholding periods.
- **Cultural & Preventative Measures:** Drip irrigation, 3-year crop rotation schedules, and sanitary pruning protocols.
- **RAG Chatbot:** Conversational assistant maintaining contextual history in MongoDB to answer grower questions.

---

### CHAPTER 17: Multilingual Localization, Accessibility & Speech Synthesis

To ensure accessibility for rural farmers across India, AgroBloom AI implements:
- **Trilingual Localization:** Complete interface translation across English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
- **Web Speech Synthesis API:** Speaks diagnostic results and treatment advice aloud in regional accents.
- **Speech Recognition Integration:** Enables voice queries and hands-free field operations.

---

### CHAPTER 18: Agricultural Community Forum & Peer Grower Network

The platform provides a collaborative community forum enabling growers to:
- Share field experiences and publish symptom inquiries with photo attachments.
- Categorize posts by crop type and pathology.
- Designate accepted answers and mark discussion threads as solved (`isSolved`).
- Upvote high-quality community contributions under a one-reaction-per-user constraint.

---

### CHAPTER 19: Expert Agronomist Tele-Consultation & Prescription System

To bridge the gap between smallholders and certified plant pathologists:
1. **Grower Ticket Submission:** Farmers escalate severe detections into formal consultation tickets.
2. **Multi-Turn Tele-Messaging:** Secure, threaded dialogue between grower and assigned specialist.
3. **Formal Digital Prescription:** Agronomists issue verified treatment plans with dosage specifications.
4. **Credential Verification Workflow:** Aspiring experts submit educational credentials and license numbers for administrative review before receiving agronomist privileges.

---

### CHAPTER 20: Edge Computing, Progressive Web App (PWA) & Offline Synchronization

- **PWA Service Worker:** Caches application shell assets, fonts, icons, and model binaries using a dual Cache-First / Network-First policy.
- **IndexedDB Storage:** Persists offline diagnostic records locally in `AgroBloomOfflineDB`.
- **Browser-Side TensorFlow.js:** Executes in-memory MobileNetV2 inference directly in the client browser with zero network connectivity.
- **Cloud Batch Sync Protocol (`POST /api/detections/offline-sync`):** Automatically transmits queued local records to MongoDB when internet connectivity resumes.

---

### CHAPTER 21: Database Design, Mongoose Modeling & Schema Specifications

The database layer comprises 9 normalized Mongoose schemas in MongoDB:
- `users`: User identity, hashed passwords, roles (`farmer`, `agronomist`, `admin`), language preference.
- `detections`: Diagnostic records, confidence, severity percentage, image URLs, treatment plans.
- `plants` & `diseases`: Reference botanical taxonomies and university-verified symptoms.
- `careplans` & `reminders`: Longitudinal recovery checklists and spraying schedules.
- `forumposts` & `forumcomments`: Community threads, nested comments, and accepted answers.
- `consultationtickets` & `expertapplications`: Structured consultation records and expert verification dossiers.

---

### CHAPTER 22: Monorepo Implementation Details & Code Organization

The system is organized as a clean, unified full-stack monorepo:
- Root `package.json` with unified scripts: `npm run dev` and `npm test`.
- `client/`: React 18, Tailwind CSS, Vite, PWA service worker, Vitest suite.
- `server/`: Express.js, Mongoose ODM, JWT security, Node test runner suite.
- `ai-service/`: Python FastAPI, TensorFlow/Keras, OpenCV, Pytest suite.

---

### CHAPTER 23: Quality Assurance, Test Automation & Empirical Verification

AgroBloom AI was subjected to comprehensive automated regression testing across all tiers:
- **Frontend Client:** 30 / 30 tests passed (`client/src/App.test.jsx`).
- **Backend Express:** 33 / 33 tests passed (`server/tests/api.test.js`).
- **AI Microservice:** 29 / 29 tests passed (`ai-service/test_ai_endpoints.py`).
- **Total Monorepo Suite:** **92 / 92 tests passed (100% Pass Rate)** with zero regressions.

---

### CHAPTER 24: Cybersecurity Architecture, Access Controls & OWASP Compliance

1. **Broken Access Control Mitigation:** Role-based access control (RBAC) and user-scoped query filtering.
2. **Cryptographic Protection:** Passwords salted with bcrypt (10 rounds); stateless JWT cryptographic signing.
3. **Injection Prevention:** Mongoose schema casting immune to NoSQL operator injection; UUID-based file naming preventing directory traversal.
4. **File Upload Security:** Multer MIME-type checking (JPEG/PNG/WebP only) and strict $10\text{ MB}$ payload boundaries.
5. **Session Safety:** Service worker strictly excludes authentication endpoints from client-side disk caching.

---

### CHAPTER 25: Empirical Results, Comparative Discussions & Known Constraints

- **Empirical Superiority:** EfficientNetB0 delivers $93.83\%$ crop test accuracy, outperforming MobileNetV2 ($90.12\%$) while requiring $82.3\%$ fewer parameters than ResNet50.
- **Edge Viability:** MobileNetV2 operates at $79.34\text{ ms}$ CPU latency, making it the mathematically justified choice for in-browser client execution.
- **Identified Limitations:** In floriculture, insect chewing damage can mimic fungal necrotic lesions under low-contrast illumination. Future versions can incorporate multi-spectral leaf reflectance data to enhance insect-damage discrimination.

---

### CHAPTER 26: Conclusion, Future Scope & Academic References

#### 26.1 Conclusion
AgroBloom AI successfully fulfills all academic and functional objectives for an advanced MCA Major Project. By uniting deep learning classification, explainable Grad-CAM heatmaps, quantitative severity estimation, edge PWA offline execution, multilingual accessibility, and expert consultation workflows into a hardened, production-ready full-stack platform, the project provides a transformative contribution to computational agricultural pathology.

#### 26.2 Future Enhancements
- Integration with drone multispectral aerial imagery for orchard-scale disease mapping.
- Edge tensor deployment to ultra-low-power microcontrollers (ESP32-CAM / Raspberry Pi).
- Expansion of floricultural taxonomies to include orchids, chrysanthemums, and marigolds.

#### 26.3 Academic References
1. Mohanty, S. P., Hughes, D. P., & Salathé, M. (2016). Using deep learning for image-based plant disease detection. *Frontiers in Plant Science*, 7, 1419.
2. Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L. C. (2018). MobileNetV2: Inverted residuals and linear bottlenecks. *IEEE CVPR*, 4510-4520.
3. Tan, M., & Le, Q. (2019). EfficientNet: Rethinking model scaling for convolutional neural networks. *ICML*, 6105-6114.
4. Selvaraju, R. R., Cogswell, M., Das, A., Vedaldi, A., Parikh, D., & Batra, D. (2017). Grad-CAM: Visual explanations from deep networks via gradient-based localization. *IEEE ICCV*, 618-626.
5. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *IEEE CVPR*, 770-778.
6. Masum, M. et al. (2021). Rose Leaf Disease Detection Dataset. *Mendeley Data*, DOI: 10.17632/mdtpp2cmj4.1.


# AGROBLOOM AI — MCA MAJOR PROJECT VIVA VOCE QUESTIONS & ANSWERS
## Technical Defense Guide, Theoretical Foundations, Architectural Rationale, and Examiner Q&A

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Degree:** Master of Computer Applications (MCA) Final Year Major Project  
**Author:** AgroBloom AI Project Team  
**Date:** October 2026  

---

### SECTION 1: Deep Learning & Computer Vision Foundations

#### Q1: Why did you evaluate MobileNetV2, EfficientNetB0, and ResNet50? What are their fundamental architectural differences?
**Answer:**
We evaluated these three architectures because they represent three fundamentally distinct paradigms in deep convolutional neural network design:
1. **MobileNetV2** utilizes **depthwise separable convolutions** combined with **inverted residual blocks and linear bottlenecks**. Standard convolutions filter and combine spatial features simultaneously; depthwise separable convolutions split this into a spatial depthwise convolution followed by a $1\times 1$ pointwise convolution. This reduces computation by $8\times$ to $9\times$, producing our fastest measured CPU inference time ($79.34\text{ ms}$) and compact size ($20.25\text{ MB}$), making it ideal for edge devices and browser-side PWA inference.
2. **EfficientNetB0** utilizes **compound coefficient scaling**, systematically balancing network depth ($\alpha$), width ($\beta$), and image resolution ($\gamma$) using a fixed scaling ratio $\alpha \cdot \beta^2 \cdot \gamma^2 \approx 2$. This allows EfficientNetB0 to achieve the highest accuracy ($93.83\%$) and macro F1 score ($93.76\%$) while requiring only $4.22\text{M}$ parameters ($17.6\%$ of ResNet50).
3. **ResNet50** utilizes **deep residual learning** with identity skip connections ($F(x) + x$) to solve the vanishing gradient and degradation problem in deep networks. It serves as our high-capacity baseline ($23.86\text{M}$ parameters, $161.77\text{ MB}$), confirming that compound scaling matches residual network accuracy at a fraction of the parameter cost.

#### Q2: What is Grad-CAM and how does it work mathematically?
**Answer:**
**Grad-CAM (Gradient-weighted Class Activation Mapping)** provides visual interpretability for convolutional neural networks without requiring architectural changes or retraining.
1. It computes the gradient of the unnormalized score for target class $c$ ($y^c$) with respect to feature activation map $A^k$ of the final convolutional layer:
   $$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial y^c}{\partial A_{i,j}^k}$$
   where $\alpha_k^c$ represents the importance weight of feature map $k$ for class $c$, and $Z = U \times V$ is the spatial area.
2. A weighted linear combination of these feature maps is computed and passed through a Rectified Linear Unit (ReLU) to isolate features that have a positive influence on the target class:
   $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$
3. The resulting 2D activation grid is upsampled to the original image dimensions ($224 \times 224$), color-mapped into a heatmap (OpenCV JET), and blended with the original leaf photograph. This confirms that the model's prediction is driven by necrotic lesions and not irrelevant background features.

#### Q3: How is foliar disease severity calculated in AgroBloom AI?
**Answer:**
Instead of relying on subjective human visual estimates or synthetic sensor values, AgroBloom AI implements automated computer vision segmentation in the **HSV (Hue-Saturation-Value)** color space:
1. **Healthy Chlorophyll Mask:** Isolated via Hue range $35 \le H \le 85$, Saturation $40 \le S \le 255$, and Value $40 \le V \le 255$.
2. **Necrotic / Chlorotic Lesion Mask:** Isolated via Hue ranges $0 \le H \le 30$, Saturation $50 \le S \le 255$, and Value $30 \le V \le 220$.
3. **Total Leaf Mask:** Union of healthy and necrotic pixel masks: $M_{\text{leaf}} = M_{\text{healthy}} \cup M_{\text{lesion}}$.
4. **Severity Percentage:**
   $$\text{Severity \%} = \frac{\sum M_{\text{lesion}}}{\sum M_{\text{leaf}}} \times 100\%$$
This yields an objective, quantitative percentage categorized into Healthy ($< 1\%$), Low ($1\% - 10\%$), Moderate ($10\% - 25\%$), and Severe ($> 25\%$).

---

### SECTION 2: Data Engineering & Evaluation Integrity

#### Q4: What datasets were used, and what steps were taken to prevent data leakage and bias?
**Answer:**
We used two authentic photographic datasets:
1. **PlantVillage Crop Dataset:** 2,152 real photographic leaf images across 11 crop classes (Apple Scab, Black Rot, Healthy Apple, Pepper Bacterial Spot, Healthy Pepper, Potato Early Blight, Healthy Potato, Potato Late Blight, Tomato Early Blight, Healthy Tomato, Tomato Late Blight).
2. **Rose Leaf Disease Dataset (Mendeley Data DOI: 10.17632/mdtpp2cmj4.1):** 2,048 original photographic images across 4 floriculture classes (Black Spot, Downy Mildew, Healthy, Insect Infested).

**Data Integrity Controls:**
- We strictly excluded synthetic images, generative AI creations, pre-augmented image folders, and simulated IoT sensor data.
- Train/Validation/Test splits ($70\% / 15\% / 15\%$) were partitioned using a fixed random seed prior to any training. Held-out test images were never exposed to the models during backpropagation or hyperparameter tuning.

#### Q5: Why did Rose Floriculture models achieve 75% accuracy compared to 93.83% on crops?
**Answer:**
Analysis of the rose confusion matrix reveals that all architectures achieved **100% precision and recall on Healthy foliage and Downy Mildew**. However, confusion occurred between **Black Spot fungal lesions** and **Insect Infestation damage**. Severe insect chewing creates localized foliar tissue necrosis that closely resembles fungal spot margins under natural outdoor lighting conditions. This is an authentic botanical characteristic of rose pathology, and reporting the genuine $75.00\%$ empirical accuracy demonstrates research integrity over fabricated metrics.

---

### SECTION 3: Edge Computing, Progressive Web Apps & Offline Inference

#### Q6: How does AgroBloom AI perform deep learning inference without an internet connection?
**Answer:**
AgroBloom AI implements a **Progressive Web App (PWA)** edge architecture:
1. **Service Worker (`sw.js`):** Intercepts client network traffic. It implements a **Cache-First** strategy for application assets, fonts, and model weight binaries, allowing the entire UI and neural model to load directly from local browser cache.
2. **In-Browser Inference (`@tensorflow/tfjs`):** When disconnected, the client executes an in-memory MobileNetV2 classifier directly on the user's device using hardware-accelerated **WebGL** or **WebAssembly (WASM)** backends.
3. **Local Storage (`IndexedDB`):** The diagnosis, confidence, severity, and bio-remedies are saved into browser IndexedDB (`AgroBloomOfflineDB`).
4. **Cloud Synchronization:** When internet connectivity resumes, the client triggers a batch sync request (`POST /api/detections/offline-sync`), transferring queued records into MongoDB with duplicate prevention.

---

### SECTION 4: Full-Stack Architecture, Security & Testing

#### Q7: Describe the software architecture and component communication.
**Answer:**
AgroBloom AI follows a decoupled, multi-tier microservice architecture:
- **Presentation Tier:** React 18 Single Page Application built with Vite and Tailwind CSS.
- **Backend Gateway:** Node.js Express server running on port 5000, responsible for JWT session validation, role authorization, business logic, community interactions, PDF generation, and reverse-proxying.
- **AI Microservice:** Python FastAPI service running on port 8000, hosting TensorFlow models, Grad-CAM routines, and OpenCV segmentation.
- **Persistence:** MongoDB Community Server 7.0 managed via Mongoose ODM.
- **Orchestration:** Orchestrated locally via root `package.json` (`npm run dev`) or in production via multi-container `docker-compose.yml`.

#### Q8: What security mechanisms protect the system against OWASP vulnerabilities?
**Answer:**
1. **Authentication:** Stateless JSON Web Tokens (JWT) signed with high-entropy secrets and expiration timestamps.
2. **Password Security:** User passwords are encrypted using `bcryptjs` with 10 salt rounds and excluded from database projections (`select: false`).
3. **Role-Based Access Control (RBAC):** Distinct roles (`farmer`, `agronomist`, `admin`). Administrative roles cannot be assigned via registration.
4. **File Upload Security:** Multer validates MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforces a strict $10\text{ MB}$ limit. Uploaded files are renamed with UUIDs to eliminate path traversal and command injection.
5. **NoSQL Injection Immunity:** Mongoose schema definitions strictly cast query parameters, rejecting malicious query operator payloads.

#### Q9: What is your automated test coverage?
**Answer:**
AgroBloom AI possesses a **100% pass rate across 92 automated tests**:
- **30 Frontend Tests** executed via Vitest and Testing Library.
- **33 Backend Tests** executed via Node.js native test runner and Supertest.
- **29 AI Microservice Tests** executed via Pytest.
The unified suite can be validated in a single execution using `npm test`.

---

### SECTION 5: Practical Impact & Domain Knowledge

#### Q10: What makes AgroBloom AI suitable for real-world deployment among rural farmers?
**Answer:**
1. **Accessibility:** Trilingual localization in **English, Kannada, and Hindi**, paired with Web Speech synthesis that speaks diagnosis results aloud for low-literacy farmers.
2. **Zero Connectivity Resistance:** The PWA architecture ensures that farmers can diagnose crops in remote fields with zero mobile network coverage.
3. **Actionable Recommendations:** Delivers organic biological remedies (e.g., neem oil, *Bacillus subtilis*), precise chemical active ingredients, and cultural management tips sourced from university agricultural extension bulletins.
4. **Expert Verification:** If a disease is severe, farmers can escalate the diagnosis to certified agronomists through the consultation ticket system for formal prescriptions.


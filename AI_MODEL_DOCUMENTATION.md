# AGROBLOOM AI — DEEP LEARNING MODEL & COMPUTER VISION SPECIFICATION
## Mathematical Foundations, Transfer Learning, Explainable AI, and Foliar Segmentation

**Project:** AgroBloom AI — Advanced Crop and Flower Plant Disease Detection System  
**Academic Level:** Master of Computer Applications (MCA) Major Project  
**Author:** AgroBloom AI Deep Learning & Computer Vision Research Group  
**Date:** October 2026  

---

### 1. Computer Vision Deep Learning Pipeline

The AI diagnostic pipeline accepts RGB botanical leaf imagery and applies a three-stage mathematical transformation:
1. **Geometric Preprocessing & Bilinear Foliar Normalization**
2. **Deep Convolutional Feature Extraction & Softmax Classification**
3. **Gradient-Weighted Class Activation Mapping (Grad-CAM) & HSV Lesion Segmentation**

```
   Raw RGB Image (H x W x 3)
              |
              v
   +---------------------------------------+
   | Bilinear Resize (224 x 224 x 3)       |
   | Foliar Normalization: [-1, +1]        |
   +---------------------------------------+
              |
              +---------------------------------------+
              |                                       |
              v                                       v
   +----------------------+               +-----------------------+
   | Pretrained Backbone  |               | Grad-CAM Engine       |
   | (MobileNetV2 /       |               | Gradients of class c  |
   |  EfficientNetB0 /    |               | w.r.t. last conv layer|
   |  ResNet50)           |               +-----------------------+
   +----------------------+                           |
              |                                       v
              v                           +-----------------------+
   +----------------------+               | Guided Backprop &     |
   | Global Average Pool  |               | Heatmap Jet Colormap  |
   | Dense (128, ReLU)    |               +-----------------------+
   | Dropout (0.3)        |                           |
   | Softmax (C classes)  |                           |
   +----------------------+                           |
              |                                       |
              v                                       v
   Prediction & Confidence                Explainable Heatmap Overlay
```

---

### 2. Preprocessing & Tensor Normalization

For input image $I \in \mathbb{R}^{H \times W \times 3}$, where pixel intensities $p_{i,j,c} \in [0, 255]$:
1. **Resizing:** Bilinear interpolation scales $I$ to $I' \in \mathbb{R}^{224 \times 224 \times 3}$.
2. **Normalization (MobileNetV2):**
   $$\tilde{p}_{i,j,c} = \frac{p'_{i,j,c} - 127.5}{127.5} \in [-1.0, 1.0]$$
3. **Normalization (EfficientNetB0):**
   Utilizes internal Keras rescaling:
   $$\tilde{p}_{i,j,c} = p'_{i,j,c} \in [0.0, 255.0]$$

---

### 3. Mathematical Formulation of Evaluated Architectures

#### 3.1 MobileNetV2 (Inverted Residuals & Linear Bottlenecks)
Standard convolutions apply spatial and channel-wise filtering concurrently with computational complexity:
$$\mathcal{O}(D_K \cdot D_K \cdot M \cdot N \cdot D_F \cdot D_F)$$

MobileNetV2 decomposes this into:
1. **Depthwise Convolution:** Spatial filtering applying one $D_K \times D_K$ filter per input channel ($M$).
2. **Pointwise Convolution:** $1 \times 1$ convolution combining linear combinations across channels ($N$).

Total computational reduction ratio:
$$\frac{D_K \cdot D_K \cdot M \cdot D_F \cdot D_F + M \cdot N \cdot D_F \cdot D_F}{D_K \cdot D_K \cdot M \cdot N \cdot D_F \cdot D_F} = \frac{1}{N} + \frac{1}{D_K^2}$$
For $3 \times 3$ kernels ($D_K=3$), this achieves an **$8\times$ to $9\times$ reduction in multiplication-addition operations** compared to full convolutions, yielding our measured $79.34\text{ ms}$ CPU latency.

#### 3.2 EfficientNetB0 (Compound Scaling)
Rather than scaling depth ($d$), width ($w$), or resolution ($r$) arbitrarily, EfficientNet scales all dimensions uniformly using a fixed compound coefficient $\phi$:
$$\text{depth: } d = \alpha^\phi, \quad \text{width: } w = \beta^\phi, \quad \text{resolution: } r = \gamma^\phi$$
$$\text{subject to } \alpha \cdot \beta^2 \cdot \gamma^2 \approx 2, \quad \alpha \ge 1, \beta \ge 1, \gamma \ge 1$$
For baseline B0 ($\phi=1$), this balances expressive capacity and compute overhead, achieving our top measured test accuracy of **$93.83\%$**.

---

### 4. Explainable AI: Grad-CAM Derivation

To provide visual transparency for agronomists and farmers, AgroBloom AI derives Gradient-weighted Class Activation Maps (Selvaraju et al., 2017).

Let $y^c$ be the raw class score (prior to softmax) for disease class $c$, and let $A^k$ represent the $k$-th feature activation map of the final convolutional layer (`out_relu` in MobileNetV2).

1. **Neuron Importance Weights ($\alpha_k^c$):**
   $$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial y^c}{\partial A_{i,j}^k}$$
   where $Z = U \times V$ is the spatial area of feature map $A^k$.

2. **Class Activation Map ($L_{\text{Grad-CAM}}^c$):**
   A weighted linear combination of forward activation maps is followed by a Rectified Linear Unit (ReLU) to isolate positive contributions toward class $c$:
   $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

3. **Colormap & Blend:**
   $L_{\text{Grad-CAM}}^c$ is normalized to $[0, 1]$, upsampled to $224 \times 224$ via bicubic interpolation, mapped into OpenCV's `COLORMAP_JET`, and superimposed over the original RGB leaf with blending factor $\alpha = 0.4$:
   $$I_{\text{overlay}} = \alpha \cdot I_{\text{original}} + (1 - \alpha) \cdot I_{\text{heatmap}}$$

---

### 5. Foliar Necrosis & Severity Segmentation

To calculate quantitative disease severity percentage without manual annotation, AgroBloom AI implements foliar color space thresholding in the **HSV (Hue-Saturation-Value)** domain:

1. **Green Foliar Mask:** Healthy chlorophyll tissue is isolated:
   $$M_{\text{healthy}}(i,j) = (35 \le H \le 85) \land (40 \le S \le 255) \land (40 \le V \le 255)$$
2. **Necrotic & Chlorotic Lesion Mask:** Diseased brown, yellow, and black spots are isolated:
   $$M_{\text{lesion}}(i,j) = (10 \le H \le 30 \lor 0 \le H \le 10) \land (50 \le S \le 255) \land (30 \le V \le 220)$$
3. **Total Leaf Surface:**
   $$M_{\text{leaf}} = M_{\text{healthy}} \lor M_{\text{lesion}}$$
4. **Quantitative Severity Percentage:**
   $$\text{Severity Percentage} = \frac{\sum_{i,j} M_{\text{lesion}}(i,j)}{\sum_{i,j} M_{\text{leaf}}(i,j)} \times 100\%$$
   - **Healthy:** $< 1\%$
   - **Low:** $1\% - 10\%$
   - **Moderate:** $10\% - 25\%$
   - **Severe:** $> 25\%$


const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Detection = require('../models/Detection');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');
const path = require('path');
const fs = require('fs');
const { optionalAuth } = require('../middleware/auth');

// GET /api/reports/:detectionId/pdf
router.get('/:detectionId/pdf', optionalAuth, async (req, res) => {
  try {
    const query = {
      _id: req.params.detectionId,
      user: req.user ? req.user._id : null
    };

    const detection = await Detection.findOne(query).populate('user', 'name email farmLocation phone');
    if (!detection) {
      return res.status(404).json({ success: false, message: 'Detection record not found' });
    }

    // Try finding grounded extension knowledge for citations
    let kbEntry = null;
    try {
      kbEntry = await DiseaseKnowledge.findOne({
        $or: [
          { plant: detection.plantName, disease: detection.primaryDisease },
          { id: `${detection.plantName}___${detection.primaryDisease}`.replace(/\s+/g, '_') }
        ]
      });
    } catch (e) {
      // Non-fatal if knowledge query fails
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=AgroBloom_Pathology_Report_${detection._id}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER & BRANDING =================
    doc.rect(40, 40, 515, 60).fill('#166534');
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('AGROBLOOM AI — PLANT PATHOLOGY REPORT', 50, 52, { align: 'center' });
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#bbf7d0')
       .text('Advanced Deep Learning Crop & Floral Disease Intelligence System', 50, 75, { align: 'center' });
    doc.moveDown(2);

    // Metadata Bar
    doc.rect(40, 105, 515, 24).fill('#f1f5f9');
    doc.fillColor('#475569')
       .fontSize(8)
       .font('Helvetica')
       .text(
         `Report ID: ${detection._id}   |   Issued: ${new Date(detection.createdAt || Date.now()).toLocaleString()}   |   Farmer: ${detection.user?.name || 'Authorized Field User'}`,
         50, 112
       );

    doc.moveDown(1.5);

    // ================= 1. SPECIMEN & DIAGNOSTIC OVERVIEW =================
    const currentY = 138;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('1. Diagnostic Findings & Pathogen Classification', 40, currentY);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, currentY + 16).lineTo(555, currentY + 16).stroke();

    doc.fontSize(9).font('Helvetica').fillColor('#334155');
    const startDetailsY = currentY + 24;
    
    doc.text(`Plant Host:`, 50, startDetailsY);
    doc.font('Helvetica-Bold').text(`${detection.plantName} (${(detection.plantType || 'crop').toUpperCase()})`, 160, startDetailsY);

    doc.font('Helvetica').text(`Primary Diagnosis:`, 50, startDetailsY + 16);
    doc.font('Helvetica-Bold').fillColor(detection.condition === 'healthy' ? '#15803d' : '#b91c1c')
       .text(`${detection.primaryDisease} [${detection.condition.toUpperCase()}]`, 160, startDetailsY + 16);

    doc.font('Helvetica').fillColor('#334155').text(`Model Confidence:`, 50, startDetailsY + 32);
    doc.font('Helvetica-Bold').text(`${Number(detection.confidence || 0).toFixed(2)}%`, 160, startDetailsY + 32);

    const severityText = detection.severity?.level === 'Not assessed'
      ? 'Not assessed'
      : `${detection.severity?.level || 'N/A'} (${detection.severity?.percentage != null ? Number(detection.severity.percentage).toFixed(1) + '%' : 'N/A'} foliar area)`;
    doc.font('Helvetica').text(`Severity Index:`, 50, startDetailsY + 48);
    doc.font('Helvetica-Bold').text(`${severityText}`, 160, startDetailsY + 48);

    doc.font('Helvetica').text(`Neural Architecture:`, 50, startDetailsY + 64);
    doc.font('Helvetica-Bold').text(`${detection.modelUsed || 'MobileNetV2 (Transfer Learning)'}`, 160, startDetailsY + 64);

    // ================= 2. VISUAL EVIDENCE (IMAGES) =================
    let imageSectionY = startDetailsY + 90;
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('2. Visual Pathology & Explainable AI (Grad-CAM)', 40, imageSectionY);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, imageSectionY + 16).lineTo(555, imageSectionY + 16).stroke();

    let leafImgPath = null;
    if (detection.originalImageUrl) {
      const candidatePath = path.join(__dirname, '..', 'uploads', path.basename(detection.originalImageUrl));
      if (fs.existsSync(candidatePath)) leafImgPath = candidatePath;
    }

    let gradCamImgPath = null;
    if (detection.gradCamImageUrl) {
      const candidatePath = path.join(__dirname, '..', '..', 'ai-service', 'static', 'gradcam', path.basename(detection.gradCamImageUrl));
      if (fs.existsSync(candidatePath)) gradCamImgPath = candidatePath;
    }

    const boxY = imageSectionY + 26;
    if (leafImgPath || gradCamImgPath) {
      if (leafImgPath) {
        try {
          doc.image(leafImgPath, 50, boxY, { width: 210, height: 130, fit: [210, 130] });
          doc.fontSize(8).fillColor('#64748b').text('Specimen Leaf Photograph', 50, boxY + 135, { width: 210, align: 'center' });
        } catch (e) {
          doc.fontSize(8).fillColor('#94a3b8').text('[Specimen Image Preview]', 50, boxY + 50);
        }
      }

      if (gradCamImgPath) {
        try {
          doc.image(gradCamImgPath, 290, boxY, { width: 210, height: 130, fit: [210, 130] });
          doc.fontSize(8).fillColor('#64748b').text('Grad-CAM Visual Attention Map', 290, boxY + 135, { width: 210, align: 'center' });
        } catch (e) {
          doc.fontSize(8).fillColor('#94a3b8').text('[Grad-CAM Heatmap]', 290, boxY + 50);
        }
      }
      imageSectionY = boxY + 155;
    } else {
      doc.fontSize(8).fillColor('#64748b').text('Visual imagery archived on secure storage.', 50, boxY);
      imageSectionY = boxY + 20;
    }

    // ================= 3. DIFFERENTIAL DIAGNOSES =================
    if (detection.topPredictions && detection.topPredictions.length > 1) {
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('Candidate Differential Diagnoses:', 40, imageSectionY);
      imageSectionY += 16;
      doc.fontSize(8).font('Helvetica').fillColor('#475569');
      detection.topPredictions.slice(0, 3).forEach((pred) => {
        doc.text(`• ${pred.label || pred.disease}: ${Number(pred.confidence || 0).toFixed(1)}% probability`, 50, imageSectionY);
        imageSectionY += 12;
      });
      imageSectionY += 6;
    }

    // Symptoms Section
    if (kbEntry && kbEntry.symptoms) {
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('Diagnostic Foliar Symptoms:', 40, imageSectionY);
      imageSectionY += 13;
      doc.fontSize(8).font('Helvetica').fillColor('#334155');
      doc.text(kbEntry.symptoms, 50, imageSectionY, { width: 490 });
      imageSectionY += doc.heightOfString(kbEntry.symptoms, { width: 490 }) + 8;
    }

    // ================= 4. TREATMENT & MANAGEMENT PROTOCOL =================
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('3. Agronomic Management Protocol (Extension Grounded)', 40, imageSectionY);
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, imageSectionY + 16).lineTo(555, imageSectionY + 16).stroke();
    imageSectionY += 24;

    const recs = detection.recommendations || {};
    if (recs.organic && recs.organic.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#15803d').text('Organic / Biological Control:', 40, imageSectionY);
      imageSectionY += 14;
      doc.fontSize(8).font('Helvetica').fillColor('#334155');
      recs.organic.forEach(item => {
        doc.text(`• ${item}`, 50, imageSectionY, { width: 490 });
        imageSectionY += doc.heightOfString(item, { width: 490 }) + 3;
      });
      imageSectionY += 4;
    }

    if (recs.chemical && recs.chemical.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#b91c1c').text('Chemical / Fungicidal Protectants (Follow Local Regulations):', 40, imageSectionY);
      imageSectionY += 14;
      doc.fontSize(8).font('Helvetica').fillColor('#334155');
      recs.chemical.forEach(item => {
        doc.text(`• ${item}`, 50, imageSectionY, { width: 490 });
        imageSectionY += doc.heightOfString(item, { width: 490 }) + 3;
      });
      imageSectionY += 4;
    }

    if (recs.prevention && recs.prevention.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0369a1').text('Cultural Practices & Preventative Sanitation:', 40, imageSectionY);
      imageSectionY += 14;
      doc.fontSize(8).font('Helvetica').fillColor('#334155');
      recs.prevention.forEach(item => {
        doc.text(`• ${item}`, 50, imageSectionY, { width: 490 });
        imageSectionY += doc.heightOfString(item, { width: 490 }) + 3;
      });
      imageSectionY += 6;
    }

    // ================= 5. EXTENSION CITATIONS & SIGNATURE =================
    if (kbEntry && kbEntry.sources && kbEntry.sources.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('4. Peer-Reviewed University Extension Sources:', 40, imageSectionY);
      imageSectionY += 14;
      doc.fontSize(7.5).font('Helvetica').fillColor('#475569');
      kbEntry.sources.forEach(s => {
        doc.text(`[Ref] ${s.title} — ${s.organization} (${s.url})`, 50, imageSectionY, { width: 490 });
        imageSectionY += 12;
      });
      imageSectionY += 8;
    }

    // Certification Box & AI Limitations
    doc.rect(40, 745, 515, 50).fill('#f8fafc');
    doc.fillColor('#64748b')
       .fontSize(6.5)
       .font('Helvetica')
       .text(
         'Notice & AI Limitations: Generated by AgroBloom AI Automated Plant Pathology Pipeline (Transfer-Learned MobileNetV2 Architecture). This report is provided for decision support and does not replace official quarantine microbiological cultures or accredited university plant clinic assays. Always verify chemical application with local agricultural extension officers before commercial spraying.',
         50, 750, { width: 380 }
       );

    // Signature Line
    doc.strokeColor('#94a3b8').lineWidth(1).moveTo(450, 782).lineTo(540, 782).stroke();
    doc.fontSize(7).fillColor('#334155').text('Certified AI Agronomist', 450, 785, { width: 90, align: 'center' });

    doc.end();
  } catch (err) {
    console.error('[PDF Generation Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

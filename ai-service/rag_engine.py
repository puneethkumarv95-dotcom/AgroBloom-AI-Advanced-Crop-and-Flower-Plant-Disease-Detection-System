"""
AgroBloom AI - Retrieval-Augmented Generation (RAG) & Grounded Pathology Assistant
Integrates verified university extension knowledge, intent classification,
context-aware retrieval, and optional external LLM generation.
"""

import os
import re
import logging
from typing import Dict, Any, List, Optional
from knowledge_base import PLANT_DISEASE_KB

logger = logging.getLogger("agrobloom_rag")

# Supported agricultural entities
PLANT_SPECIES_SYNONYMS = {
    "tomato": ["tomato", "tomatoes", "solanum lycopersicum", "ಟೊಮೆಟೊ", "टमाटर"],
    "potato": ["potato", "potatoes", "solanum tuberosum", "ಆಲೂಗಡ್ಡೆ", "आलू"],
    "apple": ["apple", "apples", "malus domestica", "ಸೇಬು", "सेब"],
    "pepper": ["pepper", "peppers", "bell pepper", "capsicum", "capsicum annuum", "ಕ್ಯಾಪ್ಸಿಕಂ", "शिमला मिर्च"],
    "rose": ["rose", "roses", "rosa", "ಗುಲಾಬಿ", "गुलाब"],
    "sunflower": ["sunflower", "sunflowers", "helianthus", "ಸೂರ್ಯಕಾಂತಿ", "सूरजमुखी"]
}

DISEASE_KEYWORDS = {
    "early blight": ["early blight", "alternaria", "target board", "concentric ring", "ಅಗೆತಿ"],
    "late blight": ["late blight", "phytophthora", "water-soaked", "downy", "पछेती"],
    "black spot": ["black spot", "diplocarpon", "fringed spot", "ಕಪ್ಪು ಚುಕ್ಕೆ", "काला धब्बा"],
    "scab": ["scab", "apple scab", "venturia", "ಸ್ಕ್ಯಾಬ್", "स्केब"],
    "black rot": ["black rot", "frogeye", "botryosphaeria", "ಕಪ್ಪು ಕೊಳೆತ", "काली सड़न"],
    "bacterial spot": ["bacterial spot", "xanthomonas", "water soaked", "ಚುಕ್ಕೆ ರೋಗ", "जीवाणु धब्बा"],
    "downy mildew": ["downy mildew", "peronospora", "downy", "ಡೌನಿ", "डाउनी"],
    "insect": ["insect", "aphid", "thrips", "spider mite", "sawfly", "pest", "bug", "ಕೀಟ", "कीट"],
    "nitrogen": ["nitrogen", "n deficiency", "pale yellow", "older leaves yellow", "ಸಾರಜನಕ", "नाइट्रोजन"],
    "phosphorus": ["phosphorus", "p deficiency", "purple leaves", "purpling", "ರಂಜಕ", "फॉस्फोरस"],
    "potassium": ["potassium", "k deficiency", "marginal scorch", "edge burn", "ಪೊಟ್ಯಾಶ್", "पोटेशियम"],
    "magnesium": ["magnesium", "mg deficiency", "interveinal chlorosis lower", "ಮೆಗ್ನೀಸಿಯಮ್", "मैग्नीशियम"],
    "iron": ["iron", "fe deficiency", "interveinal chlorosis upper", "iron chlorosis", "ಕಬ್ಬಿಣ", "आयरन", "लोहा"]
}

INTENT_KEYWORDS = {
    "symptoms": ["symptom", "look like", "sign", "spot", "yellow", "identify", "appearance", "ಲಕ್ಷಣ", "लक्षण"],
    "cause": ["cause", "why", "pathogen", "fungus", "bacteria", "reason", "ಹೇಗೆ ಬರುತ್ತದೆ", "कारण"],
    "organic": ["organic", "bio", "natural", "home remedy", "neem", "baking soda", "ಜೈವಿಕ", "जैविक", "घरेलू"],
    "chemical": ["chemical", "fungicide", "spray", "dose", "medicine", "mancozeb", "ಔಷಧಿ", "दवा", "कीटनाशक"],
    "prevention": ["prevent", "avoid", "stop", "protect", "ತಡೆಗಟ್ಟುವಿಕೆ", "रोकथाम", "बचाव"],
    "schedule": ["how often", "schedule", "interval", "when to check", "days", "ಸಮಯ", "समय"]
}

def identify_plant_entity(text: str) -> Optional[str]:
    text_lower = text.lower()
    for plant, aliases in PLANT_SPECIES_SYNONYMS.items():
        if any(alias in text_lower for alias in aliases):
            return plant
    return None

def retrieve_grounded_entry(query: str, context: Optional[Dict[str, Any]] = None) -> Optional[tuple]:
    """
    RAG retriever: Matches user query and optional context against PLANT_DISEASE_KB.
    Returns (class_name, entry_data, confidence_score).
    """
    query_lower = query.lower()
    
    # 1. Check if context provides explicit plant or prediction
    context_plant = None
    context_disease = None
    if context:
        if context.get("selectedPlant"):
            context_plant = str(context["selectedPlant"]).lower()
        if context.get("prediction"):
            context_disease = str(context["prediction"]).lower()
        if context.get("className") and context["className"] in PLANT_DISEASE_KB:
            return context["className"], PLANT_DISEASE_KB[context["className"]], 0.95

    # 2. Extract entities from query
    detected_plant = identify_plant_entity(query_lower) or context_plant

    # Score each knowledge base entry
    best_entry = None
    best_score = 0.0

    for class_name, details in PLANT_DISEASE_KB.items():
        score = 0.0
        kb_plant = details["plant"].lower()
        kb_disease = details["disease"].lower()
        kb_symptoms = details["symptoms"].lower()
        kb_pathogen = details["causalAgent"].lower()

        # Plant match boost
        if detected_plant:
            if detected_plant in kb_plant or (detected_plant == "pepper" and "pepper" in kb_plant):
                score += 3.0
            else:
                score -= 1.5

        # Disease match boost
        for disease_key, keywords in DISEASE_KEYWORDS.items():
            if any(kw in query_lower for kw in keywords):
                if disease_key in kb_disease or disease_key in class_name.lower():
                    score += 5.0

        # Direct disease name match
        if kb_disease in query_lower:
            score += 6.0

        # Symptom/pathogen tokens
        query_words = re.findall(r"\w+", query_lower)
        for w in query_words:
            if len(w) > 3:
                if w in kb_symptoms:
                    score += 0.5
                if w in kb_pathogen:
                    score += 1.0

        if score > best_score:
            best_score = score
            best_entry = (class_name, details, score)

    # Minimum threshold for valid grounded retrieval
    if best_entry and best_entry[2] >= 2.0:
        return best_entry[0], best_entry[1], best_entry[2]

    # If context provided a valid plant, fallback to healthy or first entry of that plant
    if detected_plant:
        for class_name, details in PLANT_DISEASE_KB.items():
            if detected_plant in details["plant"].lower():
                return class_name, details, 1.0

    return None

def detect_intents(query: str) -> List[str]:
    query_lower = query.lower()
    intents = []
    for intent, kws in INTENT_KEYWORDS.items():
        if any(kw in query_lower for kw in kws):
            intents.append(intent)
    return intents or ["general"]

def format_extension_reply(
    details: Dict[str, Any],
    intents: List[str],
    language: str = "en"
) -> str:
    """Formats grounded, verified university extension guidance based on intent."""
    plant = details["plant"]
    disease = details["disease"]
    pathogen = details["causalAgent"]
    risk = details.get("severityRisk", "Moderate")

    # Handle Kannada & Hindi localized summary if requested
    if language in ("kn", "hi") and language in details:
        loc = details[language]
        return (
            f"🌿 {plant} - {loc['disease']}\n\n"
            f"📌 ವಿವರಣೆ: {loc['summary']}\n\n"
            f"💊 ಪರಿಹಾರ: {loc['cure']}\n\n"
            f"🔍 ಕಾರಣ: {pathogen}\n"
            f"⚠️ ಗಂಭೀರತೆ: {risk}"
            if language == "kn" else
            f"🌿 {plant} - {loc['disease']}\n\n"
            f"📌 विवरण: {loc['summary']}\n\n"
            f"💊 उपचार: {loc['cure']}\n\n"
            f"🔍 कारक: {pathogen}\n"
            f"⚠️ गंभीरता: {risk}"
        )

    sections = [f"🌿 **{plant}: {disease}** ({pathogen})"]

    if details.get("condition") == "healthy":
        sections.append(f"• **Status:** Optimal vegetative health. No pathogens or active lesions observed.")
        sections.append(f"• **Maintenance:** {' '.join(details['recommendations']['organic'])}")
        sections.append(f"• **Observation:** {details.get('observationInterval', 'Scout foliage weekly.')}")
        return "\n\n".join(sections)

    # Build sections according to detected intents
    if "symptoms" in intents or "general" in intents:
        sections.append(f"🔍 **Key Foliar Symptoms:**\n{details['symptoms']}")

    if "cause" in intents or "general" in intents:
        causes = details.get("possibleCauses", pathogen)
        cond = details.get("conditions", "High humidity and surface moisture.")
        sections.append(f"🔬 **Etiology & Favorable Conditions:**\n{causes}\n*Environmental Conditions:* {cond}")

    if "organic" in intents or "general" in intents:
        org = details["recommendations"].get("organic", [])
        if org:
            org_formatted = "\n".join(f"  • {item}" for item in org)
            sections.append(f"🌱 **Organic & Biological Management:**\n{org_formatted}")

    if "chemical" in intents or "general" in intents:
        chem = details["recommendations"].get("chemical", [])
        if chem:
            chem_formatted = "\n".join(f"  • {item}" for item in chem)
            sections.append(f"🧪 **Chemical / Registered Protectants (Caution: Follow local regulations):**\n{chem_formatted}")

    if "prevention" in intents or "cultural" in intents or "general" in intents:
        cult = details["recommendations"].get("cultural", [])
        prev = details["recommendations"].get("prevention", [])
        combined = cult + prev
        if combined:
            comb_formatted = "\n".join(f"  • {item}" for item in combined)
            sections.append(f"🛡️ **Cultural Practices & Prevention:**\n{comb_formatted}")

    if "schedule" in intents or "general" in intents:
        obs = details.get("observationInterval")
        if obs:
            sections.append(f"⏱️ **Monitoring Interval:** {obs}")

    consult = details.get("whenToConsultExpert")
    if consult:
        sections.append(f"⚠️ **When to Seek Expert Review:** {consult}")

    return "\n\n".join(sections)

async def query_llm_if_available(prompt: str, grounded_context: str) -> Optional[str]:
    """
    Attempts to augment grounded response using external LLM (Gemini or OpenAI)
    if API keys are configured. If not configured, gracefully returns None.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        return None

    system_instruction = (
        "You are AgroBloom AI, an agricultural plant pathology assistant. "
        "Strict Rule: Answer the user question STRICTLY using the verified facts provided below. "
        "Do NOT invent treatments, chemicals, or dosages not in the facts. "
        "Cite the sources provided. If the facts do not contain the answer, politely state that "
        "verified extension guidance is unavailable."
    )

    full_prompt = (
        f"{system_instruction}\n\n"
        f"VERIFIED EXTENSION FACTS:\n{grounded_context}\n\n"
        f"USER QUESTION: {prompt}\n\n"
        f"ANSWER:"
    )

    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning("Gemini LLM query failed, falling back to verified retrieval: %s", e)

    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Context:\n{grounded_context}\n\nQuestion: {prompt}"}
                ],
                max_tokens=600,
                temperature=0.2
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            logger.warning("OpenAI LLM query failed, falling back to verified retrieval: %s", e)

    return None

async def execute_rag_pipeline(
    message: str,
    language: str = "en",
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Full RAG execution:
    1. Retrieve grounded entry
    2. Check confidence & detect intent
    3. Generate grounded answer (via LLM if key present, else verified extension mode)
    4. Return verified sources and uncertainty flags
    """
    query = message.strip()
    if not query:
        return {
            "success": False,
            "mode": "verified_knowledge_retrieval",
            "reply": "Please provide a plant or disease query.",
            "sources": [],
            "groundedData": None,
            "isUncertain": True
        }

    retrieval = retrieve_grounded_entry(query, context)

    # If completely out of scope
    if not retrieval:
        fallback_msg = (
            "AgroBloom AI currently specializes in verified foliar pathology for "
            "Tomato, Potato, Bell Pepper, Apple, and Rose crops, as well as plant nutrient deficiencies. "
            "Reliable verified extension guidance is unavailable for this specific query. "
            "We recommend consulting a local agricultural extension office or certified plant pathologist."
        )
        if language == "kn":
            fallback_msg = (
                "ಅಗ್ರೋಬ್ಲೂಮ್ ಎಐ ಪ್ರಸ್ತುತ ಟೊಮೆಟೊ, ಆಲೂಗಡ್ಡೆ, ಕ್ಯಾಪ್ಸಿಕಂ, ಸೇಬು ಮತ್ತು ಗುಲಾಬಿ ಬೆಳೆಗಳ ರೋಗಗಳು ಹಾಗೂ ಪೋಷಕಾಂಶಗಳ ಕೊರತೆಯನ್ನು ಗುರುತಿಸುತ್ತದೆ. "
                "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಸ್ತರಣಾಧಿಕಾರಿಗಳನ್ನು ಅಥವಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ."
            )
        elif language == "hi":
            fallback_msg = (
                "एग्रोब्लूम एआई वर्तमान में टमाटर, आलू, शिमला मिर्च, सेब और गुलाब की फसलों के रोगों तथा पोषक तत्वों की कमी की पहचान करता है। "
                "इस विशिष्ट प्रश्न के लिए प्रमाणित कृषि मार्गदर्शन उपलब्ध नहीं है। कृपया स्थानीय कृषि विस्तार अधिकारी या प्रमाणित पादप रोग विशेषज्ञ से परामर्श लें।"
            )

        return {
            "success": True,
            "mode": "verified_knowledge_retrieval",
            "engine": "AgroBloom Agricultural Knowledge Base",
            "reply": fallback_msg,
            "sources": [],
            "groundedData": None,
            "isUncertain": True
        }

    class_name, details, score = retrieval
    intents = detect_intents(query)
    sources = details.get("sources", [])

    # Format base verified extension guidance
    base_reply = format_extension_reply(details, intents, language)

    # Check for LLM generation
    llm_reply = None
    if language == "en":
        grounded_context_str = (
            f"Plant: {details['plant']} ({details.get('plantSpecies', '')})\n"
            f"Disease: {details['disease']}\n"
            f"Pathogen: {details['causalAgent']}\n"
            f"Symptoms: {details['symptoms']}\n"
            f"Causes: {details.get('possibleCauses', '')}\n"
            f"Conditions: {details.get('conditions', '')}\n"
            f"Organic Management: {' '.join(details['recommendations'].get('organic', []))}\n"
            f"Chemical Management: {' '.join(details['recommendations'].get('chemical', []))}\n"
            f"Cultural & Prevention: {' '.join(details['recommendations'].get('cultural', []) + details['recommendations'].get('prevention', []))}\n"
            f"Observation Interval: {details.get('observationInterval', '')}\n"
            f"Expert Criteria: {details.get('whenToConsultExpert', '')}\n"
            f"Sources: {', '.join(s['title'] + ' (' + s['url'] + ')' for s in sources)}"
        )
        llm_reply = await query_llm_if_available(query, grounded_context_str)

    if llm_reply:
        mode = "llm_augmented"
        final_reply = llm_reply
        engine = "AgroBloom Grounded LLM + University Extension RAG"
    else:
        mode = "verified_knowledge_retrieval"
        final_reply = base_reply
        engine = "AgroBloom University Extension Knowledge Base (Source-Grounded Retrieval)"

    return {
        "success": True,
        "mode": mode,
        "engine": engine,
        "reply": final_reply,
        "sources": sources,
        "groundedData": {
            "className": class_name,
            "plant": details["plant"],
            "disease": details["disease"],
            "causalAgent": details["causalAgent"],
            "diseaseCategory": details.get("diseaseCategory", "fungal"),
            "severityRisk": details.get("severityRisk", "Moderate"),
            "observationInterval": details.get("observationInterval"),
            "whenToConsultExpert": details.get("whenToConsultExpert"),
            "lastReviewed": details.get("lastReviewed", "2026-03-20")
        },
        "isUncertain": False
    }


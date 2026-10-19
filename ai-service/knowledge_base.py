"""
AgroBloom AI - Verified Agricultural Pathology Knowledge Base
Contains peer-reviewed and university extension grounded pathology data for:
- PlantVillage Crops (Apple, Bell Pepper, Potato, Tomato)
- Mendeley Rose Foliar Pathology (Rose Black Spot, Downy Mildew, Healthy, Insect Infested)
- Plant Nutrient Deficiencies (Nitrogen, Phosphorus, Potassium, Magnesium, Iron)

Sources:
- University of California Statewide Integrated Pest Management Program (UC Davis IPM)
- Cornell Cooperative Extension (Vegetable MD Online & Fruit IPM)
- Penn State Extension (Department of Plant Pathology and Environmental Microbiology)
- University of Florida IFAS Extension (EDIS)
- Royal Horticultural Society (RHS Plant Pathology)
"""

PLANT_DISEASE_KB = {
    "Tomato___Early_blight": {
        "plant": "Tomato",
        "plantSpecies": "Solanum lycopersicum",
        "type": "crop",
        "disease": "Early Blight",
        "diseaseCategory": "fungal",
        "causalAgent": "Alternaria solani (Fungus)",
        "condition": "diseased",
        "symptoms": "Dark brown to black necrotic spots with characteristic concentric rings (target-board appearance), surrounded by yellow chlorotic halo on older basal leaves. Stems may develop dark sunken collar rot lesions.",
        "possibleCauses": "Overwintering fungal mycelium/conidia in solanaceous plant debris; rain splash transmission; warm humid microclimates.",
        "conditions": "Optimal pathogen germination at 24°C–29°C (75°F–84°F) with prolonged relative humidity (>90%) and free surface moisture for 4+ hours.",
        "severityRisk": "Moderate to High",
        "observationInterval": "Inspect lower canopy every 3–5 days during humid weather; scout twice weekly after precipitation.",
        "whenToConsultExpert": "Consult local extension if lesions advance past the lower third of the plant canopy or dark sunken lesions encircle main stems.",
        "recommendations": {
            "organic": [
                "Apply Bacillus subtilis (strain QST 713) bio-fungicide spray at 5g/L water.",
                "Spray cold-pressed pure neem oil extract (3000 ppm) every 7–10 days.",
                "Apply Copper Octanoate (copper soap) or fixed copper preventative spray."
            ],
            "chemical": [
                "Spray Chlorothalonil 75% WP @ 2.0g per liter of water as a multi-site protectant.",
                "Apply Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1.0ml/L at first appearance of target spots."
            ],
            "cultural": [
                "Prune and safely destroy lower diseased leaves (up to 30cm from soil) to prevent ground spore splash.",
                "Use drip irrigation; avoid overhead sprinkler watering that wets foliage.",
                "Stake and trellis tomato plants to ensure minimum 60cm spacing and ample airflow."
            ],
            "prevention": [
                "Practice a strict 3-year crop rotation avoiding Solanaceae (potatoes, eggplants, peppers).",
                "Apply heavy organic straw or black plastic mulch to form a barrier against soil-borne spores."
            ]
        },
        "sources": [
            {
                "title": "Tomato Early Blight Management Guidelines",
                "organization": "University of California Statewide Integrated Pest Management (UC Davis IPM)",
                "url": "https://ipm.ucanr.edu/agriculture/tomato/early-blight/"
            },
            {
                "title": "Alternaria solani in Solanaceous Crops",
                "organization": "Cornell Cooperative Extension Vegetable MD Online",
                "url": "https://vegetablemdonline.ppath.cornell.edu/factsheets/Tomato_EarlyBlt.htm"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಟೊಮೆಟೊ ಮುಂಚಿನ ರೋಗ (Early Blight)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ಗಡಿಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
            "cure": "ಬೇವಿನ ಎಣ್ಣೆ (Neem Oil) ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ (Mancozeb) ಸಿಂಪಡಿಸಿ. ಹನಿ ನೀರಾವರಿ ಬಳಸಿ."
        },
        "hi": {
            "disease": "टमाटर का अगेती झुलसा (Early Blight)",
            "summary": "पत्तियों पर गोलाकार भूरे-काले छल्लेदार धब्बे बनते हैं जिनके चारों ओर पीला घेरा होता है।",
            "cure": "नीम के तेल का छिड़काव करें या मैंकोजेब 2.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।"
        }
    },
    "Tomato___Late_blight": {
        "plant": "Tomato",
        "plantSpecies": "Solanum lycopersicum",
        "type": "crop",
        "disease": "Late Blight",
        "diseaseCategory": "oomycete",
        "causalAgent": "Phytophthora infestans (Oomycete)",
        "condition": "diseased",
        "symptoms": "Water-soaked, irregular greasy dark green to dark brown lesions expanding rapidly across foliage and stems; delicate white cottony fungal-like sporulation on leaf undersides in humid conditions.",
        "possibleCauses": "Airborne sporangia carried on wind currents; infected seed tubers or cull piles; cool overcast wet weather.",
        "conditions": "Cool to moderate temperatures (15°C–22°C / 60°F–72°F) accompanied by high relative humidity (>90%) and rain/dew.",
        "severityRisk": "Critical - Rapid Total Crop Defoliation",
        "observationInterval": "Daily scouting during cool overcast foggy/rainy periods; inspect leaf undersides and stem forks.",
        "whenToConsultExpert": "Immediate notification to county extension or university plant clinic recommended upon confirmation due to regional epidemic potential.",
        "recommendations": {
            "organic": [
                "Apply preventative Copper Hydroxide (Bordeaux mixture 1%) thoroughly coating both upper and lower leaf surfaces.",
                "Spray certified compost tea enriched with Trichoderma harzianum as prophylactic soil wash."
            ],
            "chemical": [
                "Spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold MZ) @ 2.5g/L immediately.",
                "Apply Cymoxanil 8% + Mancozeb 64% WP @ 2.0g/L or Dimethomorph 50% WP @ 1.0g/L as emergency systemic control."
            ],
            "cultural": [
                "Promptly rogue out and bag severely infected plants; do not compost in home compost piles.",
                "Avoid late evening watering; ensure morning irrigation dries foliage within 2 hours."
            ],
            "prevention": [
                "Select certified resistant cultivars (e.g., Mountain Magic, Defiant PHR, Plum Regal).",
                "Eliminate volunteer potato plants and nightshade weeds within a 500m radius."
            ]
        },
        "sources": [
            {
                "title": "Late Blight of Tomato and Potato",
                "organization": "Penn State Extension Plant Pathology",
                "url": "https://extension.psu.edu/late-blight-of-tomato-and-potato"
            },
            {
                "title": "Phytophthora infestans Management",
                "organization": "UC Davis IPM Agriculture",
                "url": "https://ipm.ucanr.edu/agriculture/tomato/late-blight/"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಟೊಮೆಟೊ ತಡವಾದ ರೋಗ (Late Blight)",
            "summary": "ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡದ ಮೇಲೆ ಕಪ್ಪು ಬೂದು ಬಣ್ಣದ ಮಚ್ಚೆಗಳು ತೀವ್ರವಾಗಿ ಹರಡುತ್ತವೆ.",
            "cure": "ರಿಡೋಮಿಲ್ ಎಂಝಡ್ (Ridomil MZ) ಸಿಂಪಡಿಸಿ. ಸೋಂಕಿತ ಗಿಡಗಳನ್ನು ತಕ್ಷಣವೇ ನಾಶಮಾಡಿ."
        },
        "hi": {
            "disease": "टमाटर का पछेती झुलसा (Late Blight)",
            "summary": "पत्तियों पर गहरे पानीदार धब्बे और निचली सतह पर सफेद फफूंद दिखाई देती है।",
            "cure": "रिडोमिल एमजेड या बोर्डो मिश्रण का तत्काल छिड़काव करें। संक्रमित पौधों को नष्ट करें।"
        }
    },
    "Tomato___healthy": {
        "plant": "Tomato",
        "plantSpecies": "Solanum lycopersicum",
        "type": "crop",
        "disease": "Healthy Plant",
        "diseaseCategory": "healthy",
        "causalAgent": "None (Optimum Foliar Health)",
        "condition": "healthy",
        "symptoms": "Uniform deep emerald green leaves, intact cuticle, vibrant venation, no necrotic spots, chlorotic halos, or fungal growth.",
        "possibleCauses": "Balanced soil nutrition, optimal watering, disease-free seed stock, good sanitation.",
        "conditions": "Moderate temperature (20°C–28°C), 6–8 hours direct sunlight, good air circulation.",
        "severityRisk": "None",
        "observationInterval": "Routine weekly scouting for early signs of hornworms, whiteflies, or foliar spot onset.",
        "whenToConsultExpert": "No intervention required. Submit sample only if unexplained wilting or stunting occurs.",
        "recommendations": {
            "organic": [
                "Incorporate organic vermicompost (2kg/plant) at base during flowering.",
                "Apply prophylactic seaweed emulsion (2ml/L) monthly to support systemic resistance."
            ],
            "chemical": [
                "No chemical pesticides or fungicides required."
            ],
            "cultural": [
                "Maintain drip irrigation schedule delivering 25mm to 35mm water per week.",
                "Maintain suckering/pruning to keep foliage off bare ground."
            ],
            "prevention": [
                "Scout twice weekly for early hornworm or aphid infestation."
            ]
        },
        "sources": [
            {
                "title": "Growing Tomatoes in Home and Commercial Gardens",
                "organization": "University of Florida IFAS Extension",
                "url": "https://edis.ifas.ufl.edu/publication/VH028"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆರೋಗ್ಯಕರ ಟೊಮೆಟೊ ಸಸ್ಯ (Healthy)",
            "summary": "ಸಸ್ಯವು ಸಂಪೂರ್ಣವಾಗಿ ಆರೋಗ್ಯಕರವಾಗಿದ್ದು ಯಾವುದೇ ರೋಗ ಲಕ್ಷಣಗಳಿಲ್ಲ.",
            "cure": "ಯಾವುದೇ ಔಷಧಿಯ ಅಗತ್ಯವಿಲ್ಲ. ಸಾಮಾನ್ಯ ನೀರು ಮತ್ತು ಸಾವಯವ ಗೊಬ್ಬರ ನೀಡಿ."
        },
        "hi": {
            "disease": "स्वस्थ टमाटर पौधा (Healthy)",
            "summary": "पौधा पूरी तरह स्वस्थ है और पत्तियाँ हरी-भरी हैं।",
            "cure": "किसी कीटनाशक की आवश्यकता नहीं है। नियमित देखभाल जारी रखें।"
        }
    },
    "Apple___Apple_scab": {
        "plant": "Apple",
        "plantSpecies": "Malus domestica",
        "type": "crop",
        "disease": "Apple Scab",
        "diseaseCategory": "fungal",
        "causalAgent": "Venturia inaequalis (Fungus)",
        "condition": "diseased",
        "symptoms": "Olive-green velvety to sooty black circular lesions with feathered margins on upper leaf surfaces; affected leaves turn yellow and drop prematurely; fruit develops dark corky scabs.",
        "possibleCauses": "Overwintering pseudothecia in fallen leaf litter releasing ascospores during spring rain events.",
        "conditions": "Optimal infection at 15°C–21°C (60°F–70°F) requiring continuous leaf wetness between 6 and 9 hours.",
        "severityRisk": "Moderate",
        "observationInterval": "Scout weekly from green tip through fruit set; inspect cluster leaves close to spur wood.",
        "whenToConsultExpert": "Consult fruit extension pathologist if primary scab lesions exceed 10% before petal fall.",
        "recommendations": {
            "organic": [
                "Spray wettable sulfur or potassium bicarbonate at tight cluster and petal fall.",
                "Apply bio-fungicide Bacillus amyloliquefaciens prior to forecasted rain."
            ],
            "chemical": [
                "Apply Difenoconazole 25% EC @ 0.5ml/L or Captan 50% WP @ 2.5g/L.",
                "Spray Myclobutanil 20% WP @ 0.5g/L during early post-infection period."
            ],
            "cultural": [
                "Rake, chop, and shred fallen leaves in autumn or spray 5% urea to accelerate decomposition.",
                "Prune open-center canopy to accelerate leaf drying after spring rains."
            ],
            "prevention": [
                "Plant scab-resistant apple cultivars such as Liberty, Prima, GoldRush, or Enterprise."
            ]
        },
        "sources": [
            {
                "title": "Apple Scab Integrated Pest Management",
                "organization": "Cornell Cooperative Extension Fruit IPM",
                "url": "https://treefruit.wsu.edu/crop-protection/disease-management/apple-scab/"
            },
            {
                "title": "Venturia inaequalis Pathology and Control",
                "organization": "Penn State Extension Tree Fruit Production Guide",
                "url": "https://extension.psu.edu/apple-scab"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಸೇಬು ಸ್ಕ್ಯಾಬ್ ರೋಗ (Apple Scab)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು-ಹಸಿರು ವೆಲ್ವೆಟ್ ಮಾದರಿಯ ಕಲೆಗಳು ಉಂಟಾಗುತ್ತವೆ.",
            "cure": "ಕ್ಯಾಪ್ಟಾನ್ ಅಥವಾ ಡೈಫೆನೊಕೊನಾಜೋಲ್ ಸಿಂಪಡಿಸಿ. ಬಿದ್ದ ಎಲೆಗಳನ್ನು ತೋಟದಿಂದ ತೆಗೆಯಿರಿ."
        },
        "hi": {
            "disease": "सेब का स्केब (Apple Scab)",
            "summary": "पत्तियों और फलों पर जैतून-हरे से काले खुरदुरे धब्बे पड़ जाते हैं।",
            "cure": "कैप्टन या डाइफेनोकोनाजोल का छिड़काव करें। गिरे हुए पत्तों को नष्ट करें।"
        }
    },
    "Apple___Black_rot": {
        "plant": "Apple",
        "plantSpecies": "Malus domestica",
        "type": "crop",
        "disease": "Black Rot (Frogeye Leaf Spot)",
        "causalAgent": "Botryosphaeria obtusa (Fungus)",
        "condition": "diseased",
        "symptoms": "Frogeye foliar spots with small purple flecks expanding into tan circular centers with sharp purple borders; cankers on scaffold branches; mummified black fruit remaining attached to limbs.",
        "possibleCauses": "Fungal spore release from fire blight cankers, winter-damaged dead wood, and mummified fruit.",
        "conditions": "Temperature 20°C–27°C (68°F–80°F) with 9 hours of wetting required for foliar infection.",
        "severityRisk": "High",
        "observationInterval": "Inspect orchard trees every 7–10 days from bloom through midsummer, especially after hail.",
        "whenToConsultExpert": "Consult fruit specialist if active branch cankers threaten trunk or main scaffold limbs.",
        "recommendations": {
            "organic": [
                "Apply fixed copper sprays during dormant season and silver tip stage.",
                "Spray sulfur-based protectant fungicide every 10 days post-bloom."
            ],
            "chemical": [
                "Spray Thiophanate-methyl 70% WP @ 1.0g/L or Pyraclostrobin + Boscalid @ 1.5g/L.",
                "Apply Captan 50% WP @ 2.5g/L at 14-day intervals from petal fall."
            ],
            "cultural": [
                "Prune out dead wood, fire-blighted spurs, and cankers at least 15cm below visible margin.",
                "Remove and burn all mummified fruit from trees and orchard floor before bud break."
            ],
            "prevention": [
                "Avoid mechanical wounding of bark and protect against winter sunscald with white latex trunk paint."
            ]
        },
        "sources": [
            {
                "title": "Black Rot of Apple",
                "organization": "Penn State Extension Tree Fruit Disease Guide",
                "url": "https://extension.psu.edu/apple-disease-black-rot"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಸೇಬು ಕಪ್ಪು ಕೊಳೆತ (Black Rot)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು-ನೇರಳೆ ಬಣ್ಣದ ಕಲೆಗಳು ಮತ್ತು ಕೊಂಬೆಗಳ ಮೇಲೆ ಹುಣ್ಣುಗಳು ಉಂಟಾಗುತ್ತವೆ.",
            "cure": "ಥಿಯೋಫನೇಟ್-ಮಿಥೈಲ್ ಸಿಂಪಡಿಸಿ. ಒಣಗಿದ ಕೊಂಬೆಗಳನ್ನು ಕತ್ತರಿಸಿ ತೆಗೆಯಿರಿ."
        },
        "hi": {
            "disease": "सेब की काली सड़न (Black Rot)",
            "summary": "पत्तियों पर बैंगनी किनारों वाले धब्बे बनते हैं और तने पर घाव हो जाते हैं।",
            "cure": "थियोफैनेट-मिथाइल का छिड़काव करें और सूखी संक्रमित शाखाओं को छांट दें।"
        }
    },
    "Apple___healthy": {
        "plant": "Apple",
        "plantSpecies": "Malus domestica",
        "type": "crop",
        "disease": "Healthy Apple Tree",
        "diseaseCategory": "healthy",
        "causalAgent": "None",
        "condition": "healthy",
        "symptoms": "Vigorous serrated dark green leaves, supple shoot growth, firm fruit without spots or corking.",
        "possibleCauses": "Effective winter orchard sanitation, proper canopy thinning, balanced nitrogen feeding.",
        "conditions": "Full sunlight (minimum 6–8 hours), well-aerated sandy-loam soil with pH 6.0–7.0.",
        "severityRisk": "None",
        "observationInterval": "Scout bi-weekly for mite webbing, aphid colonies, and codling moth entry points.",
        "whenToConsultExpert": "No treatment needed.",
        "recommendations": {
            "organic": ["Maintain orchard sod or compost mulch 30cm away from trunk."],
            "chemical": ["No intervention required."],
            "cultural": ["Maintain annual dormant pruning for sunlight penetration."],
            "prevention": ["Install pheromone traps to monitor insect pest flight."]
        },
        "sources": [
            {
                "title": "Integrated Orchard Management for Commercial Apples",
                "organization": "Washington State University Extension",
                "url": "https://treefruit.wsu.edu/orchard-management/"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆರೋಗ್ಯಕರ ಸೇಬು ಸಸ್ಯ (Healthy)",
            "summary": "ಸಸ್ಯವು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ.",
            "cure": "ನಿಯಮಿತ ಪೋಷಣೆ ನೀಡಿ."
        },
        "hi": {
            "disease": "स्वस्थ सेब का पेड़ (Healthy)",
            "summary": "पत्तियां पूरी तरह स्वस्थ हैं।",
            "cure": "संतुलित पोषण और सिंचाई जारी रखें।"
        }
    },
    "Pepper__bell___Bacterial_spot": {
        "plant": "Bell Pepper",
        "plantSpecies": "Capsicum annuum",
        "type": "crop",
        "disease": "Bacterial Spot",
        "diseaseCategory": "bacterial",
        "causalAgent": "Xanthomonas campestris pv. vesicatoria (Bacterium)",
        "condition": "diseased",
        "symptoms": "Small, angular, water-soaked lesions on leaf undersides, turning brown-black with yellow chlorotic borders; leaves quickly turn yellow and drop, exposing developing pods to sunscald.",
        "possibleCauses": "Seed-borne bacterial pathogen; splashing rain, sprinkler irrigation, handling wet foliage.",
        "conditions": "Warm temperatures (24°C–30°C / 75°F–86°F) combined with rain storms and high relative humidity (>85%).",
        "severityRisk": "High",
        "observationInterval": "Scout twice weekly during monsoon/rainy weather; check lower interior canopy leaves.",
        "whenToConsultExpert": "Consult agricultural extension if leaf drop exceeds 20% or pod lesions appear on commercial crop.",
        "recommendations": {
            "organic": [
                "Spray Copper Oxychloride 50% WP @ 2.5g/L combined with Streptocycline 100ppm.",
                "Apply bio-bactericide Bacillus amyloliquefaciens (Double Nickel) on 5-day cycle."
            ],
            "chemical": [
                "Apply Copper Hydroxide + Mancozeb tank mix @ 2.0g/L each at 7-day intervals.",
                "Apply Actigard 50WG (Acibenzolar-S-methyl) to activate systemic acquired resistance (SAR)."
            ],
            "cultural": [
                "Never work or harvest pepper beds while leaves are wet with dew or rain.",
                "Disinfect harvesting shears and stakes with 10% bleach or quaternary ammonium solution."
            ],
            "prevention": [
                "Use hot-water treated or certified disease-free pepper seeds; purchase resistant varieties (races 1–10 resistant)."
            ]
        },
        "sources": [
            {
                "title": "Bacterial Spot of Pepper and Tomato",
                "organization": "University of Florida IFAS Extension EDIS",
                "url": "https://edis.ifas.ufl.edu/publication/VH052"
            },
            {
                "title": "Pepper Bacterial Spot Management",
                "organization": "UC Davis IPM Agriculture",
                "url": "https://ipm.ucanr.edu/agriculture/peppers/bacterial-spot/"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಕ್ಯಾಪ್ಸಿಕಂ ಬ್ಯಾಕ್ಟೀರಿಯಾದ ಚುಕ್ಕೆ ರೋಗ (Bacterial Spot)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ನೀರಿನಿಂದ ಕೂಡಿದ ಸಣ್ಣ ಕಂದು ಕಲೆಗಳು ಉಂಟಾಗಿ ಎಲೆಗಳು ಉದುರುತ್ತವೆ.",
            "cure": "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಮತ್ತು ಸ್ಟ್ರೆಪ್ಟೊಸೈಕ್ಲಿನ್ ಮಿಶ್ರಣ ಸಿಂಪಡಿಸಿ."
        },
        "hi": {
            "disease": "शिमला मिर्च का जीवाणु धब्बा (Bacterial Spot)",
            "summary": "पत्तियों पर छोटे कोणीय पानीदार भूरे धब्बे पड़ते हैं।",
            "cure": "कॉपर ऑक्सीक्लोराइड और स्ट्रेप्टोसाइक्लिन का छिड़काव करें।"
        }
    },
    "Pepper__bell___healthy": {
        "plant": "Bell Pepper",
        "plantSpecies": "Capsicum annuum",
        "type": "crop",
        "disease": "Healthy Bell Pepper",
        "diseaseCategory": "healthy",
        "causalAgent": "None",
        "condition": "healthy",
        "symptoms": "Lush glossy dark-green leaf lamina, strong apical growth, upright sturdy branching with prolific white star flowers.",
        "possibleCauses": "Appropriate soil temperature (>18°C), drip fertigation, well-draining soil.",
        "conditions": "Temperature 22°C–28°C, soil pH 6.2–6.8, consistent moisture without saturation.",
        "severityRisk": "None",
        "observationInterval": "Check every 5–7 days for thrips, mites, or blossom-end rot on expanding fruit.",
        "whenToConsultExpert": "No intervention required.",
        "recommendations": {
            "organic": ["Side-dress with compost and balanced fish-kelp fertilizer every 3 weeks."],
            "chemical": ["No chemicals needed."],
            "cultural": ["Maintain 45cm plant spacing and stake heavy fruiting branches."],
            "prevention": ["Maintain reflective silver mulch to repel aphid and thrips vectors."]
        },
        "sources": [
            {
                "title": "Bell Pepper Production Guidelines",
                "organization": "Penn State Extension Vegetable Production",
                "url": "https://extension.psu.edu/bell-pepper-production"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆರೋಗ್ಯಕರ ಕ್ಯಾಪ್ಸಿಕಂ ಸಸ್ಯ (Healthy)",
            "summary": "ಎಲೆಗಳು ಹೊಳಪಿನಿಂದ ಕೂಡಿದ್ದು ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರವಾಗಿವೆ.",
            "cure": "ಸಾವಯವ ನೀರಾವರಿ ಪದ್ಧತಿ ಮುಂದುವರಿಸಿ."
        },
        "hi": {
            "disease": "स्वस्थ शिमला मिर्च (Healthy)",
            "summary": "पौधा हरा-भरा और चमकदार है।",
            "cure": "संतुलित खाद और पानी दें।"
        }
    },
    "Potato___Early_blight": {
        "plant": "Potato",
        "plantSpecies": "Solanum tuberosum",
        "type": "crop",
        "disease": "Early Blight",
        "diseaseCategory": "fungal",
        "causalAgent": "Alternaria solani (Fungus)",
        "condition": "diseased",
        "symptoms": "Concentric ring target-like dark brown necrotic spots initiating on mature basal foliage; leaves yellow and senesce prematurely; lesions bounded by major veins.",
        "possibleCauses": "Soil-borne crop residues; plant stress from tuber bulking, low nitrogen, or drought.",
        "conditions": "Alternating wet and dry periods with temperatures around 24°C–29°C.",
        "severityRisk": "Moderate",
        "observationInterval": "Inspect lower canopy every 4–6 days starting at tuber initiation (flowering).",
        "whenToConsultExpert": "Consult agronomist if foliar defoliation exceeds 15% during early bulking stage.",
        "recommendations": {
            "organic": [
                "Apply copper octanoate (soap) or bio-fungicide Bacillus subtilis at 7-day intervals.",
                "Spray cold-pressed neem formulation 10,000 ppm @ 2ml/L."
            ],
            "chemical": [
                "Spray Mancozeb 75% WP @ 2.5g/L or Propineb 70% WP @ 2.0g/L.",
                "Apply Azoxystrobin 23% SC @ 1.0ml/L or Difenoconazole @ 0.5ml/L."
            ],
            "cultural": [
                "Hill up rows thoroughly with loose soil to prevent spore washing onto shallow tubers.",
                "Avoid overhead irrigation in late afternoon; allow foliage to dry rapidly."
            ],
            "prevention": [
                "Maintain optimum nitrogen and potassium nutrition to avoid early senescence.",
                "Practice 3-year crop rotation with non-solanaceous crops."
            ]
        },
        "sources": [
            {
                "title": "Early Blight of Potato",
                "organization": "University of Idaho Extension Potato Pathology",
                "url": "https://www.uidaho.edu/extension/ipm/crop-management/potato"
            },
            {
                "title": "Potato Early Blight Guidelines",
                "organization": "UC Davis IPM Agriculture",
                "url": "https://ipm.ucanr.edu/agriculture/potato/early-blight/"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆಲೂಗಡ್ಡೆ ಮುಂಚಿನ ರೋಗ (Early Blight)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ವಲಯಾಕಾರದ ಕಲೆಗಳು ಕಂಡುಬರುತ್ತವೆ.",
            "cure": "ಮ್ಯಾಂಕೋಜೆಬ್ 2.5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ."
        },
        "hi": {
            "disease": "आलू का अगेती झुलसा (Early Blight)",
            "summary": "निचली पत्तियों पर गोल छल्लेदार भूरे धब्बे दिखाई देते हैं।",
            "cure": "मैंकोजेब 2.5 ग्राम/लीटर का छिड़काव करें। पौधों पर मिट्टी चढ़ाएं।"
        }
    },
    "Potato___Late_blight": {
        "plant": "Potato",
        "plantSpecies": "Solanum tuberosum",
        "type": "crop",
        "disease": "Late Blight",
        "diseaseCategory": "oomycete",
        "causalAgent": "Phytophthora infestans (Oomycete)",
        "condition": "diseased",
        "symptoms": "Large, dark brown to purplish-black water-soaked lesions expanding rapidly; white fuzzy mold on leaf undersides in morning dew; entire vine collapses with pungent rot smell.",
        "possibleCauses": "Infected seed tubers; cull potato piles; windblown sporangia from neighboring infected fields.",
        "conditions": "Cool, damp weather with temperatures 10°C–21°C and relative humidity >90% for 8+ hours.",
        "severityRisk": "Critical Epidemic Hazard",
        "observationInterval": "Scout daily during prolonged wet, foggy, or rainy cool spells.",
        "whenToConsultExpert": "Immediate mandatory reporting to local agricultural department/extension officer.",
        "recommendations": {
            "organic": [
                "Apply preventative Copper Hydroxide (Bordeaux mixture 1%) thoroughly ahead of rainy weather.",
                "Incorporate bio-protectant Trichoderma viride into soil at planting."
            ],
            "chemical": [
                "Spray Dimethomorph 50% WP @ 1.0g/L + Mancozeb 75% WP @ 2.0g/L immediately.",
                "Apply Metalaxyl-M + Chlorothalonil or Mandipropamid 23.4% SC @ 1.0ml/L."
            ],
            "cultural": [
                "Desiccate or kill potato haulms 14 days prior to harvest to prevent tuber contact with live spores.",
                "Never harvest tubers from fields with active foliar late blight during wet conditions."
            ],
            "prevention": [
                "Plant only certified disease-tested seed tubers from reputable government/certified agencies.",
                "Eradicate cull piles and volunteer potato sprouts by deep burial or herbicide."
            ]
        },
        "sources": [
            {
                "title": "Potato Late Blight Management",
                "organization": "Michigan State University Extension Potato Diseases",
                "url": "https://www.canr.msu.edu/potato/diseases/"
            },
            {
                "title": "Phytophthora infestans on Potato",
                "organization": "CABI Digital Library Compendium",
                "url": "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.40970"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆಲೂಗಡ್ಡೆ ತಡವಾದ ರೋಗ (Late Blight)",
            "summary": "ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡ ಕಪ್ಪಾಗಿ ಕೊಳೆಯುತ್ತವೆ.",
            "cure": "ಡೈಮೆಥೋಮಾರ್ಫ್ ಅಥವಾ ಬೋರ್ಡೋ ಮಿಶ್ರಣ ಸಿಂಪಡಿಸಿ."
        },
        "hi": {
            "disease": "आलू का पछेती झुलसा (Late Blight)",
            "summary": "पत्तियां और तने तेजी से काले पड़कर सड़ने लगते हैं।",
            "cure": "डाइमेथोमॉर्फ या रिडोमिल का तुरंत छिड़काव करें।"
        }
    },
    "Potato___healthy": {
        "plant": "Potato",
        "plantSpecies": "Solanum tuberosum",
        "type": "crop",
        "disease": "Healthy Potato Plant",
        "diseaseCategory": "healthy",
        "causalAgent": "None",
        "condition": "healthy",
        "symptoms": "Vibrant composite dark-green leaves, robust upright haulms, intact margins, zero foliar water-soaking or necrotic lesions.",
        "possibleCauses": "Certified disease-free seed, balanced potash nutrition, well-draining mounded beds.",
        "conditions": "Daytime 18°C–24°C, night 12°C–16°C, loose sandy loam with pH 5.2–6.5.",
        "severityRisk": "None",
        "observationInterval": "Scout weekly for potato beetles, aphids, and early leaf spots.",
        "whenToConsultExpert": "No intervention required.",
        "recommendations": {
            "organic": ["Side-dress with potassium-rich wood ash or sulfate of potash at hilling."],
            "chemical": ["No intervention required."],
            "cultural": ["Maintain hilling to ensure tubers are shielded from direct sunlight (greening)."],
            "prevention": ["Practice 3-year crop rotation avoiding solanaceous crops."]
        },
        "sources": [
            {
                "title": "Potato Commercial Production Guide",
                "organization": "Cornell Cooperative Extension",
                "url": "https://cals.cornell.edu/crop-and-soil-sciences"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆರೋಗ್ಯಕರ ಆಲೂಗಡ್ಡೆ ಸಸ್ಯ (Healthy)",
            "summary": "ಸಸ್ಯವು ಉತ್ತಮ ಹಸಿರಿನಿಂದ ಕೂಡಿದೆ.",
            "cure": "ಸಾಮಾನ್ಯ ಆರೈಕೆ ಮುಂದುವರಿಸಿ."
        },
        "hi": {
            "disease": "स्वस्थ आलू का पौधा (Healthy)",
            "summary": "पत्तियां पूरी तरह स्वस्थ और हरी हैं।",
            "cure": "संतुलित सिंचाई और पोटाश युक्त खाद दें।"
        }
    },
    "Rose___Black_spot": {
        "plant": "Rose",
        "plantSpecies": "Rosa spp.",
        "type": "flower",
        "disease": "Rose Black Spot",
        "diseaseCategory": "fungal",
        "causalAgent": "Diplocarpon rosae (Fungus)",
        "condition": "diseased",
        "symptoms": "Circular black spots (2mm–12mm) with fringed, feathery margins on upper leaf surfaces; tissue surrounding spots turns yellow; severe premature defoliation starting from bottom branches.",
        "possibleCauses": "Water-splash dispersal of conidia from overwintering cane lesions or fallen leaves; wet leaf surfaces.",
        "conditions": "Temperature 20°C–27°C (68°F–80°F) requiring continuous leaf wetness for minimum 7 hours.",
        "severityRisk": "High (Floral Aesthetic Loss & Shrub Weakening)",
        "observationInterval": "Scout rose bushes every 5 days from spring bud burst through late autumn.",
        "whenToConsultExpert": "Consult local master gardener or rose society if defoliation exceeds 40% of canopy.",
        "recommendations": {
            "organic": [
                "Spray potassium bicarbonate (3g/L) mixed with horticultural oil.",
                "Apply cold-pressed pure neem oil (5ml/L) early in the morning every 7–10 days."
            ],
            "chemical": [
                "Apply Tebuconazole 25.9% EC @ 1.0ml/L or Myclobutanil 10% WP @ 1.0g/L.",
                "Spray Trifloxystrobin + Tebuconazole combination fungicide at 14-day intervals."
            ],
            "cultural": [
                "Rake and safely discard all fallen black-spotted rose leaves; do not compost.",
                "Water rose bases directly via drip or soaker hoses; keep foliage completely dry.",
                "Prune dense interior shoots to ensure ample sunlight and airflow."
            ],
            "prevention": [
                "Select resistant cultivars (e.g., Knock Out, Flower Carpet, Oso Easy series).",
                "Plant in locations receiving at least 6 hours of morning direct sunlight."
            ]
        },
        "sources": [
            {
                "title": "Rose Black Spot Management",
                "organization": "Royal Horticultural Society (RHS Plant Pathology)",
                "url": "https://www.rhs.org.uk/disease/rose-black-spot"
            },
            {
                "title": "Black Spot on Roses in the Landscape",
                "organization": "University of California Statewide IPM Program",
                "url": "https://ipm.ucanr.edu/PMG/GARDEN/PLANTS/DISEASES/roseblackspot.html"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಗುಲಾಬಿ ಕಪ್ಪು ಚುಕ್ಕೆ ರೋಗ (Black Spot)",
            "summary": "ಗುಲಾಬಿ ಎಲೆಗಳ ಮೇಲೆ ಕಪ್ಪು ವೃತ್ತಾಕಾರದ ಚುಕ್ಕೆಗಳು ಉಂಟಾಗಿ ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಉದುರುತ್ತವೆ.",
            "cure": "ಬೇವಿನ ಎಣ್ಣೆ ಅಥವಾ ಟೆಬುಕೊನಜೋಲ್ ಸಿಂಪಡಿಸಿ. ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ಬುಡಕ್ಕೆ ನೀರು ಹಾಕಿ."
        },
        "hi": {
            "disease": "गुलाब का काला धब्बा (Black Spot)",
            "summary": "पत्तियों पर काले गोल धब्बे बनते हैं और पत्तियां पीली होकर झड़ने लगती हैं।",
            "cure": "नीम तेल या टेबुकोनाजोल का छिड़काव करें। पत्तियों को गीला न करें, जड़ों में पानी दें।"
        }
    },
    "Rose___Downy_mildew": {
        "plant": "Rose",
        "plantSpecies": "Rosa spp.",
        "type": "flower",
        "disease": "Rose Downy Mildew",
        "diseaseCategory": "oomycete",
        "causalAgent": "Peronospora sparsa (Oomycete)",
        "condition": "diseased",
        "symptoms": "Purplish-red to dark brown angular lesions strictly bounded by leaf veins; rapid chlorosis and severe leaf drop within 48 hours; sparse purplish-gray downy mold on leaf undersides in humid air.",
        "possibleCauses": "High relative humidity in protected structures or dense gardens; infected nursery stock; cool humid nights.",
        "conditions": "Temperature 15°C–20°C (60°F–68°F) with relative humidity exceeding 85% for prolonged periods.",
        "severityRisk": "Critical (Rapid Crop Defoliation)",
        "observationInterval": "Daily scouting in early morning during cool overcast weather; check undersides of upper shoots.",
        "whenToConsultExpert": "Immediate diagnostic consultation advised if entire nursery benches or rose beds show sudden leaf drop.",
        "recommendations": {
            "organic": [
                "Apply Copper Octanoate (copper soap) bio-spray thoroughly covering leaf undersides.",
                "Spray Bacillus subtilis QST 713 bio-fungicide at 7-day intervals as protectant."
            ],
            "chemical": [
                "Apply Fosetyl-Al 80% WP @ 2.5g/L as systemic preventative.",
                "Spray Dimethomorph 50% WP @ 1.0g/L + Mancozeb 75% WP @ 2.0g/L immediately."
            ],
            "cultural": [
                "Immediately gather and burn fallen diseased leaves and purge symptomatic canes.",
                "Reduce greenhouse relative humidity below 80% with nocturnal exhaust venting.",
                "Ensure minimum 75cm spacing between shrubs to promote rapid air movement."
            ],
            "prevention": [
                "Quarantine newly purchased rose plants for 21 days before introducing to garden.",
                "Never use overhead irrigation late in the afternoon or evening."
            ]
        },
        "sources": [
            {
                "title": "Rose Downy Mildew Pathology and Control",
                "organization": "University of California Statewide IPM Program",
                "url": "https://ipm.ucanr.edu/PMG/GARDEN/PLANTS/DISEASES/rosedownymildew.html"
            },
            {
                "title": "Peronospora sparsa in Ornamental Roses",
                "organization": "Penn State Extension Plant Disease Factsheets",
                "url": "https://extension.psu.edu/rose-diseases"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಗುಲಾಬಿ ಡೌನಿ ಶಿಲೀಂಧ್ರ (Downy Mildew)",
            "summary": "ಎಲೆಗಳ ಮೇಲೆ ನೇರಳೆ-ಕಂದು ಬಣ್ಣದ ರೇಖಾತ್ಮಕ ಕಲೆಗಳು ಉಂಟಾಗಿ ಎಲೆಗಳು ವೇಗವಾಗಿ ಉದುರುತ್ತವೆ.",
            "cure": "ತಾಮ್ರದ ಶಿಲೀಂಧ್ರನಾಶಕ ಅಥವಾ ಮ್ಯಾಂಕೋಜೆಬ್ ಸಿಂಪಡಿಸಿ. ಎಲೆಗಳು ಒಣಗಿರಲು ತೇವಾಂಶ ಕಡಿಮೆ ಮಾಡಿ."
        },
        "hi": {
            "disease": "गुलाब का डाउनी मिल्ड्यू (Downy Mildew)",
            "summary": "पत्तियों पर नसों के बीच बैंगनी-भूरे कोणीय धब्बे बनते हैं और पत्तियां तेजी से गिरती हैं।",
            "cure": "कॉपर फफूंदनाशी या डाइमेथोमॉर्फ का छिड़काव करें। शाम को पानी देने से बचें।"
        }
    },
    "Rose___healthy": {
        "plant": "Rose",
        "plantSpecies": "Rosa spp.",
        "type": "flower",
        "disease": "Healthy Rose Bush",
        "diseaseCategory": "healthy",
        "causalAgent": "None",
        "condition": "healthy",
        "symptoms": "Glossy emerald foliage, firm robust canes, well-pigmented petals, zero fungal mycelium, leaf spotting, or insect distortion.",
        "possibleCauses": "Adequate sunlight, regular deadheading, well-draining organic soil, clean drip watering.",
        "conditions": "6+ hours direct sunlight daily, loamy soil with pH 6.0–6.5, good air circulation.",
        "severityRisk": "None",
        "observationInterval": "Inspect weekly for early aphid colonies on flower buds and tender shoots.",
        "whenToConsultExpert": "No treatment required.",
        "recommendations": {
            "organic": ["Top-dress with well-aerated vermicompost and bone meal monthly during bloom."],
            "chemical": ["No intervention required."],
            "cultural": ["Regularly deadhead spent blooms at a 45° angle above a five-leaflet leaf set."],
            "prevention": ["Maintain a 5cm layer of bark mulch keeping 7cm clear around the root crown."]
        },
        "sources": [
            {
                "title": "Rose Care and Cultural Recommendations",
                "organization": "Royal Horticultural Society (RHS Gardening)",
                "url": "https://www.rhs.org.uk/plants/roses/growing-guide"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಆರೋಗ್ಯಕರ ಗುಲಾಬಿ ಸಸ್ಯ (Healthy)",
            "summary": "ಗುಲಾಬಿ ಗಿಡವು ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರವಾಗಿದ್ದು ಹೂ ಬಿಡಲು ಸಿದ್ಧವಾಗಿದೆ.",
            "cure": "ಸಾಮಾನ್ಯ ಸಾವಯವ ಗೊಬ್ಬರ ನೀಡಿ."
        },
        "hi": {
            "disease": "स्वस्थ गुलाब (Healthy)",
            "summary": "पौधा चमकदार हरी पत्तियों के साथ पूरी तरह स्वस्थ है।",
            "cure": "नियमित रूप से सूखे फूल काटते रहें और जैविक खाद दें।"
        }
    },
    "Rose___Insect_infested": {
        "plant": "Rose",
        "plantSpecies": "Rosa spp.",
        "type": "flower",
        "disease": "Rose Insect Infestation",
        "diseaseCategory": "pest",
        "causalAgent": "Arthropod Pests (Aphids, Thrips, Spider Mites, Rose Sawfly Larvae)",
        "condition": "diseased",
        "symptoms": "Foliar stippling and bronzing from spider mites; curled young leaf terminals; windowpane skeletonization from sawfly larvae; sticky honeydew with sooty mold; deformed flower buds.",
        "possibleCauses": "Pest population blooms in dry warm weather; lack of natural insect predators; excessive nitrogen feeding.",
        "conditions": "Warm dry conditions (25°C–32°C) favoring rapid spider mite and thrips life cycles.",
        "severityRisk": "Moderate to High",
        "observationInterval": "Scout twice weekly; inspect tender new shoot tips and the undersides of mid-canopy leaves.",
        "whenToConsultExpert": "Consult extension entomologist if persistent thrips damage ruins blooms or systemic insecticides fail.",
        "recommendations": {
            "organic": [
                "Spray cold-pressed pure neem oil (3000 ppm) @ 5ml/L with potassium-based insecticidal soap.",
                "Introduce beneficial biological predators: Green lacewings (Chrysoperla carnea) or Ladybird beetles."
            ],
            "chemical": [
                "Spray Imidacloprid 17.8% SL @ 0.5ml/L for systemic sap-sucking pest suppression.",
                "Apply Spinosad 45% SC @ 0.4ml/L for thrips and sawfly leaf-skeletonizing larvae."
            ],
            "cultural": [
                "Use high-pressure water jets early in the morning to physically dislodge aphid colonies.",
                "Hang yellow sticky traps for aphids/whiteflies and blue traps for thrips around bushes."
            ],
            "prevention": [
                "Avoid high-nitrogen fertilizers that generate excess succulent growth attractant to aphids.",
                "Prune and safely destroy distorted terminal shoot tips during early infestation."
            ]
        },
        "sources": [
            {
                "title": "Rose Insects and Pests Management",
                "organization": "University of California Statewide IPM Program",
                "url": "https://ipm.ucanr.edu/PMG/GARDEN/PLANTS/DISEASES/rosepests.html"
            },
            {
                "title": "Controlling Pests on Garden Roses",
                "organization": "Royal Horticultural Society (RHS Advice)",
                "url": "https://www.rhs.org.uk/biodiversity/rose-aphid"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಗುಲಾಬಿ ಕೀಟ ಬಾಧೆ (Insect Infested)",
            "summary": "ಹೇನುಗಳು ಮತ್ತು ನುಸಿ ಕೀಟಗಳು ಎಲೆಯ ರಸವನ್ನು ಹೀರಿ ಎಲೆಗಳನ್ನು ಸುರುಟಾಗಿಸುತ್ತವೆ.",
            "cure": "ಬೇವಿನ ಎಣ್ಣೆ ಅಥವಾ ಇಮಿಡಾಕ್ಲೋಪ್ರಿಡ್ ಸಿಂಪಡಿಸಿ. ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ."
        },
        "hi": {
            "disease": "गुलाब का कीट प्रकोप (Insect Infested)",
            "summary": "माहू, थ्रिप्स और कीट पत्तियों का रस चूसकर उन्हें विकृत और पीला कर देते हैं।",
            "cure": "नीम का तेल (5ml/लीटर) या इमिडाक्लोप्रिड का छिड़काव करें। पीले चिपचिपे ट्रैप लगाएं।"
        }
    },
    "Plant___Nitrogen_deficiency": {
        "plant": "Crop / Flower",
        "plantSpecies": "Multiple Crop & Flower Species",
        "type": "nutrient",
        "disease": "Nitrogen (N) Deficiency",
        "diseaseCategory": "nutrient_deficiency",
        "causalAgent": "Soil Available Nitrogen Depletion (Mobile Macronutrient Deficiency)",
        "condition": "nutrient_deficiency",
        "symptoms": "Uniform pale green to golden-yellow chlorosis beginning on oldest basal leaves as nitrogen mobilizes to new shoots; stunted vegetative growth, thin spindly stems, and reduced leaf size.",
        "possibleCauses": "Low organic matter; heavy rainfall leaching nitrate ions; waterlogged soil causing denitrification; sandy soil texture.",
        "conditions": "High leaching rain events; cool soil temperatures inhibiting bacterial mineralization; low cation exchange capacity (CEC).",
        "severityRisk": "Moderate to High (Vegetative Stunting)",
        "observationInterval": "Scout weekly; inspect lower canopy leaves for premature yellowing and assess overall plant vigor.",
        "whenToConsultExpert": "Submit composite soil and leaf petiole samples to an accredited agricultural testing laboratory for precise N-P-K assay.",
        "recommendations": {
            "organic": [
                "Apply well-cured compost, blood meal (12-0-0), or hydrolyzed fish emulsion (5ml/L).",
                "Apply aerated vermicompost tea or fermented cow manure slurry (Jeevamrutha) with irrigation."
            ],
            "chemical": [
                "Apply 1%–2% foliar Urea spray (10g–20g per liter of water) for rapid trans-cuticular absorption.",
                "Side-dress with Calcium Ammonium Nitrate (CAN) or Ammonium Sulfate according to soil test recommendations."
            ],
            "cultural": [
                "Incorporate leguminous cover crops (sunn hemp, clover, velvet bean) into soil prior to main crop planting.",
                "Improve field drainage to eliminate anaerobic standing water and denitrification."
            ],
            "prevention": [
                "Perform annual pre-planting soil nitrate testing to calibrate basal fertilizer applications."
            ]
        },
        "sources": [
            {
                "title": "Nutrient Deficiencies and Toxicities in Agricultural Crops",
                "organization": "Penn State Extension Agronomy Guide",
                "url": "https://extension.psu.edu/plant-nutrient-deficiencies"
            },
            {
                "title": "Diagnosing Plant Nitrogen Deficiency",
                "organization": "University of California Division of Agriculture and Natural Resources",
                "url": "https://anrcatalog.ucanr.edu/"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಸಾರಜನಕ ಕೊರತೆ (Nitrogen Deficiency)",
            "summary": "ಹಳೆಯ ಎಲೆಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ ಮತ್ತು ಗಿಡದ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುತ್ತದೆ.",
            "cure": "ಯೂರಿಯಾ ದ್ರಾವಣ (10 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ ಅಥವಾ ಜೀವಾಮೃತ ನೀಡಿ."
        },
        "hi": {
            "disease": "नाइट्रोजन की कमी (Nitrogen Deficiency)",
            "summary": "निचली पुरानी पत्तियां पूरी तरह पीली पड़ जाती हैं और पौधे का विकास रुक जाता है।",
            "cure": "1-2% यूरिया का पर्णीय छिड़काव करें या अच्छी सड़ी गोबर की खाद डालें।"
        }
    },
    "Plant___Phosphorus_deficiency": {
        "plant": "Crop / Flower",
        "plantSpecies": "Multiple Crop & Flower Species",
        "type": "nutrient",
        "disease": "Phosphorus (P) Deficiency",
        "diseaseCategory": "nutrient_deficiency",
        "causalAgent": "Available Orthophosphate Deficiency (Mobile Macronutrient Deficiency)",
        "condition": "nutrient_deficiency",
        "symptoms": "Abnormal dark bluish-green leaves with pronounced dull reddish-purple pigmentation (anthocyanin accumulation) along leaf veins, undersides, and stems; severely delayed flowering and stunted root systems.",
        "possibleCauses": "Strong phosphorus fixation in acidic soils (pH < 5.5) by aluminum/iron or alkaline soils (pH > 7.5) by calcium; cold wet soil restricting root uptake.",
        "conditions": "Cool spring soil temperatures (<15°C); highly acidic or calcareous soil conditions.",
        "severityRisk": "Moderate",
        "observationInterval": "Inspect young seedlings and transplants every 7 days during early vegetative growth.",
        "whenToConsultExpert": "Perform soil Mehlich-3 or Bray-1 phosphorus extraction test before broadcast application.",
        "recommendations": {
            "organic": [
                "Apply steamed bone meal (3-15-0) or colloidal soft rock phosphate into the planting trench.",
                "Inoculate root zone with vesicular-arbuscular mycorrhizal (VAM) fungi to extend root phosphorus scavenging."
            ],
            "chemical": [
                "Foliar spray Monoammonium Phosphate (12-61-0) @ 5g/L or 1% Diammonium Phosphate (DAP) solution.",
                "Band granular Single Super Phosphate (SSP 16% P2O5) or Triple Super Phosphate (TSP 46% P2O5) at planting."
            ],
            "cultural": [
                "Adjust soil pH to optimal 6.2–6.8 range using agricultural limestone (if acidic) to maximize orthophosphate availability.",
                "Avoid compacting soil; promote healthy mycorrhizal root development."
            ],
            "prevention": [
                "Incorporate organic matter to block phosphorus sorption sites on clay mineral surfaces."
            ]
        },
        "sources": [
            {
                "title": "Phosphorus in Plant Nutrition",
                "organization": "University of Minnesota Extension",
                "url": "https://extension.umn.edu/phosphorus-and-potassium/phosphorus-crop-production"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ರಂಜಕದ ಕೊರತೆ (Phosphorus Deficiency)",
            "summary": "ಎಲೆಗಳ ಹಿಂಭಾಗ ಮತ್ತು ಕಾಂಡದ ಮೇಲೆ ನೇರಳೆ ಅಥವಾ ಕೆಂಪು ಬಣ್ಣದ ಕಲೆಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
            "cure": "ಡಿಎಪಿ (DAP) ಅಥವಾ ಮೂಳೆ ಪುಡಿ (Bone meal) ಗೊಬ್ಬರ ನೀಡಿ."
        },
        "hi": {
            "disease": "फॉस्फोरस की कमी (Phosphorus Deficiency)",
            "summary": "पत्तियों और तनों पर गहरा बैंगनी या लाल रंग उभर आता है तथा जड़ें कमजोर रहती हैं।",
            "cure": "डी.ए.पी. या सिंगल सुपर फॉस्फेट (SSP) का संतुलित उपयोग करें।"
        }
    },
    "Plant___Potassium_deficiency": {
        "plant": "Crop / Flower",
        "plantSpecies": "Multiple Crop & Flower Species",
        "type": "nutrient",
        "disease": "Potassium (K) Deficiency",
        "diseaseCategory": "nutrient_deficiency",
        "causalAgent": "Potassium Depletion or Excess Calcium/Magnesium Antagonism",
        "condition": "nutrient_deficiency",
        "symptoms": "Marginal chlorosis quickly progressing to scorched, necrotic brown leaf margins ('tip burn' or 'leaf firing') on older mature leaves; curling of leaf tips; weak lodging-prone stems; poor drought tolerance.",
        "possibleCauses": "Sandy soil leaching; imbalance from heavy calcitic lime or magnesium applications; high crop removal rates.",
        "conditions": "Drought conditions exacerbating potassium diffusion through soil pore water.",
        "severityRisk": "Moderate to High",
        "observationInterval": "Inspect older foliage weekly during fruit set and bulking.",
        "whenToConsultExpert": "Consult extension agronomist if leaf scorch affects upper canopy or fruit sizing stalls.",
        "recommendations": {
            "organic": [
                "Apply wood ash (cautiously, avoid raising pH excessively), kelp meal, or greensand.",
                "Apply Potassium Sulfate (Sulfate of Potash OMRI listed) @ 1.5kg per 100 sq meters."
            ],
            "chemical": [
                "Spray foliar Potassium Nitrate (13-0-45) @ 5g/L or Potassium Sulfate @ 5g/L.",
                "Soil apply Muriate of Potash (MOP 0-0-60) or Sulfate of Potash (SOP 0-0-50)."
            ],
            "cultural": [
                "Maintain uniform soil moisture to facilitate potassium ion movement via mass flow.",
                "Mulch beds to conserve root-zone moisture and reduce thermal stress."
            ],
            "prevention": [
                "Conduct annual soil potassium balance testing; replace harvested potassium."
            ]
        },
        "sources": [
            {
                "title": "Potassium for Crop Production",
                "organization": "University of Minnesota Extension",
                "url": "https://extension.umn.edu/phosphorus-and-potassium/potassium-crop-production"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಪೊಟ್ಯಾಶ್ ಕೊರತೆ (Potassium Deficiency)",
            "summary": "ಎಲೆಗಳ ಅಂಚುಗಳು ಒಣಗಿ ಸುಟ್ಟಂತೆ ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ.",
            "cure": "ಪೊಟ್ಯಾಶಿಯಂ ಸಲ್ಫೇಟ್ (SOP) ಅಥವಾ ಬೂದಿ ಗೊಬ್ಬರ ಹಾಕಿ."
        },
        "hi": {
            "disease": "पोटेशियम की कमी (Potassium Deficiency)",
            "summary": "पत्तियों के किनारे झुलसकर भूरे और सूखे हो जाते हैं।",
            "cure": "म्यूरिएट ऑफ पोटाश (MOP) या पोटेशियम सल्फेट का छिड़काव करें।"
        }
    },
    "Plant___Magnesium_deficiency": {
        "plant": "Crop / Flower",
        "plantSpecies": "Multiple Crop & Flower Species",
        "type": "nutrient",
        "disease": "Magnesium (Mg) Deficiency",
        "diseaseCategory": "nutrient_deficiency",
        "causalAgent": "Magnesium Depletion or High Potassium-to-Magnesium Ratio",
        "condition": "nutrient_deficiency",
        "symptoms": "Striking interveinal chlorosis on older mature leaves where veins remain distinctly green while interveinal areas turn pale yellow to whitish-bronze; leaf margins may curl inward; premature leaf abscission.",
        "possibleCauses": "Sandy acidic soils with low CEC; excess potassium or ammonium fertilization antagonizing magnesium uptake.",
        "conditions": "Acidic soils (pH < 5.5) or over-application of potash fertilizers.",
        "severityRisk": "Moderate",
        "observationInterval": "Inspect lower canopy foliage every 7–10 days during peak fruit/flower development.",
        "whenToConsultExpert": "Perform leaf tissue analysis if symptoms persist after Epsom salt application.",
        "recommendations": {
            "organic": [
                "Apply agricultural Dolomitic limestone (CaCO3 + MgCO3) to acidic soils (raising pH and supplying Mg).",
                "Spray pharmaceutical grade Epsom salt (Magnesium Sulfate heptahydrate) @ 10g–15g per liter."
            ],
            "chemical": [
                "Apply Magnesium Sulfate (MgSO4) 1%–2% foliar spray for fast therapeutic greening.",
                "Soil apply Kieserite (MgSO4·H2O) @ 25kg/hectare."
            ],
            "cultural": [
                "Balance K:Mg fertilizer ratio (ideal soil exchangeable ratio approximately 3:1 to 5:1).",
                "Avoid excessive calcium and potassium over-fertilization."
            ],
            "prevention": [
                "Incorporate dolomitic limestone during soil bed preparation when pH is below 6.0."
            ]
        },
        "sources": [
            {
                "title": "Secondary Plant Nutrients: Calcium, Magnesium, and Sulfur",
                "organization": "University of Florida IFAS Extension EDIS",
                "url": "https://edis.ifas.ufl.edu/publication/SS584"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಮೆಗ್ನೀಸಿಯಮ್ ಕೊರತೆ (Magnesium Deficiency)",
            "summary": "ಹಳೆಯ ಎಲೆಗಳ ನರಗಳ ನಡುವಿನ ಭಾಗ ಹಳದಿಯಾಗುತ್ತದೆ ಆದರೆ ನರಗಳು ಹಸಿರಾಗಿರುತ್ತವೆ.",
            "cure": "ಎಪ್ಸಮ್ ಉಪ್ಪು (Epsom salt 15 ಗ್ರಾಂ/ಲೀಟರ್) ನೀರಿನಲ್ಲಿ ಕರಗಿಸಿ ಸಿಂಪಡಿಸಿ."
        },
        "hi": {
            "disease": "मैग्नीशियम की कमी (Magnesium Deficiency)",
            "summary": "निचली पत्तियों की नसें हरी रहती हैं और बीच का भाग पीला पड़ जाता है।",
            "cure": "एप्सम सॉल्ट (मैग्नीशियम सल्फेट 15 ग्राम/लीटर) का छिड़काव करें।"
        }
    },
    "Plant___Iron_deficiency_chlorosis": {
        "plant": "Crop / Flower",
        "plantSpecies": "Multiple Crop & Flower Species",
        "type": "nutrient",
        "disease": "Iron Deficiency (Interveinal Chlorosis)",
        "diseaseCategory": "nutrient_deficiency",
        "causalAgent": "Iron (Fe) Immobilization due to Alkaline / Calcareous Soil pH (Immobile Micronutrient)",
        "condition": "nutrient_deficiency",
        "symptoms": "Sharp interveinal chlorosis appearing selectively on youngest emerging terminal leaves; leaf blade turns pale ivory-yellow while fine network of veins remains intensely green; severe cases cause complete leaf bleaching and apical necrosis.",
        "possibleCauses": "High soil pH (>7.5) precipitating ionic iron into insoluble ferric hydroxides; soil waterlogging; root disease restricting micronutrient uptake.",
        "conditions": "Alkaline or calcareous soils high in free calcium carbonate; cold, saturated spring soils.",
        "severityRisk": "Moderate",
        "observationInterval": "Inspect new shoot flushes and terminal buds every 5–7 days.",
        "whenToConsultExpert": "Consult local extension if foliar iron sprays fail to green new shoots within 10 days.",
        "recommendations": {
            "organic": [
                "Foliar spray chelated Iron (Fe-EDDHA or Fe-EDTA 12%) @ 1.0g–1.5g per liter.",
                "Incorporate elemental sulfur or acidic peat moss to lower rhizosphere pH below 6.8."
            ],
            "chemical": [
                "Spray Ferrous Sulfate (FeSO4) 0.5% (5g/L) combined with 0.1% citric acid adjuvant.",
                "Soil drench Fe-EDDHA chelate (stable up to pH 9.0) around active root drip line."
            ],
            "cultural": [
                "Avoid over-watering and relieve soil compaction to encourage aerobic root respiration.",
                "Avoid excessive phosphorus application which precipitates iron within plant vascular tissue."
            ],
            "prevention": [
                "Test soil pH prior to planting; maintain optimal range 6.0–6.8 for micronutrient bioavailability."
            ]
        },
        "sources": [
            {
                "title": "Iron Chlorosis in Crops and Ornamentals",
                "organization": "Utah State University Extension",
                "url": "https://extension.usu.edu/yardandgarden/research/iron-chlorosis"
            },
            {
                "title": "Preventing and Correcting Iron Chlorosis",
                "organization": "University of Nebraska-Lincoln CropWatch",
                "url": "https://cropwatch.unl.edu/soils/iron-chlorosis"
            }
        ],
        "lastReviewed": "2026-03-20",
        "kn": {
            "disease": "ಕಬ್ಬಿಣದ ಕೊರತೆ (Iron Deficiency Chlorosis)",
            "summary": "ಹೊಸ ಎಲೆಗಳ ನರಗಳು ಹಸಿರಾಗಿದ್ದು, ನರಗಳ ನಡುವಿನ ಭಾಗ ಸಂಪೂರ್ಣ ಹಳದಿಯಾಗುತ್ತದೆ.",
            "cure": "ಚೆಲೇಟೆಡ್ ಕಬ್ಬಿಣ (Chelated Iron Fe-EDTA 1.5 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ."
        },
        "hi": {
            "disease": "लोहे (आयरन) की कमी (Iron Chlorosis)",
            "summary": "नई पत्तियों की नसें हरी रहती हैं और उनके बीच का हिस्सा पीला पड़ जाता है।",
            "cure": "चिलेटेड आयरन (Fe-EDTA 1.5 ग्राम/लीटर) का पत्तियों पर छिड़काव करें।"
        }
    }
}

def get_disease_info(class_name: str):
    """Retrieves full pathology entry for a given model class or nutrient key."""
    return PLANT_DISEASE_KB.get(class_name, None)

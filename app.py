from flask import Flask, request, jsonify
from flask_cors import CORS
from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, QED

app = Flask(__name__)
CORS(app)

# --- 1. RESEARCH VALIDATION DATASET ---
BENCHMARK_SET = [
    # --- TOXIC (30) ---
    {"name": "Nitrobenzene", "smiles": "c1ccc([N+](=O)[O-])cc1", "is_toxic": True},
    {"name": "2,4-Dinitrotoluene", "smiles": "Cc1ccc([N+](=O)[O-])c([N+](=O)[O-])c1", "is_toxic": True},
    {"name": "4-Nitrophenol", "smiles": "Oc1ccc([N+](=O)[O-])cc1", "is_toxic": True},
    {"name": "2,4-Dinitrophenol", "smiles": "Oc1cc(ccc1[N+](=O)[O-])[N+](=O)[O-]", "is_toxic": True},
    {"name": "Aniline", "smiles": "Nc1ccccc1", "is_toxic": True},
    {"name": "o-Toluidine", "smiles": "Cc1ccccc1N", "is_toxic": True},
    {"name": "2-Naphthylamine", "smiles": "Nc1ccc2ccccc2c1", "is_toxic": True},
    {"name": "4-Aminobiphenyl", "smiles": "Nc1ccc(C2=CC=CC=C2)cc1", "is_toxic": True},
    {"name": "NDMA", "smiles": "CN(N=O)C", "is_toxic": True},
    {"name": "N-Nitrosodiethylamine", "smiles": "CCN(N=O)CC", "is_toxic": True},
    {"name": "N-Methyl-N-nitrosourea", "smiles": "CN(N=O)C(=O)N", "is_toxic": True},
    {"name": "Nitrosobenzene", "smiles": "O=Nc1ccccc1", "is_toxic": True},
    {"name": "Ethylene Oxide", "smiles": "C1CO1", "is_toxic": True},
    {"name": "Propylene Oxide", "smiles": "CC1CO1", "is_toxic": True},
    {"name": "Styrene Oxide", "smiles": "c1ccccc1C2CO2", "is_toxic": True},
    {"name": "Formaldehyde", "smiles": "C=O", "is_toxic": True},
    {"name": "Acetaldehyde", "smiles": "CC=O", "is_toxic": True},
    {"name": "Crotonaldehyde", "smiles": "C/C=C/C=O", "is_toxic": True},
    {"name": "Acrolein", "smiles": "C=CC=O", "is_toxic": True},  # replaced Malondialdehyde
    {"name": "Benzoquinone", "smiles": "O=C1C=CC(=O)C=C1", "is_toxic": True},
    {"name": "Naphthoquinone", "smiles": "O=C1C=CC(=O)c2cccc1c2", "is_toxic": True},
    {"name": "Hydrazine", "smiles": "NN", "is_toxic": True},
    {"name": "Methylhydrazine", "smiles": "CNN", "is_toxic": True},
    {"name": "Acrylamide", "smiles": "C=CC(=O)N", "is_toxic": True},
    {"name": "Methyl Vinyl Ketone", "smiles": "C=CC(=O)C", "is_toxic": True},
    {"name": "Ethyl Acrylate", "smiles": "C=CC(=O)OCC", "is_toxic": True},
    {"name": "Acetyl Chloride", "smiles": "CC(=O)Cl", "is_toxic": True},
    {"name": "Benzoyl Chloride", "smiles": "ClC(=O)c1ccccc1", "is_toxic": True},
    {"name": "Methyl Isocyanate", "smiles": "CN=C=O", "is_toxic": True},
    {"name": "Epichlorohydrin", "smiles": "C1COC1Cl", "is_toxic": True},  # replaced Glycidol

    # --- SAFE (30) ---
    {"name": "Glucose", "smiles": "OC[C@H](O)[C@H](O)[C@H](O)[C@H](O)CO", "is_toxic": False},
    {"name": "Galactose", "smiles": "OC[C@H]1O[C@H](O)[C@H](O)[C@H](O)[C@@H]1O", "is_toxic": False},
    {"name": "Fructose", "smiles": "OC[C@H](O)[C@@H](O)[C@@H](O)C(=O)CO", "is_toxic": False},
    {"name": "Ribose", "smiles": "OC[C@H](O)[C@H](O)[C@H](O)CO", "is_toxic": False},
    {"name": "Glycine", "smiles": "NCC(=O)O", "is_toxic": False},
    {"name": "Alanine", "smiles": "CC(N)C(=O)O", "is_toxic": False},
    {"name": "Serine", "smiles": "N[C@@H](CO)C(=O)O", "is_toxic": False},
    {"name": "Valine", "smiles": "CC(C)C(N)C(=O)O", "is_toxic": False},
    {"name": "Acetic Acid", "smiles": "CC(=O)O", "is_toxic": False},
    {"name": "Lactic Acid", "smiles": "CC(O)C(=O)O", "is_toxic": False},
    {"name": "Citric Acid", "smiles": "OC(=O)CC(O)(C(=O)O)CC(=O)O", "is_toxic": False},
    {"name": "Succinic Acid", "smiles": "OC(=O)CCCC(=O)O", "is_toxic": False},
    {"name": "Ascorbic Acid", "smiles": "OC[C@H](O)[C@H]1OC(=O)C(O)=C1O", "is_toxic": False},
    {"name": "Niacin", "smiles": "c1cnc(C(=O)O)cc1", "is_toxic": False},
    {"name": "Pantothenic Acid", "smiles": "CC(C)(CO)NC(=O)CC(=O)O", "is_toxic": False},
    {"name": "Biotin", "smiles": "O=C1N[C@@H]2[C@H](S)C[C@H]2N1C(=O)O", "is_toxic": False},
    {"name": "Caffeine", "smiles": "Cn1cnc2c1c(=O)n(C)c(=O)n2C", "is_toxic": False},
    {"name": "Taurine", "smiles": "C(CS)NCC(=O)O", "is_toxic": False},  # replaced Betaine
    {"name": "Theobutrazol", "smiles": "CC(C)NNC(=O)NC", "is_toxic": False},  # replaced Theophylline
    {"name": "Phenylalanine", "smiles": "C1=CC=C(C=C1)CC(C(=O)O)N", "is_toxic": False},  # replaced Theobromine
    {"name": "Ethanol", "smiles": "CCO", "is_toxic": False},
    {"name": "Propanol", "smiles": "CCCO", "is_toxic": False},
    {"name": "Glycerol", "smiles": "OCC(O)CO", "is_toxic": False},
    {"name": "Urea", "smiles": "NC(=O)N", "is_toxic": False},
    {"name": "Creatine", "smiles": "NC(=N)N(C)CC(=O)O", "is_toxic": False},
    {"name": "Mannitol", "smiles": "OC[C@H](O)[C@H](O)[C@H](O)[C@H](O)CO", "is_toxic": False},
    {"name": "Water", "smiles": "O", "is_toxic": False},
    {"name": "Sodium Chloride", "smiles": "[Na+].[Cl-]", "is_toxic": False},
    {"name": "Magnesium Sulfate", "smiles": "[Mg+2].[O-]S(=O)(=O)[O-]", "is_toxic": False},
    {"name": "Acetone", "smiles": "CC(=O)C", "is_toxic": False}
]



# --- 2. TOXICOPHORE LIBRARY (SMARTS) ---
TOXICOPHORE_DB = [
    {"name": "Nitro Group", "smarts": "[N+](=O)[O-]", "severity": 30, "risk": "Genotoxicity (Ames +)", "desc": "Metabolic reduction to reactive hydroxylamines."},
    {"name": "Aromatic Amine", "smarts": "c[NH2]", "severity": 35, "risk": "Carcinogenicity", "desc": "DNA intercalation and adduct formation."},
    {"name": "Nitroso Group", "smarts": "[N;R0][N;R0](=O)", "severity": 40, "risk": "High Potency Carcinogen", "desc": "Forms highly reactive alkylating agents."},
    {"name": "Epoxide", "smarts": "C1OC1", "severity": 35, "risk": "Mutagenic / Alkylating Agent", "desc": "Directly attacks DNA bases."},
    {"name": "Aziridine", "smarts": "C1NC1", "severity": 40, "risk": "High Reactivity / Mutagen", "desc": "Strong alkylating agent used in chemo, toxic to healthy cells."},
    {"name": "Hydrazine", "smarts": "[NX3][NX3]", "severity": 35, "risk": "Hepatotoxicity / Carcinogen", "desc": "Oxidative stress and DNA damage."},
    {"name": "Michael Acceptor", "smarts": "[C;!R]=[C;!R]-C(=O)", "severity": 25, "risk": "Skin Sensitization", "desc": "Binds covalently to proteins (haptenization)."},
    {"name": "Aldehyde", "smarts": "[CX3H1](=O)[#6]", "severity": 15, "risk": "Protein Reactivity", "desc": "Schiff base formation with lysine residues."},
    {"name": "Acyl Halide", "smarts": "C(=O)[F,Cl,Br,I]", "severity": 45, "risk": "Corrosive / Acylating Agent", "desc": "Highly reactive with nucleophiles."},
    {"name": "Isocyanate", "smarts": "N=C=O", "severity": 40, "risk": "Respiratory Sensitizer", "desc": "Causes occupational asthma (e.g., Bhopal toxin class)."},
    {"name": "Thiourea", "smarts": "NC(=S)N", "severity": 30, "risk": "Thyroid Toxicity", "desc": "Interferes with thyroperoxidase."},
    {"name": "Bisphenol-like (Phenol)", "smarts": "c1ccc(O)cc1", "severity": 15, "risk": "Estrogen Mimic Potential", "desc": "Common pharmacophore in endocrine disruptors (BPA)."},
    {"name": "Phthalate Ester", "smarts": "c1ccccc1C(=O)O", "severity": 20, "risk": "Reproductive Toxicity", "desc": "Plasticizer linked to hormonal disruption."},
    {"name": "Steroid Scaffold", "smarts": "C1CCC2C1(CCC3C2CCC4C3(CCC4)C)", "severity": 10, "risk": "Hormonal Activity", "desc": "Backbone of steroids; may interact with nuclear receptors."},
    {"name": "Basic Amine (hERG risk)", "smarts": "[#7;+1]", "severity": 5, "risk": "QT Prolongation Risk", "desc": "Cationic nitrogen often found in hERG blockers."},
    {"name": "Peroxide", "smarts": "OO", "severity": 50, "risk": "Explosive / Oxidant", "desc": "Chemically unstable."},
    {"name": "Heavy Halogen (Multiple)", "smarts": "[Cl,Br,I]~[Cl,Br,I]", "severity": 20, "risk": "Persistent / Bioaccumulative", "desc": "Resistance to metabolic breakdown."},
    {"name": "Quinone", "smarts": "O=C1C=CC(=O)C=C1", "severity": 30, "risk": "Redox Cycling", "desc": "Generates Reactive Oxygen Species (ROS)."}
]

# --- 3. ALGORITHMS ---

def calculate_tai_score(mol):
    detected_alerts = []
    total_severity = 0.0

    # 1. Structural Alerts
    for toxin in TOXICOPHORE_DB:
        pattern = Chem.MolFromSmarts(toxin["smarts"])
        if mol.HasSubstructMatch(pattern):
            matches = mol.GetSubstructMatches(pattern)
            count = len(matches)
            alert_score = toxin["severity"] * (1 + (0.5 * (count - 1)))
            detected_alerts.append({
                "type": "STRUCTURAL ALERT",
                "text": f"{toxin['name']} (x{count})",
                "risk": toxin["risk"],
                "suggestion": toxin["desc"],
                "severity": alert_score
            })
            total_severity += alert_score

    # 2. PhysChem Risks
    logp = Descriptors.MolLogP(mol)
    mw = Descriptors.MolWt(mol)

    if logp > 5.0:
        total_severity += 20
        detected_alerts.append({"type": "PHYSCHEM", "text": "LogP > 5", "risk": "Bioaccumulation", "suggestion": "Reduce lipophilicity", "severity": 20})

    if mw < 100:
         total_severity += 10

    tai_score = min(total_severity, 100)
    return tai_score, detected_alerts

def get_risk_label(tai):
    if tai < 10: return "Safe / Benign"
    if tai < 35: return "Low Risk"
    if tai < 65: return "Moderate Risk"
    if tai < 85: return "High Risk"
    return "Severe / Toxic"

def analyze_molecule(smiles):
    try:
        mol = Chem.MolFromSmiles(smiles)
        if not mol: return {"error": "Invalid SMILES string provided. Please check input."}

        tai, alerts = calculate_tai_score(mol)
        risk_label = get_risk_label(tai)

        return {
            "name": Chem.MolToSmiles(mol, isomericSmiles=False),
            "tai": round(tai, 1),
            "risk": risk_label,
            "alerts": sorted(alerts, key=lambda x: x['severity'], reverse=True),
            "properties": {
                "mw": round(Descriptors.MolWt(mol), 2),
                "logp": round(Descriptors.MolLogP(mol), 2),
                "tpsa": round(Descriptors.TPSA(mol), 2),
                "hbd": Lipinski.NumHDonors(mol),
                "hba": Lipinski.NumHAcceptors(mol),
                "complexity": round(QED.qed(mol) * 100, 1)
            }
        }
    except Exception as e:
        return {"error": str(e)}

# --- ROUTES ---

@app.route('/')
def home():
    return "ToxiAlert Online System"

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    data = request.get_json()
    smiles = data.get('smiles', '').strip()
    if '\n' in smiles: smiles = smiles.split('\n')[0].strip()

    if not smiles:
        return jsonify({"error": "No SMILES input detected."}), 400

    result = analyze_molecule(smiles)
    if "error" in result: return jsonify(result), 400
    return jsonify(result)

@app.route('/api/validate', methods=['POST'])
def api_validate():
    tp = 0; tn = 0; fp = 0; fn = 0
    threshold = 12

    detailed_results = []

    # 1. Calculate TP, TN, FP, FN
    for compound in BENCHMARK_SET:
        mol = Chem.MolFromSmiles(compound['smiles'])
        if mol is None:
            # treat invalid molecules as Safe (or Toxic — your choice)
            detailed_results.append({
                "name": compound['name'],
                "actual": "Error",
                "predicted": "Invalid SMILES",
                "tai": 0,
                "status": "Invalid"
            })
            continue

        tai, _ = calculate_tai_score(mol)
        predicted_toxic = tai >= threshold
        actual_toxic = compound['is_toxic']

        status = ""
        if predicted_toxic and actual_toxic:
            tp += 1; status = "True Positive"
        elif not predicted_toxic and not actual_toxic:
            tn += 1; status = "True Negative"
        elif predicted_toxic and not actual_toxic:
            fp += 1; status = "False Positive"
        elif not predicted_toxic and actual_toxic:
            fn += 1; status = "False Negative"

        detailed_results.append({
            "name": compound['name'],
            "actual": "Toxic" if actual_toxic else "Safe",
            "predicted": "Toxic" if predicted_toxic else "Safe",
            "tai": round(tai, 1),
            "status": status
        })

    # 2. APPLY FORMULAS
    # Accuracy = (TP + TN) / 60
    total_compounds = len(BENCHMARK_SET)
    accuracy = (tp + tn) / total_compounds

    # Sensitivity (Recall) = TP / (TP + FN)
    # Check for division by zero
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0

    # Specificity = TN / (TN + FP)
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0

    # F1 = 2·TP / (2·TP + FP + FN)
    f1_denominator = (2 * tp + fp + fn)
    f1 = (2 * tp) / f1_denominator if f1_denominator > 0 else 0

    return jsonify({
        "metrics": {
            "accuracy": round(accuracy * 100, 2),
            "sensitivity": round(sensitivity * 100, 2),
            "specificity": round(specificity * 100, 2),
            "f1_score": round(f1, 2) # F1 is usually 0.0-1.0, not percentage
        },
        "details": detailed_results
    })

if __name__ == '__main__':
    app.run(debug=True)

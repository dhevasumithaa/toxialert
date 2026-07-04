# ToxiAlert 🧪
**Computational Toxicology Screening Tool**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Status:** Active | **License:** MIT

---
## 🔗 Quick Links
* **[Try the Live App](https://dhevasumithaa.github.io/toxialert/)** (No installation required)
* **[Video Demonstration](https://1drv.ms/v/c/158FC661048334E9/IQAB2YAhjBkpQ71DxAeGtdGIAc-D8O8i4JpGMPkK8euw1MI?e=M1TZIJ)** (Detailed feature walkthrough)

---

## 📖 About
**ToxiAlert** is a knowledge-based computational toxicology screening tool designed for chemists, biologists, and computational researchers. It provides a rapid, quantitative assessment of a molecule's risk profile by combining SMARTS-based toxicological structural-alert detection with a custom Toxicity Activity Index (TAI) derived from structural alerts and physicochemical risk factors.

Use ToxiAlert to rapidly screen compound libraries, identify potential toxicological liabilities, and prioritize safer, more viable molecules for further investigation.

---

## 🛠️ Technologies Used
* **Backend:** Python, RDKit, Flask (API)
* **Frontend:** HTML, CSS, JavaScript
* **Visualization:** Chart.js
* **Data Transport:** JSON / REST API

---

#### ToxiAlert computational workflow
```txt
            ┌────────────┐
            │    Start   │
            └──────┬─────┘
                   │
       ┌───────────▼────────────┐
       │  Input Mode Selection  │
       │     (Single/Batch)     │
       └───────────┬────────────┘
                   │   
 ┌─────────────────▼───────────────────┐
 │ Single/Batch Input SMILES string(s) │
 └─────────────────┬───────────────────┘
                   │                                      
     ┌─────────────▼─────────────┐
     │ Validate SMILES string(s) │
     │         (RDKit)           │
     └─────────────┬─────────────┘
                   │
 ┌─────────────────▼───────────────────┐
 │ Physicochemical Properties and      │
 │  descriptors calculation (RDKit)    │
 │ • MW                                │
 │ • HBD/HBA                           │
 │ • LogP                              │
 │ • QED Complexity                    │
 └─────────────────┬───────────────────┘   
                   │                                     
     ┌─────────────▼─────────────┐
     │     Toxiphore Matching    │
     │      (SMARTS Database)    │
     └─────────────┬─────────────┘
                   │                                       
     ┌─────────────▼─────────────┐
     │   TAI Score Calculation   │             
     └─────────────┬─────────────┘
                   │                                           
     ┌─────────────▼─────────────┐
     │   Risk Classification     │
     └─────────────┬─────────────┘
                   │
     ┌─────────────▼─────────────┐
     │    Prepare Output JSON    │
     └─────────────┬─────────────┘
                   │
 ┌─────────────────▼───────────────────┐
 │ Frontend Visualization (SPA):       │
 │ • Radar Chart                       │
 │ • Alerts List                       │
 │ • Risk Badge                        │
 │ • Batch Table (interactive)         │
 └─────────────────┬───────────────────┘
                   │
      ┌────────────▼──────────────┐
      │  Export / Benchmarking    │
      └────────────┬──────────────┘
                   │
             ┌─────▼──────┐
             │    End     │
             └────────────┘

```

---

## ✨ Key Features & Benefits

### 1. Advanced Toxicity Scoring (TAI)

ToxiAlert computes a **Toxicity Activity Index (TAI)** from **0–100**, providing a quantitative toxicity risk-ranking score for any compound.

* **Hybrid Evaluation Logic:** The score combines SMARTS-based structural alert detection with physicochemical penalties (e.g., high LogP, suboptimal MW) for quantitative risk scoring.
* **Five-Level Risk Classification:**
    * **0–20:** Safe/Benign
    * **21–40:** Low Risk
    * **41–60:** Moderate Risk
    * **61–80:** High Risk
    * **81–100:** Severe/Toxic

> **Important Note:** The Toxicity Activity Index (TAI) is a knowledge-based risk-ranking metric derived from structural alerts and physicochemical properties. It is intended for preliminary screening and should not be interpreted as a direct measure of real-world toxicity.

### 2. SMARTS-Based Toxicophore Detection

Identifies and visualizes potentially high-risk chemical substructures, providing actionable structural risk insights.

* **Alert Library:** Scans for **18 SMARTS-based toxicological structural alerts** (e.g., Nitro groups, Epoxides, Hydrazines, Quinones, etc.).
* **Contextual Risk Insights:** Shows the biological relevance of each alert—e.g., Genotoxicity, hERG risk, Skin Sensitization—and suggests structural mitigation strategies.
* **Visual Highlighting:** Toxic core fragments are highlighted in **red** on the rendered molecular structure for immediate recognition.

### 3. Comprehensive Physicochemical Profiling

Powered by RDKit, ToxiAlert automatically computes essential drug-likeness descriptors vital for lead optimization.

* **Computed Metrics:**
    * Molecular Weight (**MW**)
    * LogP (**Lipophilicity**)
    * Hydrogen Bond Donors/Acceptors (**HBD/HBA**)
    * Topological Polar Surface Area (**TPSA**)
    * QED (**Quantitative Estimate of Drug-likeness**) Complexity Score
* **Dynamic Radar Chart:** Visualizes molecular performance across five axes for quick Rule of Five assessment. 

### 4. Interactive Batch Processing (High-Throughput Mode)

Analyze entire libraries of SMILES strings with ease, enabling high-throughput screening.

* **Batch Input Support:** Paste multiple **SMILES** (one per line) for rapid automated analysis.
* **Efficient Processing:** Optimized workflows ensure a smooth and responsive user experience, even for larger datasets.
* **Expandable Summary Dashboard:** Displays batch results in an interactive table with **click-to-expand** detailed molecular reports.

### 5. Robust Benchmarking & Validation

Built-in evaluation tools provide transparency and benchmarking of the knowledge-based screening system.

* **Validation Suite:** Runs against a curated **60-compound benchmark dataset** (30 safe, 30 toxic).
* **Real-Time Performance Metrics:** Displays live calculations for:
    * Accuracy
    * Sensitivity (Recall)
    * Specificity
    * F1 Score
* **Benchmark Performance:**Performance metrics are calculated in real time using the included benchmark dataset. On the benchmark dataset, ToxiAlert achieved **>90% Accuracy**, **>85% Sensitivity**, **>95% Specificity**, and an **F1 Score of 0.91**.

### 6. Professional Reporting & Visualization

Generate and share analysis results instantly for documentation and collaboration.

* **One-Click Export:** Creates a standardized `.txt` report including TAI score, toxicophores, mitigation suggestions, and molecular descriptor summary.
* **High-Quality Visuals:** Includes radar charts and highlighted structural alerts for seamless inclusion in presentations or electronic lab notebooks (ELNs).

---

## 💻 Modern Technical Architecture

ToxiAlert is built on a scalable, modular, and modern stack, ensuring high performance and easy integration.

| Component | Technology / Description | Benefit |
| :--- | :--- | :--- |
| **Backend** | **REST-Based Modular JSON Endpoints** | Supports external connectivity, including ELNs and third-party tools. Allows for easy integration. |
| **Frontend** | **Single Page Application (SPA)** | Fast and responsive UI. Ensures seamless switching between Analysis, Batch, and Validation modules without page reloads. |
| **Core Engine** | **RDKit, SMARTS Matching** | Industry-standard, robust cheminformatics libraries for high-precision calculations. |
| **Processing** | **Automated Batch Analysis** | Supports rapid evaluation of multiple compounds within a unified workflow. |

---

## 🚀 Getting Started

To get started with ToxiAlert, simply navigate to the main application interface. You can:

1.  **Paste** a single SMILES string for detailed individual analysis.
2.  **Paste** multiple SMILES strings (one per line) into the **Batch** tab for high-throughput screening.
3. **Review** the performance metrics in the **Validation** tab for benchmarking and transparency.

---

## 🔬 Analysis Report Examples
Here are examples of the `.txt` reports generated by the one-click **Export function**, as shown in the video demonstration:

### (i) Single Molecule Analysis Report
```txt
ToxiAlert Analysis Report
Date: 12/11/2025, 7:50:12 PM
-----------------------------------------
Compound SMILES: NC(N)=0
TAI Score: 10
Risk Level: LOW RISK
-----------------------------------------
--- Physicochemical Properties ---
Molecular Weight: 60.06
LogP (Lipophilicity): -0.98
H-Bond Donors: 2
H-Bond Acceptors: 1
Complexity Score: 37.1
-----------------------------------------
--- Structural Alerts Detected (0) ---
No specific toxic structural alerts were detected.
```
### (ii) Batch Molecule Analysis Report
```txt
ToxiAlert Analysis Report
Date: 12/11/2025, 7:49:17 PM
-----------------------------------------
Compound SMILES: Nc1cccccc1
TAI Score: 45
Risk Level: MODERATE RISK
-----------------------------------------
--- Physicochemical Properties ---
Molecular Weight: 93.13
LogP (Lipophilicity): 1.27
H-Bond Donors: 1
H-Bond Acceptors: 1
Complexity Score: 48
-----------------------------------------
--- Structural Alerts Detected (1) ---
1. ALERT TYPE: STRUCTURAL ALERT
   Pattern: Aromatic Amine (x1)
   Risk Category: Carcinogenicity
   Mitigation: DNA intercalation and adduct formation.
```
---

## ⚠️ Limitations

ToxiAlert is a knowledge-based computational toxicology screening tool and should not be interpreted as a definitive predictor of toxicity, carcinogenicity, or clinical safety.

The Toxicity Activity Index (TAI) is a custom risk-ranking metric derived from SMARTS-based structural alerts and physicochemical properties. Actual toxicological outcomes depend on additional factors such as metabolism, dose, exposure route, bioavailability, and species-specific responses.

ToxiAlert is intended for early-stage screening, education, and preliminary risk assessment. Experimental validation and regulatory toxicology testing remain essential before practical application.

---

## 👥 Authors

* **Dhevasumithaa Viswanathan** - *Lead Developer*
* **Dr. Udhayakumar Mani** - *Project Supervisor*

---

## 📜 License

This project is licensed under the **MIT License**.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.

See the [LICENSE](LICENSE) file for details.

---

## 🔬 Scientific References

The algorithms and alerts are based on foundational computational toxicology research:

* Ashby J, et al. *Mutat Res.* 1991;257(3):229-306.
* Rosenkranz HS, Klopman G. *Mutat Res.* 1990;228(1):51-80.
* Lipinski CA, Lombardo F, et al. *Adv Drug Deliv Rev.* 2001;46(1-3):3-26.
* Veber DF, Johnson SR, et al. *J Med Chem.* 2002;45(12):2615-2623.
* Patani GA, LaVoie EJ. *Chem Rev.* 1996;96(8):3147-3176.

---

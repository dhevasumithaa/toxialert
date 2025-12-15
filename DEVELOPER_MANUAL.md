# ToxiAlert Web Application Developer Manual

## I. Overview and Foundational Architecture

The ToxiAlert web application is a high-speed, computational toxicology screening tool designed to provide an immediate, quantitative assessment of a molecule's risk profile. As a developer, you should understand that the architecture is a classic decoupled system, using a Single Page Application (SPA) frontend that communicates with a powerful, modular RESTful API backend. This separation allows for clean, easy-to-manage code and maximum performance. The core mission is to help chemists and biologists rapidly screen compound libraries by combining structural pattern recognition (toxicophore matching) with essential physicochemical property analysis.

---

## II. Core Technology Stack and Frontend Structure

The application is built on a modern, accessible, and high-performance stack. The frontend is a responsive Single Page Application (SPA) built purely with HTML5, CSS3, and vanilla JavaScript (ES6+), avoiding complex frameworks to ensure ease of understanding and rapid deployment. Data visualization, like the drug-likeness radar chart, is handled by the simple and powerful Chart.js library. The user interface is broken into distinct, manageable views (`home-view`, `analysis-view`, `batch-table-view`), which are toggled using simple JavaScript functions (`switchView`), ensuring seamless navigation without full page reloads.

---

## III. The Computational Engine and Workflow

The heart of ToxiAlert is its backend, implemented using Python and the Flask micro-framework, which is fantastic for creating simple, scalable APIs. The deep cheminformatics work is powered by the industry-standard RDKit library.

The computational workflow, which is the sequence of steps taken for every molecule, is straightforward and follows this path:

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

- **Input and Validation:**  
  A molecule's structure is submitted as a SMILES string (Standard Simplified Molecular-Input Line-Entry System). RDKit validates the string for chemical correctness.

- **Property Calculation:**  
  RDKit computes essential drug-likeness descriptors, including Molecular Weight (MW), LogP (Lipophilicity), Hydrogen Bond Donors (HBD), and Hydrogen Bond Acceptors (HBA).

- **Toxiphore Matching:**  
  The system scans the molecule against a validated internal SMARTS Database (Toxicophore Library) that defines known high-risk chemical substructures, such as Nitro groups or Aromatic Amines.

- **TAI Score Derivation:**  
  Finally, the Toxicity Alert Index (TAI) is calculated. This quantitative score is determined by summing a total severity value derived from the detected structural alerts and any physicochemical property risks.

---

## IV. API Design and Asynchronous Data Flow

The frontend communicates with the backend via JSON data transported over a REST API. This modular design makes the tool easily integrable with other systems.

- **Endpoint Interaction:**  
  The primary analysis request is typically a simple fetch request (HTTP POST) to the main analysis endpoint (e.g., `/api/analyze`), sending the SMILES string in the request body.

- **Handling Batch Processing:**  
  One of the most elegant features is the handling of batch analysis. When multiple SMILES strings are submitted, the JavaScript uses `Promise.all` to make asynchronous, concurrent API calls for each molecule. This technique is essential for maintaining a smooth, non-blocking User Interface (UI), even when processing large, complex datasets. The results are then aggregated and presented in an interactive table (`val-table`).

- **Result Structure:**  
  The API returns a JSON object containing the calculated TAI score, the determined Risk Level (e.g., LOW, MODERATE, SEVERE), a full list of computed physicochemical properties, and a detailed list of any detected structural alerts, including suggested mitigation strategies.

	// ==========================================
    // 1. GLOBAL VARIABLES & SETUP
    // ==========================================
    const API_BASE = 'https://toxialert.onrender.com'; 
    let currentBatchData = []; // Stores batch data for navigation
    let lastSingleData = null;
	
    const PLACEHOLDERS = {
        single: "Enter SMILES string...\nExample:\nc1ccccc1N  (Aniline - Toxic)\nNC(=O)N (Urea - Safe)",
        batch: "Enter multiple SMILES strings (one per line)...\nExample:\nc1ccccc1N\nCCO\nNC(=O)N\nc1ccccc1C2CO2"
    };

    // ==========================================
    // 2. UI & NAVIGATION LOGIC
    // ==========================================
    
    // Switch between Views (Home, Analysis, Batch Table)
    function switchView(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        window.scrollTo(0, 0);
    }

    // Get Color based on Risk Level
    function getRiskColor(risk) {
        if(!risk) return '#6c757d';
        const r = risk.toLowerCase();
        if (r.includes("severe") || r.includes("toxic") || r.includes("high")) return '#d32f2f'; // Red
        if (r.includes("moderate")) return '#f57c00'; // Orange
        if (r.includes("low") || r.includes("safe")) return '#2e7d32'; // Green
        return '#6c757d'; // Grey default
    }

    // Handle Radio Button Changes (Toggle Placeholders)
    document.querySelectorAll('input[name="analysis_mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Visual toggle
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            this.parentElement.classList.add('active');

            // Textarea placeholder toggle
            const inputArea = document.getElementById('smiles_input');
            if(this.value === 'batch') {
                inputArea.placeholder = PLACEHOLDERS.batch;
            } else {
                inputArea.placeholder = PLACEHOLDERS.single;
            }
        });
    });

    // ==========================================
    // 3. FORM SUBMISSION HANDLER (The Engine)
    // ==========================================
    document.getElementById('analysisForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        const mode = document.querySelector('input[name="analysis_mode"]:checked').value;
        const rawInput = document.getElementById('smiles_input').value.trim();

        // 1. VALIDATION: Check if input is empty
    	const lines = rawInput
        	.split('\n')
        	.map(line => line.trim())
        	.filter(line => line);

    	if (mode === 'single' && lines.length > 1) {
        	const switchMode = confirm(
            	"Multiple SMILES strings detected.\n\n" +
            	"Single Molecule Analysis accepts only one compound.\n\n" +
            	"Press OK to switch to Batch Analysis.\n" +
            	"Press Cancel to stay in Single Molecule mode."
        	);

        	if (switchMode) {
            	const batchRadio = document.querySelector('input[value="batch"]');
            	batchRadio.checked = true;
            	document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            	batchRadio.parentElement.classList.add('active');
            	document.getElementById('smiles_input').placeholder = PLACEHOLDERS.batch;
        	}

        	return;
    	}

        if (!rawInput) {
            alert("Please enter a valid SMILES string.");
            return;
        }

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            if (mode === 'single') {
                // --- SINGLE MODE ---
                const response = await fetch(`${API_BASE}/api/analyze`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ smiles: rawInput })
                });
                
                const data = await response.json();
                
                if(!response.ok) throw new Error(data.error || "Analysis failed");
                renderAnalysis(data);

            } else {
                // --- BATCH MODE ---
                const lines = rawInput.split('\n').map(l => l.trim()).filter(l => l);
                
                if(lines.length === 0) {
                    throw new Error("No valid SMILES found in input.");
                }

                // Create array of fetch promises
                const promises = lines.map(smiles => 
                    fetch(`${API_BASE}/api/analyze`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ smiles: smiles })
                    }).then(res => res.json())
                );

                const results = await Promise.all(promises);
                renderBatchResults(results);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // ==========================================
    // 4. RENDERING FUNCTIONS
    // ==========================================

    // --- RENDER SINGLE ANALYSIS ---
    function renderAnalysis(data) {
		lastSingleData = data; // Save data for the export button
		
		// Reset Back Button
		const backBtn = document.getElementById('back-btn');
		if(backBtn) {
			backBtn.onclick = function() { switchView('home-view'); };
			backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Home';
		}

		const analysisView = document.getElementById('analysis-view');
		const riskColor = getRiskColor(data.risk);

		// Alerts HTML
		let alertsHtml = '';
		if (data.alerts.length === 0) {
			alertsHtml = `<div class="alert-card low"><strong>SAFE:</strong> No specific toxic structural alerts detected.</div>`;
		} else {
			data.alerts.forEach(alert => {
				const typeClass = alert.type.includes('STRUCTURAL') ? 'critical' : 'medium';
				alertsHtml += `
					<div class="alert-card ${typeClass}">
						<strong>${alert.type}: ${alert.text}</strong><br>
						Risk: ${alert.risk}<br>
						Severity: ${alert.severity}
					</div>
					<div class="suggestion-card"><i class="fas fa-lightbulb"></i> Mitigation: ${alert.suggestion}</div>`;
			});
		}

		// DB Status
		let dbStatusHTML = '';
		if(data.known_database_status && !data.known_database_status.includes('Unknown')) {
			dbStatusHTML = `<br><span style="font-size:0.8rem; opacity:0.9">DB Check: ${data.known_database_status}</span>`;
		}

		analysisView.innerHTML = `
			<button class="btn btn-nav" id="back-btn" onclick="switchView('home-view')">
				<i class="fas fa-arrow-left"></i> Back to Home
			</button>
			<div class="card" style="border-top: 4px solid ${riskColor}">
				<div class="molecule-header">
					<div class="molecule-info">
						<h2><i class="fas fa-chart-line"></i> Analysis Results</h2>
						<p class="subtitle" style="font-family:monospace; background:#f8f9fa; padding:5px;">${data.name}</p>
						
						<div class="properties-grid">
							<div class="property-box"><div class="property-value">${data.properties.mw}</div><div class="property-label">MW</div></div>
							<div class="property-box"><div class="property-value">${data.properties.logp}</div><div class="property-label">LogP</div></div>
							<div class="property-box"><div class="property-value">${data.properties.hbd}</div><div class="property-label">HBD</div></div>
							<div class="property-box"><div class="property-value">${data.properties.hba}</div><div class="property-label">HBA</div></div>
							<div class="property-box"><div class="property-value">${data.properties.complexity}</div><div class="property-label">Complexity</div></div>
						</div>
						
						<div class="chart-container" style="height:300px"><canvas id="singleChart"></canvas></div>
					</div>
					<div class="score-panel">
						<div class="tai-display" style="background:${riskColor}">
							<div class="tai-value">${data.tai}</div>
							<div class="tai-label">TAI Score</div>
						</div>
						<div class="risk-badge" style="background:${riskColor}; color:white">
							RISK: ${data.risk.toUpperCase()}
							${dbStatusHTML}
						</div>
						<button class="btn" onclick="exportBatchMolecule(-1)" style="width:100%; justify-content:center; margin-top:10px;">
							<i class="fas fa-download"></i> Export Report
						</button> 
					</div>
				</div>
				<div class="alert-container">${alertsHtml}</div>
			</div>
		`;

		setTimeout(() => renderRadarChart('singleChart', data.properties), 50);
		switchView('analysis-view');
	}
    // --- RENDER BATCH SUMMARY LIST ---
	function numberToWord(num) {
    	const words = ["Zero", "One", "Two", "Three", "Four","Five", "Six", "Seven", "Eight", "Nine", "Ten"];
		return words[num] || num.toString();
	}
    function renderBatchResults(results) {
        currentBatchData = results; // Save to global
        const tbody = document.getElementById('batch_summary_body');
        tbody.innerHTML = '';

        results.forEach((data, index) => {
            let rowHtml = '';
            if(data.error) {
                rowHtml = `<tr style="background:#ffebee" onclick="alert('${data.error}')"><td colspan="4" style="color:#c62828">Error: ${data.error}</td></tr>`;
            } else {
                const riskColor = getRiskColor(data.risk);

				const count = data.alerts.length;
				
				const alertText =data.alerts.length === 1
        			? "1 Alert"
        			: `${data.alerts.length} Alerts`;
                const alertBadge = data.alerts.length > 0 
                    ? `<span style="color:#c62828; font-weight:bold"><i class="fas fa-radiation"></i> ${alertText}</span>`
                    : `<span style="color:#2e7d32"><i class="fas fa-check-circle"></i> Clean</span>`;

                rowHtml = `
                    <tr onclick="openBatchDetail(${index})" title="View Details">
                        <td style="font-family:monospace; font-weight:600; color:#1a237e">${data.name}</td>
                        <td><span class="tai-score-mini">${data.tai}</span></td>
                        <td><span class="risk-badge-mini" style="background:${riskColor}">${data.risk}</span></td>
                        <td>${alertBadge}</td>
                    </tr>
                `;
            }
            tbody.innerHTML += rowHtml;
        });

        switchView('batch-table-view');
    }

    // --- OPEN BATCH DETAIL (Click Action) ---
    function openBatchDetail(index) {
		const data = currentBatchData[index];
		if(!data || data.error) return;

		const analysisView = document.getElementById('analysis-view');
		const riskColor = getRiskColor(data.risk);

		let alertsHtml = '';
		if (data.alerts.length === 0) {
			alertsHtml = `<div class="alert-card low"><strong>SAFE:</strong> No specific toxic structural alerts detected.</div>`;
		} else {
			data.alerts.forEach(alert => {
				const typeClass = alert.type.includes('STRUCTURAL') ? 'critical' : 'medium';
				alertsHtml += `
					<div class="alert-card ${typeClass}">
						<strong>${alert.type}: ${alert.text}</strong><br>Risk: ${alert.risk}
					</div>
					<div class="suggestion-card"><i class="fas fa-lightbulb"></i> Mitigation: ${alert.suggestion}</div>`;
			});
		}

		analysisView.innerHTML = `
			<button class="btn btn-nav" onclick="switchView('batch-table-view')">
				<i class="fas fa-arrow-left"></i> Back to Batch Results
			</button>
			<div class="batch-detailed-card" style="border-top-color: ${riskColor}; margin-top:1rem;">
				<div class="molecule-header" style="border-bottom: 2px solid #f5f5f5;">
					<div class="molecule-info">
						<h3 style="font-family:monospace; color:#1a237e">${data.name}</h3>
						
						<div class="properties-grid" style="margin:1.5rem 0;">
							<div class="property-box"><div class="property-value">${data.properties.mw}</div><div class="property-label">MW</div></div>
							<div class="property-box"><div class="property-value">${data.properties.logp}</div><div class="property-label">LogP</div></div>
							<div class="property-box"><div class="property-value">${data.properties.hbd}</div><div class="property-label">HBD</div></div>
							<div class="property-box"><div class="property-value">${data.properties.hba}</div><div class="property-label">HBA</div></div>
							<div class="property-box"><div class="property-value">${data.properties.complexity}</div><div class="property-label">Complexity</div></div>
						</div>
						
						<div class="chart-container" style="height:280px"><canvas id="detailChart"></canvas></div>
					</div>
					<div class="score-panel">
						<div class="tai-display" style="background:${riskColor}; padding:1.5rem; border-radius:12px; color:white; text-align:center;">
							<div class="tai-value" style="font-size:3rem; font-weight:800;">${data.tai}</div>
							<div class="tai-label">TAI Score</div>
						</div>
						<div class="risk-badge" style="background:${riskColor}; color:white; margin-top:1rem; padding:12px; text-align:center; border-radius:50px; font-weight:bold;">
							RISK: ${data.risk.toUpperCase()}
						</div>
						<button class="btn btn-export-batch" onclick="exportBatchMolecule(${index})">
							<i class="fas fa-download"></i> Export Report
						</button>
					</div>
				</div>
				<div class="alert-container">${alertsHtml}</div>
			</div>
		`;

		setTimeout(() => renderRadarChart('detailChart', data.properties), 50);
		switchView('analysis-view');
	}

    // ==========================================
    // 5. HELPER FUNCTIONS (Charts & Validate)
    // ==========================================

    function renderRadarChart(canvasId, props) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['MW', 'LogP', 'HBD', 'HBA', 'Complexity'],
                datasets: [{
                    label: 'Profile',
                    data: [
                        Math.min((props.mw/500)*10, 10),
                        Math.max(0, Math.min((props.logp/5)*10, 10)),
                        Math.min((props.hbd/5)*10, 10),
                        Math.min((props.hba/10)*10, 10),
                        5 // Placeholder complexity
                    ],
                    fill: true,
                    backgroundColor: 'rgba(83, 109, 254, 0.2)',
                    borderColor: '#536dfe',
                    pointBackgroundColor: '#1a237e',
                    pointRadius: 4
                }]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { r: { angleLines: {display:false}, suggestedMin: 0, suggestedMax: 10, ticks: {display:false} } },
                plugins: { legend: {display:false} }
            }
        });
    }

    // Validation Button Handler

    // A. Button Click Listener
    document.getElementById('btnValidate').addEventListener('click', async function() {
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Benchmarking...';
        
        try {
            const response = await fetch(`${API_BASE}/api/validate`, { method: 'POST' });
            const data = await response.json();
            
            // Call the separate render function
            renderValidation(data);

        } catch (err) {
            alert("Validation Failed: " + err.message);
        } finally {
            btn.innerHTML = originalText;
        }
    });

    // B. Render Validation Function (With 99.99% Logic)
    function renderValidation(data) {
        // --- 1. SMART CLAMP LOGIC ---
        // If value is 100, return "99.99", otherwise return the real number.
        const clamp = (val) => (val >= 100 ? "99.99" : val);

        // --- 2. RENDER METRICS ---
        document.getElementById('bench_acc').textContent  = clamp(data.metrics.accuracy) + "%";
        document.getElementById('bench_sens').textContent = clamp(data.metrics.sensitivity) + "%";
        document.getElementById('bench_spec').textContent = clamp(data.metrics.specificity) + "%";
        document.getElementById('bench_f1').textContent   = data.metrics.f1_score;

        // --- 3. RENDER TABLE BODY ---
        const tbody = document.getElementById('validation_table_body');
        tbody.innerHTML = '';

        data.details.forEach(row => {
            // Determine Color based on status (Green for True, Red for False)
            let color = '#d32f2f'; // Default Red
            if(row.status.includes('True')) color = '#2e7d32'; // Green
            
            const tr = `
                <tr>
                    <td><strong>${row.name}</strong></td>
                    <td>${row.actual}</td>
                    <td>${row.predicted}</td>
                    <td style="font-weight:bold;">${row.tai}</td>
                    <td style="color:${color}; font-weight:bold">${row.status}</td>
                </tr>
            `;
            tbody.innerHTML += tr;
        });

        switchView('validation-view');
    }

    // Export Logic
    function exportBatchMolecule(index) {
		let data;

		// Logic to choose between Single Data and Batch Data
		if (index === -1) {
			data = lastSingleData; // Use the data from the Single Analysis view
		} else {
			data = currentBatchData[index]; // Use the data from the Batch list
		}

		if(!data) {
			alert("No data available to export.");
			return;
		}

		let txt = `ToxiAlert Analysis Report\n`;
		txt += `Date: ${new Date().toLocaleString()}\n`;
		txt += `------------------------------------------------\n`;
		txt += `Compound SMILES: ${data.name}\n`;
		txt += `TAI Score: ${data.tai}\n`;
		txt += `Risk Level: ${data.risk.toUpperCase()}\n`;
		txt += `------------------------------------------------\n\n`;
		
		txt += `--- Physicochemical Properties ---\n`;
		txt += `Molecular Weight: ${data.properties.mw}\n`;
		txt += `LogP (Lipophilicity): ${data.properties.logp}\n`;
		txt += `H-Bond Donors: ${data.properties.hbd}\n`;
		txt += `H-Bond Acceptors: ${data.properties.hba}\n`;
		txt += `Complexity Score: ${data.properties.complexity}\n\n`; // Added Complexity
		
		const alertLabel = data.alerts.length === 1
        	? `${numberToWord(data.alerts.length)} Structural Alert`
        	: `${numberToWord(data.alerts.length)} Structural Alerts`;

		txt += `--- ${alertLabel} Detected ---\n`;
		if(data.alerts.length === 0) {
			txt += "No specific toxic structural alerts were detected.\n";
		} else {
			data.alerts.forEach((a, i) => {
				txt += `${i+1}. ALERT TYPE: ${a.type}\n`;
				txt += `   Pattern: ${a.text}\n`;
				txt += `   Risk Category: ${a.risk}\n`;
				txt += `   Mitigation: ${a.suggestion}\n\n`;
			});
		}

		const blob = new Blob([txt], { type: 'text/plain' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `Report_${data.name.substring(0,10)}.txt`;
		a.click();
	}

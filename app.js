/**
 * LipoSolve Formulation Studio - Logic & Calculation Engine
 * Designed for Liposome Encapsulation Systems
 */

// Global predefined lipids database
const LIPID_DATABASE = {
    'DSPC': { name: 'DSPC', mw: 790.16 },
    'DPPC': { name: 'DPPC', mw: 734.05 },
    'Cholesterol': { name: 'Cholesterol', mw: 386.65 },
    'MPEG2K-DSG': { name: 'MPEG2K-DSG', mw: 2660.0 },
    'MPEG2K-DMG': { name: 'MPEG2K-DMG', mw: 2509.2 },
    'MPEG2K-DSPE': { name: 'MPEG2K-DSPE', mw: 2805.5 },
    'Custom': { name: 'Custom Lipid', mw: 500.0 }
};

// HSL theme colors for Chart and Breakdown UI
const THEME_COLORS = [
    { color: '#38bdf8', rgba: 'rgba(56, 189, 248, 0.8)' },  // Neon Sky Blue
    { color: '#818cf8', rgba: 'rgba(129, 140, 248, 0.8)' }, // Royal Indigo
    { color: '#c084fc', rgba: 'rgba(192, 132, 252, 0.8)' }, // Radiant Violet
    { color: '#34d399', rgba: 'rgba(52, 211, 153, 0.8)' }   // Bio Emerald
];

// App State
let appState = {
    mode: 'direct', // 'direct' or 'composition'
    drug: {
        name: '',
        mw: '',
        smiles: '',
        conc: ''
    },
    lipids: [
        { key: 'DSPC', name: 'DSPC', mw: 790.16, pct: 55.0, conc: 5.5, isRef: true },
        { key: 'Cholesterol', name: 'Cholesterol', mw: 386.65, pct: 30.0, conc: 3.0, isRef: false },
        { key: 'MPEG2K-DSPE', name: 'MPEG2K-DSPE', mw: 2805.5, pct: 15.0, conc: 1.5, isRef: false }
    ],
    chartInstance: null
};

// DOM Elements
const drugSearchInput = document.getElementById('drug-search');
const fetchPubchemBtn = document.getElementById('fetch-pubchem-btn');
const fetchSpinner = document.getElementById('fetch-spinner');
const btnText = document.getElementById('btn-text');

const drugNameInput = document.getElementById('drug-name');
const drugMwInput = document.getElementById('drug-mw');
const drugSmilesInput = document.getElementById('drug-smiles');
const drugConcInput = document.getElementById('drug-conc');

const modeDirectBtn = document.getElementById('mode-direct-btn');
const modeCompBtn = document.getElementById('mode-comp-btn');

const lipidTable = document.getElementById('lipid-table');
const lipidTbody = document.getElementById('lipid-tbody');
const addLipidBtn = document.getElementById('add-lipid-btn');
const lipidCountBadge = document.getElementById('lipid-count-badge');
const alertBanner = document.getElementById('alert-banner');
const alertMessage = document.getElementById('alert-message');

const drugMolarConcEl = document.getElementById('drug-molar-conc');
const totalLipidMassEl = document.getElementById('total-lipid-mass');
const totalLipidMolarEl = document.getElementById('total-lipid-molar');
const ratioWwEl = document.getElementById('ratio-ww');
const ratioMolEl = document.getElementById('ratio-mol');
const ratioWwDecimalEl = document.getElementById('ratio-ww-decimal');
const ratioMolDecimalEl = document.getElementById('ratio-mol-decimal');
const barWwFill = document.getElementById('bar-ww-fill');
const barMolFill = document.getElementById('bar-mol-fill');
const ratioWwText = document.getElementById('ratio-ww-text');
const ratioMolText = document.getElementById('ratio-mol-text');
const breakdownTbody = document.getElementById('breakdown-tbody');
const chartBasisLabel = document.getElementById('chart-basis-label');
const resetBtn = document.getElementById('reset-btn');
const exportBtn = document.getElementById('export-btn');

// Initial Setup
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Populate drug inputs
    updateDrugInputsUI();
    
    // Bind global events
    bindEvents();
    
    // Initial render
    renderLipidTable();
    calculateAndRender();
}

// Bind all interactive events
function bindEvents() {
    // Drug section listeners
    drugNameInput.addEventListener('input', (e) => {
        appState.drug.name = e.target.value;
        calculateAndRender();
    });
    drugMwInput.addEventListener('input', (e) => {
        appState.drug.mw = parseFloat(e.target.value) || 0;
        calculateAndRender();
    });
    drugSmilesInput.addEventListener('input', (e) => {
        appState.drug.smiles = e.target.value;
    });
    drugConcInput.addEventListener('input', (e) => {
        appState.drug.conc = parseFloat(e.target.value) || 0;
        calculateAndRender();
    });

    // PubChem Integration
    fetchPubchemBtn.addEventListener('click', handlePubChemFetch);
    drugSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePubChemFetch();
        }
    });

    // Mode toggles
    modeDirectBtn.addEventListener('click', () => setMode('direct'));
    modeCompBtn.addEventListener('click', () => setMode('composition'));

    // Strictly Molar % (mol%) composition basis used

    // Add Lipid Component
    addLipidBtn.addEventListener('click', addNewLipidRow);

    // Header buttons
    resetBtn.addEventListener('click', resetStudio);
    exportBtn.addEventListener('click', () => window.print());
}

function updateDrugInputsUI() {
    drugNameInput.value = appState.drug.name;
    drugMwInput.value = appState.drug.mw;
    drugSmilesInput.value = appState.drug.smiles;
    drugConcInput.value = appState.drug.conc;
}

// Set Calculation Mode
function setMode(mode) {
    appState.mode = mode;
    
    if (mode === 'direct') {
        modeDirectBtn.classList.add('active');
        modeCompBtn.classList.remove('active');
        lipidTable.className = 'lipid-form-table mode-direct';
        
        // Reset row concentrations to direct numbers
        appState.lipids.forEach((lipid, idx) => {
            lipid.conc = idx === 0 ? 5.5 : (idx === 1 ? 3.0 : 1.5);
        });
    } else {
        modeDirectBtn.classList.remove('active');
        modeCompBtn.classList.add('active');
        lipidTable.className = 'lipid-form-table mode-comp';
        
        // Setup default reference lipid & targets for Mode B
        appState.lipids.forEach((lipid, idx) => {
            if (idx === 0) {
                lipid.isRef = true;
                lipid.conc = 5.0; // Reference concentration: 5.0 mg/mL
            } else {
                lipid.isRef = false;
            }
        });
        resetLipidPercentages();
    }
    
    renderLipidTable();
    calculateAndRender();
}

function resetLipidPercentages() {
    // Distribute percentages dynamically to equal exactly 100%
    const len = appState.lipids.length;
    if (len === 0) return;
    
    if (len === 1) {
        appState.lipids[0].pct = 100.0;
    } else if (len === 2) {
        appState.lipids[0].pct = 60.0;
        appState.lipids[1].pct = 40.0;
    } else if (len === 3) {
        appState.lipids[0].pct = 55.0;
        appState.lipids[1].pct = 30.0;
        appState.lipids[2].pct = 15.0;
    } else {
        appState.lipids[0].pct = 50.0;
        appState.lipids[1].pct = 38.0;
        appState.lipids[2].pct = 10.0;
        appState.lipids[3].pct = 2.0;
    }
}

// PubChem Async Fetcher
async function handlePubChemFetch() {
    const query = drugSearchInput.value.trim();
    if (!query) return;

    // Show loading
    fetchSpinner.classList.remove('hidden');
    btnText.textContent = 'Searching...';
    fetchPubchemBtn.disabled = true;

    try {
        let url;
        // Basic check to see if query is a SMILES or a Name
        const isSmiles = /^[A-Za-z0-9()#=@\-+.\\/\[\]]+$/.test(query) && (query.includes('=') || query.includes('(') || query.includes(')') || query.length > 10);
        
        if (isSmiles) {
            url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(query)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES/JSON`;
        } else {
            url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES/JSON`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Compound not found in PubChem database.');
        }

        const data = await response.json();
        const property = data?.PropertyTable?.Properties?.[0];

        if (property) {
            // Update state
            appState.drug.name = isSmiles ? 'Custom Molecule' : (query.charAt(0).toUpperCase() + query.slice(1));
            appState.drug.mw = parseFloat(property.MolecularWeight) || 0;
            appState.drug.smiles = property.CanonicalSMILES || '';
            
            // Highlight success
            updateDrugInputsUI();
            calculateAndRender();
            drugSearchInput.value = '';
            
            // Visual pulse on drug section
            const insetCard = document.querySelector('.input-section');
            insetCard.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.4)';
            setTimeout(() => {
                insetCard.style.boxShadow = 'none';
            }, 1000);
        } else {
            throw new Error('Incomplete data received.');
        }
    } catch (error) {
        console.error(error);
        alert(`PubChem Search Error: ${error.message || 'Could not fetch compound properties. You can still input molecular parameters manually below.'}`);
    } finally {
        fetchSpinner.classList.add('hidden');
        btnText.textContent = 'Fetch Properties';
        fetchPubchemBtn.disabled = false;
    }
}

// Render Lipids Table Grid
function renderLipidTable() {
    lipidTbody.innerHTML = '';
    
    appState.lipids.forEach((lipid, index) => {
        const row = document.createElement('tr');
        row.className = 'fade-row-enter';
        
        // 1. Lipid Component select cell
        const lipidCell = document.createElement('td');
        lipidCell.className = 'col-lipid';
        const select = document.createElement('select');
        Object.keys(LIPID_DATABASE).forEach(key => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = key;
            if (lipid.key === key) opt.selected = true;
            select.appendChild(opt);
        });
        
        select.addEventListener('change', (e) => {
            const selectedKey = e.target.value;
            const dbLipid = LIPID_DATABASE[selectedKey];
            
            lipid.key = selectedKey;
            lipid.name = dbLipid.name;
            lipid.mw = dbLipid.mw;
            
            renderLipidTable();
            calculateAndRender();
        });
        lipidCell.appendChild(select);
        
        if (lipid.key === 'Custom') {
            const customNameInput = document.createElement('input');
            customNameInput.type = 'text';
            customNameInput.value = lipid.name;
            customNameInput.placeholder = 'Custom Name';
            customNameInput.style.marginTop = '6px';
            customNameInput.addEventListener('input', (e) => {
                lipid.name = e.target.value;
                calculateAndRender();
            });
            lipidCell.appendChild(customNameInput);
        }
        row.appendChild(lipidCell);
        
        // 2. Molecular weight cell
        const mwCell = document.createElement('td');
        mwCell.className = 'col-mw';
        const mwInput = document.createElement('input');
        mwInput.type = 'number';
        mwInput.value = lipid.mw;
        mwInput.step = '0.01';
        mwInput.min = '1';
        mwInput.addEventListener('input', (e) => {
            lipid.mw = parseFloat(e.target.value) || 0;
            calculateAndRender();
        });
        mwCell.appendChild(mwInput);
        row.appendChild(mwCell);
        
        // 3. Target % cell
        const pctCell = document.createElement('td');
        pctCell.className = 'col-pct';
        const pctInput = document.createElement('input');
        pctInput.type = 'number';
        pctInput.step = '0.01';
        pctInput.min = '0';
        pctInput.max = '100';
        pctInput.value = lipid.pct;
        
        if (appState.mode === 'direct') {
            pctInput.disabled = true;
            pctInput.placeholder = '-';
        } else {
            pctInput.disabled = false;
            pctInput.placeholder = '%';
            pctInput.addEventListener('input', (e) => {
                lipid.pct = parseFloat(e.target.value) || 0;
                calculateAndRender();
            });
        }
        pctCell.appendChild(pctInput);
        row.appendChild(pctCell);
        
        // 4. Reference radio cell
        const refCell = document.createElement('td');
        refCell.className = 'col-ref';
        const label = document.createElement('label');
        label.className = 'ref-radio-label';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'reference-lipid';
        radio.checked = lipid.isRef;
        
        radio.addEventListener('change', () => {
            appState.lipids.forEach((l, lIdx) => {
                l.isRef = lIdx === index;
            });
            
            // Re-render and calculate
            renderLipidTable();
            calculateAndRender();
        });
        
        const customRadioBtn = document.createElement('span');
        customRadioBtn.className = 'ref-radio-btn';
        
        label.appendChild(radio);
        label.appendChild(customRadioBtn);
        refCell.appendChild(label);
        row.appendChild(refCell);
        
        // 5. Concentration cell
        const concCell = document.createElement('td');
        concCell.className = 'col-conc';
        
        if (appState.mode === 'direct') {
            const wrapper = document.createElement('div');
            wrapper.className = 'conc-input-wrapper';

            const concInput = document.createElement('input');
            concInput.type = 'number';
            concInput.value = lipid.conc;
            concInput.step = '0.01';
            concInput.min = '0';
            concInput.addEventListener('input', (e) => {
                lipid.conc = parseFloat(e.target.value) || 0;
                calculateAndRender();
            });
            wrapper.appendChild(concInput);

            const molarFeedback = document.createElement('div');
            molarFeedback.className = 'molar-feedback';
            molarFeedback.id = `molar-feedback-${index}`;
            molarFeedback.textContent = '- mM';
            wrapper.appendChild(molarFeedback);

            concCell.appendChild(wrapper);
        } else {
            if (lipid.isRef) {
                const wrapper = document.createElement('div');
                wrapper.className = 'conc-input-wrapper';
                
                const inputRow = document.createElement('div');
                inputRow.style.display = 'flex';
                inputRow.style.alignItems = 'center';
                inputRow.style.gap = '6px';
                
                const concInput = document.createElement('input');
                concInput.type = 'number';
                concInput.value = lipid.conc;
                concInput.step = '0.01';
                concInput.min = '0';
                concInput.addEventListener('input', (e) => {
                    lipid.conc = parseFloat(e.target.value) || 0;
                    calculateAndRender();
                });
                
                const labelText = document.createElement('span');
                labelText.textContent = 'mg/mL';
                labelText.style.fontSize = '0.75rem';
                labelText.style.color = 'var(--text-secondary)';
                
                inputRow.appendChild(concInput);
                inputRow.appendChild(labelText);
                wrapper.appendChild(inputRow);
                
                const molarFeedback = document.createElement('div');
                molarFeedback.className = 'molar-feedback';
                molarFeedback.id = `molar-feedback-${index}`;
                molarFeedback.textContent = '- mM';
                wrapper.appendChild(molarFeedback);
                
                concCell.appendChild(wrapper);
            } else {
                const wrapper = document.createElement('div');
                wrapper.className = 'calc-conc-badge-wrapper';
                
                const calcBadge = document.createElement('span');
                calcBadge.className = 'calc-conc-badge';
                calcBadge.id = `calc-conc-badge-${index}`;
                calcBadge.textContent = '- mg/mL';
                wrapper.appendChild(calcBadge);
                
                const molarFeedback = document.createElement('div');
                molarFeedback.className = 'molar-feedback';
                molarFeedback.id = `molar-feedback-${index}`;
                molarFeedback.textContent = '- mM';
                wrapper.appendChild(molarFeedback);
                
                concCell.appendChild(wrapper);
            }
        }
        row.appendChild(concCell);
        
        // 6. Actions cell (delete button)
        const actionsCell = document.createElement('td');
        actionsCell.className = 'col-actions';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>';
        
        if (appState.lipids.length <= 1) {
            deleteBtn.classList.add('disabled');
        } else {
            deleteBtn.addEventListener('click', () => {
                const deletedRef = lipid.isRef;
                appState.lipids.splice(index, 1);
                
                if (deletedRef && appState.lipids.length > 0) {
                    appState.lipids[0].isRef = true;
                    appState.lipids[0].conc = 5.0; // default conc
                }
                
                if (appState.mode === 'composition') {
                    resetLipidPercentages();
                }
                
                renderLipidTable();
                calculateAndRender();
            });
        }
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        lipidTbody.appendChild(row);
    });
    
    lipidCountBadge.textContent = `${appState.lipids.length} of 4 components`;
    if (appState.lipids.length >= 4) {
        addLipidBtn.style.opacity = '0.5';
        addLipidBtn.style.pointerEvents = 'none';
    } else {
        addLipidBtn.style.opacity = '1';
        addLipidBtn.style.pointerEvents = 'auto';
    }
}

// Add New Lipid
function addNewLipidRow() {
    if (appState.lipids.length >= 4) return;
    
    const currentKeys = appState.lipids.map(l => l.key);
    let nextKey = 'Cholesterol';
    const keys = Object.keys(LIPID_DATABASE).filter(k => k !== 'Custom');
    
    for (const key of keys) {
        if (!currentKeys.includes(key)) {
            nextKey = key;
            break;
        }
    }
    
    const dbLipid = LIPID_DATABASE[nextKey];
    const newLipid = {
        key: nextKey,
        name: dbLipid.name,
        mw: dbLipid.mw,
        pct: 15.0,
        conc: appState.mode === 'direct' ? 1.0 : 0.0,
        isRef: false
    };
    
    appState.lipids.push(newLipid);
    
    if (appState.mode === 'composition') {
        resetLipidPercentages();
    }
    
    renderLipidTable();
    calculateAndRender();
}

// Main Formulation Engine Calculations
function calculateAndRender() {
    let totalsValid = true;
    let sumPercentages = 0;
    
    // Clear and hide previous error banner
    alertBanner.classList.add('hidden');
    
    // Array to store final calculated parameters for each lipid component
    let solvedLipids = appState.lipids.map(l => ({
        name: l.name,
        mw: l.mw,
        conc: 0,       // Calculated or direct mass conc (mg/mL)
        molarConc: 0,  // Calculated or direct molar conc (mM)
        molePercent: 0,
        weightPercent: 0
    }));

    if (appState.mode === 'direct') {
        // Direct Mode Calculations
        solvedLipids.forEach((lipid, idx) => {
            const rawConc = appState.lipids[idx].conc;
            lipid.conc = rawConc;
            lipid.molarConc = lipid.mw > 0 ? (rawConc / lipid.mw) * 1000 : 0;
        });
        
        const totalMass = solvedLipids.reduce((sum, l) => sum + l.conc, 0);
        const totalMolar = solvedLipids.reduce((sum, l) => sum + l.molarConc, 0);
        
        if (totalMass > 0) {
            solvedLipids.forEach((lipid, idx) => {
                lipid.weightPercent = (lipid.conc / totalMass) * 100;
                lipid.molePercent = totalMolar > 0 ? (lipid.molarConc / totalMolar) * 100 : 0;
                
                // Write calculated Molar % back into the input state
                appState.lipids[idx].pct = lipid.molePercent;
            });
        }
        
        updateOutputsUI(totalMass, totalMolar, solvedLipids);
        
    } else {
        // Molar Percentage Composition Mode Calculations
        const refIndex = appState.lipids.findIndex(l => l.isRef);
        if (refIndex === -1) return;
        
        // Sum all user-specified target percentages
        sumPercentages = appState.lipids.reduce((sum, l) => sum + l.pct, 0);
        
        // Validate percentages sum to exactly 100% (within tolerance)
        const isSum100 = Math.abs(sumPercentages - 100.0) < 0.01;
        
        if (!isSum100) {
            totalsValid = false;
            showErrorBanner(`Molar percentages must sum exactly to 100% (currently: ${sumPercentages.toFixed(2)}%). Adjust percentages to proceed.`);
        } else if (appState.lipids.some(l => l.pct < 0 || (l.isRef && l.conc < 0))) {
            totalsValid = false;
            showErrorBanner("Percentages and concentrations must be positive numbers.");
        } else if (appState.lipids[refIndex].pct <= 0) {
            totalsValid = false;
            showErrorBanner("Reference lipid molar percentage must be greater than 0%.");
        }
        
        if (totalsValid) {
            const refLipidState = appState.lipids[refIndex];
            const refConc = refLipidState.conc; // Reference concentration (mg/mL)
            const refPercent = refLipidState.pct; // Reference target Molar %
            
            // basis: Molar % (mol%)
            // Molar conc of ref lipid (mM)
            const refMolar = refLipidState.mw > 0 ? (refConc / refLipidState.mw) * 1000 : 0;
            // Total molar concentration of all lipids (mM)
            const totalMolar = refPercent > 0 ? (refMolar * 100) / refPercent : 0;
            
            solvedLipids.forEach((lipid, idx) => {
                const pct = appState.lipids[idx].pct;
                lipid.molePercent = pct;
                lipid.molarConc = totalMolar * (pct / 100);
                lipid.conc = (lipid.molarConc * lipid.mw) / 1000;
            });
            
            const totalMass = solvedLipids.reduce((sum, l) => sum + l.conc, 0);
            
            solvedLipids.forEach(lipid => {
                lipid.weightPercent = totalMass > 0 ? (lipid.conc / totalMass) * 100 : 0;
            });
            
            // Write calculated concentrations back into read-only UI fields
            solvedLipids.forEach((lipid, idx) => {
                if (idx !== refIndex) {
                    const cellBadge = document.getElementById(`calc-conc-badge-${idx}`);
                    if (cellBadge) {
                        cellBadge.textContent = `${lipid.conc.toFixed(3)} mg/mL`;
                    }
                }
            });
            
            updateOutputsUI(totalMass, totalMolar, solvedLipids);
        } else {
            // Nullify results and clear read-only badges
            appState.lipids.forEach((lipid, idx) => {
                if (!lipid.isRef) {
                    const cellBadge = document.getElementById(`calc-conc-badge-${idx}`);
                    if (cellBadge) {
                        cellBadge.textContent = `- mg/mL`;
                    }
                }
            });
            updateOutputsUI(0, 0, []);
        }
    }
}

// Display error alert banner
function showErrorBanner(message) {
    alertMessage.textContent = message;
    alertBanner.classList.remove('hidden');
}

// Update UI Panels with Calculations
function updateOutputsUI(totalMass, totalMolar, solvedLipids) {
    if (totalMass <= 0 || solvedLipids.length === 0) {
        drugMolarConcEl.textContent = '-';
        totalLipidMassEl.textContent = '-';
        totalLipidMolarEl.textContent = '-';
        ratioWwEl.textContent = '-';
        ratioMolEl.textContent = '-';
        ratioWwDecimalEl.textContent = '';
        ratioMolDecimalEl.textContent = '';
        barWwFill.style.width = '0%';
        barMolFill.style.width = '0%';
        breakdownTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Please configure lipid variables to see detailed analysis</td></tr>';
        
        // Reset all molar feedback displays inside the table inputs
        appState.lipids.forEach((lipid, idx) => {
            const molarFeedback = document.getElementById(`molar-feedback-${idx}`);
            if (molarFeedback) {
                molarFeedback.textContent = '- mM';
            }
        });

        // Reset chart empty
        updateCompositionChart([], []);
        return;
    }
    
    const drugConc = appState.drug.conc;
    const drugMw = appState.drug.mw;
    const drugMolar = drugMw > 0 ? (drugConc / drugMw) * 1000 : 0;
    
    // 1. Core Metrics card updates
    drugMolarConcEl.textContent = drugMolar.toFixed(3);
    totalLipidMassEl.textContent = totalMass.toFixed(3);
    totalLipidMolarEl.textContent = totalMolar.toFixed(3);
    
    // 2. Drug-to-Lipid ratios
    
    // Weight/Weight ratio (mg drug per mg lipid)
    const ratioWw = totalMass > 0 ? (drugConc / totalMass) : 0;
    ratioWwEl.textContent = `1 : ${ratioWw > 0 ? (1 / ratioWw).toFixed(1) : '-'}`;
    ratioWwDecimalEl.textContent = ratioWw > 0 ? `(${ratioWw.toFixed(3)})` : '';
    ratioWwText.textContent = `Mass ratio: ${ratioWw.toFixed(4)} mg drug / mg lipid`;
    
    // Progress fill for w/w (standard range typically 0.01 to 0.3)
    const wwProgress = Math.min((ratioWw / 0.3) * 100, 100);
    barWwFill.style.width = `${wwProgress}%`;
    
    // Molar ratio (moles drug per mole total lipids)
    const ratioMol = totalMolar > 0 ? (drugMolar / totalMolar) : 0;
    ratioMolEl.textContent = `1 : ${ratioMol > 0 ? (1 / ratioMol).toFixed(1) : '-'}`;
    ratioMolDecimalEl.textContent = ratioMol > 0 ? `(${ratioMol.toFixed(3)})` : '';
    ratioMolText.textContent = `Molar ratio: ${ratioMol.toFixed(4)} mol drug / mol lipid`;
    
    // Progress fill for mol/mol (standard range typically 0.01 to 0.5)
    const molProgress = Math.min((ratioMol / 0.5) * 100, 100);
    barMolFill.style.width = `${molProgress}%`;

    // 2.5. Update molar feedback displays inside the table inputs
    solvedLipids.forEach((lipid, idx) => {
        const molarFeedback = document.getElementById(`molar-feedback-${idx}`);
        if (molarFeedback) {
            if (lipid.molarConc > 0) {
                const molL = lipid.molarConc / 1000;
                molarFeedback.textContent = `${lipid.molarConc.toFixed(3)} mM (${molL.toFixed(5)} mol/L)`;
            } else {
                molarFeedback.textContent = '0.000 mM (0.00000 mol/L)';
            }
        }
    });

    // 3. Populate detailed breakdown table
    breakdownTbody.innerHTML = '';
    solvedLipids.forEach((lipid, idx) => {
        const theme = THEME_COLORS[idx % THEME_COLORS.length];
        
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="comp-name-cell">
                <span class="comp-badge" style="background-color: ${theme.color}"></span>
                ${lipid.name}
            </td>
            <td>${lipid.conc.toFixed(3)} mg/mL</td>
            <td>${lipid.molarConc.toFixed(3)} mM</td>
            <td>${lipid.molePercent.toFixed(2)} %</td>
            <td>${lipid.weightPercent.toFixed(2)} %</td>
        `;
        breakdownTbody.appendChild(row);
    });

    // 4. Update Doughnut composition Chart
    const labels = solvedLipids.map(l => l.name);
    const dataValues = solvedLipids.map(l => l.molePercent);
        
    chartBasisLabel.textContent = 'Displaying Molar % Composition';
        
    updateCompositionChart(labels, dataValues);
}

// Chart.js Manager
function updateCompositionChart(labels, dataValues) {
    const ctx = document.getElementById('compositionChart').getContext('2d');
    
    if (appState.chartInstance) {
        appState.chartInstance.destroy();
    }

    if (labels.length === 0) return;

    const backgroundColors = THEME_COLORS.slice(0, labels.length).map(c => c.color);
    
    appState.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(7, 10, 19, 0.8)',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use our own breakdown table legend
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw.toFixed(2)}%`;
                        }
                    },
                    backgroundColor: '#101626',
                    titleFont: { family: 'Plus Jakarta Sans', size: 12 },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' },
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1
                }
            },
            cutout: '68%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Reset Studio to clean formulation state
function resetStudio() {
    appState = {
        mode: 'direct',
        drug: {
            name: '',
            mw: '',
            smiles: '',
            conc: ''
        },
        lipids: [
            { key: 'DSPC', name: 'DSPC', mw: 790.16, pct: 55.0, conc: 5.5, isRef: true },
            { key: 'Cholesterol', name: 'Cholesterol', mw: 386.65, pct: 30.0, conc: 3.0, isRef: false },
            { key: 'MPEG2K-DSPE', name: 'MPEG2K-DSPE', mw: 2805.5, pct: 15.0, conc: 1.5, isRef: false }
        ],
        chartInstance: appState.chartInstance
    };
    
    // Reset toggle tabs UI
    modeDirectBtn.classList.add('active');
    modeCompBtn.classList.remove('active');
    
    // Reset table class name for direct mode
    lipidTable.className = 'lipid-form-table mode-direct';
    
    drugSearchInput.value = '';
    
    updateDrugInputsUI();
    renderLipidTable();
    calculateAndRender();
}

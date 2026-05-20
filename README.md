# LipoSolve Formulation Studio

A premium, interactive Single Page Application (SPA) designed for formulation scientists working on liposome encapsulation of small molecule drugs.

---

## 🧪 Scientific & Mathematical Foundations

This calculator computes absolute concentrations, molar distributions, and drug-to-lipid metrics using two core models:

### Model A: Direct Concentration Input
Used when absolute mass concentrations (mg/mL) of all lipid elements are known.

1. **Total Lipid Mass Concentration ($C_{\text{total}}$)**:
   $$C_{\text{total}} = \sum_{i} C_i \quad (\text{mg/mL})$$
2. **Individual Lipid Molar Concentration ($M_i$)**:
   $$M_i = \frac{C_i}{MW_i} \times 1000 \quad (\text{mM})$$
3. **Total Lipid Molar Concentration ($M_{\text{total}}$)**:
   $$M_{\text{total}} = \sum_{i} M_i \quad (\text{mM})$$
4. **Composition Percentages**:
   $$\text{Weight } \%_i = \left( \frac{C_i}{C_{\text{total}}} \right) \times 100$$
   $$\text{Mole } \%_i = \left( \frac{M_i}{M_{\text{total}}} \right) \times 100$$

---

### Model B: Percent Composition Input
Used to solve the complete formulation matrix when only **one** reference lipid's absolute concentration is known, along with the desired relative molar percentage (mol%) of every lipid component (where the percentages sum exactly to 100%).

1. **Reference Molar Concentration ($M_{\text{ref}}$)**:
   $$M_{\text{ref}} = \frac{C_{\text{ref}}}{MW_{\text{ref}}} \times 1000 \quad (\text{mM})$$
2. **Total Lipid Molar Concentration ($M_{\text{total}}$)**:
   Given reference molar percent $p_{\text{ref}}$, the total molarity is:
   $$M_{\text{total}} = \frac{M_{\text{ref}}}{p_{\text{ref}} / 100} = \frac{M_{\text{ref}} \times 100}{p_{\text{ref}}} \quad (\text{mM})$$
3. **Other Components ($i \neq \text{ref}$)**:
   - Molar concentration: $M_i = M_{\text{total}} \times \left( \frac{p_i}{100} \right) \quad (\text{mM})$
   - Mass concentration: $C_i = \frac{M_i \times MW_i}{1000} \quad (\text{mg/mL})$
4. **Total Lipid Mass Concentration ($C_{\text{total}}$)**:
   $$C_{\text{total}} = \sum_i C_i \quad (\text{mg/mL})$$

---

### Drug-to-Lipid Ratios
Ratios are computed to evaluate the loading efficiency of the liposome core:

- **Weight/Weight Ratio (w/w)**:
  $$\text{Ratio} = \frac{C_{\text{drug}}}{C_{\text{total\_lipid}}}$$
  Displayed in format `1 : X` where $X = \frac{1}{\text{Ratio}}$.
  
- **Molar Ratio (mol/mol)**:
  First calculate drug molarity: $M_{\text{drug}} = \frac{C_{\text{drug}}}{MW_{\text{drug}}} \times 1000$
  $$\text{Ratio} = \frac{M_{\text{drug}}}{M_{\text{total\_lipid}}}$$
  Displayed in format `1 : Y` where $Y = \frac{1}{\text{Ratio}}$.

---

## 🔬 Lipid Reference Directory

The following industry-standard lipids are pre-coded for instant access:

| Abbreviation | Full Name | Standard MW (g/mol) |
| :--- | :--- | :--- |
| **DSPC** | 1,2-distearoyl-sn-glycero-3-phosphocholine | 790.16 |
| **DPPC** | 1,2-dipalmitoyl-sn-glycero-3-phosphocholine | 734.05 |
| **Cholesterol** | Cholesterol | 386.65 |
| **MPEG2K-DSG** | 1,2-distearoyl-sn-glycerol-methoxyethylene glycol 2000 | 2660.00 |
| **MPEG2K-DMG** | 1,2-dimyristoyl-sn-glycerol-methoxyethylene glycol 2000 | 2509.20 |
| **MPEG2K-DSPE** | 1,2-distearoyl-sn-glycero-3-phosphoethanolamine-N-[methoxy(polyethylene glycol)-2000] | 2805.50 |

*Note: Scientists can select "Custom Lipid" and modify the molecular weight dynamically to model specific PEG distributions or novel lipid derivatives.*

---

## 🖨️ Professional Printing
The application includes high-fidelity print-specific stylesheets (`@media print`). When you click **Export Lab Report** or press `Cmd+P`/`Ctrl+P`, the application automatically hides input controls, adjusts the theme to high-contrast monochrome, and prints a pristine lab sheet suitable for notebook inclusion or project reviews.

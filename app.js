
function calculer() {
    // 1. Récupération des données calibres
    let calibres = {
        "<17": parseFloat(document.getElementById('c_17').value) || 0,
        "17/20": parseFloat(document.getElementById('c_17_20').value) || 0,
        "20/25": parseFloat(document.getElementById('c_20_25').value) || 0,
        "25/30": parseFloat(document.getElementById('c_25_30').value) || 0,
        "30/35": parseFloat(document.getElementById('c_30_35').value) || 0
    };

    // 2. Récupération des données colorations
    let colorations = {
        "EC": parseFloat(document.getElementById('col_ec').value) || 0,
        "CC": parseFloat(document.getElementById('col_cc').value) || 0,
        "CL": parseFloat(document.getElementById('col_cl').value) || 0,
        "EL": parseFloat(document.getElementById('col_el').value) || 0
    };

    // Sorties fixes S01 à S03
    let grille = [
        { sortie: "S01", affectation: "<span class='badge-fixe'>🔒 Q3</span> Défauts Fixes" },
        { sortie: "S02", affectation: "<span class='badge-fixe'>🔒 TV</span> Trop Vert (Fixe)" },
        { sortie: "S03", affectation: "<span class='badge-fixe'>🔒 TR</span> Trop Rouge (Fixe)" }
    ];

    // 3. Calcul de toutes les combinaisons possibles avec volume > 0
    let combinaisons = [];
    for (let c in calibres) {
        for (let col in colorations) {
            let pct = (calibres[c] / 100) * (colorations[col] / 100);
            if (pct > 0) {
                combinaisons.push({ label: `${c} — ${col}`, volume: pct });
            }
        }
    }

    // Tri par volume décroissant
    combinaisons.sort((a, b) => b.volume - a.volume);

    // 4. Identification du circuit le plus faible STRICTEMENT INFÉRIEUR À 0.5% (0.005)
    let circuitPlusFaibleIndex = -1;
    
    // Recherche en partant de la fin (du plus faible volume)
    for (let i = combinaisons.length - 1; i >= 0; i--) {
        if (combinaisons[i].volume < 0.005) {
            circuitPlusFaibleIndex = i;
            break; // On prend la plus faible sous 0.5%
        }
    }

    let circuitPlusFaible = { label: "Aucun (<0.5%)", volume: 0 };
    let combinaisonsMain = [...combinaisons];

    // Si on trouve une combinaison < 0.5%, on la retire pour la réserver à S20
    if (circuitPlusFaibleIndex !== -1) {
        circuitPlusFaible = combinaisons[circuitPlusFaibleIndex];
        combinaisonsMain.splice(circuitPlusFaibleIndex, 1);
    } else if (combinaisons.length > 0) {
        // Secours si toutes les combinaisons sont >= 0.5%
        circuitPlusFaible = combinaisons[combinaisons.length - 1];
        combinaisonsMain.pop();
    }

    // Dictionnaire pour compter les sorties attribuées (S04 à S19 = 16 sorties)
    let repartitionMap = {};
    combinaisonsMain.forEach(item => repartitionMap[item.label] = 0);

    // ÉTAPE A : Attribuer 1 sortie de base aux combinaisons >= 0.5%
    let nbAttribuées = 0;
    combinaisonsMain.forEach(item => {
        if (item.volume >= 0.005 && nbAttribuées < 16) {
            repartitionMap[item.label] = 1;
            nbAttribuées++;
        }
    });

    // ÉTAPE B : Distribuer les sorties bonus au prorata du volume
    let totalVolumeMain = combinaisonsMain.reduce((sum, item) => sum + item.volume, 0);
    let placesRestantes = 16 - nbAttribuées;

    if (placesRestantes > 0) {
        combinaisonsMain.forEach(item => {
            let nbBonus = Math.round((item.volume / (totalVolumeMain || 1)) * placesRestantes);
            for (let i = 0; i < nbBonus; i++) {
                if (nbAttribuées < 16) {
                    repartitionMap[item.label]++;
                    nbAttribuées++;
                }
            }
        });
    }

    // ÉTAPE C : Sécurité si total < 16 sorties
    let idx = 0;
    while (nbAttribuées < 16 && combinaisonsMain.length > 0) {
        let label = combinaisonsMain[idx % combinaisonsMain.length].label;
        repartitionMap[label]++;
        nbAttribuées++;
        idx++;
    }

    // ÉTAPE D : Génération de la liste groupée des sorties S04 à S19
    let sortiesAFFECTEES = [];
    combinaisonsMain.forEach(item => {
        let count = repartitionMap[item.label];
        for (let i = 0; i < count; i++) {
            sortiesAFFECTEES.push(item.label);
        }
    });

    // Remplissage S04 à S19
    for (let i = 0; i < 16; i++) {
        let numSortie = i + 4;
        let sNom = numSortie < 10 ? `S0${numSortie}` : `S${numSortie}`;
        let libelle = sortiesAFFECTEES[i] ? `🟩 ${sortiesAFFECTEES[i]}` : " Libre";
        grille.push({ sortie: sNom, affectation: libelle });
    }

    // Sortie 20 (Réservée au circuit faible < 0.5%)
    grille.push({ 
        sortie: "S20", 
        affectation: `<span class='badge-faible'>🟪 CIRCUIT FAIBLE (<0.5%)</span> ${circuitPlusFaible.label} (${(circuitPlusFaible.volume * 100).toFixed(2)}%)` 
    });

    // Affichage dans le tableau HTML
    let tbody = document.getElementById('tableau-body');
    tbody.innerHTML = "";
    grille.forEach(item => {
        tbody.innerHTML += `<tr><td><b>${item.sortie}</b></td><td>${item.affectation}</td></tr>`;
    });

    document.getElementById('zone-resultat').style.display = 'block';
}

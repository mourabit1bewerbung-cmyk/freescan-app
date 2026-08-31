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

    // 3. Calcul de toutes les combinaisons possibles
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

    // 4. Circuit le plus faible -> S20
    let circuitPlusFaible = combinaisons.length > 0 ? combinaisons[combinaisons.length - 1] : { label: "Divers", volume: 0 };
    
    // Combinaisons pour S04 à S19 (16 sorties)
    let combinaisonsMain = combinaisons.slice(0, combinaisons.length - 1);

    let sortiesAFFECTEES = [];

    // ÉTAPE A : Donner AU MOINS 1 sortie à chaque combinaison ayant un volume significatif (> 0.5%)
    combinaisonsMain.forEach(item => {
        if (item.volume >= 0.005 && sortiesAFFECTEES.length < 16) {
            sortiesAFFECTEES.push(item.label);
        }
    });

    // ÉTAPE B : Distribuer les sorties RESTANTES au prorata du volume (pour charger le 20/25)
    let totalVolumeMain = combinaisonsMain.reduce((sum, item) => sum + item.volume, 0);
    let placesRestantes = 16 - sortiesAFFECTEES.length;

    if (placesRestantes > 0) {
        combinaisonsMain.forEach(item => {
            let nbEnPlus = Math.round((item.volume / (totalVolumeMain || 1)) * placesRestantes);
            for (let i = 0; i < nbEnPlus; i++) {
                if (sortiesAFFECTEES.length < 16) {
                    sortiesAFFECTEES.push(item.label);
                }
            }
        });
    }

    // ÉTAPE C : Sécurité au cas où il reste des trous
    let idx = 0;
    while (sortiesAFFECTEES.length < 16) {
        sortiesAFFECTEES.push(combinaisonsMain[idx % combinaisonsMain.length].label);
        idx++;
    }

    // Remplissage S04 à S19
    for (let i = 0; i < 16; i++) {
        let numSortie = i + 4;
        let sNom = numSortie < 10 ? `S0${numSortie}` : `S${numSortie}`;
        grille.push({ sortie: sNom, affectation: `🟩 ${sortiesAFFECTEES[i]}` });
    }

    // Sortie 20
    grille.push({ 
        sortie: "S20", 
        affectation: `<span class='badge-faible'>🟪 CIRCUIT PLUS FAIBLE</span> ${circuitPlusFaible.label} (${(circuitPlusFaible.volume * 100).toFixed(2)}%)` 
    });

    // Affichage
    let tbody = document.getElementById('tableau-body');
    tbody.innerHTML = "";
    grille.forEach(item => {
        tbody.innerHTML += `<tr><td><b>${item.sortie}</b></td><td>${item.affectation}</td></tr>`;
    });

    document.getElementById('zone-resultat').style.display = 'block';
}



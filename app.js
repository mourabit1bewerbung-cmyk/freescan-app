function calculer() {
    let c20_26 = parseFloat(document.getElementById('c_20_26').value) || 0;
    let col_ec = parseFloat(document.getElementById('col_ec').value) || 0;
    let col_cc = parseFloat(document.getElementById('col_cc').value) || 0;

    let grille = [
        { sortie: "S01", affectation: "🔒 Q3 (Défauts Fixes)" },
        { sortie: "S02", affectation: "🔒 TV (Trop Vert - Fixe)" },
        { sortie: "S03", affectation: "🔒 TR (Trop Rouge - Fixe)" }
    ];

    let n_20_26_EC = Math.round((c20_26/100) * (col_ec/100) * 15);
    let n_20_26_CC = Math.round((c20_26/100) * (col_cc/100) * 15);
    
    for(let i = 4; i <= 3 + n_20_26_EC; i++) {
        grille.push({ sortie: `S${i < 10 ? '0'+i : i}`, affectation: "🟩 20/26 — EC (Dominant)" });
    }
    
    let debut_CC = 4 + n_20_26_EC;
    for(let i = debut_CC; i < debut_CC + n_20_26_CC; i++) {
        if(i <= 18) grille.push({ sortie: `S${i < 10 ? '0'+i : i}`, affectation: "🟧 20/26 — CC (Secondaire)" });
    }

    for(let i = grille.length + 1; i <= 18; i++) {
        grille.push({ sortie: `S${i < 10 ? '0'+i : i}`, affectation: "🟦 18/20 — EC / CL (Ajustement)" });
    }

    grille.push({ sortie: "S19", affectation: "🟪 Circuits Faibles / Q2 (<5%)" });
    grille.push({ sortie: "S20", affectation: "🟪 Circuits Faibles / Q2 (<5%)" });

    let tbody = document.getElementById('tableau-body');
    tbody.innerHTML = "";
    grille.forEach(item => {
        tbody.innerHTML += `<tr><td><b>${item.sortie}</b></td><td>${item.affectation}</td></tr>`;
    });

    document.getElementById('zone-resultat').style.display = 'block';
}

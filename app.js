// ============================================
// LOGIQUE PRINCIPALE — EMM FRÉQUENCE
// ============================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

function login() {
  var pass = document.getElementById('loginPassword').value.trim();
  var bonnePass = DB.get('password', 'admin123');
  if (pass !== bonnePass) {
    document.getElementById('loginError').textContent = '❌ Mot de passe incorrect';
    return;
  }
  DB.set('session', true);
  document.getElementById('loginError').textContent = '';
  document.getElementById('loginPassword').value = '';
  afficherAnnonces();
  rafraichirEntites();
  afficherListeEntites();
  afficherJournaliere();
  afficherAdminAnnonces();
  showScreen('homeScreen');
}

function logout() { DB.set('session', false); showScreen('loginScreen'); }
function goHome() { showScreen('homeScreen'); }

function openSection(name) {
  if (name === 'rapports') document.getElementById('rapportBox').innerHTML = '';
  if (name === 'admin') afficherAdminAnnonces();
  if (name === 'journaliere') afficherListeEntites();
  showScreen(name + 'Screen');
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR');
}

function echapper(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getEntiteNom(id) {
  var e = DB.get('entites', []).find(function(x) { return x.id === id; });
  return e ? e.type + ' - ' + e.nom : 'Inconnu';
}

// ========== ANNONCES ==========
function afficherAnnonces() {
  var list = DB.get('annonces', []);
  var box = document.getElementById('announcementsBox');
  if (!box) return;
  if (!list.length) { box.innerHTML = '<p>Aucune annonce.</p>'; return; }
  var html = '';
  list.slice().reverse().forEach(function(a) {
    html += '<div class="item-list"><strong>📢 ' + a.date + '</strong><br>' + echapper(a.texte) + '</div>';
  });
  box.innerHTML = html;
}

function publierAnnonce() {
  var texte = document.getElementById('annonceText').value.trim();
  if (!texte) return alert('Écrivez une annonce');
  var list = DB.get('annonces', []);
  list.push({ id: uid(), texte: texte, date: new Date().toLocaleDateString('fr-FR') });
  DB.set('annonces', list);
  document.getElementById('annonceText').value = '';
  afficherAnnonces();
  afficherAdminAnnonces();
  alert('✅ Annonce publiée');
}

function afficherAdminAnnonces() {
  var list = DB.get('annonces', []);
  var box = document.getElementById('adminAnnoncesList');
  if (!box) return;
  if (!list.length) { box.innerHTML = '<p>Aucune annonce.</p>'; return; }
  var html = '';
  list.slice().reverse().forEach(function(a) {
    html += '<div class="item-list">';
    html += '<strong>📢 ' + a.date + '</strong><br>';
    html += echapper(a.texte) + '<br>';
    html += '<button class="btn-mini orange" onclick="modifierAnnonce(\'' + a.id + '\')">✏️ Modifier</button> ';
    html += '<button class="btn-mini danger" onclick="supprimerAnnonce(\'' + a.id + '\')">🗑️ Supprimer</button>';
    html += '</div>';
  });
  box.innerHTML = html;
}

function modifierAnnonce(id) {
  var list = DB.get('annonces', []);
  var a = list.find(function(x) { return x.id === id; });
  if (!a) return;
  var nouveau = prompt('Modifier l\'annonce :', a.texte);
  if (nouveau === null) return;
  if (!nouveau.trim()) return alert('Texte vide');
  a.texte = nouveau.trim();
  DB.set('annonces', list);
  afficherAnnonces();
  afficherAdminAnnonces();
  alert('✅ Modifiée');
}

function supprimerAnnonce(id) {
  if (!confirm('Supprimer cette annonce ?')) return;
  var list = DB.get('annonces', []).filter(function(x) { return x.id !== id; });
  DB.set('annonces', list);
  afficherAnnonces();
  afficherAdminAnnonces();
}

// ========== ENTITÉS ==========
function ajouterEntite() {
  var type = document.getElementById('jTypeEntite').value;
  var nom = document.getElementById('jNomEntite').value.trim().toUpperCase();
  var resp = document.getElementById('jResponsable').value.trim();
  if (!nom || !resp) return alert('Remplissez tous les champs');
  var entites = DB.get('entites', []);
  if (entites.find(function(e) { return e.nom === nom; })) return alert('Cette entité existe déjà');
  entites.push({ id: uid(), type: type, nom: nom, responsable: resp });
  DB.set('entites', entites);
  document.getElementById('jNomEntite').value = '';
  document.getElementById('jResponsable').value = '';
  rafraichirEntites();
  afficherListeEntites();
  alert('✅ Entité ajoutée : ' + nom);
}

function rafraichirEntites() {
  var entites = DB.get('entites', []);
  ['jEntiteSelect', 'mEntite'].forEach(function(id) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var val = sel.value;
    var opts = '';
    entites.forEach(function(e) {
      opts += '<option value="' + e.id + '">' + e.type + ' - ' + e.nom + '</option>';
    });
    sel.innerHTML = opts;
    if (val) sel.value = val;
  });
}

// ========== LISTE ENTITÉS (avec Modifier/Supprimer) ==========
function afficherListeEntites() {
  var entites = DB.get('entites', []);
  var box = document.getElementById('listeEntites');
  if (!box) return;
  if (!entites.length) { box.innerHTML = '<p>Aucune entité enregistrée.</p>'; return; }
  var html = '';
  entites.forEach(function(e) {
    html += '<div class="item-list" style="padding:12px;margin-bottom:10px">';
    html += '<div style="font-size:14px;color:#0a6e2c;font-weight:600;margin-bottom:4px">🏛️ ' + echapper(e.type) + ' - ' + echapper(e.nom) + '</div>';
    html += '<div style="font-size:12px;color:#666;margin-bottom:8px">👤 Responsable : ' + echapper(e.responsable) + '</div>';
    html += '<button class="btn-mini orange" onclick="modifierEntite(\'' + e.id + '\')">✏️ Modifier</button> ';
    html += '<button class="btn-mini danger" onclick="supprimerEntite(\'' + e.id + '\')">🗑️ Supprimer</button>';
    html += '</div>';
  });
  box.innerHTML = html;
}
function modifierEntite(id) {
  var list = DB.get('entites', []);
  var e = list.find(function(x) { return x.id === id; });
  if (!e) return;

  var type = prompt('Type d\'entité (Jorhei Center / Unité religieuse / Foyer de lumière) :', e.type);
  if (type === null) return;
  var nom = prompt('Nom de l\'entité :', e.nom);
  if (nom === null) return;
  var resp = prompt('Nom du responsable :', e.responsable);
  if (resp === null) return;

  var nouveauNom = nom.trim().toUpperCase();
  if (!nouveauNom) return alert('Nom vide');

  // Vérifier doublon
  var doublon = list.find(function(x) {
    return x.id !== id && x.nom === nouveauNom;
  });
  if (doublon) return alert('⚠️ Une autre entité porte déjà ce nom');

  e.type = type.trim() || e.type;
  e.nom = nouveauNom;
  e.responsable = resp.trim();

  DB.set('entites', list);
  rafraichirEntites();
  afficherListeEntites();
  afficherJournaliere();
  alert('✅ Entité modifiée');
}

function supprimerEntite(id) {
  var e = DB.get('entites', []).find(function(x) { return x.id === id; });
  if (!e) return;

  // Compter les participations liées
  var parts = DB.get('participations', []).filter(function(p) { return p.entiteId === id; });
  var msg = '⚠️ Supprimer l\'entité "' + e.nom + '" ?';
  if (parts.length) {
    msg += '\n\n' + parts.length + ' participation(s) journalière(s) liée(s) seront AUSSI supprimées.';
  }
  if (!confirm(msg)) return;

  DB.set('entites', DB.get('entites', []).filter(function(x) { return x.id !== id; }));
  DB.set('participations', DB.get('participations', []).filter(function(p) { return p.entiteId !== id; }));

  rafraichirEntites();
  afficherListeEntites();
  afficherJournaliere();
  alert('✅ Entité supprimée');
}

// ========== FRÉQUENCE JOURNALIÈRE ==========
function enregistrerParticipation() {
  var entiteId = document.getElementById('jEntiteSelect').value;
  var date = document.getElementById('jDate').value;
  var m = parseInt(document.getElementById('jMembres').value) || 0;
  var s = parseInt(document.getElementById('jSympathisants').value) || 0;
  var n = parseInt(document.getElementById('jNouveaux').value) || 0;
  if (!entiteId) return alert('⚠️ Enregistrez d\'abord une entité');
  if (!date) return alert('Choisissez une date');
  var list = DB.get('participations', []);
  list.push({
    id: uid(), entiteId: entiteId, date: date,
    m: m, s: s, n: n,
    createdAt: new Date().toISOString()
  });
  DB.set('participations', list);
  afficherJournaliere();
  alert('✅ Participation enregistrée');
}

function afficherJournaliere() {
  var parts = DB.get('participations', []);
  var box = document.getElementById('listeJournaliere');
  if (!box) return;
  if (!parts.length) { box.innerHTML = '<p>Aucune donnée.</p>'; return; }

  var parEntite = {};
  parts.forEach(function(p) {
    if (!parEntite[p.entiteId]) parEntite[p.entiteId] = [];
    parEntite[p.entiteId].push(p);
  });

  var html = '';
  Object.keys(parEntite).forEach(function(eid) {
    var lignes = parEntite[eid].slice().sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    var tm = 0, ts = 0, tn = 0;
    lignes.forEach(function(p) { tm += p.m; ts += p.s; tn += p.n; });

    html += '<div class="entity-block">';
    html += '<h4>📍 ' + echapper(getEntiteNom(eid)) + '</h4>';
    html += '<div class="table-wrapper"><table class="data-table">';
    html += '<thead><tr><th>Date</th><th>M</th><th>S</th><th>NV</th><th>Actions</th></tr></thead><tbody>';
    lignes.forEach(function(p) {
      html += '<tr>';
      html += '<td>' + fmtDate(p.date) + '</td>';
      html += '<td class="num">' + p.m + '</td>';
      html += '<td class="num">' + p.s + '</td>';
      html += '<td class="num">' + p.n + '</td>';
      html += '<td>';
      html += '<button class="btn-mini orange" onclick="modifierParticipation(\'' + p.id + '\')">✏️</button>';
      html += '<button class="btn-mini danger" onclick="supprimerParticipation(\'' + p.id + '\')">🗑️</button>';
      html += '</td></tr>';
    });
    html += '</tbody>';
    html += '<tfoot><tr><td>TOTAL</td><td class="num">' + tm + '</td><td class="num">' + ts + '</td><td class="num">' + tn + '</td><td></td></tr></tfoot>';
    html += '</table></div></div>';
  });
  box.innerHTML = html;
}

function modifierParticipation(id) {
  var list = DB.get('participations', []);
  var p = list.find(function(x) { return x.id === id; });
  if (!p) return;
  var date = prompt('Modifier la date (AAAA-MM-JJ) :', p.date);
  if (date === null) return;
  var m = prompt('Modifier Membres (M) :', p.m);
  if (m === null) return;
  var s = prompt('Modifier Sympathisants (S) :', p.s);
  if (s === null) return;
  var n = prompt('Modifier Nouveaux venus (NV) :', p.n);
  if (n === null) return;
  p.date = date.trim();
  p.m = parseInt(m) || 0;
  p.s = parseInt(s) || 0;
  p.n = parseInt(n) || 0;
  DB.set('participations', list);
  afficherJournaliere();
  alert('✅ Modifiée');
}

function supprimerParticipation(id) {
  if (!confirm('⚠️ Supprimer cette participation ?')) return;
  var list = DB.get('participations', []).filter(function(x) { return x.id !== id; });
  DB.set('participations', list);
  afficherJournaliere();
  alert('✅ Supprimée');
}

// ========== FICHE MENSUELLE ==========
function enregistrerFicheMensuelle() {
  var numericIds = [
    'mEncadreurs','mMembresActifs','mSympathisants','mFMembres','mFSympathisants','mFNouveaux',
    'mFoyersLumiere','mAvecGoshintai','mSansGoshintai','mFoyersSymp','mFleurs','mPotagers',
    'mTotalPotagers','mMaisonsOuvertes','mTemoignages','mCandGoshintai','mConfInit','mConfReinit',
    'mConfShoku','mConfKannon','mConfMitamaya','mMaisonsMembres','mMaisonsSymp','mAssistMembres',
    'mAssistSymp','mConcessions','mTerrains','mConcSuivies','mAgriNat','mCampagnes','mFleursAssist',
    'mCoursEns','mCoursFleurs','mCoursFleursMess','mCoursFleursNonMess'
  ];
  var f = {
    id: uid(),
    entiteId: document.getElementById('mEntite').value,
    mois: document.getElementById('mMois').value,
    annee: document.getElementById('mAnnee').value,
    responsable: document.getElementById('mResponsable').value,
    jourReunion: document.getElementById('mJourReunion').value,
    produits: document.getElementById('mProduits').value,
    themes: document.getElementById('mThemes').value,
    graces: document.getElementById('mGraces').value,
    points: document.getElementById('mPoints').value,
    solutions: document.getElementById('mSolutions').value,
    objectifs: document.getElementById('mObjectifs').value,
    actions: document.getElementById('mActions').value,
    archive: false,
    dateCreation: new Date().toISOString()
  };
  numericIds.forEach(function(id) { f[id] = parseInt(document.getElementById(id).value) || 0; });
  if (!f.entiteId) return alert('⚠️ Enregistrez d\'abord une entité');
  var list = DB.get('fichesMensuelles', []);
  list.push(f);
  DB.set('fichesMensuelles', list);
  alert('✅ Fiche mensuelle enregistrée');
}

// ========== TABLEAU FICHE ==========
function tableFicheMensuelle(f, avecBoutons) {
  var h = '<div class="entity-block">';
  h += '<h4>📍 ' + echapper(getEntiteNom(f.entiteId)) + ' — ' + echapper(f.mois) + ' ' + echapper(f.annee) + '</h4>';
  if (avecBoutons) {
    h += '<div style="margin-bottom:8px">';
    h += '<button class="btn-mini orange" onclick="modifierFiche(\'' + f.id + '\')">✏️ Modifier</button> ';
    h += '<button class="btn-mini danger" onclick="supprimerFiche(\'' + f.id + '\')">🗑️ Supprimer</button> ';
    h += '<button class="btn-mini gray" onclick="archiverFiche(\'' + f.id + '\')">📦 Archiver</button>';
    h += '</div>';
  }
  h += '<div class="table-wrapper"><table class="data-table"><tbody>';
  h += '<tr><td>Responsable</td><td>' + echapper(f.responsable) + '</td></tr>';
  h += '<tr><th colspan="2">PRÉSENTATION</th></tr>';
  h += '<tr><td>Nombre d\'Encadreurs</td><td class="num">' + f.mEncadreurs + '</td></tr>';
  h += '<tr><td>Jour réunion évaluation</td><td>' + echapper(f.jourReunion) + '</td></tr>';
  h += '<tr><td>Membres actifs</td><td class="num">' + f.mMembresActifs + '</td></tr>';
  h += '<tr><td>Sympathisants</td><td class="num">' + f.mSympathisants + '</td></tr>';
  h += '<tr><th colspan="2">FRÉQUENTATION CULTE MENSUEL</th></tr>';
  h += '<tr><td>Membres</td><td class="num">' + f.mFMembres + '</td></tr>';
  h += '<tr><td>Sympathisants</td><td class="num">' + f.mFSympathisants + '</td></tr>';
  h += '<tr><td>Nouveaux venus</td><td class="num">' + f.mFNouveaux + '</td></tr>';
  h += '<tr><td>Foyers Lumière accompagnés</td><td class="num">' + f.mFoyersLumiere + '</td></tr>';
  h += '<tr><td>Membres avec Goshintai</td><td class="num">' + f.mAvecGoshintai + '</td></tr>';
  h += '<tr><td>Membres sans Goshintai</td><td class="num">' + f.mSansGoshintai + '</td></tr>';
  h += '<tr><td>Foyers de sympathisants</td><td class="num">' + f.mFoyersSymp + '</td></tr>';
  h += '<tr><td>Fleurs distribuées</td><td class="num">' + f.mFleurs + '</td></tr>';
  h += '<tr><td>Potagers confectionnés</td><td class="num">' + f.mPotagers + '</td></tr>';
  h += '<tr><td>Total potagers unité</td><td class="num">' + f.mTotalPotagers + '</td></tr>';
  h += '<tr><td>Maisons ouvertes (fleurs)</td><td class="num">' + f.mMaisonsOuvertes + '</td></tr>';
  h += '<tr><td>Témoignages recueillis</td><td class="num">' + f.mTemoignages + '</td></tr>';
  h += '<tr><th colspan="2">CONFIRMATION</th></tr>';
  h += '<tr><td>Candidats Goshintai</td><td class="num">' + f.mCandGoshintai + '</td></tr>';
  h += '<tr><td>Confirmés initiation</td><td class="num">' + f.mConfInit + '</td></tr>';
  h += '<tr><td>Confirmés ré-initiation</td><td class="num">' + f.mConfReinit + '</td></tr>';
  h += '<tr><td>Confirmés Shoku</td><td class="num">' + f.mConfShoku + '</td></tr>';
  h += '<tr><td>Confirmés Kannon</td><td class="num">' + f.mConfKannon + '</td></tr>';
  h += '<tr><td>Confirmés Mitamaya</td><td class="num">' + f.mConfMitamaya + '</td></tr>';
  h += '<tr><th colspan="2">ASSISTANCE / UNITÉS</th></tr>';
  h += '<tr><td>Maisons des membres</td><td class="num">' + f.mMaisonsMembres + '</td></tr>';
  h += '<tr><td>Maisons des sympathisants</td><td class="num">' + f.mMaisonsSymp + '</td></tr>';
  h += '<tr><td>Maisons membres assistées</td><td class="num">' + f.mAssistMembres + '</td></tr>';
  h += '<tr><td>Maisons sympathisants assistées</td><td class="num">' + f.mAssistSymp + '</td></tr>';
  h += '<tr><td>Concessions agricoles</td><td class="num">' + f.mConcessions + '</td></tr>';
  h += '<tr><td>Terrains de l\'église</td><td class="num">' + f.mTerrains + '</td></tr>';
  h += '<tr><td>Concessions suivies</td><td class="num">' + f.mConcSuivies + '</td></tr>';
  h += '<tr><td>Font agriculture naturelle</td><td class="num">' + f.mAgriNat + '</td></tr>';
  h += '<tr><td>Produits disponibles</td><td>' + echapper(f.produits) + '</td></tr>';
  h += '<tr><td>Campagnes nettoyage</td><td class="num">' + f.mCampagnes + '</td></tr>';
  h += '<tr><td>Fleurs distribuées (assist.)</td><td class="num">' + f.mFleursAssist + '</td></tr>';
  h += '<tr><th colspan="2">FORMATION</th></tr>';
  h += '<tr><td>Cours d\'enseignements</td><td class="num">' + f.mCoursEns + '</td></tr>';
  h += '<tr><td>Thèmes exploités</td><td>' + echapper(f.themes) + '</td></tr>';
  h += '<tr><td>Cours de fleurs unité</td><td class="num">' + f.mCoursFleurs + '</td></tr>';
  h += '<tr><td>Cours fleurs maisons messianiques</td><td class="num">' + f.mCoursFleursMess + '</td></tr>';
  h += '<tr><td>Cours fleurs maisons non messianiques</td><td class="num">' + f.mCoursFleursNonMess + '</td></tr>';
  h += '<tr><th colspan="2">GRÂCES / POINTS / SOLUTIONS</th></tr>';
  h += '<tr><td>Grâces reçues</td><td>' + echapper(f.graces) + '</td></tr>';
  h += '<tr><td>Points à améliorer</td><td>' + echapper(f.points) + '</td></tr>';
  h += '<tr><td>Solutions proposées</td><td>' + echapper(f.solutions) + '</td></tr>';
  h += '<tr><td>Objectifs mois prochain</td><td>' + echapper(f.objectifs) + '</td></tr>';
  h += '<tr><td>Actions à mener</td><td>' + echapper(f.actions) + '</td></tr>';
  h += '</tbody></table></div></div>';
  return h;
}

function modifierFiche(id) {
  var list = DB.get('fichesMensuelles', []);
  var f = list.find(function(x) { return x.id === id; });
  if (!f) return;
  var nouveau = prompt('Modifier le responsable :', f.responsable);
  if (nouveau === null) return;
  f.responsable = nouveau.trim();
  var mois = prompt('Modifier le mois :', f.mois);
  if (mois === null) return;
  f.mois = mois.trim();
  DB.set('fichesMensuelles', list);
  alert('✅ Modifiée');
  if (document.getElementById('searchFreq').value) rechercherFreq();
  else rapportFreqDetaille();
}

function supprimerFiche(id) {
  if (!confirm('⚠️ Supprimer cette fiche ?')) return;
  DB.set('fichesMensuelles', DB.get('fichesMensuelles', []).filter(function(x) { return x.id !== id; }));
  alert('✅ Supprimée');
  rapportFreqDetaille();
}

function archiverFiche(id) {
  if (!confirm('📦 Archiver cette fiche ?')) return;
  var list = DB.get('fichesMensuelles', []);
  var f = list.find(function(x) { return x.id === id; });
  if (f) f.archive = true;
  DB.set('fichesMensuelles', list);
  alert('✅ Archivée');
  rapportFreqDetaille();
}

function desarchiverFiche(id) {
  var list = DB.get('fichesMensuelles', []);
  var f = list.find(function(x) { return x.id === id; });
  if (f) f.archive = false;
  DB.set('fichesMensuelles', list);
  alert('✅ Restaurée');
  rapportFreqArchive();
}
// ========== RAPPORTS ==========
function rapportFreqGlobal() {
  var fiches = DB.get('fichesMensuelles', []).filter(function(f) { return !f.archive; });
  var parts = DB.get('participations', []);
  var html = '<div class="rapport-header"><h3>📊 RAPPORT GLOBAL — FRÉQUENCES</h3><p>EMM RD CONGO</p></div>';
  var tm = 0, ts = 0, tn = 0;
  parts.forEach(function(p) { tm += p.m; ts += p.s; tn += p.n; });

  html += '<div class="table-wrapper"><table class="data-table">';
  html += '<thead><tr><th>Rubrique</th><th>Total</th></tr></thead><tbody>';
  html += '<tr><td>Fiches mensuelles</td><td class="num">' + fiches.length + '</td></tr>';
  html += '<tr><td>Participations journalières</td><td class="num">' + parts.length + '</td></tr>';
  html += '<tr><td>Total Membres (journalier)</td><td class="num">' + tm + '</td></tr>';
  html += '<tr><td>Total Sympathisants</td><td class="num">' + ts + '</td></tr>';
  html += '<tr><td>Total Nouveaux venus</td><td class="num">' + tn + '</td></tr>';
  html += '</tbody></table></div>';

  if (fiches.length) {
    html += '<h4 style="color:#0a6e2c;margin:16px 0 8px">📌 Détails par entité</h4>';
    var parEntite = {};
    fiches.forEach(function(f) {
      if (!parEntite[f.entiteId]) parEntite[f.entiteId] = [];
      parEntite[f.entiteId].push(f);
    });
    Object.keys(parEntite).forEach(function(eid) {
      var liste = parEntite[eid];
      var sm = 0, ss = 0, sn = 0;
      liste.forEach(function(f) { sm += f.mFMembres; ss += f.mFSympathisants; sn += f.mFNouveaux; });
      html += '<div class="entity-block">';
      html += '<h4>📍 ' + echapper(getEntiteNom(eid)) + '</h4>';
      html += '<div class="table-wrapper"><table class="data-table">';
      html += '<thead><tr><th>Mois</th><th>Membres (M)</th><th>Sympathisants (S)</th><th>Nouveaux venus (NV)</th></tr></thead><tbody>';
      liste.forEach(function(f) {
        html += '<tr><td>' + echapper(f.mois) + ' ' + f.annee + '</td><td class="num">' + f.mFMembres + '</td><td class="num">' + f.mFSympathisants + '</td><td class="num">' + f.mFNouveaux + '</td></tr>';
      });
      html += '</tbody>';
      html += '<tfoot><tr><td>TOTAL</td><td class="num">' + sm + '</td><td class="num">' + ss + '</td><td class="num">' + sn + '</td></tr></tfoot>';
      html += '</table></div></div>';
    });
  }

  if (fiches.length) {
    html += '<h4 style="color:#0a6e2c;margin:20px 0 8px">🌍 FICHE MENSUELLE GLOBALE (Toutes entités)</h4>';
    var somme = {};
    var numericIds = [
      'mEncadreurs','mMembresActifs','mSympathisants','mFMembres','mFSympathisants','mFNouveaux',
      'mFoyersLumiere','mAvecGoshintai','mSansGoshintai','mFoyersSymp','mFleurs','mPotagers',
      'mTotalPotagers','mMaisonsOuvertes','mTemoignages','mCandGoshintai','mConfInit','mConfReinit',
      'mConfShoku','mConfKannon','mConfMitamaya','mMaisonsMembres','mMaisonsSymp','mAssistMembres',
      'mAssistSymp','mConcessions','mTerrains','mConcSuivies','mAgriNat','mCampagnes','mFleursAssist',
      'mCoursEns','mCoursFleurs','mCoursFleursMess','mCoursFleursNonMess'
    ];
    numericIds.forEach(function(id) { somme[id] = 0; });
    fiches.forEach(function(f) {
      numericIds.forEach(function(id) { somme[id] += f[id] || 0; });
    });
    html += '<div class="entity-block">';
    html += '<h4>🌍 TOTAL DE ' + fiches.length + ' ENTITÉ(S)</h4>';
    html += '<div class="table-wrapper"><table class="data-table"><tbody>';
    html += '<tr><th colspan="2">PRÉSENTATION</th></tr>';
    html += '<tr><td>Nombre d\'Encadreurs</td><td class="num">' + somme.mEncadreurs + '</td></tr>';
    html += '<tr><td>Membres actifs</td><td class="num">' + somme.mMembresActifs + '</td></tr>';
    html += '<tr><td>Sympathisants</td><td class="num">' + somme.mSympathisants + '</td></tr>';
    html += '<tr><th colspan="2">FRÉQUENTATION CULTE MENSUEL</th></tr>';
    html += '<tr><td>Membres</td><td class="num">' + somme.mFMembres + '</td></tr>';
    html += '<tr><td>Sympathisants</td><td class="num">' + somme.mFSympathisants + '</td></tr>';
    html += '<tr><td>Nouveaux venus</td><td class="num">' + somme.mFNouveaux + '</td></tr>';
    html += '<tr><td>Foyers Lumière accompagnés</td><td class="num">' + somme.mFoyersLumiere + '</td></tr>';
    html += '<tr><td>Membres avec Goshintai</td><td class="num">' + somme.mAvecGoshintai + '</td></tr>';
    html += '<tr><td>Membres sans Goshintai</td><td class="num">' + somme.mSansGoshintai + '</td></tr>';
    html += '<tr><td>Foyers de sympathisants</td><td class="num">' + somme.mFoyersSymp + '</td></tr>';
    html += '<tr><td>Fleurs distribuées</td><td class="num">' + somme.mFleurs + '</td></tr>';
    html += '<tr><td>Potagers confectionnés</td><td class="num">' + somme.mPotagers + '</td></tr>';
    html += '<tr><td>Total potagers unité</td><td class="num">' + somme.mTotalPotagers + '</td></tr>';
    html += '<tr><td>Maisons ouvertes (fleurs)</td><td class="num">' + somme.mMaisonsOuvertes + '</td></tr>';
    html += '<tr><td>Témoignages recueillis</td><td class="num">' + somme.mTemoignages + '</td></tr>';
    html += '<tr><th colspan="2">CONFIRMATION</th></tr>';
    html += '<tr><td>Candidats Goshintai</td><td class="num">' + somme.mCandGoshintai + '</td></tr>';
    html += '<tr><td>Confirmés initiation</td><td class="num">' + somme.mConfInit + '</td></tr>';
    html += '<tr><td>Confirmés ré-initiation</td><td class="num">' + somme.mConfReinit + '</td></tr>';
    html += '<tr><td>Confirmés Shoku</td><td class="num">' + somme.mConfShoku + '</td></tr>';
    html += '<tr><td>Confirmés Kannon</td><td class="num">' + somme.mConfKannon + '</td></tr>';
    html += '<tr><td>Confirmés Mitamaya</td><td class="num">' + somme.mConfMitamaya + '</td></tr>';
    html += '<tr><th colspan="2">ASSISTANCE / UNITÉS</th></tr>';
    html += '<tr><td>Maisons des membres</td><td class="num">' + somme.mMaisonsMembres + '</td></tr>';
    html += '<tr><td>Maisons des sympathisants</td><td class="num">' + somme.mMaisonsSymp + '</td></tr>';
    html += '<tr><td>Maisons membres assistées</td><td class="num">' + somme.mAssistMembres + '</td></tr>';
    html += '<tr><td>Maisons sympathisants assistées</td><td class="num">' + somme.mAssistSymp + '</td></tr>';
    html += '<tr><td>Concessions agricoles</td><td class="num">' + somme.mConcessions + '</td></tr>';
    html += '<tr><td>Terrains de l\'église</td><td class="num">' + somme.mTerrains + '</td></tr>';
    html += '<tr><td>Concessions suivies</td><td class="num">' + somme.mConcSuivies + '</td></tr>';
    html += '<tr><td>Font agriculture naturelle</td><td class="num">' + somme.mAgriNat + '</td></tr>';
    html += '<tr><td>Campagnes nettoyage</td><td class="num">' + somme.mCampagnes + '</td></tr>';
    html += '<tr><td>Fleurs distribuées (assist.)</td><td class="num">' + somme.mFleursAssist + '</td></tr>';
    html += '<tr><th colspan="2">FORMATION</th></tr>';
    html += '<tr><td>Cours d\'enseignements</td><td class="num">' + somme.mCoursEns + '</td></tr>';
    html += '<tr><td>Cours de fleurs unité</td><td class="num">' + somme.mCoursFleurs + '</td></tr>';
    html += '<tr><td>Cours fleurs maisons messianiques</td><td class="num">' + somme.mCoursFleursMess + '</td></tr>';
    html += '<tr><td>Cours fleurs maisons non messianiques</td><td class="num">' + somme.mCoursFleursNonMess + '</td></tr>';
    html += '</tbody></table></div></div>';

    html += '<h4 style="color:#0a6e2c;margin:20px 0 8px">📝 RASSEMBLEMENT DES TEXTES (toutes entités)</h4>';
    var textes = {
      'Thèmes exploités': [], 'Grâces reçues': [], 'Points à améliorer': [],
      'Solutions proposées': [], 'Objectifs du mois prochain': [], 'Actions à mener': [],
      'Produits disponibles': []
    };
    var mapChamps = {
      'Thèmes exploités': 'themes', 'Grâces reçues': 'graces', 'Points à améliorer': 'points',
      'Solutions proposées': 'solutions', 'Objectifs du mois prochain': 'objectifs',
      'Actions à mener': 'actions', 'Produits disponibles': 'produits'
    };
    fiches.forEach(function(f) {
      Object.keys(mapChamps).forEach(function(label) {
        var val = f[mapChamps[label]];
        if (val && val.trim()) {
          textes[label].push('<strong>' + echapper(getEntiteNom(f.entiteId)) + ' (' + echapper(f.mois) + ' ' + f.annee + ')</strong> : ' + echapper(val));
        }
      });
    });
    html += '<div class="entity-block">';
    Object.keys(textes).forEach(function(label) {
      html += '<h4 style="background:#fff;padding:8px;border-radius:6px;margin-top:10px">📌 ' + label + '</h4>';
      if (textes[label].length) {
        html += '<div style="padding:8px;font-size:13px;line-height:1.6">';
        textes[label].forEach(function(t) { html += '<div style="margin-bottom:6px;padding-left:8px;border-left:3px solid #0a6e2c">' + t + '</div>'; });
        html += '</div>';
      } else {
        html += '<p style="font-size:12px;color:#888;padding:6px">Aucune donnée.</p>';
      }
    });
    html += '</div>';
  }
  document.getElementById('rapportBox').innerHTML = html;
}

function rapportFreqDetaille() {
  var fiches = DB.get('fichesMensuelles', []).filter(function(f) { return !f.archive; });
  if (!fiches.length) { document.getElementById('rapportBox').innerHTML = '<p>Aucune fiche enregistrée.</p>'; return; }
  var html = '<div class="rapport-header"><h3>📋 RAPPORT DÉTAILLÉ — FRÉQUENCES</h3><p>EMM RD CONGO</p></div>';
  fiches.forEach(function(f) { html += tableFicheMensuelle(f, true); });
  document.getElementById('rapportBox').innerHTML = html;
}

function rapportFreqArchive() {
  var fiches = DB.get('fichesMensuelles', []).filter(function(f) { return f.archive; });
  if (!fiches.length) { document.getElementById('rapportBox').innerHTML = '<p>Aucune fiche archivée.</p>'; return; }
  var html = '<div class="rapport-header"><h3>📦 ARCHIVES — FRÉQUENCES</h3><p>EMM RD CONGO</p></div>';
  fiches.forEach(function(f) {
    html += '<div class="entity-block">';
    html += '<h4>📍 ' + echapper(getEntiteNom(f.entiteId)) + ' — ' + echapper(f.mois) + ' ' + f.annee + '</h4>';
    html += '<button class="btn-mini" onclick="desarchiverFiche(\'' + f.id + '\')">↩️ Restaurer</button> ';
    html += '<button class="btn-mini danger" onclick="supprimerFiche(\'' + f.id + '\')">🗑️ Supprimer</button>';
    html += '</div>';
  });
  document.getElementById('rapportBox').innerHTML = html;
}

function rechercherFreq() {
  var q = document.getElementById('searchFreq').value.toLowerCase().trim();
  if (!q) { document.getElementById('rapportBox').innerHTML = ''; return; }
  var fiches = DB.get('fichesMensuelles', []).filter(function(f) {
    return getEntiteNom(f.entiteId).toLowerCase().indexOf(q) !== -1;
  });
  var html = '<h3>Résultats (' + fiches.length + ')</h3>';
  if (!fiches.length) html += '<p>Aucun résultat.</p>';
  else fiches.forEach(function(f) { html += tableFicheMensuelle(f, true); });
  document.getElementById('rapportBox').innerHTML = html;
}

function rechercherAdmin() {
  var q = document.getElementById('searchAdmin').value.toLowerCase().trim();
  var box = document.getElementById('adminSearchResult');
  if (!q) { box.innerHTML = ''; return; }
  var fiches = DB.get('fichesMensuelles', []).filter(function(f) {
    return getEntiteNom(f.entiteId).toLowerCase().indexOf(q) !== -1;
  });
  var parts = DB.get('participations', []).filter(function(p) {
    return getEntiteNom(p.entiteId).toLowerCase().indexOf(q) !== -1;
  });
  var html = '<p><strong>' + fiches.length + '</strong> fiche(s) mensuelle(s), <strong>' + parts.length + '</strong> participation(s) trouvée(s)</p>';
  html += '<button class="btn-secondary" onclick="imprimerAdminRapide()">🖨️ Imprimer</button>';
  box.innerHTML = html;
  box.setAttribute('data-resultats', JSON.stringify({ fiches: fiches, parts: parts }));
}

function imprimerAdminRapide() {
  var box = document.getElementById('adminSearchResult');
  var data = JSON.parse(box.getAttribute('data-resultats') || '{}');
  var w = window.open('', '_blank');
  w.document.write('<html><head><meta charset="UTF-8"><title>Recherche EMM</title>');
  w.document.write('<style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0a6e2c;color:white;padding:8px}td{padding:6px;border-bottom:1px solid #ddd}</style>');
  w.document.write('</head><body><h2 style="color:#0a6e2c">EMM RD CONGO — Recherche</h2>');
  if (data.fiches && data.fiches.length) {
    w.document.write('<h3>Fiches mensuelles</h3><table><thead><tr><th>Entité</th><th>Mois</th><th>M</th><th>S</th><th>NV</th></tr></thead><tbody>');
    data.fiches.forEach(function(f) {
      w.document.write('<tr><td>' + getEntiteNom(f.entiteId) + '</td><td>' + f.mois + ' ' + f.annee + '</td><td>' + f.mFMembres + '</td><td>' + f.mFSympathisants + '</td><td>' + f.mFNouveaux + '</td></tr>');
    });
    w.document.write('</tbody></table>');
  }
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 500);
}

// ========== ADMIN ==========
function changerMotDePasse() {
  var nouveau = document.getElementById('newPass').value.trim();
  if (!nouveau || nouveau.length < 4) return alert('Minimum 4 caractères');
  DB.set('password', nouveau);
  document.getElementById('newPass').value = '';
  alert('✅ Mot de passe changé');
}

function toutEffacer() {
  if (!confirm('⚠️ Effacer TOUTES les données ?')) return;
  if (!confirm('Vraiment sûr ?')) return;
  var pass = DB.get('password', 'admin123');
  localStorage.clear();
  DB.set('password', pass);
  initDB();
  alert('✅ Effacé');
  location.reload();
}

// ========== EXPORT / IMPORT ==========
function exporterDonnees() {
  var data = {};
  ['entites', 'participations', 'fichesMensuelles', 'annonces'].forEach(function(k) {
    data[k] = DB.get(k, []);
  });
  var json = JSON.stringify(data, null, 2);
  try {
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'emm_frequence_' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    alert('✅ Fichier téléchargé');
  } catch (e) {
    var w = window.open('', '_blank');
    w.document.write('<h3>Sauvegarde EMM</h3><textarea style="width:100%;height:400px">' + json + '</textarea>');
  }
}

function restaurerTexte() {
  var txt = document.getElementById('importText').value.trim();
  if (!txt) return alert('Collez d\'abord un JSON');
  try {
    var data = JSON.parse(txt);
    Object.keys(data).forEach(function(k) { DB.set(k, data[k]); });
    alert('✅ Données restaurées');
    rafraichirEntites();
    afficherListeEntites();
    afficherJournaliere();
    afficherAnnonces();
    afficherAdminAnnonces();
    document.getElementById('importText').value = '';
  } catch (e) { alert('❌ JSON invalide'); }
}

function importerDonnees(ev) {
  var file = ev.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      Object.keys(data).forEach(function(k) { DB.set(k, data[k]); });
      alert('✅ Données restaurées');
      rafraichirEntites();
      afficherListeEntites();
      afficherJournaliere();
      afficherAnnonces();
      afficherAdminAnnonces();
    } catch (err) { alert('❌ Fichier invalide'); }
  };
  reader.readAsText(file);
}

// ========== IMPRESSION / WORD / PDF / PARTAGE ==========
function getRapportHTML() { return document.getElementById('rapportBox').innerHTML; }

function imprimerRapport() {
  var contenu = getRapportHTML();
  if (!contenu || contenu.trim() === '') return alert('Générez d\'abord un rapport');
  var w = window.open('', '_blank');
  w.document.write('<html><head><meta charset="UTF-8"><title>Rapport EMM</title>');
  w.document.write('<style>body{font-family:Arial;padding:20px}h3{color:#0a6e2c;text-align:center}h4{color:#0a6e2c}.rapport-header{text-align:center;border-bottom:2px solid #0a6e2c;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}th{background:#0a6e2c;color:white;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #ddd}tr:nth-child(even){background:#f9f9f9}td.num{text-align:right}tfoot td{font-weight:bold;background:#e8f5e9}.entity-block{background:#f9f9f9;padding:10px;margin-bottom:14px;border-left:4px solid #0a6e2c}.btn-mini{display:none}</style></head><body>');
  w.document.write('<h1 style="text-align:center;color:#0a6e2c">EMM RD CONGO</h1><p style="text-align:center">Module I — Fréquences</p><hr>');
  w.document.write(contenu);
  w.document.write('<p style="text-align:center;margin-top:30px;font-size:11px;color:#888">Imprimé le ' + new Date().toLocaleString('fr-FR') + '</p></body></html>');
  w.document.close();
  setTimeout(function() { w.print(); }, 600);
}

function exporterWord() {
  var contenu = getRapportHTML();
  if (!contenu || contenu.trim() === '') return alert('Générez d\'abord un rapport');
  var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><title>Rapport EMM</title>';
  html += '<style>body{font-family:Arial}h3,h4{color:#0a6e2c}.rapport-header{text-align:center;border-bottom:2px solid #0a6e2c;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}th{background:#0a6e2c;color:white;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #ddd}td.num{text-align:right}tfoot td{font-weight:bold;background:#e8f5e9}.entity-block{background:#f9f9f9;padding:10px;margin-bottom:14px;border-left:4px solid #0a6e2c}.btn-mini{display:none}</style></head><body>';
  html += '<h1 style="text-align:center;color:#0a6e2c">EMM RD CONGO</h1><p style="text-align:center">Module I — Fréquences</p><hr>';
  html += contenu;
  html += '<p style="text-align:center;margin-top:30px;font-size:11px;color:#888">Généré le ' + new Date().toLocaleString('fr-FR') + '</p></body></html>';
  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'Rapport_EMM_' + Date.now() + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  alert('✅ Fichier Word généré');
}

function exporterPDF() {
  var contenu = getRapportHTML();
  if (!contenu || contenu.trim() === '') return alert('Générez d\'abord un rapport');
  var w = window.open('', '_blank');
  w.document.write('<html><head><meta charset="UTF-8"><title>Rapport EMM</title>');
  w.document.write('<style>body{font-family:Arial;padding:20px}h3,h4{color:#0a6e2c}.rapport-header{text-align:center;border-bottom:2px solid #0a6e2c;padding-bottom:10px}table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}th{background:#0a6e2c;color:white;padding:8px;text-align:left}td{padding:7px;border-bottom:1px solid #ddd}tr:nth-child(even){background:#f9f9f9}td.num{text-align:right}tfoot td{font-weight:bold;background:#e8f5e9}.entity-block{background:#f9f9f9;padding:10px;margin-bottom:14px;border-left:4px solid #0a6e2c}.btn-mini{display:none}</style></head><body>');
  w.document.write('<h1 style="text-align:center;color:#0a6e2c">EMM RD CONGO</h1><p style="text-align:center">Module I — Fréquences</p><hr>');
  w.document.write(contenu);
  w.document.write('</body></html>');
  w.document.close();
  setTimeout(function() {
    w.print();
    alert('💡 Choisissez "Enregistrer au format PDF".');
  }, 800);
}

function partagerRapport() {
  var contenu = getRapportHTML();
  if (!contenu || contenu.trim() === '') return alert('Générez d\'abord un rapport');
  var div = document.createElement('div');
  div.innerHTML = contenu;
  var texte = div.innerText.substring(0, 2000);
  var msg = 'EMM RD CONGO — Rapport Fréquences\n\n' + texte;
  if (navigator.share) {
    navigator.share({ title: 'Rapport EMM', text: msg }).catch(function(err) {
      if (err.name !== 'AbortError') partagerFallback(msg);
    });
  } else partagerFallback(msg);
}

function partagerFallback(msg) {
  var email = prompt('📧 Email (laisser vide pour WhatsApp) :', '');
  if (email === null) return;
  if (email.trim()) window.location.href = 'mailto:' + email.trim() + '?subject=Rapport EMM&body=' + encodeURIComponent(msg);
  else window.location.href = 'https://wa.me/?text=' + encodeURIComponent(msg);
}

// ========== PWA INSTALL ==========
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var btn = document.getElementById('installBtn');
  if (btn) btn.style.display = 'block';
});

function installApp() {
  if (!deferredPrompt) return alert('Utilisez le menu navigateur → "Ajouter à l\'écran d\'accueil"');
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function() {
    deferredPrompt = null;
    var btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
  });
}

// ========== INITIALISATION ==========
window.addEventListener('load', function() {
  if (DB.get('session')) {
    afficherAnnonces();
    rafraichirEntites();
    afficherListeEntites();
    afficherJournaliere();
    afficherAdminAnnonces();
    showScreen('homeScreen');
  }
});
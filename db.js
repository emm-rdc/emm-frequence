// ============================================
// BASE DE DONNÉES LOCALE — EMM FRÉQUENCE
// ============================================

const DB = {
  get: function(key, def) {
    try {
      const v = localStorage.getItem('emmvf_' + key);
      return v ? JSON.parse(v) : (def !== undefined ? def : null);
    } catch(e) { return def; }
  },
  set: function(key, val) {
    localStorage.setItem('emmvf_' + key, JSON.stringify(val));
  },
  remove: function(key) {
    localStorage.removeItem('emmvf_' + key);
  }
};

function initDB() {
  if (DB.get('password') === null) {
    DB.set('password', 'admin123');
  }
  if (!DB.get('entites')) DB.set('entites', []);
  if (!DB.get('participations')) DB.set('participations', []);
  if (!DB.get('fichesMensuelles')) DB.set('fichesMensuelles', []);
  if (!DB.get('annonces')) DB.set('annonces', []);
  if (!DB.get('session')) DB.set('session', false);
}

initDB();
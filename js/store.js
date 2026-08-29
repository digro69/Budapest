/* =====================================================================
   store.js — État de l'application + persistance locale
   Le programme vit dans localStorage. Aucune donnée ne quitte le
   téléphone : l'application fonctionne entièrement hors-ligne.
   ===================================================================== */

const STORAGE_KEY = 'voyage-app::budapest::v1';

const Store = (() => {
  let state = null;

  /* ---------- utilitaires ---------- */

  const clone = (o) => JSON.parse(JSON.stringify(o));

  const uid = (prefix) =>
    prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /** Minutes depuis minuit, pour trier ; les horaires vides passent en dernier. */
  const minutes = (hhmm) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : 99999;
  };

  const sortActivities = (day) => {
    day.activities.sort((a, b) => minutes(a.time) - minutes(b.time));
  };

  const sortDays = () => {
    state.days.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  };

  /* ---------- persistance ---------- */

  function load() {
    let saved = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      console.warn('Lecture du stockage impossible, retour au programme d’origine.', e);
    }
    state = saved && saved.days && saved.days.length ? saved : clone(SEED);
    state.days.forEach(sortActivities);
    sortDays();
    return state;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('Sauvegarde impossible (stockage plein ou navigation privée).', e);
      return false;
    }
  }

  function reset() {
    state = clone(SEED);
    state.days.forEach(sortActivities);
    save();
    return state;
  }

  /* ---------- transfert entre appareils ---------- */

  const EXPORT_FORMAT = 'voyage-budapest';

  /** Le programme complet, sous forme de texte JSON prêt à être partagé. */
  function exportText() {
    return JSON.stringify({
      format: EXPORT_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      trip: state.trip,
      days: state.days
    }, null, 2);
  }

  const countActivities = (days) => days.reduce((n, d) => n + d.activities.length, 0);
  const countNotes = (days) =>
    days.reduce((n, d) => n + d.activities.filter((a) => (a.notes || '').trim()).length, 0);

  /**
   * Analyse un contenu reçu sans rien modifier.
   * @returns {{ok:true, data:object, resume:object} | {ok:false, error:string}}
   */
  function parseImport(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return { ok: false, error: 'Contenu illisible : ce n’est pas un programme exporté par l’application.' };
    }
    const src = parsed && Array.isArray(parsed.days) ? parsed : null;
    if (!src) return { ok: false, error: 'Aucun programme trouvé dans ce contenu.' };
    if (!src.days.length) return { ok: false, error: 'Ce programme ne contient aucun jour.' };

    const invalide = src.days.find((d) => !d.id || !Array.isArray(d.activities));
    if (invalide) return { ok: false, error: 'La structure des jours est incomplète : import annulé.' };

    return {
      ok: true,
      data: src,
      resume: {
        titre: (src.trip && src.trip.title) || 'Programme',
        jours: src.days.length,
        activites: countActivities(src.days),
        notes: countNotes(src.days),
        date: src.exportedAt ? src.exportedAt.slice(0, 10) : null
      }
    };
  }

  /** Remplace intégralement le programme par celui reçu. */
  function importReplace(src) {
    state = {
      version: 1,
      trip: clone(src.trip || state.trip),
      days: clone(src.days)
    };
    state.days.forEach(sortActivities);
    sortDays();
    save();
    return state;
  }

  /**
   * Ne reprend que les notes personnelles, appariées par identifiant d'activité.
   * Une note déjà présente localement n'est jamais écrasée : la note reçue est
   * ajoutée à la suite.
   * @returns {number} nombre d'activités enrichies
   */
  function importNotes(src) {
    const recues = new Map();
    src.days.forEach((d) =>
      d.activities.forEach((a) => {
        if ((a.notes || '').trim()) recues.set(a.id, a.notes.trim());
      })
    );

    let n = 0;
    state.days.forEach((d) =>
      d.activities.forEach((a) => {
        const recue = recues.get(a.id);
        if (!recue) return;
        const locale = (a.notes || '').trim();
        if (!locale) {
          a.notes = recue;
          n++;
        } else if (!locale.includes(recue)) {
          a.notes = locale + '\n\n— Reçu de l’autre téléphone :\n' + recue;
          n++;
        }
      })
    );
    if (n) save();
    return n;
  }

  /* ---------- lecture ---------- */

  const getState = () => state;
  const getDays = () => state.days;
  const getDay = (dayId) => state.days.find((d) => d.id === dayId) || null;

  function getActivity(dayId, actId) {
    const day = getDay(dayId);
    if (!day) return null;
    const activity = day.activities.find((a) => a.id === actId) || null;
    return activity ? { day, activity } : null;
  }

  /* ---------- écriture : voyage ---------- */

  /** Met à jour les informations générales du séjour (titre, notes pratiques…). */
  function updateTrip(patch) {
    Object.assign(state.trip, patch);
    save();
    return state.trip;
  }

  /* ---------- écriture : jours ---------- */

  function updateDay(dayId, patch) {
    const day = getDay(dayId);
    if (!day) return null;
    Object.assign(day, patch);
    sortDays();
    save();
    return day;
  }

  /* ---------- écriture : activités ---------- */

  function updateActivity(dayId, actId, patch) {
    const found = getActivity(dayId, actId);
    if (!found) return null;
    Object.assign(found.activity, patch);
    sortActivities(found.day);
    save();
    return found.activity;
  }

  function addActivity(dayId, data) {
    const day = getDay(dayId);
    if (!day) return null;
    const activity = Object.assign(
      {
        id: uid('act'),
        time: '12:00',
        duration: 60,
        type: 'visite',
        title: 'Nouvelle activité',
        description: '',
        details: '',
        address: '',
        links: [],
        comments: '',
        notes: ''
      },
      data || {}
    );
    day.activities.push(activity);
    sortActivities(day);
    save();
    return activity;
  }

  function removeActivity(dayId, actId) {
    const day = getDay(dayId);
    if (!day) return false;
    const i = day.activities.findIndex((a) => a.id === actId);
    if (i === -1) return false;
    day.activities.splice(i, 1);
    save();
    return true;
  }

  /**
   * Déplace une activité vers un autre jour (utilisé quand on change la date
   * d'une activité depuis la fiche détail).
   */
  function moveActivity(fromDayId, actId, toDayId) {
    if (fromDayId === toDayId) return true;
    const from = getDay(fromDayId);
    const to = getDay(toDayId);
    if (!from || !to) return false;
    const i = from.activities.findIndex((a) => a.id === actId);
    if (i === -1) return false;
    const [activity] = from.activities.splice(i, 1);
    to.activities.push(activity);
    sortActivities(to);
    save();
    return true;
  }

  /* ---------- écriture : liens ---------- */

  function addLink(dayId, actId, link) {
    const found = getActivity(dayId, actId);
    if (!found) return null;
    if (!Array.isArray(found.activity.links)) found.activity.links = [];
    found.activity.links.push({ label: link.label || link.url, url: link.url });
    save();
    return found.activity.links;
  }

  function updateLink(dayId, actId, index, link) {
    const found = getActivity(dayId, actId);
    if (!found || !found.activity.links[index]) return null;
    Object.assign(found.activity.links[index], link);
    save();
    return found.activity.links;
  }

  function removeLink(dayId, actId, index) {
    const found = getActivity(dayId, actId);
    if (!found || !found.activity.links[index]) return null;
    found.activity.links.splice(index, 1);
    save();
    return found.activity.links;
  }

  return {
    load, save, reset,
    exportText, parseImport, importReplace, importNotes,
    getState, getDays, getDay, getActivity,
    updateTrip, updateDay,
    addActivity, updateActivity, removeActivity, moveActivity,
    addLink, updateLink, removeLink,
    minutes, uid
  };
})();

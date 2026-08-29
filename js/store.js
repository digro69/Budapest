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
    getState, getDays, getDay, getActivity,
    updateDay,
    addActivity, updateActivity, removeActivity, moveActivity,
    addLink, updateLink, removeLink,
    minutes, uid
  };
})();

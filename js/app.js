/* =====================================================================
   app.js — Routage par ancre, rendu des trois écrans, édition
     #/                       Accueil (synthèse jour 1 → jour n)
     #/jour/:dayId            Détail du jour (activités, chronologique)
     #/jour/:dayId/:actId     Détail de l'activité
   ===================================================================== */

/* ---------------------------------------------------------------------
   Utilitaires
   ------------------------------------------------------------------ */

const $ = (sel, root = document) => root.querySelector(sel);

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
              'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** '2026-10-05' → 'Lundi 5 octobre 2026' (lower = true : 'lundi 5 octobre 2026') */
function fmtDate(iso, withYear = true, lower = false) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const jour = lower ? JOURS[d.getDay()] : cap(JOURS[d.getDay()]);
  return `${jour} ${d.getDate()} ${MOIS[d.getMonth()]}${withYear ? ' ' + m[1] : ''}`;
}

/** '2026-10-05' → 'lun. 5 oct.' */
function fmtDateShort(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return iso || '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${JOURS[d.getDay()].slice(0, 3)}. ${d.getDate()} ${MOIS[d.getMonth()].slice(0, 4)}.`;
}

/** 100 → '1 h 40' ; 45 → '45 min' */
function fmtDuration(min) {
  const n = Number(min);
  if (!n || n <= 0) return '—';
  const h = Math.floor(n / 60);
  const r = n % 60;
  if (!h) return `${r} min`;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

/** '15:30' + 90 → '17:00' */
function endTime(time, duration) {
  const start = Store.minutes(time);
  const n = Number(duration);
  if (start >= 99999 || !n) return '';
  const t = (start + n) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

const typeOf = (key) => TYPES[key] || { label: 'Activité', icon: '📍', color: 'var(--muted)' };

const mapsSearchUrl = (address) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address + ', Budapest');

const mapsTransitUrl = (address) =>
  'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' +
  encodeURIComponent(address + ', Budapest');

/** Complète une URL saisie sans protocole. */
function normalizeUrl(url) {
  const u = (url || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u) || /^(mailto|tel):/i.test(u)) return u;
  return 'https://' + u.replace(/^\/+/, '');
}

const prettyUrl = (url) => (url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');

/* ---------------------------------------------------------------------
   Toast
   ------------------------------------------------------------------ */

let toastTimer = null;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

/* ---------------------------------------------------------------------
   Feuille modale (formulaires)
   ------------------------------------------------------------------ */

/**
 * Ouvre une feuille de saisie.
 * @param {string} title  Titre affiché
 * @param {string} bodyHtml  Contenu du formulaire
 * @param {object} opts  { okLabel, onOk(form) -> bool|undefined, onOpen(form) }
 */
function openSheet(title, bodyHtml, opts = {}) {
  const dlg = $('#sheet');
  dlg.innerHTML = `
    <form method="dialog" id="sheet-form">
      <div class="sheet__head">
        <span class="sheet__title">${esc(title)}</span>
        <button type="button" class="iconbtn" data-close aria-label="Fermer">✕</button>
      </div>
      <div class="sheet__body">${bodyHtml}</div>
      <div class="sheet__foot">
        <button type="button" class="btn" data-close>Annuler</button>
        <button type="button" class="btn btn--primary" data-ok>${esc(opts.okLabel || 'Enregistrer')}</button>
      </div>
    </form>`;

  const form = $('#sheet-form', dlg);
  dlg.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => dlg.close())
  );
  $('[data-ok]', dlg).addEventListener('click', () => {
    if (opts.onOk && opts.onOk(form) === false) return; // validation échouée
    dlg.close();
  });

  dlg.showModal();
  if (opts.onOpen) opts.onOpen(form);
  const first = form.querySelector('input, select, textarea');
  if (first && !opts.noFocus) first.focus();
}

const val = (form, name) => {
  const el = form.elements[name];
  return el ? el.value.trim() : '';
};

/* ---------------------------------------------------------------------
   Barre d'application
   ------------------------------------------------------------------ */

function renderAppbar({ title, subtitle, backHref, action }) {
  return `
    <header class="appbar">
      ${backHref
        ? `<a class="appbar__back" href="${backHref}" aria-label="Retour">‹</a>`
        : `<span class="appbar__back" aria-hidden="true">🗺️</span>`}
      <div class="appbar__titles">
        <div class="appbar__title">${esc(title)}</div>
        ${subtitle ? `<div class="appbar__sub">${esc(subtitle)}</div>` : ''}
      </div>
      ${action
        ? `<button class="appbar__action" id="${action.id}">${esc(action.label)}</button>`
        : ''}
    </header>`;
}

/* ---------------------------------------------------------------------
   Écran 1 — Accueil
   ------------------------------------------------------------------ */

function viewHome() {
  const state = Store.getState();
  const days = Store.getDays();

  const cards = days.map((day, i) => {
    const acts = day.activities;
    // Résumé : les types présents dans la journée, sans doublon
    const seen = [];
    acts.forEach((a) => { if (!seen.includes(a.type)) seen.push(a.type); });
    const chips = seen.map((t) => {
      const T = typeOf(t);
      return `<span class="chip">${T.icon} ${esc(T.label)}</span>`;
    }).join('');

    const first = acts[0];
    const last = acts[acts.length - 1];
    const plage = first && last ? `${first.time} → ${endTime(last.time, last.duration) || last.time}` : '';

    return `
      <button class="daycard" data-goto="#/jour/${day.id}">
        <div class="daycard__head">
          <span class="daycard__num">Jour ${i + 1}</span>
          <span class="daycard__date">${esc(fmtDate(day.date, false))}</span>
          <span class="daycard__chevron">›</span>
        </div>
        <div class="daycard__sub">
          ${day.title ? esc(day.title) + ' · ' : ''}${acts.length} activité${acts.length > 1 ? 's' : ''}${plage ? ' · ' + plage : ''}
        </div>
        <div class="daycard__chips">${chips}</div>
      </button>`;
  }).join('');

  const notes = (state.trip.notes || [])
    .map((n) => `<li>${esc(n)}</li>`).join('');

  return renderAppbar({
    title: state.trip.title,
    subtitle: state.trip.subtitle,
    action: { id: 'btn-menu', label: 'Options' }
  }) + `
    <main>
      <div id="install-slot"></div>

      <section class="hero">
        <h1 class="hero__title">${esc(state.trip.title)}</h1>
        <div class="hero__dates">
          Du ${esc(fmtDate(state.trip.startDate, false, true))} au ${esc(fmtDate(state.trip.endDate, true, true))}
          · ${days.length} jours
        </div>
        ${state.trip.hotel ? `<div class="hero__meta">🛏️ ${esc(state.trip.hotel)}</div>` : ''}
      </section>

      <h2 class="section-title">Programme jour par jour</h2>
      ${cards}

      ${notes ? `
        <h2 class="section-title">Notes pratiques</h2>
        <div class="card card--muted">
          <ul class="notes-list">${notes}</ul>
        </div>` : ''}
    </main>`;
}

function bindHome() {
  $('#btn-menu')?.addEventListener('click', openOptions);
}

function openOptions() {
  openSheet('Options', `
    <div class="field">
      <label for="opt-theme">Apparence</label>
      <select id="opt-theme" name="theme">
        <option value="auto">Automatique (système)</option>
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
      </select>
    </div>
    <div class="card card--muted" style="margin-top:14px">
      <div class="card__label">Réinitialiser</div>
      <p class="body-text">Efface toutes vos modifications et restaure le programme d’origine
      issu du document de voyage.</p>
      <button type="button" class="btn btn--danger btn--block" id="opt-reset"
              style="margin-top:10px">Restaurer le programme d’origine</button>
    </div>
    <p class="hint" style="margin-top:14px">
      Vos modifications sont enregistrées uniquement sur cet appareil. L’application
      fonctionne sans connexion internet.
    </p>`, {
    okLabel: 'Fermer',
    onOpen: (form) => {
      form.elements.theme.value = localStorage.getItem('voyage-app::theme') || 'auto';
      form.elements.theme.addEventListener('change', (e) => applyTheme(e.target.value));
      $('#opt-reset', form).addEventListener('click', () => {
        if (!confirm('Restaurer le programme d’origine ? Toutes vos modifications et notes seront perdues.')) return;
        Store.reset();
        $('#sheet').close();
        render();
        toast('Programme d’origine restauré');
      });
    },
    onOk: () => {}
  });
}

function applyTheme(mode) {
  localStorage.setItem('voyage-app::theme', mode);
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
}

/* ---------------------------------------------------------------------
   Écran 2 — Détail du jour
   ------------------------------------------------------------------ */

function viewDay(dayId) {
  const day = Store.getDay(dayId);
  if (!day) return viewNotFound();

  const index = Store.getDays().indexOf(day) + 1;

  const rows = day.activities.map((a) => {
    const T = typeOf(a.type);
    const fin = endTime(a.time, a.duration);
    return `
      <article class="act" style="--type-color:${T.color}">
        <div class="act__main">
          <div class="act__time">
            <div class="act__hour">${esc(a.time)}</div>
            <div class="act__dur">${esc(fmtDuration(a.duration))}</div>
            ${fin ? `<div class="act__dur">→ ${esc(fin)}</div>` : ''}
          </div>
          <div class="act__rule"></div>
          <div class="act__body">
            <div class="act__type">${T.icon} ${esc(T.label)}</div>
            <h3 class="act__title">${esc(a.title)}</h3>
            ${a.description ? `<div class="act__desc">${esc(a.description)}</div>` : ''}
            ${a.address ? `<div class="act__addr"><span>📍</span><span>${esc(a.address)}</span></div>` : ''}
          </div>
        </div>
        <div class="act__actions">
          <button class="btn btn--primary" data-goto="#/jour/${day.id}/${a.id}">Détail</button>
          <button class="btn" data-edit="${a.id}">Modifier</button>
          <button class="btn btn--danger" data-del="${a.id}">Supprimer</button>
        </div>
      </article>`;
  }).join('');

  return renderAppbar({
    title: fmtDate(day.date, false),
    subtitle: `Jour ${index}` + (day.title ? ' · ' + day.title : '') +
              ` · ${day.activities.length} activité${day.activities.length > 1 ? 's' : ''}`,
    backHref: '#/',
    action: { id: 'btn-add', label: '+ Activité' }
  }) + `
    <main>
      <h2 class="section-title">Déroulé de la journée</h2>
      ${rows || '<p class="empty">Aucune activité pour ce jour. Utilisez « + Activité » pour en ajouter une.</p>'}
      <button class="btn btn--lg btn--block" id="btn-add-bottom" style="margin-top:14px">
        + Ajouter une activité
      </button>
    </main>`;
}

function bindDay(dayId) {
  const add = () => openActivityForm(dayId, null);
  $('#btn-add')?.addEventListener('click', add);
  $('#btn-add-bottom')?.addEventListener('click', add);

  document.querySelectorAll('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => openActivityForm(dayId, b.dataset.edit))
  );

  document.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      const found = Store.getActivity(dayId, b.dataset.del);
      if (!found) return;
      if (!confirm(`Supprimer « ${found.activity.title} » ?`)) return;
      Store.removeActivity(dayId, b.dataset.del);
      render();
      toast('Activité supprimée');
    })
  );
}

/* ---------------------------------------------------------------------
   Formulaire d'activité (création / modification)
   ------------------------------------------------------------------ */

function openActivityForm(dayId, actId) {
  const found = actId ? Store.getActivity(dayId, actId) : null;
  const a = found ? found.activity : null;

  const currentType = a ? a.type : 'visite'; // type par défaut à la création
  const typeOptions = Object.entries(TYPES).map(([key, T]) =>
    `<option value="${key}"${currentType === key ? ' selected' : ''}>${T.icon} ${esc(T.label)}</option>`
  ).join('');

  const dayOptions = Store.getDays().map((d, i) =>
    `<option value="${d.id}"${d.id === dayId ? ' selected' : ''}>Jour ${i + 1} — ${esc(fmtDate(d.date, false))}</option>`
  ).join('');

  openSheet(a ? 'Modifier l’activité' : 'Nouvelle activité', `
    <div class="field">
      <label for="f-title">Intitulé</label>
      <input id="f-title" name="title" type="text" value="${esc(a ? a.title : '')}"
             placeholder="Ex. Bains Széchenyi">
    </div>

    <div class="field">
      <label for="f-day">Jour</label>
      <select id="f-day" name="day">${dayOptions}</select>
    </div>

    <div class="field field--split">
      <div>
        <label for="f-time">Horaire</label>
        <input id="f-time" name="time" type="time" value="${esc(a ? a.time : '12:00')}">
      </div>
      <div>
        <label for="f-duration">Durée (min)</label>
        <input id="f-duration" name="duration" type="number" min="0" step="5"
               value="${esc(a ? a.duration : 60)}">
      </div>
    </div>

    <div class="field">
      <label for="f-type">Type d’activité</label>
      <select id="f-type" name="type">${typeOptions}</select>
    </div>

    <div class="field">
      <label for="f-description">Description courte</label>
      <input id="f-description" name="description" type="text"
             value="${esc(a ? a.description : '')}"
             placeholder="Une ligne, affichée dans le programme du jour">
    </div>

    <div class="field">
      <label for="f-address">Adresse</label>
      <input id="f-address" name="address" type="text" value="${esc(a ? a.address : '')}"
             placeholder="Rue, code postal, ville">
    </div>

    <div class="field">
      <label for="f-details">Description détaillée</label>
      <textarea id="f-details" name="details"
                placeholder="Ce qu’il faut savoir, ce qu’on y voit…">${esc(a ? a.details : '')}</textarea>
    </div>

    <div class="field">
      <label for="f-comments">Commentaires et précisions</label>
      <textarea id="f-comments" name="comments"
                placeholder="Horaires, réservation, à prévoir…">${esc(a ? a.comments : '')}</textarea>
    </div>`, {
    okLabel: a ? 'Enregistrer' : 'Ajouter',
    onOk: (form) => {
      const title = val(form, 'title');
      if (!title) { toast('L’intitulé est obligatoire'); return false; }

      const patch = {
        title,
        time: val(form, 'time') || '12:00',
        duration: Number(val(form, 'duration')) || 0,
        type: val(form, 'type'),
        description: val(form, 'description'),
        address: val(form, 'address'),
        details: val(form, 'details'),
        comments: val(form, 'comments')
      };
      const targetDay = val(form, 'day');

      if (a) {
        Store.updateActivity(dayId, a.id, patch);
        if (targetDay !== dayId) {
          Store.moveActivity(dayId, a.id, targetDay);
          // La fiche a changé de jour : on suit l'activité si on était dessus
          if (location.hash.includes(a.id)) location.hash = `#/jour/${targetDay}/${a.id}`;
          else render();
          toast('Activité déplacée au ' + fmtDateShort(Store.getDay(targetDay).date));
          return;
        }
        toast('Activité mise à jour');
      } else {
        Store.addActivity(targetDay, patch);
        toast('Activité ajoutée');
      }
      render();
    }
  });
}

/* ---------------------------------------------------------------------
   Écran 3 — Détail de l'activité
   ------------------------------------------------------------------ */

function viewActivity(dayId, actId) {
  const found = Store.getActivity(dayId, actId);
  if (!found) return viewNotFound();

  const { day, activity: a } = found;
  const T = typeOf(a.type);
  const fin = endTime(a.time, a.duration);

  const links = (a.links || []).map((l, i) => `
    <div class="linkrow">
      <a class="linkrow__go" href="${esc(normalizeUrl(l.url))}" target="_blank" rel="noopener noreferrer">
        <div class="linkrow__label">🔗 ${esc(l.label || prettyUrl(l.url))}</div>
        <div class="linkrow__url">${esc(prettyUrl(l.url))}</div>
      </a>
      <button class="iconbtn" data-link-edit="${i}" aria-label="Modifier le lien">✎</button>
      <button class="iconbtn" data-link-del="${i}" aria-label="Supprimer le lien">🗑</button>
    </div>`).join('');

  return renderAppbar({
    title: a.title,
    subtitle: `${fmtDate(day.date, false)} · ${a.time}`,
    backHref: `#/jour/${day.id}`,
    action: { id: 'btn-edit', label: 'Modifier' }
  }) + `
    <main>
      <section class="detail-head" style="--type-color:${T.color}">
        <span class="detail-head__type">${T.icon} ${esc(T.label)}</span>
        <h1 class="detail-head__title">${esc(a.title)}</h1>
        <div class="detail-head__when">
          🕒 ${esc(a.time)}${fin ? ' – ' + esc(fin) : ''} · ${esc(fmtDuration(a.duration))}
          <br>📅 ${esc(fmtDate(day.date))}
        </div>
      </section>

      ${a.details || a.description ? `
        <h2 class="section-title">Description</h2>
        <div class="card"><p class="body-text">${esc(a.details || a.description).replace(/\n/g, '<br>')}</p></div>
      ` : ''}

      <h2 class="section-title">Adresse & itinéraire</h2>
      <div class="card">
        <p class="body-text">📍 ${a.address ? esc(a.address) : '<span class="empty">Aucune adresse renseignée</span>'}</p>
        ${a.address ? `
          <div class="btn-row" style="margin-top:12px">
            <a class="btn btn--primary" style="text-decoration:none;text-align:center"
               href="${esc(mapsSearchUrl(a.address))}" target="_blank" rel="noopener noreferrer">Google Maps</a>
            <a class="btn" style="text-decoration:none;text-align:center"
               href="${esc(mapsTransitUrl(a.address))}" target="_blank" rel="noopener noreferrer">Itinéraire</a>
          </div>` : ''}
      </div>

      <h2 class="section-title">Liens</h2>
      <div class="card">
        <div class="linklist">
          ${links || '<p class="empty">Aucun lien pour le moment.</p>'}
        </div>
        <button class="btn btn--block" id="btn-link-add" style="margin-top:12px">+ Ajouter un lien</button>
      </div>

      ${a.comments ? `
        <h2 class="section-title">Commentaires et précisions</h2>
        <div class="card card--muted"><p class="body-text">${esc(a.comments).replace(/\n/g, '<br>')}</p></div>
      ` : ''}

      <h2 class="section-title">Mes notes</h2>
      <div class="card">
        <div class="field">
          <label for="user-notes">Commentaires ou informations additionnelles</label>
          <textarea id="user-notes" placeholder="Réservation n°…, ce qu’on a aimé, à refaire…">${esc(a.notes)}</textarea>
          <div class="hint" id="notes-status">Enregistrement automatique sur cet appareil.</div>
        </div>
      </div>

      <div class="btn-row" style="margin-top:16px">
        <button class="btn btn--lg" id="btn-edit-bottom">Modifier l’activité</button>
        <button class="btn btn--lg btn--danger" id="btn-delete">Supprimer</button>
      </div>
    </main>`;
}

function bindActivity(dayId, actId) {
  const edit = () => openActivityForm(dayId, actId);
  $('#btn-edit')?.addEventListener('click', edit);
  $('#btn-edit-bottom')?.addEventListener('click', edit);

  $('#btn-delete')?.addEventListener('click', () => {
    const found = Store.getActivity(dayId, actId);
    if (!found) return;
    if (!confirm(`Supprimer « ${found.activity.title} » ?`)) return;
    Store.removeActivity(dayId, actId);
    location.hash = `#/jour/${dayId}`;
    toast('Activité supprimée');
  });

  /* --- liens --- */
  $('#btn-link-add')?.addEventListener('click', () => openLinkForm(dayId, actId, null));

  document.querySelectorAll('[data-link-edit]').forEach((b) =>
    b.addEventListener('click', () => openLinkForm(dayId, actId, Number(b.dataset.linkEdit)))
  );

  document.querySelectorAll('[data-link-del]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.linkDel);
      const found = Store.getActivity(dayId, actId);
      const link = found && found.activity.links[i];
      if (!link) return;
      if (!confirm(`Supprimer le lien « ${link.label || link.url} » ?`)) return;
      Store.removeLink(dayId, actId, i);
      render();
      toast('Lien supprimé');
    })
  );

  /* --- zone de saisie libre, sauvegarde automatique --- */
  const ta = $('#user-notes');
  if (ta) {
    let t = null;
    const status = $('#notes-status');
    ta.addEventListener('input', () => {
      clearTimeout(t);
      status.textContent = 'Saisie en cours…';
      t = setTimeout(() => {
        Store.updateActivity(dayId, actId, { notes: ta.value });
        status.textContent = 'Enregistré ✓';
      }, 500);
    });
    ta.addEventListener('blur', () => {
      clearTimeout(t);
      Store.updateActivity(dayId, actId, { notes: ta.value });
      status.textContent = 'Enregistré ✓';
    });
  }
}

function openLinkForm(dayId, actId, index) {
  const found = Store.getActivity(dayId, actId);
  if (!found) return;
  const existing = index != null ? found.activity.links[index] : null;

  openSheet(existing ? 'Modifier le lien' : 'Ajouter un lien', `
    <div class="field">
      <label for="f-url">Adresse du lien</label>
      <input id="f-url" name="url" type="url" inputmode="url" autocomplete="off"
             value="${esc(existing ? existing.url : '')}" placeholder="https://…">
      <button type="button" class="btn btn--block" id="btn-paste" style="margin-top:8px">
        📋 Coller depuis le presse-papiers
      </button>
      <div class="hint">Le « https:// » est ajouté automatiquement si vous l’oubliez.</div>
    </div>
    <div class="field">
      <label for="f-label">Libellé affiché</label>
      <input id="f-label" name="label" type="text" value="${esc(existing ? existing.label : '')}"
             placeholder="Ex. Site officiel, Réservation, Avis…">
    </div>`, {
    okLabel: existing ? 'Enregistrer' : 'Ajouter',
    onOpen: (form) => {
      $('#btn-paste', form).addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            form.elements.url.value = text.trim();
            toast('Lien collé');
          } else toast('Presse-papiers vide');
        } catch {
          toast('Collage refusé — utilisez un appui long dans le champ');
        }
      });
    },
    onOk: (form) => {
      const url = normalizeUrl(val(form, 'url'));
      if (!url) { toast('L’adresse du lien est obligatoire'); return false; }
      const label = val(form, 'label') || prettyUrl(url);
      if (existing) Store.updateLink(dayId, actId, index, { url, label });
      else Store.addLink(dayId, actId, { url, label });
      render();
      toast(existing ? 'Lien mis à jour' : 'Lien ajouté');
    }
  });
}

/* ---------------------------------------------------------------------
   Écran d'erreur
   ------------------------------------------------------------------ */

function viewNotFound() {
  return renderAppbar({ title: 'Introuvable', backHref: '#/' }) + `
    <main>
      <div class="card">
        <p class="body-text">Cette page n’existe plus — l’élément a peut-être été supprimé.</p>
        <a class="btn btn--primary btn--block" style="text-decoration:none;margin-top:12px" href="#/">
          Retour à l’accueil
        </a>
      </div>
    </main>`;
}

/* ---------------------------------------------------------------------
   Routage
   ------------------------------------------------------------------ */

function parseRoute() {
  const raw = (location.hash || '#/').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (parts[0] === 'jour' && parts[1]) {
    return { name: parts[2] ? 'activity' : 'day', dayId: parts[1], actId: parts[2] };
  }
  return { name: 'home' };
}

function render() {
  const route = parseRoute();
  const root = $('#app');

  if (route.name === 'day') {
    root.innerHTML = viewDay(route.dayId);
    bindDay(route.dayId);
  } else if (route.name === 'activity') {
    root.innerHTML = viewActivity(route.dayId, route.actId);
    bindActivity(route.dayId, route.actId);
  } else {
    root.innerHTML = viewHome();
    bindHome();
    renderInstallBanner();
  }

  // Navigation depuis n'importe quel élément porteur de data-goto
  root.querySelectorAll('[data-goto]').forEach((el) =>
    el.addEventListener('click', () => { location.hash = el.dataset.goto; })
  );

  window.scrollTo(0, 0);
}

/* ---------------------------------------------------------------------
   Installation sur l'écran d'accueil
   ------------------------------------------------------------------ */

let deferredInstall = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  renderInstallBanner();
});

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function renderInstallBanner() {
  const slot = $('#install-slot');
  if (!slot || isStandalone()) return;
  if (localStorage.getItem('voyage-app::install-dismissed') === '1') return;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (deferredInstall) {
    slot.innerHTML = `
      <div class="install-banner">
        <p><strong>Installer l’application</strong><br>Accès direct depuis l’écran d’accueil, même sans réseau.</p>
        <button class="btn btn--primary" id="btn-install">Installer</button>
        <button class="iconbtn" id="btn-install-x" aria-label="Masquer">✕</button>
      </div>`;
    $('#btn-install').addEventListener('click', async () => {
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      slot.innerHTML = '';
    });
  } else if (isIOS) {
    slot.innerHTML = `
      <div class="install-banner">
        <p><strong>Ajouter à l’écran d’accueil</strong><br>
        Bouton <em>Partager</em> ⬆️ puis « Sur l’écran d’accueil ».</p>
        <button class="iconbtn" id="btn-install-x" aria-label="Masquer">✕</button>
      </div>`;
  } else {
    return;
  }

  $('#btn-install-x')?.addEventListener('click', () => {
    localStorage.setItem('voyage-app::install-dismissed', '1');
    slot.innerHTML = '';
  });
}

/* ---------------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------------ */

applyTheme(localStorage.getItem('voyage-app::theme') || 'auto');
Store.load();
window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* hors-ligne indisponible */ });
  });
}

/* ═══════════════════════════════════════════════════════
   CMDB — app.js v4
   QFnetwork PCB circuit canvas · English UI · Sunburst ·
   Chart drill-down · Summary sheet tabs · Glow effects
   ═══════════════════════════════════════════════════════ */
'use strict';
/* ══════════════════════════════════════════════════════════════════════
   HANDSONTABLE — global setup, instances, theme, renderers
   ══════════════════════════════════════════════════════════════════════ */

const _ht = {};          // active instances keyed by name
let _htReady = false;    // renderers registered?

/* ── WHY _injectHOTStyles ────────────────────────────────────────────
   handsontable.full.min.css is loaded DYNAMICALLY after styles.css.
   When two !important rules have equal specificity, the LAST one in the
   document wins. HOT's bundled CSS beats our static file because it loads
   later. Injecting our overrides here (at app.js runtime) guarantees our
   rules appear AFTER HOT's stylesheet in the <head>, so we always win.
   ───────────────────────────────────────────────────────────────────── */
function _injectHOTStyles(){
  if(document.getElementById('cmdb-hot-styles')) return;
  const s = document.createElement('style');
  s.id = 'cmdb-hot-styles';
  s.textContent = `
/* ── BASE CELLS ─────────────────────────────── */
html[data-theme="dark"] .handsontable,
html[data-theme="dark"] .handsontable .wtHolder,
html[data-theme="dark"] .handsontable .wtSpreader,
html[data-theme="dark"] .handsontable .wtHider,
html[data-theme="dark"] .handsontable .ht_master,
html[data-theme="dark"] .handsontable .ht_clone_top,
html[data-theme="dark"] .handsontable .ht_clone_bottom,
html[data-theme="dark"] .handsontable .ht_clone_left,
html[data-theme="dark"] .handsontable .ht_clone_right,
html[data-theme="dark"] .handsontable .ht_clone_top_left_corner,
html[data-theme="dark"] .handsontable .ht_clone_bottom_left_corner,
html[data-theme="dark"] .handsontable table,
html[data-theme="dark"] .handsontable table.htCore { background:#1C1917 !important; }

/* shared td/th sizing — matches dt-table */
.handsontable td,
.handsontable th {
  font-size:      .775rem !important;
  padding:        3px 8px !important;
  white-space:    nowrap !important;
  vertical-align: middle !important;
  line-height:    1.35 !important;
  box-sizing:     border-box !important;
}
/* Allow text selection — must come after base rule */
.handsontable td {
  user-select:         text !important;
  -webkit-user-select: text !important;
  cursor:              cell !important;
}
html[data-theme="dark"]  .handsontable td,
html[data-theme="dark"]  .handsontable th  { background-color:#1C1917 !important; color:#EDE8E2 !important; border-color:rgba(237,232,226,.08) !important; }
html[data-theme="light"] .handsontable td,
html[data-theme="light"] .handsontable th  { background-color:#FAF9F5 !important; color:#1A1815 !important; border-color:rgba(26,24,21,.09) !important; }

/* ── ZEBRA ───────────────────────────────────── */
html[data-theme="dark"]  .handsontable tr:nth-child(even) td { background-color:#232120 !important; }
html[data-theme="light"] .handsontable tr:nth-child(even) td { background-color:#F0EDE5 !important; }

/* ── COLUMN HEADERS — match dt-table header style exactly ──────── */
/* All HOT headers — same height in main + clones */
.handsontable thead th,
.handsontable .ht_clone_left thead th,
.handsontable .ht_clone_top thead th,
.handsontable .ht_clone_top_left_corner thead th,
.handsontable .ht_clone_bottom_left_corner thead th {
  font-family:     'IBM Plex Mono', monospace !important;
  font-size:       .67rem !important;
  font-weight:     600 !important;
  letter-spacing:  .05em !important;
  text-transform:  uppercase !important;
  padding:         7px 8px !important;
  white-space:     nowrap !important;
  border-bottom:   2px solid var(--brd2) !important;
  border-top:      none !important;
  cursor:          pointer !important;
  user-select:     none !important;
  line-height:     1.35 !important;
  vertical-align:  middle !important;
  overflow:        hidden !important;
  box-sizing:      border-box !important;
}
/* Row number header corner cell */
.handsontable .ht_clone_top_left_corner thead th,
.handsontable .ht_clone_bottom_left_corner thead th {
  cursor:          default !important;
}
.handsontable .colHeader {
  font-family:     'IBM Plex Mono', monospace !important;
  font-size:       .67rem !important;
  font-weight:     600 !important;
  letter-spacing:  .05em !important;
  text-transform:  uppercase !important;
  cursor:          pointer !important;
}
html[data-theme="dark"]  .handsontable thead th,
html[data-theme="dark"]  .handsontable .colHeader { background-color:#2E2B29 !important; color:#A89F96 !important; }
html[data-theme="light"] .handsontable thead th,
html[data-theme="light"] .handsontable .colHeader { background-color:#EAE8DF !important; color:#6B645C !important; }

/* ── CLONE HEADER ALIGNMENT — keep same height as main header ── */
.handsontable .ht_clone_top thead th,
.handsontable .ht_clone_top_left_corner thead th { background-color: inherit !important; }

/* ── ROW HEADERS ────────────────────────────── */
html[data-theme="dark"]  .handsontable .rowHeader,
html[data-theme="dark"]  .handsontable .htRowHeader { background-color:#252220 !important; color:#6B645C !important; font-family:'IBM Plex Mono',monospace !important; font-size:.64rem !important; }
html[data-theme="light"] .handsontable .rowHeader,
html[data-theme="light"] .handsontable .htRowHeader { background-color:#F3F1EA !important; color:#A39C94 !important; font-family:'IBM Plex Mono',monospace !important; font-size:.64rem !important; }

/* ── HOVER — solid dark tint (rgba fails on white HOT bg) ── */
html[data-theme="dark"] body .handsontable tr:hover td,
html[data-theme="dark"] body .handsontable tr:hover th,
html[data-theme="dark"] body .handsontable .ht_master tr:hover td,
html[data-theme="dark"] body .handsontable .ht_clone_left tr:hover td,
html[data-theme="dark"] body .handsontable .ht_clone_left tr:hover th { background-color:#2D2522 !important; }
html[data-theme="dark"] body .handsontable tr:nth-child(even):hover td,
html[data-theme="dark"] body .handsontable .ht_master tr:nth-child(even):hover td { background-color:#312825 !important; }

html[data-theme="light"] body .handsontable tr:hover td,
html[data-theme="light"] body .handsontable tr:hover th,
html[data-theme="light"] body .handsontable .ht_master tr:hover td { background-color:rgba(217,119,87,.10) !important; }
html[data-theme="light"] body .handsontable tr:nth-child(even):hover td,
html[data-theme="light"] body .handsontable .ht_master tr:nth-child(even):hover td { background-color:rgba(217,119,87,.13) !important; }

/* ── CURRENT CELL ────────────────────────────── */
html[data-theme="dark"] body .handsontable td.current,
html[data-theme="dark"] body .handsontable td.current.area,
html[data-theme="dark"] body .handsontable .ht_master td.current,
html[data-theme="dark"] body .handsontable .ht_master td.current.area { background-color:#3D2D24 !important; color:#EDE8E2 !important; outline:none !important; }
html[data-theme="light"] body .handsontable td.current,
html[data-theme="light"] body .handsontable td.current.area,
html[data-theme="light"] body .handsontable .ht_master td.current { background-color:rgba(217,119,87,.20) !important; outline:none !important; }

/* ── AREA SELECTION ──────────────────────────── */
html[data-theme="dark"] body .handsontable td.area,
html[data-theme="dark"] body .handsontable .ht_master td.area { background-color:#2E2420 !important; color:#EDE8E2 !important; }
html[data-theme="light"] body .handsontable td.area,
html[data-theme="light"] body .handsontable .ht_master td.area { background-color:rgba(217,119,87,.13) !important; }

/* ── SELECTION BORDERS ───────────────────────── */
html[data-theme="dark"]  body .handsontable .wtBorder.current { border-color:#E08060 !important; border-width:2px !important; }
html[data-theme="dark"]  body .handsontable .wtBorder.area    { border-color:rgba(224,128,96,.8) !important; }
html[data-theme="dark"]  body .handsontable .wtBorder.corner  { background:#E08060 !important; width:6px !important; height:6px !important; }
html[data-theme="light"] body .handsontable .wtBorder.current { border-color:#D97757 !important; border-width:2px !important; }
html[data-theme="light"] body .handsontable .wtBorder.area    { border-color:rgba(217,119,87,.75) !important; }
html[data-theme="light"] body .handsontable .wtBorder.corner  { background:#D97757 !important; width:6px !important; height:6px !important; }

/* ── SEARCH HIGHLIGHT ────────────────────────── */
html[data-theme="dark"]  .handsontable td.htSearchResult { background-color:#3A2E1C !important; color:#EDE8E2 !important; }
html[data-theme="light"] .handsontable td.htSearchResult { background-color:rgba(217,119,87,.18) !important; }

/* ── INLINE EDITOR ───────────────────────────── */
html[data-theme="dark"]  .handsontable .handsontableInputHolder .handsontableInput { background:#1C1917 !important; color:#EDE8E2 !important; border:2px solid #E08060 !important; border-radius:2px !important; font-family:'DM Sans',sans-serif !important; font-size:.775rem !important; padding:2px 6px !important; box-shadow:0 0 0 3px rgba(224,128,96,.28) !important; }
html[data-theme="light"] .handsontable .handsontableInputHolder .handsontableInput { background:#FAF9F5 !important; color:#1A1815 !important; border:2px solid #D97757 !important; border-radius:2px !important; font-family:'DM Sans',sans-serif !important; font-size:.775rem !important; padding:2px 6px !important; box-shadow:0 0 0 3px rgba(217,119,87,.22) !important; }

/* ── CONTEXT MENU ────────────────────────────── */
html[data-theme="dark"]  .htContextMenu .wtHolder { background:#2E2B29 !important; border:1px solid rgba(237,232,226,.15) !important; box-shadow:0 8px 28px rgba(0,0,0,.6) !important; border-radius:7px !important; overflow:hidden; padding:4px 0 !important; }
html[data-theme="dark"]  .htContextMenu table.htCore td { background:#2E2B29 !important; color:#EDE8E2 !important; border-color:transparent !important; font-size:.76rem !important; padding:5px 16px !important; }
html[data-theme="dark"]  .htContextMenu table.htCore td:hover,
html[data-theme="dark"]  .htContextMenu table.htCore td.current { background:#3A2D28 !important; color:#EDE8E2 !important; }
html[data-theme="dark"]  .htContextMenu table.htCore td.htSeparator { border-top:1px solid rgba(237,232,226,.1) !important; padding:0 !important; height:1px !important; }
html[data-theme="light"] .htContextMenu .wtHolder { background:#EAE8DF !important; border:1px solid rgba(26,24,21,.17) !important; box-shadow:0 8px 28px rgba(26,24,21,.13) !important; border-radius:7px !important; overflow:hidden; padding:4px 0 !important; }
html[data-theme="light"] .htContextMenu table.htCore td { background:#EAE8DF !important; color:#1A1815 !important; border-color:transparent !important; font-size:.76rem !important; padding:5px 16px !important; }
html[data-theme="light"] .htContextMenu table.htCore td:hover,
html[data-theme="light"] .htContextMenu table.htCore td.current { background:rgba(217,119,87,.12) !important; }

/* ── DROPDOWN FILTER ─────────────────────────── */
html[data-theme="dark"]  .htDropdownMenu .wtHolder,
html[data-theme="dark"]  .htFiltersConditionsMenu .wtHolder { background:#2E2B29 !important; border:1px solid rgba(237,232,226,.15) !important; box-shadow:0 8px 24px rgba(0,0,0,.55) !important; border-radius:6px !important; }
html[data-theme="dark"]  .htDropdownMenu table.htCore td,
html[data-theme="dark"]  .htFiltersConditionsMenu table.htCore td { background:#2E2B29 !important; color:#EDE8E2 !important; border-color:transparent !important; font-size:.76rem !important; padding:4px 14px !important; }
html[data-theme="dark"]  .htDropdownMenu table.htCore td:hover,
html[data-theme="dark"]  .htDropdownMenu table.htCore td.current,
html[data-theme="dark"]  .htFiltersConditionsMenu table.htCore td:hover { background:#3A2D28 !important; }
html[data-theme="light"] .htDropdownMenu .wtHolder,
html[data-theme="light"] .htFiltersConditionsMenu .wtHolder { background:#EAE8DF !important; border:1px solid rgba(26,24,21,.17) !important; border-radius:6px !important; }
html[data-theme="light"] .htDropdownMenu table.htCore td,
html[data-theme="light"] .htFiltersConditionsMenu table.htCore td { background:#EAE8DF !important; color:#1A1815 !important; border-color:transparent !important; }
html[data-theme="light"] .htDropdownMenu table.htCore td:hover,
html[data-theme="light"] .htDropdownMenu table.htCore td.current,
html[data-theme="light"] .htFiltersConditionsMenu table.htCore td:hover { background:rgba(217,119,87,.10) !important; }

/* ── FILTER BUTTONS & INPUTS ─────────────────── */
html[data-theme="dark"]  .htUIButton button,
html[data-theme="dark"]  .htUIButton input[type=button] { background:#2E2B29 !important; color:#EDE8E2 !important; border:1px solid rgba(237,232,226,.15) !important; border-radius:3px !important; font-size:.73rem !important; padding:3px 10px !important; cursor:pointer; }
html[data-theme="light"] .htUIButton button,
html[data-theme="light"] .htUIButton input[type=button] { background:#EAE8DF !important; color:#1A1815 !important; border:1px solid rgba(26,24,21,.17) !important; border-radius:3px !important; font-size:.73rem !important; padding:3px 10px !important; cursor:pointer; }
.htUIButton button:hover,
.htUIButton input[type=button]:hover { background:#E08060 !important; color:#1C1917 !important; border-color:#E08060 !important; }
html[data-theme="dark"]  .htUITextInput input { background:#1C1917 !important; color:#EDE8E2 !important; border:1px solid rgba(237,232,226,.2) !important; border-radius:3px !important; font-size:.74rem !important; padding:3px 8px !important; }
html[data-theme="light"] .htUITextInput input { background:#FAF9F5 !important; color:#1A1815 !important; border:1px solid rgba(26,24,21,.2) !important; border-radius:3px !important; font-size:.74rem !important; padding:3px 8px !important; }
.htUITextInput input:focus { border-color:#E08060 !important; outline:none !important; box-shadow:0 0 0 2px rgba(224,128,96,.28) !important; }
html[data-theme="dark"]  .htUIMultipleSelectHot .wtHolder { background:#252220 !important; }
html[data-theme="dark"]  .htUIMultipleSelectHot table.htCore td { background:#252220 !important; color:#EDE8E2 !important; }
html[data-theme="light"] .htUIMultipleSelectHot .wtHolder { background:#F3F1EA !important; }
html[data-theme="light"] .htUIMultipleSelectHot table.htCore td { background:#F3F1EA !important; color:#1A1815 !important; }

/* ── SORT / SCROLLBARS ───────────────────────── */
/* Sort indicators — match dt-table ⇅/↑/↓ */
.handsontable span.colHeader.columnSorting                    { padding-right: 18px !important; position: relative !important; }
.handsontable span.colHeader.columnSorting::before            { content: '⇅' !important; position: absolute !important; right: 2px !important; top: 50% !important; transform: translateY(-50%) !important; font-size: .62rem !important; color: rgba(168,159,150,.55) !important; font-style: normal !important; }
.handsontable span.colHeader.columnSorting.ascending::before  { content: '↑' !important; color: #E08060 !important; }
.handsontable span.colHeader.columnSorting.descending::before { content: '↓' !important; color: #E08060 !important; }
html[data-theme="dark"]  .handsontable ::-webkit-scrollbar-track { background:#1C1917; }
html[data-theme="dark"]  .handsontable ::-webkit-scrollbar-thumb { background:rgba(237,232,226,.18); border-radius:4px; }
html[data-theme="light"] .handsontable ::-webkit-scrollbar-track { background:#F3F1EA; }
html[data-theme="light"] .handsontable ::-webkit-scrollbar-thumb { background:rgba(26,24,21,.18); border-radius:4px; }
`;
  document.head.appendChild(s);
}



/* ── macOS Traffic Lights — frameless window controls ───────────── */
(function(){
  // Mark body so CSS can show/hide traffic lights
  if(window.electronAPI) document.body.classList.add('is-electron');

  // Update maximize icon when window state changes
  function _tlUpdateMax(isMax){
    const btn = document.getElementById('tlMaximize');
    if(!btn) return;
    const svg = document.getElementById('tlMaxIcon');
    if(svg){
      svg.innerHTML = isMax
        ? '<path d="M3 1.5H1.5v2M1.5 4.5v2H3M5 6.5h1.5v-2M6.5 3.5v-2H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M1.5 3.5V1.5h2M4.5 1.5h2v2M6.5 4.5v2h-2M3.5 6.5h-2v-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
  }

  if(window.electronAPI){
    // Sync icon on load
    window.electronAPI.winIsMaximized().then(_tlUpdateMax).catch(()=>{});
    // Sync on fullscreen change
    window.electronAPI.onFullscreenChange(v => _tlUpdateMax(v));
  }

  window.tlClose    = function(){ if(window.electronAPI) window.electronAPI.winClose(); };
  window.tlMinimize = function(){ if(window.electronAPI) window.electronAPI.winMinimize(); };
  window.tlMaximize = function(){
    if(window.electronAPI){
      window.electronAPI.winMaximize().then(() =>
        window.electronAPI.winIsMaximized().then(_tlUpdateMax)
      ).catch(()=>{});
    }
  };
})();


/* ── Height helper ─────────────────────────────────────────────────── */
/* onReady: fires immediately since DOM is ready when app.js loads via async loader */
function onReady(fn){ fn(); }


function _htH(pageId, subtract){
  const el = document.getElementById(pageId);
  // +5 % more table area: multiply the computed height by 1.05
  return Math.max(274, Math.round(((el ? el.clientHeight : 640) - (subtract || 114)) * 1.05));
}

/* ── Register custom cell renderers (once, after HOT is loaded) ─────── */
function _htEnsureRenderers(){
  if(_htReady || typeof Handsontable === 'undefined') return;
  _htReady = true;
  // Inject our HOT theme styles AFTER HOT's own CSS (fixes cascade order)
  _injectHOTStyles();

  // Status badge
  // Override default text renderer to format Date objects from XLSX cellDates:true
  const _origText = Handsontable.renderers.getRenderer('text');
  Handsontable.renderers.registerRenderer('text', (hot, TD, row, col, prop, val, ...rest) => {
    if(val instanceof Date && !isNaN(val.getTime())){
      TD.textContent = fmtDate(val);
      TD.className = (TD.className||'').replace(/\bhtDimmed\b/,'').trim();
      return TD;
    }
    return _origText(hot, TD, row, col, prop, val, ...rest);
  });

  Handsontable.renderers.registerRenderer('statusBadge', (hot, TD, row, col, prop, val) => {
    const v   = String(val ?? '');
    const cls = /instal|activ/i.test(v) ? 'active' : /retir|baja/i.test(v) ? 'retired' : /stock/i.test(v) ? 'stock' : '';
    TD.innerHTML = cls ? `<span class="hot-badge ${cls}">${esc(v)}</span>` : esc(v);
    TD.style.padding = '2px 6px';
  });

  // EOL date — red when expired
  Handsontable.renderers.registerRenderer('eolDate', (hot, TD, row, col, prop, val) => {
    const v = String(val ?? '');
    const d = _obsParseDate(v);
    if(d){
      TD.textContent = fmtDate(d);
      if(d < new Date()){ TD.style.color = 'var(--missing)'; TD.style.fontWeight = '600'; }
    } else {
      TD.textContent = v;
    }
  });

  // Generic date
  Handsontable.renderers.registerRenderer('fmtDate', (hot, TD, row, col, prop, val) => {
    const d = _obsParseDate(String(val ?? ''));
    TD.textContent = d ? fmtDate(d) : String(val ?? '');
  });

  // HTML pill renderer (Others _all tab — presence pills)
  Handsontable.renderers.registerRenderer('htmlPills', (hot, TD, row, col, prop, val) => {
    TD.innerHTML     = String(val ?? '');
    TD.style.padding = '2px 6px';
  });

  // SVN-missing badge
  Handsontable.renderers.registerRenderer('svnMissBadge', (hot, TD, row, col, prop, val) => {
    TD.innerHTML     = '<span class="hot-badge hot-badge--svn-miss">NOT IN SVN</span>';
    TD.style.padding = '2px 6px';
  });
}

/* ── Shared base config ─────────────────────────────────────────────── */
function _htConfig(extras){
  _htEnsureRenderers();
  return {
    licenseKey:            'non-commercial-and-evaluation',
    rowHeaders:            true,
    rowHeaderWidth:        40,
    colHeaders:            true,
    rowHeights:            26,
    manualColumnResize:    true,
    manualRowResize:       false,
    columnSorting: {
      indicator:      true,
      sortEmptyCells: false,
      headerAction:   true,
    },
    multiColumnSorting:    false,
    filters:               true,
    dropdownMenu:          ['filter_by_condition','filter_operators','filter_by_value','filter_action_bar'],
    contextMenu: {
      items: {
        'copy':              { name: 'Copiar     Ctrl+C' },
        'cut':               { name: 'Cortar     Ctrl+X' },
        'paste':             { name: 'Pegar      Ctrl+V' },
        '---------':         Handsontable.plugins.ContextMenu.SEPARATOR,
        'freeze_column':     { name: 'Congelar columna' },
        'unfreeze_column':   { name: 'Descongelar columna' },
        '---------2':        Handsontable.plugins.ContextMenu.SEPARATOR,
        'alignment':         { name: 'Alinear' },
        'column_left':       { name: 'Insertar columna izq.' },
        'column_right':      { name: 'Insertar columna der.' },
        '---------3':        Handsontable.plugins.ContextMenu.SEPARATOR,
        'undo':              { name: 'Deshacer  Ctrl+Z' },
        'redo':              { name: 'Rehacer   Ctrl+Y' },
        '---------4':        Handsontable.plugins.ContextMenu.SEPARATOR,
        'hidden_columns_hide':   { name: 'Ocultar columna' },
        'hidden_columns_show':   { name: 'Mostrar ocultas' },
      }
    },
    hiddenColumns: { indicators: true },
    copyPaste: {
      copyColumnHeaders:    true,   // include headers in copy
      copyColumnGroupHeaders: false,
      pasteMode:            'overwrite',  // Excel-like paste
    },
    undo:                  true,
    search:                true,
    autoColumnSize:        false,
    colWidths:             120,
    stretchH:              'last',
    wordWrap:              false,
    outsideClickDeselects: false,
    enterBeginsEditing:    true,   // Enter opens cell editor (Excel behavior)
    enterMoves:            { col: 0, row: 1 },  // Enter moves down
    tabMoves:              { col: 1, row: 0 },  // Tab moves right
    renderAllRows:         false,
    viewportColumnRenderingOffset: 10,
    viewportRowRenderingOffset:    20,
    allowInvalid:          true,
    allowEmpty:            true,
    trimWhitespace:        false,
    afterSelection: function(r, c, r2, c2) {
      // Ensure the HOT container has focus so Ctrl+C works
      this.rootElement && this.rootElement.focus({ preventScroll: true });
    },
    ...extras,
  };
}

/* ── Mount / remount a HOT instance ─────────────────────────────────── */
function _htMount(key, containerId, config){
  _htEnsureRenderers();
  const el = document.getElementById(containerId);
  if(!el){ console.warn('HOT container not found:', containerId); return null; }
  if(_ht[key] && !_ht[key].isDestroyed){ try{ _ht[key].destroy(); }catch(e){} }
  el.innerHTML = '';
  // Pre-paint the container bg to prevent white flash before HOT initializes
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  el.style.background = dark ? '#1C1917' : '#FAF9F5';
  _ht[key] = new Handsontable(el, config);
  // Force full theme application immediately after mount
  setTimeout(() => _htApplyTheme(), 0);
  return _ht[key];
}

// Debounced window resize: update HOT heights so tables fill the new viewport
(function(){
  let _resizeT = null;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeT);
    _resizeT = setTimeout(() => {
      // Sheets
      if(_ht['sheets'] && !_ht['sheets'].isDestroyed){
        _ht['sheets'].updateSettings({ height: _htH('page-sheets', 105) }, false);
        _ht['sheets'].render();
      }
      // Others
      if(_ht['others'] && !_ht['others'].isDestroyed){
        _ht['others'].updateSettings({ height: _htH('page-others', 124) }, false);
        _ht['others'].render();
      }
      // Search
      if(_ht['search'] && !_ht['search'].isDestroyed){
        _ht['search'].updateSettings({ height: _htH('page-search', 160) }, false);
        _ht['search'].render();
      }
      // Compare
      if(_ht['compare'] && !_ht['compare'].isDestroyed){
        _ht['compare'].updateSettings({ height: _htH('page-compare', 140) }, false);
        _ht['compare'].render();
      }
      // Obs
      if(_ht['obs'] && !_ht['obs'].isDestroyed){
        _ht['obs'].updateSettings({ height: _htH('page-obs', 200) }, false);
        _ht['obs'].render();
      }
      // Compare (uses _nativeTable, no HOT resize needed)
    }, 200);
  });
})();

/* ── Destroy all instances (data reload / reset) ────────────────────── */
function _htDestroyAll(){
  Object.keys(_ht).forEach(k => {
    try { if(_ht[k] && !_ht[k].isDestroyed) _ht[k].destroy(); } catch(e){}
    delete _ht[k];
  });
}

/* ── Re-render after theme change (CSS vars updated) ────────────────── */
function _htApplyTheme(){
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bg   = dark ? '#1C1917' : '#FAF9F5';
  const bg2  = dark ? '#252220' : '#F3F1EA';
  const bg3  = dark ? '#2E2B29' : '#EAE8DF';
  Object.values(_ht).forEach(h => {
    try {
      if(!h || h.isDestroyed) return;
      const root = h.rootElement;
      if(root){
        // Force bg on ALL HOT internal containers to prevent any white flash
        const allContainers = root.querySelectorAll(
          '.wtHolder, .wtHolder > div, .wtSpreader, .wtHider,' +
          '.ht_master, .ht_clone_top, .ht_clone_bottom,' +
          '.ht_clone_left, .ht_clone_right,' +
          '.ht_clone_top_left_corner, .ht_clone_bottom_left_corner,' +
          '.ht_clone_top_right_corner,' +
          '.wtScrollbarCorner, .wtScrollbarHolder, table, table.htCore'
        );
        root.style.background = bg;
        allContainers.forEach(el => { el.style.background = bg; });
        // Row headers
        root.querySelectorAll('.rowHeader, .htRowHeader').forEach(el => {
          el.style.backgroundColor = bg2;
        });
        // Column headers
        root.querySelectorAll('thead th, .colHeader').forEach(el => {
          el.style.backgroundColor = bg3;
        });
      }
      h.render();
    } catch(e){}
  });
}

/* ─── Native data-viewer (replaces HOT for read-only pages) ─────── */
function _nativeTable(containerId, rows, cols, opts){
  opts = opts || {};
  const el = document.getElementById(containerId);
  if(!el) return;

  if(!rows || !rows.length){
    el.innerHTML = '<div class="dt-empty">' + (opts.emptyMsg || 'Sin datos') + '</div>';
    const b = opts.countBadgeId && document.getElementById(opts.countBadgeId);
    if(b) b.textContent = '0 filas';
    return;
  }

  const CHUNK = 120;

  // ── 1. Mutable working copy ───────────────────────────────────
  const sortableRows = rows.slice();

  // ── 2. Reorder cols: _sheet/_source/_missing first ───────────
  const _prio = new Set(['_sheet','_source','_missing']);
  cols = [
    ...cols.filter(x => _prio.has(x)),
    ...cols.filter(x => !_prio.has(x))
  ];
  const _colLabels = {_sheet:'Sheet', _source:'Source', _missing:'Ausente en'};

  // ── 3. Filter state ──────────────────────────────────────────
  let _sortCol = null, _sortAsc = true;
  let _filterQ = '';
  // All column keys from first row — for full-row text search
  const _allKeys = Object.keys(sortableRows[0] || {}).filter(k => k !== '_rowIdx' && k !== '_ri');
  let _visible   = sortableRows.slice(); // starts as full copy

  function _applyFilters(){
    if(!_filterQ){ _visible = sortableRows.slice(); return; }
    const q = _filterQ;
    _visible = sortableRows.filter(r => {
      // Search across ALL fields, not just rendered cols
      for(let k = 0; k < _allKeys.length; k++){
        const v = r[_allKeys[k]];
        if(v != null && String(v).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }

  function _updateCount(){
    const b = opts.countBadgeId && document.getElementById(opts.countBadgeId);
    if(b) b.textContent = _visible.length.toLocaleString() + ' filas';
  }

  // ── 4. Build headers ─────────────────────────────────────────
  const hCells = cols.map(col => {
    const label = _colLabels[col] || col;
    return `<th data-col="${col}" class="dt-sortable" title="Click ordenar · DblClick filtrar"><span class="dt-th-label">${label}</span><span class="dt-sort-icon"></span></th>`;
  }).join('');

  // ── 5. Build rows from _visible ──────────────────────────────
  let rendered = 0;
  function buildRows(start, end){
    let html = '';
    const lim = Math.min(end, _visible.length);
    for(let i = start; i < lim; i++){
      const r = _visible[i];
      let cells = '';
      for(let j = 0; j < cols.length; j++){
        const col = cols[j];
        const raw = r[col] ?? '';
        let cell = String(raw);
        if(raw instanceof Date && !isNaN(raw.getTime())){
          cell = fmtDate(raw);
        } else if(typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)){
          const d = new Date(raw); cell = isNaN(d) ? cell : fmtDate(d);
        } else if(typeof raw === 'string' && /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+\w+\s+\d{2}\s+\d{4}/.test(raw)){
          const d = new Date(raw); cell = isNaN(d) ? cell : fmtDate(d);
        } else if(col.toLowerCase() === 'status'){
          const cls = cell.toLowerCase().replace(/[^a-z]/g,'') || 'default';
          cell = `<span class="hot-badge ${cls}">${cell}</span>`;
        } else if(col === 'u_eol' && cell){
          const d = new Date(cell); const past = !isNaN(d) && d < new Date();
          cell = `<span${past ? ' style="color:var(--missing)"' : ''}>${fmtDateVal(cell)||cell}</span>`;
        }
        cells += `<td title="${String(raw instanceof Date ? fmtDate(raw) : raw).replace(/"/g,'&quot;')}">${cell}</td>`;
      }
      html += `<tr>${cells}</tr>`;
    }
    rendered = lim;
    return html;
  }

  // ── 6. Render ─────────────────────────────────────────────────
  _applyFilters();
  const tbody_id = containerId + '-body';
  const tbl = `<div class="dt-wrap"><table class="dt-table sel-table"><thead><tr>${hCells}</tr></thead><tbody id="${tbody_id}">${buildRows(0, CHUNK)}</tbody></table></div>`;
  el.innerHTML = tbl;
  _updateCount();

  // ── 7. Sort on header click ───────────────────────────────────
  el.querySelectorAll('th.dt-sortable').forEach(th => {
    const col = th.dataset.col;
    th.addEventListener('click', () => {
      if(_sortCol === col){ _sortAsc = !_sortAsc; } else { _sortCol = col; _sortAsc = true; }
      th.closest('thead').querySelectorAll('th').forEach(h => h.removeAttribute('data-sort'));
      th.setAttribute('data-sort', _sortAsc ? 'asc' : 'desc');
      sortableRows.sort((a,b) => {
        const av = String(a[col]??''), bv = String(b[col]??'');
        return _sortAsc ? av.localeCompare(bv,undefined,{numeric:true}) : bv.localeCompare(av,undefined,{numeric:true});
      });
      _applyFilters();
      const tb = document.getElementById(tbody_id);
      if(tb) tb.innerHTML = buildRows(0, Math.min(CHUNK, _visible.length));
      _updateCount();
    });
    th.addEventListener('dblclick', e => { e.stopPropagation(); _ntShowColFilter(col, th, containerId); });
  });

  // ── 8. External search input ─────────────────────────────────
  const si = opts.searchInputId && document.getElementById(opts.searchInputId);
  if(si){
    // Restore any existing query (don't reset on re-render)
    if(si.value) { _filterQ = si.value.toLowerCase().trim(); _applyFilters(); }
    si.oninput = () => {
      _filterQ = si.value.toLowerCase().trim();
      _applyFilters();
      const tb = document.getElementById(tbody_id);
      if(tb) tb.innerHTML = buildRows(0, Math.min(CHUNK, _visible.length));
      _updateCount();
    };
  }

  // ── 9. Infinite scroll ───────────────────────────────────────
  const wrap = el.querySelector('.dt-wrap');
  if(wrap){
    wrap.addEventListener('scroll', function onScroll(){
      if(rendered >= _visible.length){ wrap.removeEventListener('scroll', onScroll); return; }
      const {scrollTop, scrollHeight, clientHeight} = wrap;
      if(scrollTop + clientHeight > scrollHeight - 200){
        const tb = document.getElementById(tbody_id);
        if(tb){
          const next = Math.min(rendered + CHUNK, _visible.length);
          tb.insertAdjacentHTML('beforeend', buildRows(rendered, next));
        }
      }
    });
  }
}

/* ─── Date formatting — DD.MMM.YYYY ─────────────────────────────
   Single source of truth for all date display in the app.
   fmtDate(d)     → "25.Jan.2024"
   fmtDateTime(d) → "25.Jan.2024 14:30"
   fmtDateVal(v)  → accepts Date | timestamp | ISO string | Excel serial
   ─────────────────────────────────────────────────────────────── */
const _MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d){
  if(!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  // Format: Mon DD, YYYY  e.g. "Mar 08, 2026"
  return _MONTHS_SHORT[d.getMonth()] + ' ' + String(d.getDate()).padStart(2,'0') + ', ' + d.getFullYear();
}
function fmtDateTime(d){
  if(!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  return fmtDate(d);  // no hours — date only throughout the app
}
function fmtDateVal(v){
  if(!v && v !== 0) return '';
  if(v instanceof Date) return fmtDate(v);
  if(typeof v === 'number' && v > 25569 && v < 80000){
    // Excel serial date
    return fmtDate(new Date((v - 25569) * 86400 * 1000));
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? String(v) : fmtDate(d);
}


/* ─── HTML ESCAPE HELPER ───────────────────────────────
   Prevents XSS when injecting user/file data into innerHTML.
   Always use esc() when inserting untrusted strings into HTML.
   ─────────────────────────────────────────────────────── */
function esc(s){
  return String(s==null?'':s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ─── GLOBAL STATE ─── */
let PD=null, allRec=[], filteredRec=[], sheetData={};
const SHEETS_LIST=['SvN','Snow','Syma','Disc'];

// ── Sheet/Compare/Obs render caches — declared here to avoid TDZ ─
let _sheetsAllCols    = [];
let _sheetsColsCache  = {};   // tab → cols[]
let _sheetsRowCache   = {};   // tab → sort state
let _compareColsCache = {};   // key → cols[]
let _obsColsCache     = null; // cols[]
let rowsShown=100;
let sortCol='', sortAsc=true;  // search table sort state
let filters={sheet:[],status:[],empresa:[],os:[],manufacturer:[],chassis:[]};
const FILTER_CONFIG=[
  {key:'sheet',        field:'_sheet',       id:'filterSheet',       label:'Sheet'},
  {key:'status',       field:'Status',       id:'filterStatus',      label:'Status'},
  {key:'empresa',      field:'Empresa',      id:'filterEmpresa',     label:'Company',limit:20},
  {key:'os',           field:'OS',           id:'filterOS',          label:'OS',    limit:15},
  {key:'manufacturer', field:'Manufacturer', id:'filterManufacturer',label:'Manufacturer'},
  {key:'chassis',      field:'Chassis',      id:'filterChassis',     label:'Chassis'},
];
let currentModalData=[], currentModalCols=[];
let currentDashSheet='All', currentSummarySheet='All';
// chartType / PALETTES / getPalette defined in CHARTS section below
// PALETTE proxy re-exported here for dashboard/donut SVG usage
const PALETTE = new Proxy({}, { get: (_, i) => (typeof getPalette === 'function' ? getPalette() : [])[+i] || '#D97757' });
// SEARCH_COLS is built dynamically from loaded data; fallback for pre-load
const SEARCH_COLS_DEFAULT=['Serial','Placa','Dias','Hostname','OS','Status','Empresa','Manufacturer','Model','Chassis','Ubicacion','User','UserID','_sheet'];
let SEARCH_COLS = [...SEARCH_COLS_DEFAULT];
function rebuildSearchCols(){
  if(!allRec.length){ SEARCH_COLS=[...SEARCH_COLS_DEFAULT]; _searchTextCache=null; return; }
  const skip=new Set(['_rowIdx']);
  const colSet=new Set();
  // Sample ALL records to catch every column present in the file
  allRec.forEach(r=>Object.keys(r).forEach(k=>{ if(!skip.has(k)) colSet.add(k); }));
  SEARCH_COLS = _orderCols([...colSet]);
  _searchTextCache = null;  // invalidate so cache is rebuilt with new columns
}
/* ─── Canonical column order — applies to ALL spreadsheets ──── */
const COL_ORDER = [
  'Serial','Hostname','Placa','OS','Dias','Actualizado','Status',
  'Empresa','User','UserID','Ubicacion','IP',
  'Manufacturer','Model','Chassis',
  'start_date','u_eol','O.HW','O.So',
  'Dominio','Regional','ModeloBase','Fabricacion',
  '_sheet','Dupli'
];
/**
 * Sort an array of column names by COL_ORDER.
 * Unknown columns appear at the end, in their original order.
 */
function _orderCols(cols){
  const idx = col => { const i = COL_ORDER.indexOf(col); return i === -1 ? 9999 : i; };
  return [...cols].sort((a, b) => idx(a) - idx(b));
}


/* ═══════════════════════════════════════════════════════
   WELCOME — FULL-SCREEN PCB  (QFnetwork-style)
   No chip · Dense grid of nodes · Traces fill screen
   Signal pulses · Endpoint pads · Light + Dark themes
   ═══════════════════════════════════════════════════════ */
// Canvas init — DOM is already ready when app.js loads (async sequential loader)
// Using immediate IIFE instead of DOMContentLoaded which fires before app.js
;(function(){
  // Show "restore data" hint on welcome if cache exists
  const flag = localStorage.getItem('cmdb_cache_flag');
  if(flag){
    try {
      const f = JSON.parse(flag);
      if(Date.now() - f.ts <= 7*86400000){
        const hint = document.getElementById('welcomeCacheHint');
        if(hint){
          hint.textContent = '↩ Datos guardados disponibles — continuar para restaurar';
          hint.style.display = 'block';
        }
      }
    } catch(e){}
  }

  const canvas = document.getElementById('welcomeCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, running = true, traces = [], animT = 0, lastT = 0;

  /* ── Theme colors — Claude palette ── */
  function isDark(){ return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function col(){
    return isDark() ? {
      trace : 'rgba(224,128,96,0.09)',   /* coral Claude oscuro */
      hi    : 'rgba(224,128,96,0.26)',
      pad   : 'rgba(224,128,96,0.60)',
      ring  : 'rgba(224,128,96,0.16)',
      sig   : '#E08060',
      glow  : 'rgba(224,128,96,0.48)',
      tail  : 'rgba(224,128,96,0.18)'
    } : {
      trace : 'rgba(217,119,87,0.11)',   /* coral Claude claro */
      hi    : 'rgba(217,119,87,0.26)',
      pad   : 'rgba(217,119,87,0.62)',
      ring  : 'rgba(217,119,87,0.15)',
      sig   : '#D97757',
      glow  : 'rgba(217,119,87,0.30)',
      tail  : 'rgba(217,119,87,0.18)'
    };
  }

  /* ── Geometry ── */
  function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
  function segLen(a, b){ const dx=b.x-a.x, dy=b.y-a.y; return Math.sqrt(dx*dx+dy*dy); }
  function pathLen(pts){ let l=0; for(let i=1;i<pts.length;i++) l+=segLen(pts[i-1],pts[i]); return l; }
  function ptAlong(pts, frac){
    const tot = pathLen(pts);
    let rem = frac * tot;
    for(let i=1; i<pts.length; i++){
      const d = segLen(pts[i-1], pts[i]);
      if(rem <= d){ const t=rem/d; return{x:pts[i-1].x+(pts[i].x-pts[i-1].x)*t, y:pts[i-1].y+(pts[i].y-pts[i-1].y)*t}; }
      rem -= d;
    }
    return pts[pts.length-1];
  }

  /* ── PCB trace: only horizontal/vertical/45° turns ── */
  const DIRS = [0, 45, 90, 135, 180, 225, 270, 315]; // degrees, screen coords: 0=right, 90=up…
  // Convert PCB angle to screen delta (y inverted for canvas)
  function delta(deg, dist){
    const r = deg * Math.PI / 180;
    return { dx: Math.cos(r) * dist, dy: -Math.sin(r) * dist };
  }

  function makeTrace(ox, oy, startDir){
    const pts = [{ x: ox, y: oy }];
    const m = 12; // margin from edge
    let x = ox, y = oy;
    let dir = startDir;
    // Pick a grid spacing scaled to screen size
    const cell = Math.min(W, H) / 7;

    // Segment 1: straight run (1–2 cells)
    const len1 = cell * (0.6 + Math.random() * 1.0);
    const d1 = delta(dir, len1);
    x = clamp(x + d1.dx, m, W-m);
    y = clamp(y + d1.dy, m, H-m);
    pts.push({x, y});

    // 45° jog — keep on-grid
    if(Math.random() < 0.72){
      const turn = Math.random() < 0.5 ? 45 : -45;
      dir = (dir + turn + 360) % 360;
      const len2 = cell * (0.3 + Math.random() * 0.7);
      const d2 = delta(dir, len2);
      x = clamp(x + d2.dx, m, W-m);
      y = clamp(y + d2.dy, m, H-m);
      pts.push({x, y});
      // Come back to original axis after jog
      dir = (dir - turn + 360) % 360;
      const len3 = cell * (0.3 + Math.random() * 0.6);
      const d3 = delta(dir, len3);
      x = clamp(x + d3.dx, m, W-m);
      y = clamp(y + d3.dy, m, H-m);
      pts.push({x, y});
    }

    // Optional 90° turn + long run
    if(Math.random() < 0.55){
      const turn2 = Math.random() < 0.5 ? 90 : -90;
      dir = (dir + turn2 + 360) % 360;
      const len4 = cell * (0.5 + Math.random() * 1.0);
      const d4 = delta(dir, len4);
      x = clamp(x + d4.dx, m, W-m);
      y = clamp(y + d4.dy, m, H-m);
      pts.push({x, y});
    }

    // Final run to near edge
    const len5 = cell * (0.8 + Math.random() * 1.4);
    const d5 = delta(dir, len5);
    x = clamp(x + d5.dx, m, W-m);
    y = clamp(y + d5.dy, m, H-m);
    pts.push({x, y});

    return {
      pts,
      phase  : Math.random() * Math.PI * 2,
      period : 2.2 + Math.random() * 4.0,
      drawn  : 0,
      total  : pathLen(pts),
      delay  : 0  // set in buildTraces
    };
  }

  /* ── Build dense full-screen node grid ── */
  function buildTraces(){
    traces = [];
    const cols = 9, rows = 6;
    const cellW = W / cols, cellH = H / rows;

    let idx = 0;
    for(let gy = 0; gy < rows; gy++){
      for(let gx = 0; gx < cols; gx++){
        // Node center with small jitter
        const nx = cellW * (gx + 0.5) + (Math.random()-0.5) * cellW * 0.45;
        const ny = cellH * (gy + 0.5) + (Math.random()-0.5) * cellH * 0.45;

        // 2–4 traces from each node, in different directions
        const traceCount = 2 + Math.floor(Math.random() * 2);
        // Pick directions that don't overlap too much
        const baseDir = DIRS[Math.floor(Math.random() * DIRS.length)];
        for(let t = 0; t < traceCount; t++){
          const dir = (baseDir + t * 90 + (Math.random()<0.3 ? 45 : 0)) % 360;
          const tr = makeTrace(nx, ny, dir);
          tr.delay = idx * 0.018 + Math.random() * 0.08;
          traces.push(tr);
          idx++;
        }
      }
    }

    // Shuffle so draw-in doesn't go row-by-row
    for(let i = traces.length-1; i > 0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [traces[i], traces[j]] = [traces[j], traces[i]];
    }
    // Re-assign staggered delays after shuffle
    traces.forEach((tr, i) => { tr.delay = i * 0.022; });
  }

  /* ── Draw animated traces + pads + pulses ── */
  function drawScene(dt){
    const c = col();
    const growPx = Math.min(W, H) * 0.8;

    traces.forEach(tr => {
      if(animT > tr.delay){
        tr.drawn = Math.min(tr.total, tr.drawn + dt * growPx);
      }
      if(tr.drawn <= 0) return;

      const pct = tr.total > 0 ? tr.drawn / tr.total : 0;

      /* — Trace line — */
      ctx.beginPath();
      ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
      let rem = tr.drawn;
      for(let i = 1; i < tr.pts.length; i++){
        const dx = tr.pts[i].x - tr.pts[i-1].x;
        const dy = tr.pts[i].y - tr.pts[i-1].y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if(rem <= 0) break;
        if(rem >= len){
          ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
          rem -= len;
        } else {
          ctx.lineTo(tr.pts[i-1].x + dx*(rem/len), tr.pts[i-1].y + dy*(rem/len));
          break;
        }
      }
      ctx.strokeStyle = c.trace;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      /* — Start node dot — */
      ctx.beginPath(); ctx.arc(tr.pts[0].x, tr.pts[0].y, 2.2, 0, Math.PI*2);
      ctx.fillStyle = c.ring; ctx.fill();

      /* — Endpoint pad — */
      if(pct >= 0.96){
        const ep = tr.pts[tr.pts.length-1];
        ctx.beginPath(); ctx.arc(ep.x, ep.y, 5.5, 0, Math.PI*2);
        ctx.strokeStyle = c.ring; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(ep.x, ep.y, 3.0, 0, Math.PI*2);
        ctx.fillStyle = c.pad; ctx.fill();
      }

      /* — Signal pulse — */
      if(pct > 0.35){
        const cycle = ((animT + tr.phase) / tr.period) % 1;
        if(cycle < 0.80){
          const frac = (cycle / 0.80) * pct;
          const pos = ptAlong(tr.pts, frac);

          // Glow halo
          const gr = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 14);
          gr.addColorStop(0, c.glow);
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(pos.x, pos.y, 14, 0, Math.PI*2);
          ctx.fillStyle = gr; ctx.fill();

          // Bright dot
          ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.6, 0, Math.PI*2);
          ctx.fillStyle = c.sig; ctx.fill();

          // Tail
          const tailFrac = Math.max(0, frac - 0.06);
          const tail = ptAlong(tr.pts, tailFrac);
          ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(tail.x, tail.y);
          ctx.strokeStyle = c.tail; ctx.lineWidth = 2.2; ctx.stroke();
        }
      }
    });
  }

  /* ── Main loop ── */
  function frame(ts){
    if(!running) return;
    const dt = Math.min((ts - lastT) / 1000, 0.05);
    lastT = ts; animT += dt;
    ctx.clearRect(0, 0, W, H);
    drawScene(dt);
    requestAnimationFrame(frame);
  }

  function start(){
    running = true;
    requestAnimationFrame(ts => { lastT = ts; requestAnimationFrame(frame); });
  }

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    animT = 0;
    buildTraces();
  }

  window.addEventListener('resize', resize);
  resize();
  start();

  window._stopAnim  = () => { running = false; };
  window._startAnim = () => { if(!running) start(); };
  // Expose trace data + helpers so Claw'd can read ion positions
  window._pcb = { traces, ptAlong, get animT(){ return animT; }, get W(){ return W; }, get H(){ return H; } };
})();


function exitWelcome(){
  const w = document.getElementById('welcome');
  w.style.opacity = '0';
  setTimeout(() => {
    w.style.display = 'none';
    if(window._stopAnim)  window._stopAnim();
  }, 500);
  document.getElementById('app').classList.remove('hidden');
  // Entrar a pantalla completa automáticamente al iniciar
  setTimeout(() => {
    if(window.electronAPI){
      window.electronAPI.toggleFullscreen();
    } else if(document.documentElement.requestFullscreen){
      document.documentElement.requestFullscreen().catch(()=>{});
    }
  }, 100);
  // If cached data exists, restore it — otherwise stay on upload page
  const flag = localStorage.getItem('cmdb_cache_flag');
  if(flag){
    try {
      const f = JSON.parse(flag);
      if(Date.now() - f.ts <= 7*86400000){
        loadFromLocalStorage();
        return;
      }
      // Expired cache — clean up
      localStorage.removeItem('cmdb_cache_flag');
      _idbDel('cmdb_data').catch(()=>{});
    } catch(e){ /* ignore */ }
  }
  // No cache: stay on upload page
  showPage('upload', document.querySelector('[data-page="upload"]'));
}

function showWelcome(){
  const w = document.getElementById('welcome');
  w.style.display = '';
  w.style.opacity = '0';
  requestAnimationFrame(() => { void w.offsetHeight; w.style.opacity = '1'; });
  if(window._startAnim)  window._startAnim();
}

/* ══════════════════════════════════════════════════════════
   INDEXEDDB  — unlimited storage for large CMDB files
   Falls back to localStorage for small files
   ══════════════════════════════════════════════════════════ */
const IDB_NAME  = 'cmdb_idb_v1';
const IDB_STORE = 'data';
let _idb = null;

function _openIDB(){
  return new Promise((res, rej) => {
    if(_idb){ res(_idb); return; }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess  = e => { _idb = e.target.result; res(_idb); };
    req.onerror    = e => rej(e.target.error);
  });
}
function _idbPut(key, val){ return _openIDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readwrite'); tx.objectStore(IDB_STORE).put(val,key); tx.oncomplete=res; tx.onerror=e=>rej(e.target.error); })); }
function _idbGet(key){ return _openIDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readonly'); const req=tx.objectStore(IDB_STORE).get(key); req.onsuccess=()=>res(req.result); req.onerror=e=>rej(e.target.error); })); }
function _idbDel(key){ return _openIDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readwrite'); tx.objectStore(IDB_STORE).delete(key); tx.oncomplete=res; tx.onerror=e=>rej(e.target.error); })); }

/* ── Auto-load: siempre muestra welcome primero ── */
/* La carga del cache ocurre en exitWelcome() si existe dato guardado */
document.addEventListener('keydown', e => {
  // Alt+1..8 → quick navigate to pages
  if(e.altKey && !e.ctrlKey && !e.metaKey && e.key >= '1' && e.key <= '8'){
    const pages=['upload','compare','search','others','dashboard','charts','summary','delta'];
    const idx = parseInt(e.key)-1;
    if(idx < pages.length){
      e.preventDefault();
      const btn = document.querySelector(`[data-page="${pages[idx]}"]`);
      showPage(pages[idx], btn);
    }
    return;
  }
  // Ctrl+F / Cmd+F → focus search input on Search page
  if((e.ctrlKey || e.metaKey) && e.key === 'f'){
    const si = document.getElementById('searchInput');
    if(si && document.getElementById('page-search')?.classList.contains('active')){
      e.preventDefault();
      si.focus(); si.select();
    }
    return;
  }
  if(e.key !== 'Escape') return;
  // Welcome screen
  const w = document.getElementById('welcome');
  if(w && w.style.display !== 'none' && !w.classList.contains('hidden')){ exitWelcome(); return; }
  // Reset confirm overlay
  const resetOv = document.querySelector('.reset-confirm-overlay');
  if(resetOv){ resetOv.remove(); return; }
  // Filter popover
  const fp = document.getElementById('filterPopover');
  if(fp && !fp.classList.contains('hidden')){ closeFilterPop(); return; }
  // Main record modal
  const modal = document.getElementById('modal');
  if(modal && !modal.classList.contains('hidden')){ modal.classList.add('hidden'); return; }
});

/* ── Alt key hold: reveal keyboard shortcut hints in sidebar ── */
document.addEventListener('keydown', e => { if(e.key === 'Alt') document.body.classList.add('show-kbd-hints'); });
document.addEventListener('keyup',   e => { if(e.key === 'Alt') document.body.classList.remove('show-kbd-hints'); });

/* ═══════════════════════════════════════════════════════════════
   SISTEMA DE TEMAS — Solo claro y oscuro
   Paleta Claude: papel cálido / carbón rico
   ═══════════════════════════════════════════════════════════════ */
function _getTheme(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }

function setTheme(t){
  const theme = (t === 'light' || t === 'dark') ? t : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('cmdb_theme', theme);
}

/* ☀️/🌙 Alternar entre claro y oscuro */
function toggleTheme(){
  setTheme(_getTheme() === 'light' ? 'dark' : 'light');
  // Apply immediately (inline styles), then again after CSS transition settles
  _htApplyTheme();
  setTimeout(_htApplyTheme, 80);
  setTimeout(_htApplyTheme, 300);
}

/* Aplicar tema guardado al arrancar (script al final de <body>, DOM ya existe) */
(()=>{
  const saved = localStorage.getItem('cmdb_theme');
  const t = (saved === 'light' || saved === 'dark') ? saved : 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();
/* ─── DOMContentLoaded: restaurar tema guardado ────────────── */
onReady(() => {
  const saved = localStorage.getItem('cmdb_theme');
  if(saved === 'light' || saved === 'dark'){
    document.documentElement.setAttribute('data-theme', saved);
  }
});

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
const PAGE_TITLES={upload:'Upload',dashboard:'Summary & Dashboard',compare:'Compare',sheets:'Sheets',search:'Search',charts:'Charts',delta:'Delta — Comparison',others:'Others',obsolescencia:'Obsolescencia'};
function showPage(name,elem){
  // summary is now unified with dashboard
  if(name==='summary') name='dashboard';
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const pageEl = document.getElementById('page-'+name);
  if(pageEl) pageEl.classList.add('active');
  if(elem) elem.classList.add('active');
  document.getElementById('topbarTitle').textContent=PAGE_TITLES[name]||name;
  const mainEl = document.querySelector('.main');
  if(mainEl) mainEl.style.overflow = (name==='others'||name==='sheets'||name==='obsolescencia'||name==='search') ? 'hidden' : '';
  if(name==='dashboard'&&PD){ renderDashboard(); renderSummary(); }
  if(name==='compare'&&PD)renderComparisons();
  if(name==='search'&&PD){buildCascadingFilters();applyFilters()}
  if(name==='charts'&&PD){ chUpdateFilters(); chAutoRender(); }
  if(name==='sheets'&&PD) sheetsRender();
  // Resize HOT instances after layout settles
  setTimeout(()=>{ Object.values(_ht).forEach(h=>{ try{ if(!h.isDestroyed) h.render(); }catch(e){} }); }, 80);
  if(name==='obsolescencia'&&PD) obsRender();
  if(name==='delta')renderDelta();
}

/* ═══════════════════════════════════════════════════════
   FILE UPLOAD
   ═══════════════════════════════════════════════════════ */
const dropZone=document.getElementById('dropZone');
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('drag-over')});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('drag-over');if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0])});

function handleFile(file){
  if(!file)return;
  document.getElementById('fileInfo').classList.remove('hidden');
  document.getElementById('fileName').textContent=file.name;
  document.getElementById('fileMeta').textContent=formatBytes(file.size)+' · reading…';
  setProgress(10);
  const processBtn = document.getElementById('processBtn');
  if(processBtn){ processBtn.disabled = true; processBtn.style.opacity = '.6'; }
  const reader=new FileReader();
  reader.onload=e=>{
    setProgress(30);
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:true,dense:false,bookVBA:false,WTF:false});
      const sheets={};
      SHEETS_LIST.forEach(name=>{if(wb.SheetNames.includes(name))sheets[name]=XLSX.utils.sheet_to_json(wb.Sheets[name],{defval:''})});
      const totalRows=Object.values(sheets).reduce((s,r)=>s+r.length,0);
      const sl=document.getElementById('sheetList');sl.innerHTML='';
      Object.entries(sheets).forEach(([name,rows])=>{
        const d=document.createElement('div');d.className='sheet-item';
        d.innerHTML=`<span class="sheet-item-name">${name}</span><span class="sheet-item-count">${rows.length.toLocaleString()} rows</span>`;
        sl.appendChild(d);
      });
      const foundSheets = Object.keys(sheets).length;
      document.getElementById('fileMeta').textContent=formatBytes(file.size)+' · '+foundSheets+' sheets · '+totalRows.toLocaleString()+' records';
      if(foundSheets === 0){
        showToast('No se encontraron hojas reconocidas. Se esperan: '+SHEETS_LIST.join(', ')+'. Hojas en el archivo: '+wb.SheetNames.join(', '), 'warn');
        document.getElementById('processBtn').style.display='none';
      } else {
        document.getElementById('processBtn').style.display='inline-flex';
        if(foundSheets < SHEETS_LIST.length){
          showToast('Found '+foundSheets+' of '+SHEETS_LIST.length+' expected sheets.', 'info');
        }
      }
      window._rawSheets=sheets;window._rawFileName=file.name;setProgress(100);
      if(processBtn){ processBtn.disabled = false; processBtn.style.opacity = ''; }
    }catch(err){
      document.getElementById('fileMeta').textContent='Error: '+err.message;
      document.getElementById('processBtn').style.display='none';
      if(processBtn){ processBtn.disabled = false; processBtn.style.opacity = ''; }
      showToast('Could not read file: '+err.message, 'warn');
    }
  };
  reader.readAsArrayBuffer(file);
}

async function processData(){
  const _pdBtn = document.getElementById('processBtn');
  if(_pdBtn){ _pdBtn.disabled = true; _pdBtn.textContent = 'Processing…'; }
  try {
  // Reset all render caches — new file loaded
  _htDestroyAll();
  _sheetsColsCache   = {};
  _sheetsRowCache    = {};
  _othersPerSheetIdx = null;
  _othersSheetIdx    = null;
  _searchTextCache   = null;
  _sheetsVsCount   = {};
  _compareColsCache = {};
  _obsColsCache    = null;
  _filterSets      = null;
  _othersSheetIdx  = null;  // invalidate on new data
  const sheets=window._rawSheets;
  if(!sheets||!Object.keys(sheets).length){
    showToast('No data available — upload a file first.','warn'); return;
  }
  // Save current data as "previous" before overwriting
  if(allRec.length>0) savePreviousSnapshot();
  /* Staggered progress steps — each in its own tick so the DOM repaints between them */
  setStep(1,'active'); setProgress(10);
  await new Promise(r=>setTimeout(r,60));

  setStep(1,'done'); setStep(2,'active'); setProgress(25);
  PD={sheets,comparisons:{},summaries:{}}; sheetData=sheets;
  allRec=[]; SHEETS_LIST.forEach(name=>{if(sheets[name])sheets[name].forEach(r=>allRec.push({...r,_sheet:name}))});
  rebuildSearchCols();
  await new Promise(r=>setTimeout(r,60));

  setStep(2,'done'); setStep(3,'active'); setProgress(50);
  PD.comparisons=buildComparisons(sheets);
  await new Promise(r=>setTimeout(r,60));

  setStep(3,'done'); setStep(4,'active'); setProgress(70);
  ['Status','Empresa','OS','Manufacturer','Chassis','Regional','Dominio'].forEach(f=>{PD.summaries[f]=buildFieldSummary(allRec,f)});
  await new Promise(r=>setTimeout(r,60));

  setStep(4,'done'); setStep(5,'active'); setProgress(85);
  filteredRec=[...allRec]; updateBadge(); updateInfoGrid();
  buildCascadingFilters(); updateChartSheetFilters();
  setStep(5,'done'); setProgress(100);
  // Save to cache in background — don't block the UI
  saveToLocalStorage().catch(e => console.warn('Cache save failed:', e));

  document.getElementById('topbarInfo').textContent=allRec.length.toLocaleString()+' records · '+Object.keys(sheets).length+' sheets';
  const banner=document.getElementById('dataLoadedBanner');
  const msg=document.getElementById('dataLoadedMsg');
  if(banner&&msg){
    msg.textContent=`${window._rawFileName||'File'} — ${allRec.length.toLocaleString()} records loaded`;
    banner.classList.remove('hidden');
  }
  updateSnapshotPanel();
  if(_pdBtn){ _pdBtn.disabled = false; _pdBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Process Data'; }
  setTimeout(()=>{ showPage('dashboard',document.querySelector('[data-page="dashboard"]')); },200);
  } catch(err){
    console.error('processData error:', err);
    showToast('Error procesando datos: ' + err.message, 'warn');
    setProgress(0); [1,2,3,4,5].forEach(n=>setStep(n,''));
    if(_pdBtn){ _pdBtn.disabled = false; _pdBtn.textContent = 'Process Data'; }
  }
}

function buildComparisons(sheets){
  if(!sheets.SvN)return{};
  const svnSet = new Set(sheets.SvN.map(r=>norm(r.Serial)));
  const result = {};

  // ── For each other sheet: records NOT in SvN ──────────────────
  ['Snow','Syma','Disc'].forEach(name=>{
    if(!sheets[name]){result[name]={count:0,data:[],uniqueSerials:new Set(),duplicates:0};return;}
    const notIn = sheets[name].filter(r=>!svnSet.has(norm(r.Serial)));
    const seen=new Set(); let dups=0;
    notIn.forEach(r=>{const s=norm(r.Serial);if(seen.has(s))dups++;else seen.add(s);});
    result[name]={count:notIn.length,data:notIn,uniqueSerials:seen,duplicates:dups};
  });

  // ── Combined: union of all "not in SvN" records ───────────────
  const combined=[]; const cSeen=new Set();
  ['Snow','Syma','Disc'].forEach(name=>{
    if(result[name]) result[name].data.forEach(r=>{
      const s=norm(r.Serial);
      if(!cSeen.has(s)){cSeen.add(s);combined.push({...r,_source:name});}
    });
  });
  result['_combined']={count:combined.length,data:combined,uniqueSerials:cSeen,duplicates:0};

  // ── SvN-only: serials in SvN but absent from ALL other sheets ─
  const allOtherSets = {};
  ['Snow','Syma','Disc'].forEach(name=>{
    allOtherSets[name] = new Set((sheets[name]||[]).map(r=>norm(r.Serial)));
  });
  const svnOnlyData = sheets.SvN.filter(r=>{
    const s = norm(r.Serial);
    return !allOtherSets['Snow'].has(s) &&
           !allOtherSets['Syma'].has(s) &&
           !allOtherSets['Disc'].has(s);
  });
  // Per-sheet breakdown for SvN: mark which sheets are missing
  const svnOnlyFull = svnOnlyData.map(r=>{
    const s = norm(r.Serial);
    return {
      ...r,
      _missing: ['Snow','Syma','Disc'].filter(n=>!allOtherSets[n].has(s)).join(', ')
    };
  });
  const svnOnlySeen = new Set(svnOnlyData.map(r=>norm(r.Serial)));
  result['_svnonly'] = {count:svnOnlyData.length, data:svnOnlyFull, uniqueSerials:svnOnlySeen, duplicates:0};

  return result;
}

function norm(v){return(v||'').toString().trim().toUpperCase()}
function buildFieldSummary(records,field){
  const c={};records.forEach(r=>{
    const raw=r[field];
    const v=(raw===undefined||raw===null||raw==='')?'(blank)':String(raw).trim()||'(blank)';
    c[v]=(c[v]||0)+1;
  });
  return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([val,count])=>({val,count}));
}
function updateInfoGrid(){
  const sn=new Set(allRec.map(r=>norm(r.Serial)).filter(Boolean));
  const dups=allRec.filter(r=>(r.Dupli||'').toString().toLowerCase()==='si').length;
  document.getElementById('infoTotal').textContent=allRec.length.toLocaleString();
  document.getElementById('infoSerials').textContent=sn.size.toLocaleString();
  document.getElementById('infoSheets').textContent=Object.keys(sheetData).length;
  document.getElementById('infoDups').textContent=dups.toLocaleString();
}
function updateBadge(){document.getElementById('badgeRecords').textContent=allRec.length.toLocaleString()}
function setProgress(p){document.getElementById('progressBar').style.width=p+'%'}
function setStep(n,s){const e=document.getElementById('step'+n);if(e)e.className='step '+s}
function clearFile(){window._rawSheets=null;document.getElementById('fileInfo').classList.add('hidden');document.getElementById('processBtn').style.display='none';setProgress(0);document.getElementById('sheetList').innerHTML='';[1,2,3,4,5].forEach(n=>setStep(n,''))}
function formatBytes(b){return b>1024*1024?(b/1024/1024).toFixed(1)+' MB':(b/1024).toFixed(1)+' KB'}

/* ═══════════════════════════════════════════════════════
   STORAGE — IndexedDB primary · localStorage fallback
   ═══════════════════════════════════════════════════════ */
/* ── Toast system ────────────────────────────────────────────
   showToast(msg, type)           — mensaje simple
   showDownloadToast(filename, openFn) — con botón "Abrir"
   ─────────────────────────────────────────────────────────── */
function _getToast(){
  let t = document.getElementById('appToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'appToast';
    t.style.cssText = [
      'position:fixed','bottom:28px','left:50%','transform:translateX(-50%)',
      'padding:10px 16px','border-radius:6px','font-size:.76rem',
      'font-family:IBM Plex Mono,monospace','z-index:9999','max-width:560px',
      'display:flex','align-items:center','gap:12px',
      'box-shadow:0 4px 24px rgba(0,0,0,.35)',
      'transition:opacity .35s','letter-spacing:.01em',
      'pointer-events:auto'
    ].join(';');
    document.body.appendChild(t);
  }
  return t;
}
function showToast(msg, type='info'){
  const t = _getToast();
  const isDk = document.documentElement.getAttribute('data-theme')==='dark';
  t.style.background = type==='warn'?'#b84040':type==='ok'?'#1e7a3e':isDk?'#2a2a28':'#1a1a18';
  t.style.color = '#fff';
  t.style.opacity = '1';
  t.innerHTML = `<span style="flex:1">${msg}</span>`;
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.opacity='0'; }, 4000);
}
/* Download toast con boton "Abrir" — browser + Electron */
function showDownloadToast(filename, savedPath){
  const t = _getToast();
  const isDk = document.documentElement.getAttribute('data-theme')==='dark';
  t.style.cssText = [
    'position:fixed','bottom:28px','left:50%','transform:translateX(-50%)',
    'padding:11px 18px','border-radius:7px','font-size:.76rem',
    'font-family:IBM Plex Mono,monospace','z-index:99999','max-width:580px',
    'width:auto','min-width:320px',
    'display:flex','align-items:center','gap:12px',
    'box-shadow:0 6px 32px rgba(0,0,0,.55)',
    'transition:opacity .35s','letter-spacing:.01em',
    'pointer-events:auto','opacity:1',
    isDk ? 'background:#1a2e1a;border:1px solid rgba(74,222,128,.2)' : 'background:#0f2010;border:1px solid rgba(74,222,128,.3)'
  ].join(';');
  const short = filename.length > 36 ? '...' + filename.slice(-33) : filename;
  const isImg  = /\.(png|jpg|svg)$/i.test(filename);
  const btnStyle = "background:rgba(74,222,128,.2);border:1px solid rgba(74,222,128,.4);color:#4ade80;padding:4px 14px;border-radius:4px;font-size:.72rem;font-family:inherit;cursor:pointer;flex-shrink:0;text-decoration:none;white-space:nowrap;transition:background .15s";
  const btnHover = "onmouseover=\"this.style.background='rgba(74,222,128,.32)'\" onmouseout=\"this.style.background='rgba(74,222,128,.2)'\"";
  let openBtn = '';
  if(savedPath && window.electronAPI){
    // Electron: open the saved file with system's default app (Excel, Foxit, etc.)
    const sp = savedPath.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    openBtn = `<button onclick="window.electronAPI.openPath('${sp}')" style="${btnStyle}" ${btnHover}>Abrir archivo</button>`;
  }
  // In browser: no "Abrir" button — the browser already downloaded the file
  t.innerHTML = [
    '<svg viewBox="0 0 16 16" fill="none" style="width:15px;height:15px;flex-shrink:0">',
    '<path d="M8 3v8M5 8l3 3 3-3" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    '<path d="M3 13h10" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round"/></svg>',
    `<span style="flex:1;color:#aacfaa;font-size:.75rem">Descargado&nbsp;<strong style="color:#fff">${short}</strong></span>`,
    openBtn,
    '<button onclick="this.closest(\'#appToast\').style.opacity=\'0\'" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:1.15rem;line-height:1;cursor:pointer;padding:0 2px;flex-shrink:0">&times;</button>'
  ].join('');
  clearTimeout(t._t);
  t._t = setTimeout(()=>{ t.style.opacity='0'; }, 9000);
}
/* Helper: XLSX download + toast con "Abrir" */
function _xlsxDownload(wb, filename){
  const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });

  if(window.electronAPI && window.electronAPI.saveFile){
    // Electron: show ONE native Save dialog, write to disk, then offer "Abrir"
    window.electronAPI.saveFile({
      name:        filename,
      arrayBuffer: wbout.buffer || wbout,
      filters:     [{ name:'Excel', extensions:['xlsx'] }]
    }).then(savedPath => {
      if(savedPath) showDownloadToast(filename, savedPath);
      // If cancelled, show nothing
    }).catch(() => {
      // Fallback: browser-style download
      const url = URL.createObjectURL(new Blob([wbout], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      showDownloadToast(filename, null);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    });
  } else {
    // Browser: standard download
    const blob = new Blob([wbout], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = filename; a.click();
    showDownloadToast(filename, null);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
/* Helper: PNG download + toast con "Abrir" */
function _pngDownload(url, filename){
  const a = document.createElement('a');
  a.download = filename; a.href = url; a.click();
  showDownloadToast(filename, null);  // browser download — no "Abrir" in browser
}

async function saveToLocalStorage(){
  const payload = {
    ts      : Date.now(),
    fileName: window._rawFileName || 'cmdb.xlsx',
    sheets  : {}
  };
  SHEETS_LIST.forEach(n => { if(sheetData[n]) payload.sheets[n] = sheetData[n]; });

  try {
    // Primary: IndexedDB (no size limit)
    await _idbPut('cmdb_data', payload);
    // Small flag in localStorage for fast startup check
    localStorage.setItem('cmdb_cache_flag', JSON.stringify({ ts: payload.ts, fileName: payload.fileName }));
    // Update cache notification
    const msg = document.getElementById('cacheMsg');
    if(msg){ const d=new Date(payload.ts); msg.textContent=`Cached: ${payload.fileName} · ${fmtDateTime(d)}`; }
    document.getElementById('cacheNotif')?.classList.remove('hidden');
  } catch(e){
    console.warn('IndexedDB save failed, trying localStorage:', e);
    try {
      const json = JSON.stringify(payload);
      localStorage.setItem('cmdb_data_v1', json);
      localStorage.setItem('cmdb_cache_flag', JSON.stringify({ ts: payload.ts, fileName: payload.fileName }));
    } catch(e2){
      if(e2.name === 'QuotaExceededError' || e2.code === 22){
        showToast('⚠ File too large for browser cache. Data will not persist after reload.', 'warn');
      }
    }
  }
}

async function loadFromLocalStorage(){
  try {
    // Try IndexedDB first
    let p = await _idbGet('cmdb_data').catch(() => null);

    // Fall back to legacy localStorage
    if(!p){
      const raw = localStorage.getItem('cmdb_data_v1');
      if(!raw){ return; }
      p = JSON.parse(raw);
      // Migrate to IDB
      _idbPut('cmdb_data', p).catch(()=>{});
    }

    if(!p || !p.sheets){ return; }
    if(Date.now() - (p.ts || p.timestamp || 0) > 7*86400000){
      _idbDel('cmdb_data').catch(()=>{});
      localStorage.removeItem('cmdb_data_v1');
      localStorage.removeItem('cmdb_cache_flag');
      return;
    }

    const d = new Date(p.ts || p.timestamp);
    const fn = p.fileName || p.fn || 'cached file';
    document.getElementById('cacheMsg').textContent = `Loaded: ${fn} · ${fmtDateTime(d)}`;
    document.getElementById('cacheNotif').classList.remove('hidden');
    window._rawSheets  = p.sheets;
    window._rawFileName = fn;
    processData();
  } catch(e){ console.warn('Load from cache failed:', e.message); showToast('Cache restore failed — please upload your file.','warn'); }
}

async function clearLocalStorage(){
  try { await _idbDel('cmdb_data'); } catch(e){}
  localStorage.removeItem('cmdb_data_v1');
  localStorage.removeItem('cmdb_cache_flag');
  document.getElementById('cacheNotif')?.classList.add('hidden');
  PD=null; allRec=[]; filteredRec=[]; sheetData={};
  filters={sheet:[],status:[],empresa:[],os:[],manufacturer:[],chassis:[]};
  document.getElementById('badgeRecords').textContent='—';
  document.getElementById('topbarInfo').textContent='No data loaded';
  document.getElementById('dataLoadedBanner')?.classList.add('hidden');
  document.getElementById('othersSheetWrap')?.classList.add('hidden');
  document.getElementById('othersExportBar')?.classList.add('hidden');
  document.getElementById('othersStats')?.classList.add('hidden');
  document.getElementById('othersPlaceholder')?.classList.remove('hidden');
  clearFile();
  showPage('upload', document.querySelector('[data-page="upload"]'));
  showToast('Cache cleared — upload a new file to continue.', 'info');
}

/* ═══════════════════════════════════════════════════════
   COMPARACIONES
   ═══════════════════════════════════════════════════════ */
/* ─── Compare state ──────────────────────────────────────────── */
let compareEdits       = {};   // "rowIdx:col" => edited value
let compareActiveTab   = '_combined';
let compareSortCol     = null;
let compareSortAsc     = true;
let _compareAllCols    = [];   // cached columns for active tab


/* ─── renderComparisons — cards + spreadsheet ─────────────────── */
function renderComparisons(){
  _compareColsCache = {}; // new data → rebuild col cache
  const container = document.getElementById('compareCards');
  if(!PD || !PD.comparisons){
    container.innerHTML = '<div class="compare-placeholder">Load a file to see comparisons</div>';
    document.getElementById('compareSheetArea').style.display = 'none';
    return;
  }

  /* ── Cards ── */
  container.innerHTML = '';
  const cardDefs = [
    {key:'Snow',      label:'Snow',     labelSub:'Not in SvN'},
    {key:'Syma',      label:'Syma',     labelSub:'Not in SvN'},
    {key:'Disc',      label:'Disc',     labelSub:'Not in SvN'},
    {key:'_combined', label:'Combined', labelSub:'Not in SvN', tag:'Snow ∪ Syma ∪ Disc', combined:true},
    {key:'_svnonly',  label:'SvN Only', labelSub:'Not in Snow · Syma · Disc', svnonly:true},
  ];

  cardDefs.forEach(card => {
    const c   = PD.comparisons[card.key] || {count:0, data:[], duplicates:0};
    const el  = document.createElement('div');
    el.className = 'compare-card'
      + (card.combined ? ' combined' : '')
      + (card.svnonly  ? ' svnonly'  : '')
      + (compareActiveTab === card.key ? ' selected' : '');
    el.innerHTML = `
      ${card.tag ? `<div class="compare-tag">${card.tag}</div>` : ''}
      <div class="compare-source">${card.label}</div>
      <div class="compare-count">${c.count.toLocaleString()}</div>
      <div class="compare-label">${card.labelSub}</div>
      ${c.duplicates > 0 ? `<div class="compare-dups">${c.duplicates} serial duplicates</div>` : ''}
    `;
    el.addEventListener('click', () => compareShowTab(card.key));
    container.appendChild(el);
  });

  /* ── Tabs del spreadsheet ── */
  const tabs = document.getElementById('compareSheetTabs');
  tabs.innerHTML = cardDefs.map(c =>
    `<button class="others-sheet-tab${compareActiveTab === c.key ? ' active' : ''}"
       onclick="compareShowTab('${c.key}')">${c.label} (${(PD.comparisons[c.key]?.count||0).toLocaleString()})</button>`
  ).join('');

  /* ── Render spreadsheet ── */
  document.getElementById('compareSheetArea').style.display = '';
  _compareRenderSheet();
}

function compareShowTab(key){
  if(_ht['compare'] && !_ht['compare'].isDestroyed){ _ht['compare'].destroy(); delete _ht['compare']; }
  compareActiveTab = key;
  compareSortCol   = null;
  compareSortAsc   = true;
  _compareColsCache = {}; // invalidate col cache on tab change
  /* Update card selection */
  document.querySelectorAll('.compare-card').forEach((el, i) => {
    const keys = ['Snow','Syma','Disc','_combined','_svnonly'];
    el.classList.toggle('selected', keys[i] === key);
  });
  /* Update tab buttons */
  document.querySelectorAll('#compareSheetTabs .others-sheet-tab').forEach((btn, i) => {
    const keys = ['Snow','Syma','Disc','_combined','_svnonly'];
    btn.classList.toggle('active', keys[i] === key);
  });
  _compareRenderSheet();
}





/* ─── Cell edit handlers ── */
/* ── Sheets cell handlers ──────────────────────────────── */

/* ── Others cell handlers (by rowIdx:col) ─────────────── */

/* ── Others cell handlers (by ek key) ─────────────────── */


function compareResetEdits(){
  const ov = document.createElement('div'); ov.className = 'reset-confirm-overlay';
  ov.innerHTML = `<div class="reset-confirm-box"><h3>Reset Edits?</h3><p>All manual cell edits will be discarded.</p><div class="btn-row"><button class="btn-ghost" onclick="this.closest('.reset-confirm-overlay').remove()">Cancel</button><button class="btn-ghost" style="border-color:rgba(218,54,51,.5);color:var(--missing)" onclick="compareEdits={};_compareRenderSheet();this.closest('.reset-confirm-overlay').remove()">Reset</button></div></div>`;
  document.body.appendChild(ov);
}

function compareExportExcel(){
  if(!PD?.comparisons) return;
  const wb  = XLSX.utils.book_new();
  const ts  = new Date().toISOString().slice(0,10);
  const tabDefs = [
    {key:'Snow',      sheetName:'Snow - Not in SvN'},
    {key:'Syma',      sheetName:'Syma - Not in SvN'},
    {key:'Disc',      sheetName:'Disc - Not in SvN'},
    {key:'_combined', sheetName:'Combined - Not in SvN'},
    {key:'_svnonly',  sheetName:'SvN - Not in Others'},
  ];
  let hasData = false;
  tabDefs.forEach(({key, sheetName}) => {
    const comp = PD.comparisons[key] || {data:[]};
    const rows = comp.data || [];
    if(!rows.length) return;
    hasData = true;
    // Get columns for this tab
    const SKIP = new Set(['_sheet','_rowIdx','_source','_missing']);
    const s = new Set();
    rows.forEach(r => Object.keys(r).forEach(k => { if(!SKIP.has(k)) s.add(k); }));
    let prefix = [];
    if(key === '_combined') prefix = ['_source'];
    if(key === '_svnonly')  prefix = ['_missing'];
    const cols = [...prefix, ..._orderCols([...s])];
    const exportRows = rows.map((r, vi) => {
      const ri = r._rowIdx ?? vi;
      const out = {};
      cols.forEach(c => {
        const raw = c === '_source' ? (r._source||'') : c === '_missing' ? (r._missing||'') : (r[c]??'');
        const label = c === '_source' ? 'Fuente' : c === '_missing' ? 'Ausente en' : c;
        out[label] = compareEdits[`${key}:${ri}:${c}`] ?? raw;
      });
      return out;
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), sheetName.slice(0,31));
  });
  if(!hasData){ showToast('No hay datos para exportar.', 'warn'); return; }
  _xlsxDownload(wb, `cmdb_compare_${ts}.xlsx`);
}

/* ═══════════════════════════════════════════════════════
   MODAL (shared for compare + chart drill-down)
   ═══════════════════════════════════════════════════════ */
function openModal(title,sub,data,cols){
  cols=cols||(data.length?_orderCols(Object.keys(data[0]).filter(c=>c!=='_sheet')):['Serial','Hostname','OS','Status','Empresa','Manufacturer']);
  currentModalData=data;currentModalCols=cols;
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalSub').textContent=sub;
  document.getElementById('modalSearch').value='';
  renderModalTable(data,cols);
  document.getElementById('modal').classList.remove('hidden');
}

function filterModal(){
  const q=document.getElementById('modalSearch').value.toLowerCase();
  renderModalTable(q?currentModalData.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q))):currentModalData,currentModalCols);
}
function closeModal(e){
  if(e.target.id==='modal'){
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modalSearch').value='';
  }
}
function exportModal(type){
  if(!currentModalData.length)return;
  if(type==='excel'){const wb=XLSX.utils.book_new();const ts=new Date().toISOString().slice(0,10);XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(currentModalData),'Export');_xlsxDownload(wb,`cmdb_export_${ts}.xlsx`)}
  else exportTableAsPNG(document.getElementById('modalTable'),'cmdb_export.png');
}

/* ═══════════════════════════════════════════════════════
   CASCADING FILTERS
   ═══════════════════════════════════════════════════════ */
/* Pre-computed search query — se actualiza en _applyFiltersNow */
/* Pre-compiled filter Sets — rebuilt only when filters change.
   Set.has() is O(1) vs Array.includes() O(n) in the hot 44k-record loop */
let _filterSets   = null;  // key → Set | null
let _filterQuery  = '';    // cached search query (avoids DOM read per record)

function _rebuildFilterSets(){
  _filterSets = {};
  for(let i=0;i<FILTER_CONFIG.length;i++){
    const k=FILTER_CONFIG[i].key;
    _filterSets[k]=filters[k].length ? new Set(filters[k]) : null;
  }
}

function matchesFilters(r,excludeKey,mode){
  if(!_filterSets) _rebuildFilterSets();
  for(let i=0;i<FILTER_CONFIG.length;i++){
    const fc=FILTER_CONFIG[i];
    if(fc.key===excludeKey) continue;
    const fset=_filterSets[fc.key];
    if(!fset) continue;
    const val=(fc.field==='_sheet'?r._sheet:(r[fc.field]||'')).toString().trim();
    if(!fset.has(val)) return false;
  }
  if(mode !== 'skipQuery'){
    const q=_filterQuery;
    if(q){
      const t=String(r.Serial||'')+' '+String(r.Hostname||'')+' '+String(r.User||'')+' '+
              String(r.UserID||'')+' '+String(r.Empresa||'')+' '+String(r.IP||'')+' '+
              String(r.Ubicacion||'')+' '+String(r.Model||'')+' '+String(r.OS||'')+' '+String(r.Manufacturer||'');
      if(!t.toLowerCase().includes(q)) return false;
    }
  }
  return true;
}
function buildCascadingFilters(){
  if(!allRec.length)return;
  /* Only rebuild groups whose subset could have changed (all of them on full rebuild,
     but we avoid the extra filter pass by sharing the pre-filtered subsets) */
  for(let i=0;i<FILTER_CONFIG.length;i++){
    const fc=FILTER_CONFIG[i];
    buildFilterGroup(fc.id,fc.key,fc.field,allRec,fc.limit);
  }
}
function buildFilterGroup(containerId,filterKey,field,_unusedSubset,limit){
  const el=document.getElementById(containerId);if(!el)return;
  const subset=allRec.filter(r=>matchesFilters(r,filterKey));
  const counts={};subset.forEach(r=>{const v=(field==='_sheet'?r._sheet:(r[field]||'')).toString().trim()||'(blank)';counts[v]=(counts[v]||0)+1});
  let values=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([v,c])=>({v,c}));
  if(limit)values=values.slice(0,limit);
  const active=new Set(filters[filterKey]);
  el.innerHTML='';
  [...values.filter(x=>active.has(x.v)),...values.filter(x=>!active.has(x.v))].forEach(({v,c})=>{
    const wrap=document.createElement('label');wrap.className='filter-opt'+(c===0?' filter-opt-dim':'');
    const vSafe=v.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    wrap.innerHTML=`<input type="checkbox" value="${v}" ${active.has(v)?'checked':''} onchange="toggleFilter('${filterKey}','${vSafe}',this.checked)"><span class="filter-opt-label" onclick="showFilterDetail('${filterKey}','${field}','${vSafe}',event)">${v||'(blank)'}</span><span class="filter-opt-count">${c.toLocaleString()}</span>`;
    el.appendChild(wrap);
  });
  active.forEach(v=>{if(!values.find(x=>x.v===v)){const wrap=document.createElement('label');wrap.className='filter-opt filter-opt-dim';wrap.innerHTML=`<input type="checkbox" value="${v}" checked onchange="toggleFilter('${filterKey}','${v.replace(/'/g,"\\'")}',this.checked)"><span class="filter-opt-label">${v}</span><span class="filter-opt-count">0</span>`;el.appendChild(wrap)}});
}
function toggleFilter(key,val,checked){if(checked){if(!filters[key].includes(val))filters[key].push(val)}else{filters[key]=filters[key].filter(v=>v!==val)}_filterSets=null;buildCascadingFilters();applyFilters()}
function updateFilterBadge(){
  const active = Object.values(filters).flat().length;
  const badge  = document.getElementById('filterActiveBadge');
  const btn    = document.getElementById('filterResetBtn');
  if(!badge) return;
  if(active > 0){
    badge.textContent = active;
    badge.style.display = 'inline-flex';
    if(btn){ btn.classList.add('has-filters'); }
  } else {
    badge.style.display = 'none';
    if(btn){ btn.classList.remove('has-filters'); }
  }
}
function resetFilters(){
  filters={sheet:[],status:[],empresa:[],os:[],manufacturer:[],chassis:[]};
  _filterSets=null; // invalidate compiled sets
  // Clear search too
  const si = document.getElementById('searchInput');
  if(si) si.value = '';
  buildCascadingFilters();
  applyFilters();
  updateFilterBadge();
}
let _applyFiltersTimer=null;
function applyFilters(){
  // Debounce: espera 150ms desde la última tecla antes de filtrar
  clearTimeout(_applyFiltersTimer);
  _applyFiltersTimer=setTimeout(_applyFiltersNow, 150);
}
function _applyFiltersNow(){
  if(!allRec.length)return;
  _filterQuery=(document.getElementById('searchInput')?.value||'').toLowerCase().trim();
  if(!_filterSets) _rebuildFilterSets();
  // Fast path: pre-build a text index per record for the query
  const q = _filterQuery;
  const n = allRec.length;
  if(q){
    // Rebuild text cache only when needed — all columns dynamically
    if(!_searchTextCache || _searchTextCache.length !== n){
      _searchTextCache = new Array(n);
      const cols = SEARCH_COLS.filter(c => c !== '_rowIdx');
      for(let i=0;i<n;i++){
        const r=allRec[i];
        let txt='';
        for(let j=0;j<cols.length;j++){ const v=r[cols[j]]; if(v!=null && v!=='') txt+=v+' '; }
        _searchTextCache[i]=txt.toLowerCase();
      }
    }
    filteredRec=[];
    for(let i=0;i<n;i++){
      if(_searchTextCache[i].includes(q) && matchesFilters(allRec[i],null,'skipQuery')) filteredRec.push(allRec[i]);
    }
  } else {
    filteredRec=allRec.filter(r=>matchesFilters(r,null,null));
  }
  rowsShown=100;
  renderSearchTable();
  updateFilterBadge();
}
/* Search selection state */


/* Cache RegExp de búsqueda — evita recompilar en cada celda */
let _searchRegex=null, _searchRegexQ='__NONE__';

function showMoreRows(){rowsShown+=100;renderSearchTable()}
function exportSearch(){
  if(!filteredRec.length)return;
  const expCols=SEARCH_COLS.filter(c=>c!=='_rowIdx');
  const ws=XLSX.utils.json_to_sheet(filteredRec.map(r=>{const o={};expCols.forEach(c=>{o[c==='_sheet'?'Sheet':c]=c==='_sheet'?r._sheet:(r[c]||'')});return o}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Results');const ts=new Date().toISOString().slice(0,10); _xlsxDownload(wb,`cmdb_search_${ts}.xlsx`);
}

/* ─── FILTER DETAIL POPOVER ─── */




/* ═══════════════════════════════════════════════════════
   OTHERS — UNIFIED SERIAL LOOKUP + EDITABLE SPREADSHEET
   ═══════════════════════════════════════════════════════ */
const OTHERS_CMDB_COLS = ['Serial','Placa','Dias','Hostname','Status','OS','Manufacturer','Model','Chassis','Empresa','Regional','Dominio','User','Ubicacion'];

/* State — single source of truth */
let othersEdits         = {};   // "rowIdx:col" or "Sheet:serial:hitIdx:col" => edited value
let othersActiveSheet   = '_all';
let lastOthersResults   = [];   // [{_rowIdx,_serial,_presence:{Name:rows[]|null},...cmdb}]
let _othersSheetIdx = null;  // cached per-sheet serial indexes
let _othersPerSheetIdx  = null; // lazy per-sheet serial→rows index
let othersSortCol       = null;
let othersSortAsc       = true;
let othersFileData      = [];   // rows from uploaded lookup spreadsheet
let othersFileHeaders   = [];
let othersSerialCol     = '';


/* ── Helpers ── */
function parseSerials(raw){ return raw.split(/[\n,;\s]+/).map(s=>s.trim().toUpperCase()).filter(Boolean); }
function updateOthersCount(){ document.getElementById('othersCount').textContent = parseSerials(document.getElementById('othersInput').value).length+' serials'; }

/* ── Clear ── */
function clearOthers(){
  document.getElementById('othersInput').value = '';
  document.getElementById('othersCount').textContent = '0 serials';
  document.getElementById('othersPlaceholder').classList.remove('hidden');
  document.getElementById('othersSheetWrap').classList.add('hidden');
  document.getElementById('othersStats').classList.add('hidden');
  document.getElementById('othersExportBar').classList.add('hidden');
  lastOthersResults = []; othersEdits = {};
  othersFileData = []; othersFileHeaders = []; othersSerialCol = '';
  const badge = document.getElementById('othersFileBadge');
  if(badge) badge.classList.add('hidden');
  document.getElementById('othersColSelector').classList.add('hidden');
}

/* ── File upload helpers ── */
function othersOnDragOver(e){ e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function othersOnDragLeave(e){ e.preventDefault(); e.currentTarget.classList.remove('drag-over'); }
function othersOnDrop(e){
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if(file) othersLoadFile(file);
}
function othersLoadFile(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb   = XLSX.read(ev.target.result, {type:'array'});
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, {defval:''});
      othersFileData    = data;
      othersFileHeaders = data.length ? Object.keys(data[0]) : [];
      const badge   = document.getElementById('othersFileBadge');
      const colSel  = document.getElementById('othersColSelect');   // ← fix: use element ID
      if(badge){ badge.textContent = file.name; badge.classList.remove('hidden'); }
      if(colSel){
        colSel.innerHTML = '<option value="">— select column —</option>';
        othersFileHeaders.forEach(h=>{
          const o = document.createElement('option');
          o.value = h; o.textContent = h;
          colSel.appendChild(o);
        });
        const auto = othersFileHeaders.find(h=>/serial|sn|equipo/i.test(h)) || othersFileHeaders[0] || '';
        colSel.value = auto;
        othersSerialCol = auto;
      }
      document.getElementById('othersColSelector')?.classList.remove('hidden');
      othersApplyColumn();
      showToast(`${file.name} — ${data.length.toLocaleString()} filas cargadas`, 'info');
      // Auto-trigger search if CMDB data is loaded
      if(PD) setTimeout(lookupSerials, 120);
    } catch(err) {
      showToast('Error leyendo archivo: ' + err.message, 'warn');
    }
  };
  reader.readAsArrayBuffer(file);
}
function othersApplyColumn(){
  const _colSel = document.getElementById('othersColSelect');
  othersSerialCol = _colSel ? _colSel.value : othersSerialCol;
  if(!othersSerialCol || !othersFileData.length) return;
  const serials = othersFileData.map(r=>(r[othersSerialCol]||'').toString().trim().toUpperCase()).filter(Boolean);
  const textarea = document.getElementById('othersInput');
  textarea.value = serials.join('\n');
  updateOthersCount();
}

/* ══════════════════════════════════════════════════════
   LOOKUP — single unified implementation
   ══════════════════════════════════════════════════════ */
function lookupSerials(){
  if(!PD){ showToast('Load a CMDB file first — upload a file from the Upload page.', 'warn'); return; }
  const serials = parseSerials(document.getElementById('othersInput').value);
  if(!serials.length){ showToast('Enter at least one serial number.', 'warn'); return; }
  _othersPerSheetIdx = null;  // reset per-sheet cache for new lookup

  /* Build per-sheet indexes — cached for tab switching */
  if(!_othersSheetIdx){
    _othersSheetIdx = {};
    SHEETS_LIST.forEach(name=>{
      if(!sheetData[name]) return;
      _othersSheetIdx[name] = Object.create(null);
      sheetData[name].forEach(r=>{
        const k = norm(r.Serial);
        if(!_othersSheetIdx[name][k]) _othersSheetIdx[name][k] = [];
        _othersSheetIdx[name][k].push(r);
      });
    });
  }
  const idx = _othersSheetIdx;

  /* Build file index */
  const fileIdx = {};
  if(othersFileData.length && othersSerialCol){
    othersFileData.forEach(r=>{
      const sn = norm((r[othersSerialCol]||'').toString());
      if(sn) fileIdx[sn] = r;
    });
  }

  /* Build results */
  lastOthersResults = serials.map((serial, i)=>{
    const presence = {};
    let firstFound = null;
    SHEETS_LIST.forEach(name=>{
      const hits = idx[name]?.[serial] || null;
      presence[name] = hits;
      if(!firstFound && hits) firstFound = hits[0];
    });
    const base = idx['SvN']?.[serial]?.[0] || firstFound || {};
    return {
      _rowIdx  : i,
      _serial  : serial,
      _presence: presence,
      _fileRow : fileIdx[serial] || null,
      ...OTHERS_CMDB_COLS.reduce((o,col)=>({...o,[col]:base[col]||''}),{})
    };
  });
  othersEdits = {};
  othersSortCol = null; othersSortAsc = true;

  /* Stats bar */
  const found    = lastOthersResults.filter(r=>SHEETS_LIST.some(n=>r._presence[n])).length;
  const notFound = lastOthersResults.length - found;
  const notInSvn = lastOthersResults.filter(r=>!(r._presence['SvN'] && r._presence['SvN'].length)).length;
  const statsEl  = document.getElementById('othersStats');
  statsEl.classList.remove('hidden');
  const availSheets = SHEETS_LIST.filter(n=>sheetData[n]);
  statsEl.innerHTML =
    availSheets.map(n=>{ const c=lastOthersResults.filter(r=>r._presence[n]).length; return `<div class="others-stat-item"><div class="others-stat-num">${c}</div><div class="others-stat-label">${n}</div></div>`; }).join('') +
    (availSheets.includes('SvN') ? `<div class="others-stat-item others-stat-item--warn" onclick="othersGoToTab('_notinsvn')" title="Click para ver"><div class="others-stat-num" style="color:var(--svn-miss)">${notInSvn}</div><div class="others-stat-label">Not in SvN</div></div>` : '') +
    `<div class="others-stat-item"><div class="others-stat-num" style="color:var(--found)">${found}</div><div class="others-stat-label">Found</div></div>` +
    `<div class="others-stat-item"><div class="others-stat-num" style="color:var(--missing)">${notFound}</div><div class="others-stat-label">Not found</div></div>`;

  /* Show sheet + export */
  document.getElementById('othersPlaceholder').classList.add('hidden');
  document.getElementById('othersSheetWrap').classList.remove('hidden');
  document.getElementById('othersExportBar').classList.remove('hidden');

  /* Tabs: All + per-sheet + Not Found */
  const tabDefs = [
    {key:'_all',      label:'All'},
    ...availSheets.map(n=>({key:n, label:n})),
    ...(availSheets.includes('SvN') && notInSvn > 0
        ? [{key:'_notinsvn', label:`⚠ Not in SvN (${notInSvn})`, warn:true}]
        : []),
    {key:'_notfound', label:`Not Found (${notFound})`}
  ];
  document.getElementById('othersSheetTabs').innerHTML = tabDefs.map(t=>
    `<button class="others-sheet-tab${t.key==='_all'?' active':''}${t.warn?' others-tab-warn':''}" onclick="othersSetTab('${t.key}',this)">${t.label}</button>`
  ).join('');

  othersActiveSheet = '_all';
  othersRenderSheet();
}

function othersSetTab(key, btn){
  if(_ht['others'] && !_ht['others'].isDestroyed){ _ht['others'].destroy(); delete _ht['others']; }
  othersActiveSheet = key;
  othersSortCol = null; othersSortAsc = true;
  document.querySelectorAll('.others-sheet-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  othersRenderSheet();
}
function othersGoToTab(key){
  const btn = [...document.querySelectorAll('.others-sheet-tab')].find(b=>b.getAttribute('onclick')?.includes(key));
  if(btn) othersSetTab(key, btn);
}

/* ── Render spreadsheet by tab ── */



/* ══════════════════════════════════════════════════════
   EXPORT — clean, reliable
   ══════════════════════════════════════════════════════ */
function exportOthers(type){
  if(!lastOthersResults.length){ showToast('Run a lookup first.', 'warn'); return; }
  if(type === 'png') exportTableAsPNG(document.getElementById('othersSheetTable'), 'cmdb_others.png');
}


function othersExportExcel(){
  if(!lastOthersResults.length){ showToast('Run a lookup first.', 'warn'); return; }

  const wb     = XLSX.utils.book_new();
  const sheets = SHEETS_LIST.filter(n => sheetData[n]);

  /* ── Collect ALL unique native column names across all CMDB sheets ── */
  const allNativeCols = [];
  const colSet = new Set();
  sheets.forEach(n => {
    const sample = sheetData[n]?.[0] || {};
    Object.keys(sample).filter(c => c !== '_sheet').forEach(c => {
      if(!colSet.has(c)){ colSet.add(c); allNativeCols.push(c); }
    });
  });

  /* ── Helper: build enriched row for a result record ── */
  function buildRow(r){
    const row = { Serial: r._serial };
    sheets.forEach(n => { row['In_' + n] = r._presence[n] ? 'YES' : 'NO'; });
    let bestHit = null;
    sheets.forEach(n => { if(!bestHit && r._presence[n]) bestHit = r._presence[n][0]; });
    if(bestHit) allNativeCols.filter(c => c !== 'Serial').forEach(c => { row[c] = bestHit[c] ?? ''; });
    else        allNativeCols.filter(c => c !== 'Serial').forEach(c => { row[c] = ''; });
    OTHERS_CMDB_COLS.filter(c => c !== 'Serial').forEach(c => {
      const edited = othersEdits[`${r._rowIdx}:${c}`];
      if(edited !== undefined) row[c] = edited;
    });
    if(r._fileRow && othersFileHeaders.length){
      othersFileHeaders.filter(h => h !== othersSerialCol).forEach(h => { row['File_' + h] = r._fileRow[h] ?? ''; });
    }
    return row;
  }

  /* ── Sheet 1: All results ── */
  const allRows = lastOthersResults.map(r => buildRow(r));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allRows), 'All');

  /* ── Sheet 2: Not in SvN — serials missing from SvN sheet ── */
  if(sheets.includes('SvN')){
    const notInSvnRecs = lastOthersResults.filter(r => !(r._presence['SvN'] && r._presence['SvN'].length));
    if(notInSvnRecs.length){
      // Build a detailed sheet: serial + presence in other sheets + any CMDB data found elsewhere
      const notInSvnRows = notInSvnRecs.map(r => {
        const row = { Serial: r._serial, SvN_Status: 'NOT IN SVN' };
        // Check other sheets
        const otherSheets = sheets.filter(n => n !== 'SvN');
        otherSheets.forEach(n => { row['In_' + n] = r._presence[n] ? 'YES' : 'NO'; });
        // Best data hit from non-SvN sheets
        let bestHit = null;
        otherSheets.forEach(n => { if(!bestHit && r._presence[n]) bestHit = r._presence[n][0]; });
        if(bestHit){
          allNativeCols.filter(c => c !== 'Serial').forEach(c => { row[c] = bestHit[c] ?? ''; });
        }
        // Uploaded file data if available
        if(r._fileRow && othersFileHeaders.length){
          othersFileHeaders.filter(h => h !== othersSerialCol).forEach(h => { row['File_' + h] = r._fileRow[h] ?? ''; });
        }
        return row;
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notInSvnRows), 'Not in SvN');
    }
  }

  /* ── One sheet per CMDB source that has matches ── */
  sheets.forEach(n => {
    const sheetRecs   = sheetData[n] || [];
    const colsInSheet = sheetRecs[0] ? Object.keys(sheetRecs[0]).filter(c => c !== '_sheet') : [];
    const rows = lastOthersResults
      .filter(r => r._presence[n])
      .flatMap(r => r._presence[n].map(hit => {
        const row = {};
        colsInSheet.forEach(c => { row[c] = hit[c] ?? ''; });
        return row;
      }));
    if(rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), n);
  });

  /* ── Not Found sheet — serials not in ANY sheet ── */
  const notFoundRows = lastOthersResults
    .filter(r => !sheets.some(n => r._presence[n]))
    .map(r => ({ Serial: r._serial, Status: 'NOT FOUND IN ANY SHEET' }));
  if(notFoundRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(notFoundRows), 'Not Found');

  const ts = new Date().toISOString().slice(0, 10);
  _xlsxDownload(wb, `cmdb_others_${ts}.xlsx`);
}

function othersResetEdits(){
  if(!Object.keys(othersEdits||{}).length){ showToast('No hay ediciones que resetear.','info'); return; }
  const ov = document.createElement('div'); ov.className='reset-confirm-overlay';
  ov.innerHTML=`<div class="reset-confirm-box"><h3>Reset Edits?</h3><p>All manual cell edits will be discarded.</p><div class="btn-row"><button class="btn-ghost" onclick="this.closest('.reset-confirm-overlay').remove()">Cancel</button><button class="btn-ghost" style="border-color:rgba(218,54,51,.5);color:var(--missing)" onclick="othersEdits={};othersRenderSheet();this.closest('.reset-confirm-overlay').remove()">Reset</button></div></div>`;
  document.body.appendChild(ov);
}

/* exportTableAsPNG — convierte una tabla HTML a PNG y la descarga */
function exportTableAsPNG(tableEl, filename){
  if(!tableEl){ showToast('Tabla no encontrada.','warn'); return; }
  // Usar html2canvas si está disponible, si no fallback a SVG-foreignObject
  if(typeof html2canvas !== 'undefined'){
    html2canvas(tableEl, { scale:2, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg2').trim() || '#1a1815' })
      .then(canvas => { _pngDownload(canvas.toDataURL('image/png'), filename); })
      .catch(()=> showToast('Error generando PNG.','warn'));
    return;
  }
  // Fallback: SVG foreignObject (funciona sin libs externas)
  try {
    const rect  = tableEl.getBoundingClientRect();
    const W     = Math.round(rect.width)  || 1200;
    const H     = Math.round(rect.height) || 600;
    const xml   = new XMLSerializer().serializeToString(tableEl);
    const svg   = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
                  `<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${xml}</div></foreignObject></svg>`;
    const blob  = new Blob([svg], {type:'image/svg+xml'});
    const url   = URL.createObjectURL(blob);
    // Convert SVG → canvas → PNG
    const img   = new Image();
    img.onload  = () => {
      const c   = document.createElement('canvas'); c.width=W*2; c.height=H*2;
      const ctx = c.getContext('2d'); ctx.scale(2,2); ctx.drawImage(img,0,0);
      URL.revokeObjectURL(url);
      _pngDownload(c.toDataURL('image/png'), filename);
    };
    img.onerror = () => { URL.revokeObjectURL(url); showToast('PNG export no disponible en este contexto.','warn'); };
    img.src = url;
  } catch(e){ showToast('Error generando PNG: '+e.message,'warn'); }
}


/* ═══════════════════════════════════════════════════════
   RESET ALL DATA
   ═══════════════════════════════════════════════════════ */
function resetAllData(){
  _htDestroyAll();
  // Confirm dialog
  const ov = document.createElement('div');
  ov.className = 'reset-confirm-overlay';
  ov.innerHTML = `
    <div class="reset-confirm-box">
      <h3>Reset All Data?</h3>
      <p>This will clear all loaded CMDB data, filters, notes, cached file and delta snapshot from this browser. This action cannot be undone.</p>
      <div class="btn-row">
        <button class="btn-ghost" onclick="this.closest('.reset-confirm-overlay').remove()">Cancel</button>
        <button class="btn-ghost" style="border-color:rgba(218,54,51,.5);color:var(--missing)" onclick="_doResetAll(this)">Yes, Reset Everything</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
}

async function _doResetAll(btn){
  btn.closest('.reset-confirm-overlay').remove();
  // Clear ALL storage (IndexedDB + localStorage) — keep notes only
  try { await _idbDel('cmdb_data'); } catch(e){}
  try { await _idbDel('cmdb_prev_v2'); } catch(e){}
  ['cmdb_data_v1','cmdb_prev_v2','cmdb_cache_flag'].forEach(k=>localStorage.removeItem(k));
  // Reset state
  PD=null; allRec=[]; filteredRec=[]; sheetData={};
  filters={sheet:[],status:[],empresa:[],os:[],manufacturer:[],chassis:[]};
  rowsShown=100; currentDashSheet='All'; currentSummarySheet='All';
  _chType='bar'; _chData=[]; _chField=''; _chRecords=[]; _ecDestroy();
  lastOthersResults=[]; othersEdits={}; prevSnapshot=null;
  // Reset UI
  document.getElementById('badgeRecords').textContent='—';
  document.getElementById('topbarInfo').textContent='No data loaded';
  document.getElementById('cacheNotif').classList.add('hidden');
  clearFile();
  // Reset Others
  const ph = document.getElementById('othersPlaceholder');
  if(ph) ph.classList.remove('hidden');
  document.getElementById('othersSheetWrap')?.classList.add('hidden');
  document.getElementById('othersExportBar').classList.add('hidden');
  document.getElementById('othersStats').classList.add('hidden');
  // Hide data loaded banner
  document.getElementById('dataLoadedBanner')?.classList.add('hidden');
  // Show upload page
  showPage('upload', document.querySelector('[data-page="upload"]'));
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════ */
function setDashSheet(name,btn){currentDashSheet=name;document.querySelectorAll('.dash-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderDashboard()}
function getDashRecords(){return currentDashSheet==='All'?allRec:(sheetData[currentDashSheet]||[]).map(r=>({...r,_sheet:currentDashSheet}))}
function renderDashboard(){
  if(!PD)return;const records=getDashRecords();const total=records.length;
  /* Single-pass counters — avoids 4 separate .filter() passes over 44k records */
  let installed=0,stock=0,retired=0,dups=0;
  const _instSet=new Set(['Instalado','Installed','En Mantenimiento']);
  const _stkSet =new Set(['En Stock','In Stock']);
  const _retSet =new Set(['Retirado','Retired']);
  for(let i=0;i<records.length;i++){
    const r=records[i];
    const st=r.Status||'';
    if(_instSet.has(st)) installed++;
    else if(_stkSet.has(st)) stock++;
    else if(_retSet.has(st)) retired++;
    if((r.Dupli||'').toString().toLowerCase()==='si') dups++;
  }
  document.getElementById('kpiRow').innerHTML=[{val:total,label:'Total Assets',pct:100},{val:installed,label:'Active / Installed',pct:total?installed/total*100:0},{val:stock,label:'In Stock',pct:total?stock/total*100:0},{val:retired,label:'Retired',pct:total?retired/total*100:0},{val:dups,label:'Duplicates (Si)',pct:total?dups/total*100:0}]
  .map(k=>`<div class="kpi-card"><div class="kpi-val">${k.val.toLocaleString()}</div><div class="kpi-label">${k.label}</div><div class="kpi-bar-wrap"><div class="kpi-bar" style="width:${k.pct.toFixed(1)}%"></div></div><div class="kpi-pct">${k.pct.toFixed(1)}%</div></div>`).join('');
  if(currentDashSheet==='All')renderDonut(SHEETS_LIST.map(n=>({name:n,count:(sheetData[n]||[]).length})).filter(s=>s.count>0),total);
  else renderDonut([{name:currentDashSheet,count:total}],total);
  renderBarList('barManufacturer',buildFieldSummary(records,'Manufacturer').slice(0,10));
  renderBarList('barOS',buildFieldSummary(records,'OS').slice(0,8));
  renderBarList('barStatus',buildFieldSummary(records,'Status').slice(0,8));
}
function renderDonut(segments,total){
  const svg=document.getElementById('donutSvg'),legend=document.getElementById('donutLegend');
  const cx=110,cy=110,r=80,ir=52;let angle=-Math.PI/2,paths='';
  segments.forEach((seg,i)=>{const pct=seg.count/total,sw=pct*2*Math.PI;if(!pct)return;
    const x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle);angle+=sw;
    const x2=cx+r*Math.cos(angle),y2=cy+r*Math.sin(angle);
    const ix1=cx+ir*Math.cos(angle-sw),iy1=cy+ir*Math.sin(angle-sw),ix2=cx+ir*Math.cos(angle),iy2=cy+ir*Math.sin(angle);
    const lg=sw>Math.PI?1:0;
    if(pct>=.999){paths+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PALETTE[i%8]}" opacity=".85"/><circle cx="${cx}" cy="${cy}" r="${ir}" fill="none" stroke="var(--bg2)" stroke-width="3"/>`}
    else{paths+=`<path d="M${x1},${y1} A${r},${r},0,${lg},1,${x2},${y2} L${ix2},${iy2} A${ir},${ir},0,${lg},0,${ix1},${iy1} Z" fill="${PALETTE[i%8]}" opacity=".85"/>`}
  });
  svg.innerHTML=paths+`<text x="${cx}" y="${cy-8}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="22" font-weight="600" fill="var(--txt)">${total.toLocaleString()}</text><text x="${cx}" y="${cy+10}" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="var(--txt3)">records</text>`;
  legend.innerHTML=segments.map((seg,i)=>`<div class="donut-leg-item"><div class="donut-leg-left"><div class="donut-leg-dot" style="background:${PALETTE[i%8]}"></div><span class="donut-leg-name">${seg.name}</span></div><span class="donut-leg-count">${seg.count.toLocaleString()} (${total?(seg.count/total*100).toFixed(1):0}%)</span></div>`).join('');
}
function renderBarList(id,items){const el=document.getElementById(id),max=items[0]?.count||1;el.innerHTML=items.map(item=>`<div class="bar-item"><div class="bar-item-head"><span class="bar-item-name" title="${esc(item.val)}">${esc(item.val)}</span><span class="bar-item-val">${item.count.toLocaleString()}</span></div><div class="bar-item-track"><div class="bar-item-fill" style="width:${(item.count/max*100).toFixed(1)}%"></div></div></div>`).join('')}

/* ═══════════════════════════════════════════════════════
   SUMMARY PAGE — with sheet tabs
   ═══════════════════════════════════════════════════════ */
function renderSummary(){
  if(!PD)return;
  const records=currentSummarySheet==='All'?allRec:(sheetData[currentSummarySheet]||[]).map(r=>({...r,_sheet:currentSummarySheet}));
  const container=document.getElementById('summaryGrid');
  const fields=['Status','Empresa','OS','Manufacturer','Chassis','Regional','Dominio'];
  /* DocumentFragment: batch-insert all cards in one reflow */
  const frag=document.createDocumentFragment();
  const total_=records.length;
  for(let i=0;i<fields.length;i++){
    const field=fields[i];
    const summary=buildFieldSummary(records,field);
    const top=summary.slice(0,8);
    const card=document.createElement('div');card.className='summary-card';
    let inner=`<div class="summary-card-title">${field}</div><div class="summary-card-total">${summary.length} unique values</div>`;
    for(let j=0;j<top.length;j++){
      const item=top[j];
      inner+=`<div class="summary-row"><span class="summary-row-name" title="${esc(item.val)}">${esc(item.val)}</span><div class="summary-row-right"><span class="summary-row-count">${item.count.toLocaleString()}</span><span>${total_?(item.count/total_*100).toFixed(1):0}%</span></div></div>`;
    }
    if(summary.length>8) inner+=`<div class="summary-row"><span style="color:var(--txt3);font-size:.72rem;">+${summary.length-8} more</span></div>`;
    card.innerHTML=inner;
    frag.appendChild(card);
  }
  container.innerHTML='';
  container.appendChild(frag);
}

/* ═══════════════════════════════════════════════════════════════
   CHARTS — Motor dinámico completo
   ─────────────────────────────────────────────────────────────
   • 10 tipos: bar, hbar, line, area, pie, donut, scatter,
               treemap, radar, sunburst
   • Auto-render: cada cambio dispara chAutoRender() (debounce 80ms)
   • Al navegar a /charts con datos: render automático
   • Drill-down: click → modal con registros filtrados
   • Sunburst: zoom + breadcrumb + back
   • Radar: compara top-N valores de un campo
   • Treemap: jerarquía visual de volúmenes
   • Export: PNG y Excel
   • Paletas intercambiables con re-render inmediato
   ═══════════════════════════════════════════════════════════════ */

/* ─── Columnas internas a excluir de los selects ─────────────── */
const CHART_SKIP_COLS = new Set([
  '_sheet','_rowIdx','_serial','_presence','_hit','_hitIdx',
  '_globalIdx','_outer','_field','_parent','_parentField',
  '_root','_rootField'
]);

/* ─── Utilidad: columnas disponibles ────────────────────────── */
function _getSheetCols(source){
  const records = source === 'All' ? allRec : (sheetData[source] || []);
  const colSet  = new Set();
  const sample  = records.slice(0, 300);
  sample.forEach(r => Object.keys(r).forEach(k => {
    if(!CHART_SKIP_COLS.has(k)) colSet.add(k);
  }));
  return [...colSet].sort();
}

/* ─── Utilidad: llenar un <select> manteniendo valor previo ─── */
function _fillSelect(id, cols, preferredVal, blankLabel){
  const el = document.getElementById(id);
  if(!el) return;
  const prev = el.value || preferredVal || '';
  el.innerHTML = blankLabel ? `<option value="">${blankLabel}</option>` : '';
  cols.forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    if(c === prev) o.selected = true;
    el.appendChild(o);
  });
  if(!el.value && cols.length > 0) el.value = cols[0];
}

/* ─── Paletas de colores ────────────────────────────────────── */
const PALETTES = {
  amber:  ['#f59e0b','#d97706','#b45309','#92400e','#fcd34d','#fbbf24','#78350f','#fde68a'],
  mono:   ['#e8e4dc','#c0b89a','#9a8e78','#786c5a','#5a5040','#3e3628','#26201a','#120e08'],
  warm:   ['#e05f0a','#f08030','#f5a860','#fad090','#7a3200','#b54800','#fde8c0','#3d1a00'],
  cool:   ['#1a88e0','#50aaee','#88ccf8','#003d7a','#0062b8','#b8e4ff','#daf0ff','#001f3f'],
  forest: ['#44a800','#62cc20','#90e050','#1a5200','#2e7a00','#b8f078','#dcfab0','#0a2a00'],
  rose:   ['#c8005a','#e83080','#f068a8','#5a0025','#900040','#f8a0cc','#fcd8ec','#2a0010'],
};
let currentPaletteKey = 'amber';
function getPalette(){ return PALETTES[currentPaletteKey] || PALETTES.amber; }

/* ─── Valores de tema para ECharts ─────────────────────────── */
function _tv(){
  const t = document.documentElement.getAttribute('data-theme') || 'dark';
  const L = t === 'light';
  return {
    L,
    txt   : L ? '#1A1815'              : '#EDE8E2',
    txt2  : L ? '#6B645C'              : '#A89F96',
    txt3  : L ? '#A39C94'              : '#6B645C',
    bg    : L ? '#FAF9F5'              : '#1C1917',
    bg2   : L ? '#F3F1EA'              : '#252220',
    bg3   : L ? '#EAE8DF'              : '#2E2B29',
    brd   : L ? 'rgba(26,24,21,.09)'   : 'rgba(237,232,226,.08)',
    brd2  : L ? 'rgba(26,24,21,.17)'   : 'rgba(237,232,226,.15)',
    tip   : L ? 'rgba(243,241,234,.97)': 'rgba(28,25,23,.97)',
    tipB  : L ? 'rgba(26,24,21,.12)'   : 'rgba(237,232,226,.12)',
    accent: L ? '#D97757'              : '#E08060',
    gridL : L ? 'rgba(26,24,21,.07)'   : 'rgba(237,232,226,.06)',
    mono  : 'IBM Plex Mono,monospace',
  };
}

function _tipCfg(t){
  return {
    backgroundColor: t.tip,
    borderColor    : t.tipB,
    borderWidth    : 1,
    padding        : [10, 14],
    textStyle      : { color: t.txt, fontFamily: t.mono, fontSize: 12 },
    confine        : true,
  };
}

/* ─── ECharts instance ──────────────────────────────────────── */
let _ecInst    = null;
const _ecResize = () => { if(_ecInst) _ecInst.resize(); };

function _ecInit(){
  const el = document.getElementById('echartsContainer');
  if(!el) return null;
  el.style.display = 'block';
  document.getElementById('chEmpty').style.display   = 'none';
  const sbnav = document.getElementById('sunburstNav');
  if(sbnav) sbnav.style.display = 'none';
  if(_ecInst){ _ecInst.dispose(); _ecInst = null; }
  window.removeEventListener('resize', _ecResize);
  _ecInst = echarts.init(el, null, {renderer: 'canvas'});
  window.addEventListener('resize', _ecResize);
  _sbZoomStack = [];
  return _ecInst;
}
function _ecDestroy(){
  window.removeEventListener('resize', _ecResize);
  if(_ecInst){ _ecInst.dispose(); _ecInst = null; }
}

/* ─── Estado global de charts ───────────────────────────────── */
let _chType     = 'bar';
let _chData     = [];     // último dataset renderizado
let _chField    = '';
let _chRecords  = [];
let _chDebounce = null;

/* ─── setChartType / chSetType ──────────────────────────────── */
function chSetType(type, btn){
  _chType = type;
  document.querySelectorAll('.ch-type').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  // Mostrar/ocultar grupos de controles según tipo
  const sunburstOn = type === 'sunburst';
  const radarOn    = type === 'radar';
  const field2On   = type === 'scatter' || type === 'radar';
  const el = id => document.getElementById(id);
  if(el('chSunburstGroup')) el('chSunburstGroup').style.display = sunburstOn ? '' : 'none';
  if(el('chField2Group'))   el('chField2Group').style.display   = field2On   ? '' : 'none';
  if(el('chFieldGroup'))    el('chFieldGroup').style.display    = sunburstOn ? 'none' : '';
  chAutoRender();
}
function setChartType(t, b){ chSetType(t, b); } // legacy alias

/* ─── chAutoRender — debounced render ───────────────────────── */
function chAutoRender(){
  clearTimeout(_chDebounce);
  _chDebounce = setTimeout(generateChart, 80);
}

/* ─── chUpdateFilters — llena todos los selects ─────────────── */
function chUpdateFilters(){
  if(!PD) return;
  const source = document.getElementById('chartSource')?.value || 'All';
  const cols   = _getSheetCols(source);
  if(!cols.length) return;

  // Preferencias de campo para cada selector
  const PREF = ['Status','Manufacturer','OS','Chassis','Empresa','Regional','Dominio'];
  const pref = prefs => prefs.find(p => cols.includes(p)) || cols[0] || '';

  _fillSelect('chartXAxis',     cols, pref(PREF));
  _fillSelect('chartYField',    cols, pref(['OS','Status','Chassis']));
  _fillSelect('chartGroupBy',   cols, pref(['Manufacturer','OS','Chassis','Empresa','Status']));
  _fillSelect('chartGroupBy2',  cols, pref(['Status','OS','Regional','Dominio','Chassis']));
  _fillSelect('chartGroupBy3',  cols, pref(['Regional','Dominio','Chassis','OS']));
  _fillSelect('chartQuickField',cols, '', '— campo —');

  // Filtrar también el dropdown rápido de la topbar
  const qf = document.getElementById('chQuickField');
  if(qf){
    qf.innerHTML = '<option value="">Campo rápido…</option>';
    cols.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      qf.appendChild(o);
    });
  }

  // Limpiar valores del filtro rápido
  const vEl = document.getElementById('chartQuickValue');
  if(vEl) vEl.innerHTML = '<option value="">— valor —</option>';

  // Actualizar fuentes disponibles (hojas reales cargadas)
  const srcSel = document.getElementById('chartSource');
  if(srcSel){
    const currSrc = srcSel.value;
    srcSel.innerHTML = '<option value="All">Todas las hojas</option>';
    Object.keys(sheetData).forEach(name => {
      if(sheetData[name]?.length){
        const o = document.createElement('option');
        o.value = name; o.textContent = name;
        srcSel.appendChild(o);
      }
    });
    if(currSrc) srcSel.value = currSrc;
  }
}

/* Actualizar valores del filtro rápido cuando cambia el campo */
function chUpdateFilterValues(){
  const source = document.getElementById('chartSource')?.value || 'All';
  const field  = document.getElementById('chartQuickField')?.value || '';
  const vEl    = document.getElementById('chartQuickValue');
  if(!vEl || !field) return;
  const records = source === 'All' ? allRec : (sheetData[source]||[]);
  const vals = [...new Set(records.map(r => (r[field]||'').toString().trim()).filter(Boolean))].sort();
  vEl.innerHTML = '<option value="">— valor —</option>';
  vals.slice(0,100).forEach(v => {
    const o = document.createElement('option'); o.value = v; o.textContent = v;
    vEl.appendChild(o);
  });
}

/* Legacy alias */
function updateChartSheetFilters(){ chUpdateFilters(); }

/* ─── chQuickSwitch — cambiar campo desde topbar ────────────── */
function chQuickSwitch(val){
  if(!val) return;
  const xEl = document.getElementById('chartXAxis');
  if(xEl) xEl.value = val;
  chAutoRender();
}

/* ─── generateChart — punto de entrada principal ────────────── */
function generateChart(){
  if(!PD){ _showEmpty('Carga datos primero.'); return; }

  const type   = _chType;
  const xAxis  = document.getElementById('chartXAxis')?.value  || '';
  const source = document.getElementById('chartSource')?.value || 'All';
  const max    = parseInt(document.getElementById('chartMax')?.value) || 0;
  const qField = document.getElementById('chartQuickField')?.value || '';
  const qVal   = document.getElementById('chartQuickValue')?.value  || '';

  if(!xAxis && type !== 'sunburst' && type !== 'radar'){
    _showEmpty('Selecciona un campo para generar el gráfico.');
    return;
  }

  // Obtener registros filtrados
  let records = source === 'All'
    ? allRec
    : (sheetData[source]||[]).map(r => ({...r, _sheet: source}));
  if(qField && qVal) records = records.filter(r =>
    (r[qField]||'').toString().trim() === qVal
  );
  if(!records.length){ _showEmpty('No hay datos con el filtro actual.'); return; }

  _chRecords = records;
  _chField   = xAxis;

  // Construir dataset
  const raw     = buildFieldSummary(records, xAxis || (document.getElementById('chartGroupBy')?.value || ''));
  const sliced  = max > 0 ? raw.slice(0, max) : raw;
  _chData = sliced;

  // Actualizar cabecera
  const titleEl = document.getElementById('chartTitleText');
  const metaEl  = document.getElementById('chartMeta');
  const parts   = [xAxis || type, source !== 'All' ? source : null, qVal || null].filter(Boolean);
  if(titleEl) titleEl.textContent = parts.join(' · ');
  if(metaEl)  metaEl.textContent  = `${sliced.length} cat. · ${records.length.toLocaleString()} reg.`;

  // Dispatch
  switch(type){
    case 'bar':      _chBar(sliced, xAxis, records);     break;
    case 'hbar':     _chHBar(sliced, xAxis, records);    break;
    case 'line':     _chLine(sliced, xAxis, records);    break;
    case 'area':     _chArea(sliced, xAxis, records);    break;
    case 'pie':      _chPie(sliced, xAxis, records);     break;
    case 'donut':    _chDonut(sliced, xAxis, records);   break;
    case 'scatter':  _chScatter(sliced, xAxis, records); break;
    case 'treemap':  _chTreemap(sliced, xAxis, records); break;
    case 'radar':    _chRadar(sliced, xAxis, records);   break;
    case 'sunburst': _chSunburst(records);               break;
  }
}

function _showEmpty(msg){
  _ecDestroy();
  const ec = document.getElementById('echartsContainer');
  if(ec) ec.style.display = 'none';
  const emp = document.getElementById('chEmpty');
  if(emp){ emp.style.display = ''; const m = document.getElementById('chEmptyMsg'); if(m) m.textContent = msg; }
  const sbnav = document.getElementById('sunburstNav');
  if(sbnav) sbnav.style.display = 'none';
}

/* ─── Drill-down: click → modal con registros ───────────────── */
function drillDown(val, field, allRecords){
  const matching = allRecords.filter(r => {
    const raw = r[field];
    const v = (raw===undefined||raw===null||raw==='')?'(blank)':String(raw).trim()||'(blank)';
    return v === val;
  });
  openModal(`${field}: ${val}`, `${matching.length.toLocaleString()} registros`, matching);
}

/* ═══════════════════════════════════════════════════════════════
   RENDERERS — Dynamic charts, full labels, robust drill-down
   ═══════════════════════════════════════════════════════════════ */

/* ── Label formatter ── */
function _lbl(v){ return v >= 10000 ? (v/1000).toFixed(1)+'k' : v >= 1000 ? v.toLocaleString() : String(v); }

/* ── Common label config for axis charts ── */

/* ── BAR (vertical) — always shows top labels ── */
function _chBar(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const many   = data.length > 14;
  const rotate = data.length > 10 ? 38 : 0;
  const bottom = rotate > 0 ? 100 : 60;
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:480, animationEasing:'cubicOut',
    animationDelay: i => i * 14,
    tooltip:{ trigger:'axis', axisPointer:{type:'shadow'}, ..._tipCfg(t),
      formatter: p => `<b>${p[0].axisValue}</b><br/>${p[0].value.toLocaleString()} registros` },
    grid:{ top:40, right:16, bottom, left:50, containLabel:false },
    xAxis:{
      type:'category', data:data.map(d=>d.val),
      axisLabel:{ color:t.txt2, fontFamily:t.mono, fontSize:10,
        rotate, overflow:'truncate', width:88, interval:0,
        hideOverlap: data.length > 28 },
      axisLine:{ lineStyle:{color:t.brd2} }, axisTick:{show:false}
    },
    yAxis:{
      type:'value',
      axisLabel:{ color:t.txt3, fontFamily:t.mono, fontSize:10, formatter:_lbl },
      splitLine:{ lineStyle:{color:t.gridL, type:'dashed'} }, axisLine:{show:false}
    },
    series:[{
      type:'bar', barMaxWidth:44,
      data:data.map((d,i)=>({
        value:d.count,
        itemStyle:{ color:pal[i%pal.length], borderRadius:[3,3,0,0] }
      })),
      label:{
        show: !many,
        position:'top',
        formatter: p => _lbl(p.value),
        color:t.txt2, fontFamily:t.mono, fontSize:10,
        distance:4, rotate: data.length > 18 ? 50 : 0,
        hideOverlap:true
      },
      emphasis:{ itemStyle:{opacity:1, shadowBlur:12, shadowColor:'rgba(0,0,0,.28)'} }
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── HBAR (horizontal) — always shows right-side labels ── */
function _chHBar(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const rev  = [...data].reverse();
  const barH = Math.max(16, Math.min(30, Math.floor(380 / (rev.length||1))));
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:540, animationEasing:'cubicOut',
    animationDelay: i => i * 14,
    tooltip:{ trigger:'axis', axisPointer:{type:'shadow'}, ..._tipCfg(t),
      formatter: p => `<b>${p[0].axisValue}</b><br/>${p[0].value.toLocaleString()} registros` },
    grid:{ top:8, right:80, bottom:8, left:8, containLabel:true },
    xAxis:{ type:'value',
      axisLabel:{ color:t.txt3, fontFamily:t.mono, fontSize:10, formatter:_lbl },
      splitLine:{ lineStyle:{color:t.gridL, type:'dashed'} }, axisLine:{show:false} },
    yAxis:{ type:'category', data:rev.map(d=>d.val),
      axisLabel:{ color:t.txt2, fontFamily:t.mono, fontSize:11, overflow:'truncate', width:140 },
      axisLine:{ lineStyle:{color:t.brd} }, axisTick:{show:false} },
    series:[{
      type:'bar', barMaxWidth:barH,
      data:rev.map((d,i)=>({
        value:d.count,
        itemStyle:{ color:pal[(data.length-1-i)%pal.length], borderRadius:[0,3,3,0] }
      })),
      label:{
        show:true, position:'right',
        formatter: p => _lbl(p.value),
        color:t.txt3, fontFamily:t.mono, fontSize:10, hideOverlap:true, distance:4
      },
      emphasis:{ itemStyle:{opacity:1, shadowBlur:10, shadowColor:'rgba(0,0,0,.22)'} }
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── LINE — shows value labels on points ── */
function _chLine(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const c      = pal[0];
  const many   = data.length > 30;
  const rotate = data.length > 12 ? 38 : 0;
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:680, animationEasing:'cubicInOut',
    tooltip:{ trigger:'axis', ..._tipCfg(t),
      formatter: p => `<b>${p[0].name}</b><br/>${p[0].value.toLocaleString()} registros` },
    grid:{ top:40, right:20, bottom: rotate > 0 ? 92 : 56, left:52 },
    xAxis:{ type:'category', data:data.map(d=>d.val), boundaryGap:false,
      axisLabel:{ color:t.txt2, fontFamily:t.mono, fontSize:10,
        rotate, overflow:'truncate', width:88, hideOverlap: data.length > 18 },
      axisLine:{ lineStyle:{color:t.brd2} }, axisTick:{show:false} },
    yAxis:{ type:'value',
      axisLabel:{ color:t.txt3, fontFamily:t.mono, fontSize:10, formatter:_lbl },
      splitLine:{ lineStyle:{color:t.gridL, type:'dashed'} }, axisLine:{show:false} },
    series:[{
      type:'line', data:data.map(d=>d.count),
      smooth:0.25, symbol:'circle', symbolSize: many ? 4 : 7,
      lineStyle:{color:c, width:2.5},
      itemStyle:{color:c, borderColor:t.bg2, borderWidth:2},
      label:{
        show:!many, position:'top',
        formatter: p => _lbl(p.value),
        color:t.txt2, fontFamily:t.mono, fontSize:9,
        distance:5, hideOverlap:true
      },
      emphasis:{scale:1.4, itemStyle:{shadowBlur:8,shadowColor:'rgba(0,0,0,.28)'}}
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── AREA — gradient fill + labels ── */
function _chArea(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const c      = pal[0];
  const many   = data.length > 28;
  const rotate = data.length > 12 ? 38 : 0;
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:720, animationEasing:'cubicInOut',
    tooltip:{ trigger:'axis', ..._tipCfg(t),
      formatter: p => `<b>${p[0].name}</b><br/>${p[0].value.toLocaleString()} registros` },
    grid:{ top:40, right:20, bottom: rotate > 0 ? 92 : 56, left:52 },
    xAxis:{ type:'category', data:data.map(d=>d.val), boundaryGap:false,
      axisLabel:{ color:t.txt2, fontFamily:t.mono, fontSize:10,
        rotate, overflow:'truncate', width:88, hideOverlap: data.length > 18 },
      axisLine:{ lineStyle:{color:t.brd2} }, axisTick:{show:false} },
    yAxis:{ type:'value',
      axisLabel:{ color:t.txt3, fontFamily:t.mono, fontSize:10, formatter:_lbl },
      splitLine:{ lineStyle:{color:t.gridL, type:'dashed'} }, axisLine:{show:false} },
    series:[{
      type:'line', data:data.map(d=>d.count),
      smooth:0.35, symbol:'circle', symbolSize: many ? 0 : 5,
      lineStyle:{color:c, width:2.2},
      itemStyle:{color:c, borderColor:t.bg2, borderWidth:2},
      areaStyle:{ color:{ type:'linear',x:0,y:0,x2:0,y2:1,
        colorStops:[{offset:0,color:c+'55'},{offset:1,color:c+'08'}] }},
      label:{
        show:!many, position:'top',
        formatter: p => _lbl(p.value),
        color:t.txt2, fontFamily:t.mono, fontSize:9,
        distance:5, hideOverlap:true
      },
      emphasis:{scale:1.3, itemStyle:{shadowBlur:8,shadowColor:'rgba(0,0,0,.28)'}}
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── PIE / DONUT — rich labels + center total for donut ── */
function _chPie  (data, field, rec){ _chPieBase(data, field, rec, false); }
function _chDonut(data, field, rec){ _chPieBase(data, field, rec, true);  }
function _chPieBase(data, field, records, isDonut){
  const pal   = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const total   = data.reduce((s,d) => s+d.count, 0);
  const radius  = isDonut ? ['38%','66%'] : ['0%','66%'];
  const showLbl = data.length <= 20;
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:620, animationEasing:'cubicOut',
    tooltip:{ trigger:'item', ..._tipCfg(t),
      formatter: p => `<b>${p.name}</b><br/>${p.value.toLocaleString()} registros &nbsp;`
        +`<span style="color:${t.txt3}">(${p.percent.toFixed(1)}%)</span>` },
    legend:{
      orient:'vertical', right:'1%', top:'center',
      itemWidth:9, itemHeight:9,
      textStyle:{ color:t.txt2, fontFamily:t.mono, fontSize:10 },
      formatter: n => n.length > 22 ? n.slice(0,20)+'…' : n,
      data: data.slice(0,18).map(d=>d.val)
    },
    graphic: isDonut ? [{
      type:'group', left:'38%', top:'middle', bounding:'raw',
      children:[
        { type:'text', silent:true, z:100,
          style:{ text:total.toLocaleString(), textAlign:'center',
            fill:t.txt, fontSize:22, fontWeight:'700', fontFamily:t.mono, y:-14 } },
        { type:'text', silent:true, z:100,
          style:{ text:'total', textAlign:'center',
            fill:t.txt3, fontSize:10, fontFamily:t.mono, y:10 } }
      ]
    }] : [],
    series:[{
      type:'pie', radius, center:['38%','50%'],
      data: data.map((d,i) => ({ name:d.val, value:d.count, itemStyle:{color:pal[i%pal.length]} })),
      label:{ show:showLbl,
        formatter: p => p.percent > 2.5
          ? `{v|${p.value.toLocaleString()}}\n{p|${p.percent.toFixed(1)}%}` : '',
        rich:{
          v:{ fontWeight:'700', fontSize:11, fontFamily:t.mono, color:'rgba(255,255,255,.95)' },
          p:{ fontSize:9,  fontFamily:t.mono, color:'rgba(255,255,255,.75)' }
        }
      },
      labelLine:{ show:showLbl, length:8, length2:10 },
      emphasis:{ scale:true, scaleSize:4, itemStyle:{shadowBlur:14,shadowColor:'rgba(0,0,0,.3)'} }
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── SCATTER — sized bubbles + labels ── */
function _chScatter(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const maxC  = Math.max(...data.map(d=>d.count), 1);
  const sData = data.map((d,i) => ({
    name:d.val, value:[i, d.count],
    symbolSize: 10 + (d.count/maxC)*34,
    itemStyle:{ color:pal[i%pal.length], opacity:.82 }
  }));
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:580, animationEasing:'cubicOut',
    animationDelay: i => i*14,
    tooltip:{ trigger:'item', ..._tipCfg(t),
      formatter: p => `<b>${p.data.name}</b><br/>${p.data.value[1].toLocaleString()} registros` },
    grid:{ top:32, right:20, bottom: data.length>10?92:58, left:52 },
    xAxis:{ type:'category', data:data.map(d=>d.val),
      axisLabel:{ color:t.txt2, fontFamily:t.mono, fontSize:10,
        rotate: data.length>10?38:0, overflow:'truncate', width:85,
        hideOverlap: data.length > 18 },
      axisLine:{ lineStyle:{color:t.brd2} }, axisTick:{show:false} },
    yAxis:{ type:'value',
      axisLabel:{ color:t.txt3, fontFamily:t.mono, fontSize:10, formatter:_lbl },
      splitLine:{ lineStyle:{color:t.gridL,type:'dashed'} }, axisLine:{show:false} },
    series:[{
      type:'scatter', data:sData,
      label:{ show:data.length <= 28, position:'top',
        formatter: p => _lbl(p.data.value[1]),
        color:t.txt2, fontFamily:t.mono, fontSize:9,
        distance:4, hideOverlap:true },
      emphasis:{ scale:1.15, itemStyle:{opacity:1, shadowBlur:14, shadowColor:'rgba(0,0,0,.3)'} }
    }]
  });
  ec.off('click');
  ec.on('click', p => { if(p.data?.name) drillDown(p.data.name, field, records); });
}

/* ── TREEMAP — value + % labels inside tiles ── */
function _chTreemap(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const total = data.reduce((s,d)=>s+d.count,0);
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:520, animationEasing:'cubicOut',
    tooltip:{ trigger:'item', ..._tipCfg(t),
      formatter: p => `<b>${p.name}</b><br/>${p.value.toLocaleString()} registros &nbsp;`
        +`<span style="color:${t.txt3}">(${total?(p.value/total*100).toFixed(1):0}%)</span>` },
    series:[{
      type:'treemap', width:'100%', height:'100%',
      breadcrumb:{ show:false },
      visibleMin:4,
      data: data.map((d,i) => ({
        name:d.val, value:d.count,
        itemStyle:{ color:pal[i%pal.length], borderColor:t.bg, borderWidth:2, gapWidth:2 }
      })),
      label:{
        show:true,
        formatter: p => `${p.name}\n${p.value.toLocaleString()} (${total?(p.value/total*100).toFixed(1):0}%)`,
        fontFamily:t.mono, fontSize:11, color:'rgba(255,255,255,.92)',
        overflow:'break', lineOverflow:'truncate'
      },
      upperLabel:{ show:true, height:26, color:t.txt, fontFamily:t.mono, fontSize:11 },
      levels:[
        { itemStyle:{ borderColor:t.bg2, borderWidth:3, gapWidth:3 } },
        { colorSaturation:[0.3,0.6], itemStyle:{ borderWidth:2, gapWidth:2 } }
      ],
      emphasis:{ focus:'descendant', itemStyle:{shadowBlur:14, shadowColor:'rgba(0,0,0,.35)'} }
    }]
  });
  ec.off('click'); ec.on('click', p => { if(p.name) drillDown(p.name, field, records); });
}

/* ── RADAR — filled polygon + value labels on vertices ── */
function _chRadar(data, field, records){
  const pal = getPalette(), t = _tv(), ec = _ecInit();
  if(!ec) return;
  const top    = data.slice(0,14);
  const maxVal = Math.max(...top.map(d=>d.count), 1);
  ec.setOption({
    backgroundColor:'transparent',
    animation:true, animationDuration:680,
    tooltip:{ trigger:'item', ..._tipCfg(t),
      formatter: p => {
        if(!p.data?.value) return '';
        return top.map((d,i) =>
          `<span style="color:${pal[i%pal.length]}">●</span> ${d.val}: <b>${(p.data.value[i]||0).toLocaleString()}</b>`
        ).join('<br/>');
      }
    },
    radar:{
      indicator: top.map(d => ({
        name: d.val.length > 16 ? d.val.slice(0,14)+'…' : d.val,
        max: maxVal
      })),
      center:['50%','52%'], radius:'62%',
      axisLine:{ lineStyle:{color:t.brd2} },
      splitLine:{ lineStyle:{color:t.gridL} },
      splitArea:{ areaStyle:{ color: t.L
        ? ['rgba(200,80,0,.03)','rgba(200,80,0,.06)']
        : ['rgba(224,128,96,.03)','rgba(224,128,96,.07)'] }},
      axisName:{ textStyle:{ color:t.txt2, fontFamily:t.mono, fontSize:10 } }
    },
    series:[{
      type:'radar',
      data:[{
        value:top.map(d=>d.count), name:field,
        areaStyle:{ color:pal[0]+'40' },
        lineStyle:{ color:pal[0], width:2.2 },
        itemStyle:{ color:pal[0] },
        symbol:'circle', symbolSize:7,
        label:{
          show:true,
          formatter: p => _lbl(p.value),
          color:t.txt2, fontFamily:t.mono, fontSize:9,
          distance:6
        }
      }]
    }]
  });
  ec.off('click');
  ec.on('click', p => {
    const name = (p.indicator?.name||p.name||'').replace(/…$/,'');
    const orig = top.find(d => d.val.startsWith(name) || name.startsWith(d.val.slice(0,14)));
    if(orig) drillDown(orig.val, field, records);
  });
}

/* ═══════════════════════════════════════════════════════════════
   SUNBURST — zoom hierarchy · center shows total · back on click
   ═══════════════════════════════════════════════════════════════ */
let _sbRecords   = [];
let _sbLevel1    = '';
let _sbLevel2    = '';
let _sbLevel3    = '';
let _sbZoomStack = [];
let _sbRootData  = [];

function _sbBuildTree(rows, l1, l2, l3){
  const root = {};
  rows.forEach(row => {
    const k1 = (row[l1]||'—').toString().trim()||'—';
    if(!root[k1]) root[k1]={};
    if(!l2){ root[k1].__v=(root[k1].__v||0)+1; return; }
    const k2=(row[l2]||'—').toString().trim()||'—';
    if(!root[k1][k2]) root[k1][k2]={};
    if(!l3){ root[k1][k2].__v=(root[k1][k2].__v||0)+1; return; }
    const k3=(row[l3]||'—').toString().trim()||'—';
    root[k1][k2][k3]=(root[k1][k2][k3]||0)+1;
  });
  function toNodes(obj){
    return Object.entries(obj)
      .filter(([k])=>k!=='__v')
      .map(([k,v])=>{
        if(typeof v==='number') return {name:k,value:v};
        const ch=toNodes(v);
        return ch.length ? {name:k,children:ch,value:v.__v||undefined} : {name:k,value:v.__v||1};
      })
      .sort((a,b)=>{
        const av=a.value||(a.children||[]).reduce((s,c)=>s+(c.value||0),0);
        const bv=b.value||(b.children||[]).reduce((s,c)=>s+(c.value||0),0);
        return bv-av;
      });
  }
  return toNodes(root);
}

function _sbNodeCount(node){
  if(node.children) return node.children.reduce((s,c)=>s+_sbNodeCount(c),0);
  return node.value||0;
}

/* Build ECharts option for a sunburst level */
function _sbOption(data, displayTotal, parentName, rootTotal){
  const pal = getPalette(), t = _tv();
  const isZoomed = !!parentName;
  /* Centre graphic — always shows grand total + navigation hint */
  const centerGfx = {
    type:'group', left:'center', top:'middle', bounding:'raw', z:200,
    children:[
      /* Grand total (always) */
      { type:'text', z:200, style:{
          text: rootTotal.toLocaleString(),
          textAlign:'center', y:-18,
          fill:t.txt, fontSize:20, fontWeight:'700', fontFamily:t.mono } },
      /* Label: "total" or parent name if zoomed */
      { type:'text', z:200, style:{
          text: isZoomed ? parentName.slice(0,16)+(parentName.length>16?'…':'') : 'total',
          textAlign:'center', y:6,
          fill: isZoomed ? t.accent : t.txt3,
          fontSize: isZoomed ? 10 : 10, fontFamily:t.mono } },
      /* Back hint when zoomed */
      ...(isZoomed ? [{
        type:'text', z:200, style:{
          text:'‹ volver',
          textAlign:'center', y:22,
          fill:t.accent, fontSize:10, fontFamily:t.mono,
          fontStyle:'italic'
        },
        cursor:'pointer'
      }] : [])
    ]
  };
  return {
    backgroundColor:'transparent',
    color: pal,
    tooltip:{ trigger:'item', ..._tipCfg(t),
      formatter(p){
        if(!p.data) return '';
        const n   = p.value!=null ? p.value : _sbNodeCount(p.data);
        const pct = rootTotal>0 ? (n/rootTotal*100).toFixed(1) : '0';
        const hint = p.data.children?.length
          ? `<br/><span style="font-size:10px;color:${t.txt3}">Click para expandir</span>`
          : '';
        return `<b>${p.name}</b><br/>${n.toLocaleString()} registros <span style="color:${t.txt3}">(${pct}%)</span>${hint}`;
      }
    },
    graphic:[ centerGfx ],
    series:[{
      type:'sunburst',
      data: data.map((n,i)=>({...n, itemStyle:{color:pal[i%pal.length]}})),
      radius:['20%','90%'], center:['50%','50%'],
      sort:null, nodeClick:false,
      startAngle:90, clockwise:true,
      label:{
        show:true, rotate:'radial', minAngle:5,
        fontSize:11, fontFamily:t.mono, color:t.txt,
        overflow:'truncate', width:55,
        formatter(p){
          const v=p.value!=null?p.value:_sbNodeCount(p.data);
          const pct=rootTotal>0?(v/rootTotal*100).toFixed(0):'';
          return p.data.children?.length
            ? `{b|${p.name}}\n{s|${v.toLocaleString()}}`
            : `${p.name}\n{s|${v.toLocaleString()}}`;
        },
        rich:{
          b:{ fontWeight:'700', fontSize:12, fontFamily:t.mono },
          s:{ fontSize:9, color:t.txt3, fontFamily:t.mono }
        }
      },
      emphasis:{ focus:'ancestor', itemStyle:{shadowBlur:14,shadowColor:'rgba(0,0,0,.4)'} },
      itemStyle:{ borderWidth:1.5, borderRadius:3,
        borderColor: t.L ? 'rgba(255,255,255,.65)' : 'rgba(255,255,255,.10)' },
      levels:[
        { r0:'0%',  r:'20%', itemStyle:{color:'transparent',borderWidth:0}, label:{show:false} },
        { r0:'21%', r:'48%', itemStyle:{borderWidth:2},
          label:{rotate:0, fontSize:13, fontWeight:'700', overflow:'truncate', width:78} },
        { r0:'49%', r:'70%', label:{fontSize:10, overflow:'truncate', width:56} },
        { r0:'71%', r:'90%', label:{fontSize:9,  overflow:'truncate', width:44, color:t.txt3} }
      ]
    }]
  };
}

function _chSunburst(records){
  _sbLevel1 = document.getElementById('chartGroupBy')?.value  || 'Status';
  _sbLevel2 = document.getElementById('chartGroupBy2')?.value || '';
  _sbLevel3 = document.getElementById('chartGroupBy3')?.value || '';
  if(!_sbLevel1){ _showEmpty('Selecciona al menos el Nivel 1 para Sunburst.'); return; }

  _sbRecords   = records;
  _sbZoomStack = [];
  _sbRootData  = _sbBuildTree(records, _sbLevel1, _sbLevel2||null, _sbLevel3||null);

  const nav = document.getElementById('sunburstNav');
  if(nav) nav.style.display = '';

  const ec = _ecInit();
  if(!ec) return;
  ec.setOption(_sbOption(_sbRootData, records.length, null, records.length));
  _sbUpdateBreadcrumb();

  ec.off('click');
  ec.on('click', p => {
    if(!p.data){
      /* click on empty centre area */
      if(_sbZoomStack.length) sbZoomBack();
      return;
    }
    /* Detect centre click by pixel distance */
    const w  = ec.getWidth(), h = ec.getHeight();
    const cx = w/2, cy = h/2;
    const innerR = Math.min(w,h)*0.5*0.20; /* 20% inner radius */
    const ex = p.event?.offsetX ?? p.event?.event?.offsetX ?? 9999;
    const ey = p.event?.offsetY ?? p.event?.event?.offsetY ?? 9999;
    if(Math.hypot(ex-cx, ey-cy) <= innerR*1.9){
      if(_sbZoomStack.length) sbZoomBack();
      return;
    }
    if(p.data.children?.length){
      _sbZoomStack.push({ name:p.data.name, data:p.data });
      ec.setOption(_sbOption(p.data.children, _sbNodeCount(p.data), p.data.name, _sbRecords.length), true);
      _sbUpdateBreadcrumb();
    } else {
      _sbDrillLeaf(p.data.name);
    }
  });
}

function _sbUpdateBreadcrumb(){
  const crumb = document.getElementById('sbBreadcrumb');
  const back  = document.getElementById('sbBackBtn');
  if(!crumb) return;
  crumb.innerHTML = `<span class="sb-crumb sb-root" onclick="sbZoomRoot()">⬤ Todo</span>`
    + _sbZoomStack.map((s,i) =>
        `<span class="sb-crumb-sep">›</span>`
        +`<span class="sb-crumb${i===_sbZoomStack.length-1?' sb-active':''}" onclick="sbZoomToLevel(${i})">${s.name}</span>`
      ).join('');
  if(back) back.style.display = _sbZoomStack.length > 0 ? '' : 'none';
}
function sbZoomRoot(){
  _sbZoomStack=[];
  if(_ecInst) _ecInst.setOption(_sbOption(_sbRootData, _sbRecords.length, null, _sbRecords.length), true);
  _sbUpdateBreadcrumb();
}
function sbZoomBack(){
  if(!_sbZoomStack.length) return;
  _sbZoomStack.pop();
  _sbRenderCurrent();
}
function sbZoomToLevel(idx){
  _sbZoomStack=_sbZoomStack.slice(0,idx+1);
  _sbRenderCurrent();
}
function _sbRenderCurrent(){
  if(!_ecInst) return;
  if(!_sbZoomStack.length){
    _ecInst.setOption(_sbOption(_sbRootData, _sbRecords.length, null, _sbRecords.length), true);
  } else {
    const top=_sbZoomStack[_sbZoomStack.length-1];
    _ecInst.setOption(_sbOption(top.data.children, _sbNodeCount(top.data), top.data.name, _sbRecords.length), true);
  }
  _sbUpdateBreadcrumb();
}
function _sbDrillLeaf(leafName){
  let filtered=[..._sbRecords];
  _sbZoomStack.forEach((frame,i)=>{
    const field=i===0?_sbLevel1:i===1?_sbLevel2:_sbLevel3;
    if(field) filtered=filtered.filter(r=>(r[field]||'—').toString().trim()===frame.name);
  });
  const depth=_sbZoomStack.length;
  const leafField=depth===0?_sbLevel1:depth===1?_sbLevel2:_sbLevel3;
  if(leafField) filtered=filtered.filter(r=>(r[leafField]||'—').toString().trim()===leafName);
  const crumbStr=[..._sbZoomStack.map(s=>s.name),leafName].join(' › ');
  openModal(crumbStr, `${filtered.length.toLocaleString()} registros`, filtered);
}

/* ─── Export ────────────────────────────────────────────────── */
function exportChartPNG(){
  if(!_ecInst){ showToast('Genera un gráfico primero.','warn'); return; }
  const t   = _tv();
  const url = _ecInst.getDataURL({ type:'png', pixelRatio:2, backgroundColor:t.bg });
  _pngDownload(url, `cmdb_chart_${new Date().toISOString().slice(0,10)}.png`);
}
function exportChartExcel(){
  if(!_chData.length){ showToast('Genera un gráfico primero.','warn'); return; }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(_chData.map(d=>({ Valor:d.val, Conteo:d.count }))), 'Chart');
  _xlsxDownload(wb, `cmdb_chart_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ─── Palette ───────────────────────────────────────────────── */
function setPalette(key, btn){
  currentPaletteKey = key;
  localStorage.setItem('cmdb_palette', key);
  document.querySelectorAll('.ch-swatch,.palette-swatch').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  if(_ecInst && _chData.length) generateChart();
}
(()=>{
  const saved = localStorage.getItem('cmdb_palette');
  if(saved && PALETTES[saved]){
    currentPaletteKey = saved;
    onReady(()=>{
      const btn = document.querySelector(`[data-palette="${saved}"]`);
      if(btn){
        document.querySelectorAll('.ch-swatch,.palette-swatch').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
      }
    }, {once:true});
  }
})();

/* ─── Quick filter: actualizar valores al cambiar campo ──────── */
onReady(()=>{
  const qf = document.getElementById('chartQuickField');
  if(qf) qf.addEventListener('change', chUpdateFilterValues);
}, {once:true});


/* ═══════════════════════════════════════════════════════
   NOTES WIDGET
   ═══════════════════════════════════════════════════════ */
const NK='cmdb_notes_v1';
function notesLoad(){try{return JSON.parse(localStorage.getItem(NK))||[]}catch{return[]}}
function notesSaveAll(n){localStorage.setItem(NK,JSON.stringify(n))}
function notesToggle(){const p=document.getElementById('notesPanel');if(p.classList.contains('hidden')){p.classList.remove('hidden');notesShowList()}else p.classList.add('hidden')}
function notesShowList(){document.getElementById('notesListView').style.display='';document.getElementById('notesEditorView').classList.add('hidden');notesRenderList()}
function notesRenderList(){
  const notes=notesLoad();const badge=document.getElementById('notesBadge');
  badge.textContent=notes.length;badge.classList.toggle('hidden',notes.length===0);
  const c=document.getElementById('notesList');
  if(!notes.length){c.innerHTML='<div class="notes-empty">No notes yet. Create one!</div>';return}
  c.innerHTML=[...notes].reverse().map(n=>`<div class="note-card" onclick="_nEdit('${n.id}')"><div class="note-card-title">${n.title||'Untitled'}</div><div class="note-card-preview">${n.body||''}</div><div class="note-card-footer"><span class="note-card-time">${fmtDate(new Date(n.updated))}</span><div class="note-card-actions" onclick="event.stopPropagation()"><button onclick="_nDel('${n.id}')" title="Delete">&#x1F5D1;</button></div></div></div>`).join('');
}
let cNoteId=null,autoNT=null;
function notesNewNote(){cNoteId='note_'+Date.now();document.getElementById('noteTitle').value='';document.getElementById('noteBody').value='';document.getElementById('notesChar').textContent='0/5000';document.getElementById('notesListView').style.display='none';document.getElementById('notesEditorView').classList.remove('hidden');document.getElementById('noteBody').oninput=function(){
    document.getElementById('notesChar').textContent=`${this.value.length}/5000`;
    clearTimeout(autoNT); autoNT=setTimeout(notesSave,2000);
  };
  document.getElementById('noteTitle').oninput=function(){
    clearTimeout(autoNT); autoNT=setTimeout(notesSave,2000);
  }}
function _nEdit(id){const n=notesLoad().find(n=>n.id===id);if(!n)return;cNoteId=id;document.getElementById('noteTitle').value=n.title||'';document.getElementById('noteBody').value=n.body||'';document.getElementById('notesChar').textContent=`${(n.body||'').length}/5000`;document.getElementById('notesListView').style.display='none';document.getElementById('notesEditorView').classList.remove('hidden')}
function _nDel(id){
  const ov=document.createElement('div');ov.className='reset-confirm-overlay';
  ov.innerHTML=`<div class="reset-confirm-box"><h3>Delete Note?</h3><p>This note will be permanently deleted.</p><div class="btn-row"><button class="btn-ghost" onclick="this.closest('.reset-confirm-overlay').remove()">Cancel</button><button class="btn-ghost" style="border-color:rgba(218,54,51,.5);color:var(--missing)" onclick="notesSaveAll(notesLoad().filter(n=>n.id!=='${id}'));notesRenderList();this.closest('.reset-confirm-overlay').remove()">Delete</button></div></div>`;
  document.body.appendChild(ov);
}
function notesSave(){const notes=notesLoad(),title=document.getElementById('noteTitle').value,body=document.getElementById('noteBody').value,idx=notes.findIndex(n=>n.id===cNoteId),note={id:cNoteId,title,body,created:idx>=0?notes[idx].created:Date.now(),updated:Date.now()};if(idx>=0)notes[idx]=note;else notes.push(note);notesSaveAll(notes);notesRenderList()}
onReady(function(){
  const panel=document.getElementById('notesPanel');
  const handle=document.getElementById('notesDragHandle');
  if(!panel||!handle) return;
  let drag=false,ox=0,oy=0;
  handle.addEventListener('mousedown',e=>{
    // Don't start drag when clicking buttons inside the header
    if(e.target.closest('button')) return;
    drag=true;
    const r=panel.getBoundingClientRect();
    ox=e.clientX-r.left; oy=e.clientY-r.top;
    panel.style.right='auto'; panel.style.bottom='auto';
    panel.style.left=r.left+'px'; panel.style.top=r.top+'px';
  });
  document.addEventListener('mousemove',e=>{if(!drag)return;panel.style.left=(e.clientX-ox)+'px';panel.style.top=(e.clientY-oy)+'px'});
  document.addEventListener('mouseup',()=>{drag=false});
});

/* palette selector — defined earlier in Charts module */

/* ═══════════════════════════════════════════════════════
   MODULE 2 — ADAPTIVE FILTER PANEL
   Adds: inline search, collapse/expand, active badge
   Does NOT modify existing filter logic at all.
   ═══════════════════════════════════════════════════════ */
const AF_SEARCH_THRESHOLD = 6; // show search box when group has >= N options
const AF_COLLAPSE_TIMEOUT = 60; // ms debounce for re-evaluation
let _afTimer = null;

/* Wrap each filter group after it's rendered */
function adaptiveFiltersApply(){
  clearTimeout(_afTimer);
  _afTimer = setTimeout(_afApplyNow, AF_COLLAPSE_TIMEOUT);
}

function _afApplyNow(){
  FILTER_CONFIG.forEach(fc => {
    const optsEl = document.getElementById(fc.id);
    if(!optsEl) return;

    // Find or create wrapper (parent .filter-group)
    let group = optsEl.closest('.filter-group');
    if(!group) return;

    // Re-wrap opts in collapsible container if not done yet
    if(!optsEl.classList.contains('filter-opts-wrap')){
      optsEl.classList.add('filter-opts-wrap');
      optsEl.style.maxHeight = optsEl.scrollHeight + 'px';
    }

    // Rebuild header with label + badge + toggle (once)
    let head = group.querySelector('.filter-group-head');
    if(!head){
      const lbl = group.querySelector('.filter-label');
      if(!lbl) return;
      head = document.createElement('div');
      head.className = 'filter-group-head';
      const leftWrap = document.createElement('div');
      leftWrap.style.cssText = 'display:flex;align-items:center;gap:6px';
      const newLbl = lbl.cloneNode(true);
      newLbl.style.margin = '0';
      leftWrap.appendChild(newLbl);
      const badge = document.createElement('span');
      badge.className = 'filter-group-badge hidden';
      badge.dataset.key = fc.key;
      leftWrap.appendChild(badge);
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'filter-group-collapse';
      collapseBtn.textContent = '▾';
      collapseBtn.title = 'Collapse / Expand';
      collapseBtn.dataset.key = fc.key;
      collapseBtn.onclick = () => _afToggle(fc.id, collapseBtn);
      head.appendChild(leftWrap);
      head.appendChild(collapseBtn);
      lbl.replaceWith(head);
    }

    // Add inline search box if enough options
    const opts = optsEl.querySelectorAll('.filter-opt');
    let searchBox = group.querySelector('.filter-inline-search');
    if(opts.length >= AF_SEARCH_THRESHOLD){
      if(!searchBox){
        searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.className = 'filter-inline-search';
        searchBox.placeholder = `Search ${fc.label.toLowerCase()}…`;
        searchBox.dataset.key = fc.key;
        searchBox.oninput = e => _afFilterOpts(e.target, optsEl);
        optsEl.before(searchBox);
      }
    } else {
      if(searchBox) searchBox.remove();
    }

    // Update active badge
    const activeCount = filters[fc.key]?.length || 0;
    const badge = group.querySelector(`.filter-group-badge[data-key="${fc.key}"]`);
    if(badge){
      badge.textContent = activeCount;
      badge.classList.toggle('hidden', activeCount === 0);
    }

    // Update max-height for smooth animation
    if(!optsEl.classList.contains('collapsed')){
      optsEl.style.maxHeight = optsEl.scrollHeight + 'px';
    }
  });
}

function _afToggle(optsId, btn){
  const el = document.getElementById(optsId);
  if(!el) return;
  const isCollapsed = el.classList.toggle('collapsed');
  btn.classList.toggle('collapsed', isCollapsed);
  btn.textContent = isCollapsed ? '▸' : '▾';
  if(!isCollapsed) el.style.maxHeight = el.scrollHeight + 'px';
}

function _afFilterOpts(input, optsEl){
  const q = input.value.toLowerCase().trim();
  optsEl.querySelectorAll('.filter-opt').forEach(opt => {
    const lbl = opt.querySelector('.filter-opt-label');
    const txt = lbl ? lbl.textContent.toLowerCase() : '';
    opt.style.display = (q && !txt.includes(q)) ? 'none' : '';
  });
  optsEl.style.maxHeight = optsEl.scrollHeight + 'px';
}

/* Hook into existing buildCascadingFilters — call adaptiveFiltersApply after each rebuild */
var _origBuildCascading = buildCascadingFilters;
buildCascadingFilters = function(){
  _origBuildCascading();
  adaptiveFiltersApply();
};

/* ═══════════════════════════════════════════════════════
   DELTA — FILE COMPARISON
   Save any loaded dataset as baseline, compare with next
   ═══════════════════════════════════════════════════════ */
const PREV_KEY = 'cmdb_prev_v2';
let prevSnapshot = null;

/* Fields to always skip in comparisons */
const DELTA_SKIP = new Set(['_sheet','Serial','Hostname','User','Ubicacion','Dupli','Placa','Dias']);

function _getDeltaFields(){
  /* Build field list from current data — all string/categorical fields */
  if(!allRec.length) return [];
  const sample = allRec.slice(0, 500);
  const cols = Object.keys(sample[0] || {}).filter(c => !DELTA_SKIP.has(c));
  /* Keep only fields with ≤60 unique values (categorical) */
  return cols.filter(c => {
    const uniq = new Set(sample.map(r=>(r[c]||'').toString().trim())).size;
    return uniq >= 2 && uniq <= 60;
  });
}

/* ── Snapshot helpers ── */
function _buildSnapshot(label){
  const fields = _getDeltaFields();
  const snap = {
    label    : label || window._rawFileName || 'snapshot',
    fileName : window._rawFileName || 'unknown',
    timestamp: Date.now(),
    total    : allRec.length,
    serials  : new Set(allRec.map(r=>norm(r.Serial))).size,
    sheets   : Object.fromEntries(SHEETS_LIST.filter(n=>sheetData[n]).map(n=>[n,(sheetData[n]||[]).length])),
    fields   : {}
  };
  fields.forEach(f => {
    const c = {};
    allRec.forEach(r=>{ const v=(r[f]||'(blank)').toString().trim()||'(blank)'; c[v]=(c[v]||0)+1; });
    snap.fields[f] = c;
  });
  return snap;
}

function savePreviousSnapshot(){
  /* Called automatically before processing a new file — saves old data */
  if(!allRec.length) return;
  try {
    const snap = _buildSnapshot();
    localStorage.setItem(PREV_KEY, JSON.stringify(snap));
    prevSnapshot = snap;
  } catch(e){ console.warn('Delta auto-save failed:', e); }
}

function manualSaveSnapshot(){
  /* Called by "Save Current as Baseline" button on Upload page */
  if(!PD || !allRec.length){ showToast('Load a CMDB file first.', 'warn'); return; }
  try {
    const snap = _buildSnapshot();
    localStorage.setItem(PREV_KEY, JSON.stringify(snap));
    prevSnapshot = snap;
    updateSnapshotPanel();
    // Visual feedback
    const btn = document.getElementById('saveSnapshotBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Saved!';
    btn.style.borderColor = 'var(--found)';
    btn.style.color = 'var(--found)';
    setTimeout(()=>{ btn.innerHTML = orig; btn.style.borderColor=''; btn.style.color=''; }, 2000);
  } catch(e){ showToast('Failed to save snapshot: '+e.message, 'warn'); }
}

function clearSnapshot(){
  localStorage.removeItem(PREV_KEY);
  prevSnapshot = null;
  updateSnapshotPanel();
  renderDelta();
}

function loadPreviousSnapshot(){
  try { const r=localStorage.getItem(PREV_KEY); return r?JSON.parse(r):null; } catch(e){ return null; }
}

function updateSnapshotPanel(){
  const snap = prevSnapshot || loadPreviousSnapshot();
  const statusEl  = document.getElementById('snapshotStatus');
  const saveBtn   = document.getElementById('saveSnapshotBtn');
  const clearBtn  = document.getElementById('clearSnapshotBtn');
  if(!statusEl) return;

  if(snap){
    const d = new Date(snap.timestamp);
    statusEl.innerHTML = `<strong style="color:var(--found)">✓ Baseline saved</strong><br>
      <span style="color:var(--txt2)">${snap.fileName}</span><br>
      <span>${fmtDateTime(d)} · ${snap.total.toLocaleString()} records</span>`;
    if(clearBtn) clearBtn.style.display = '';
  } else {
    statusEl.innerHTML = 'No snapshot saved yet. Load data and save a snapshot to enable comparison.';
    if(clearBtn) clearBtn.style.display = 'none';
  }

  if(saveBtn){
    const hasData = PD && allRec.length > 0;
    saveBtn.disabled = !hasData;
    saveBtn.style.opacity = hasData ? '1' : '0.4';
  }
}

/* ══════════════════════════════════════════════════════
   RENDER DELTA PAGE
   ══════════════════════════════════════════════════════ */
function renderDelta(){
  const container  = document.getElementById('deltaContainer');
  const howTo      = document.getElementById('deltaHowTo');
  const exportBtn  = document.getElementById('deltaExportBtn');
  const snap       = prevSnapshot || loadPreviousSnapshot();

  if(!snap || !PD){
    container.innerHTML = '';
    if(howTo) howTo.style.display = '';
    if(exportBtn) exportBtn.style.display = 'none';
    return;
  }
  if(howTo) howTo.style.display = 'none';
  if(exportBtn) exportBtn.style.display = '';

  /* Build current field distributions */
  const deltaFields = [...new Set([...Object.keys(snap.fields), ..._getDeltaFields()])];
  const currFields  = {};
  deltaFields.forEach(f => {
    const c = {};
    allRec.forEach(r=>{ const v=(r[f]||'(blank)').toString().trim()||'(blank)'; c[v]=(c[v]||0)+1; });
    currFields[f] = c;
  });

  const currSerials = new Set(allRec.map(r=>norm(r.Serial))).size;
  const currSheets  = Object.fromEntries(SHEETS_LIST.filter(n=>sheetData[n]).map(n=>[n,(sheetData[n]||[]).length]));

  function diff(a,b){ const d=b-a; return{d,sign:d>0?'up':d<0?'down':'same',str:(d>0?'+':'')+Number(d).toLocaleString()}; }

  /* ── File meta bar ── */
  const pd = new Date(snap.timestamp), cd = new Date();
  let html = `
  <div class="delta-meta">
    <div class="delta-file-tag prev">
      <span class="dt-dot"></span>
      <div><strong>${snap.fileName}</strong><br><span style="font-size:.7rem">${fmtDateTime(pd)} · ${snap.total.toLocaleString()} records</span></div>
    </div>
    <div class="delta-arrow-mid">→</div>
    <div class="delta-file-tag curr">
      <span class="dt-dot"></span>
      <div><strong>${window._rawFileName||'current file'}</strong><br><span style="font-size:.7rem">${fmtDateTime(cd)} · ${allRec.length.toLocaleString()} records</span></div>
    </div>
  </div>`;

  /* ── Summary cards ── */
  const rd = diff(snap.total, allRec.length);
  const sd = diff(snap.serials, currSerials);
  html += '<div class="delta-totals">';
  html += _dtCard('Total Records', snap.total, allRec.length, rd);
  html += _dtCard('Unique Serials', snap.serials, currSerials, sd);

  /* Per-sheet counts */
  const allSheetNames = [...new Set([...Object.keys(snap.sheets||{}), ...Object.keys(currSheets)])];
  allSheetNames.forEach(n=>{
    const p = snap.sheets?.[n] ?? 0, c = currSheets[n] ?? 0;
    html += _dtCard(`Sheet: ${n}`, p, c, diff(p,c));
  });
  html += '</div>';

  /* ── Field distribution cards ── */
  html += '<div class="delta-fields">';
  deltaFields.forEach(f => {
    const pf = snap.fields[f] || {};
    const cf = currFields[f]  || {};
    const allKeys = [...new Set([...Object.keys(pf), ...Object.keys(cf)])];
    allKeys.sort((a,b)=>(cf[b]||0)-(cf[a]||0));
    const maxVal    = Math.max(...allKeys.map(k=>Math.max(pf[k]||0, cf[k]||0)), 1);
    const newKeys   = allKeys.filter(k=>!pf[k] && cf[k]);
    const goneKeys  = allKeys.filter(k=> pf[k] && !cf[k]);
    const changed   = allKeys.filter(k=> pf[k] &&  cf[k] && pf[k]!==cf[k]);
    const same      = allKeys.filter(k=> pf[k] &&  cf[k] && pf[k]===cf[k]);

    const totalChanged = newKeys.length + goneKeys.length + changed.length;
    const badgeStyle   = totalChanged > 0 ? 'color:var(--missing)' : 'color:var(--found)';

    html += `<div class="delta-field-card">
      <div class="dfc-head">
        <span class="dfc-title">${f}</span>
        <span class="dfc-badge" style="${badgeStyle}">
          ${newKeys.length ? `+${newKeys.length} new ` : ''}${goneKeys.length ? `-${goneKeys.length} removed ` : ''}${changed.length ? `${changed.length} changed` : ''}${!totalChanged ? '✓ no changes' : ''}
        </span>
      </div>
      <div class="dfc-header-row">
        <span class="dr-name">Value</span>
        <span class="dr-prev">Prev</span>
        <span class="dr-bar-wrap" style="text-align:center;font-size:.64rem;color:var(--txt3)">trend</span>
        <span class="dr-curr">Curr</span>
        <span class="dr-delta">Δ</span>
      </div>`;

    allKeys.slice(0, 15).forEach(k => {
      const pv = pf[k]||0, cv = cf[k]||0, d = cv - pv;
      const isNew  = pv===0 && cv>0;
      const isGone = pv>0  && cv===0;
      const dir    = isNew?'new':isGone?'gone':d>0?'up':d<0?'down':'same';
      const prevBar = (pv/maxVal*100).toFixed(1);
      const currBar = (cv/maxVal*100).toFixed(1);
      const arrow   = isNew  ? '<span class="dr-arrow new">●</span>'
                    : isGone ? '<span class="dr-arrow gone">✕</span>'
                    : d > 0  ? '<span class="dr-arrow up">▲</span>'
                    : d < 0  ? '<span class="dr-arrow down">▼</span>'
                    : '<span class="dr-arrow same">─</span>';
      const dStr    = isNew ? `+${cv.toLocaleString()}` : isGone ? `-${pv.toLocaleString()}` : (d>=0?'+':'')+d.toLocaleString();
      const dColor  = isNew||d>0?'var(--found)':isGone||d<0?'var(--missing)':'var(--txt3)';

      html += `<div class="delta-row ${dir}">
        ${arrow}
        <span class="dr-name" title="${k}">${k.length>22?k.slice(0,21)+'…':k}</span>
        <span class="dr-prev">${isNew?'—':pv.toLocaleString()}</span>
        <div class="dr-bar-wrap">
          <div class="dr-bar-prev" style="width:${prevBar}%"></div>
          <div class="dr-bar-curr" style="width:${currBar}%;background:var(--${d>=0?'found':'missing'})"></div>
        </div>
        <span class="dr-curr">${isGone?'—':cv.toLocaleString()}</span>
        <span class="dr-delta" style="color:${dColor}">${dStr}</span>
      </div>`;
    });

    if(allKeys.length > 15)
      html += `<div class="dr-more">+${allKeys.length-15} more values…</div>`;
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function _dtCard(label, prev, curr, d){
  const icon = d.sign==='up'?'▲':d.sign==='down'?'▼':'─';
  const col  = d.sign==='up'?'var(--found)':d.sign==='down'?'var(--missing)':'var(--txt3)';
  return `<div class="delta-total-card">
    <div class="dtc-label">${label}</div>
    <div class="dtc-row">
      <span class="dtc-prev">${Number(prev).toLocaleString()}</span>
      <span class="dtc-arrow" style="color:${col}">${icon}</span>
      <span class="dtc-curr">${Number(curr).toLocaleString()}</span>
    </div>
    <div class="dtc-diff" style="color:${col}">${d.str}</div>
  </div>`;
}

function exportDelta(type='excel'){
  if(!PD) return;
  const snap = prevSnapshot || loadPreviousSnapshot();
  if(!snap){ showToast('No baseline snapshot saved — save one from the Upload page.', 'warn'); return; }

  const deltaFields = [...new Set([...Object.keys(snap.fields), ..._getDeltaFields()])];
  const rows = [];

  /* Summary rows */
  rows.push({Section:'SUMMARY', Field:'—', Value:'Total Records', Previous:snap.total, Current:allRec.length, Delta:allRec.length-snap.total});
  rows.push({Section:'SUMMARY', Field:'—', Value:'Unique Serials', Previous:snap.serials, Current:new Set(allRec.map(r=>norm(r.Serial))).size, Delta:0});

  /* Per-field rows */
  deltaFields.forEach(f => {
    const pf = snap.fields[f]||{};
    const cf = {};
    allRec.forEach(r=>{ const v=(r[f]||'(blank)').toString().trim()||'(blank)'; cf[v]=(cf[v]||0)+1; });
    const keys = [...new Set([...Object.keys(pf),...Object.keys(cf)])];
    keys.forEach(k=>{
      rows.push({ Section:'FIELD', Field:f, Value:k, Previous:pf[k]||0, Current:cf[k]||0, Delta:(cf[k]||0)-(pf[k]||0) });
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Delta');
  /* Also add a raw serials diff if possible */
  const prevSerialSet = new Set(Object.keys(snap.fields?.Serial||{}));
  _xlsxDownload(wb, 'cmdb_delta.xlsx');
}




/* ═══════════════════════════════════════════════════════════════
   SHEETS — Editable raw-data view of each source sheet
   Tabs: SvN · Snow · Syma · Disc
   ═══════════════════════════════════════════════════════════════ */

let sheetsActiveTab  = 'SvN';
let sheetsEdits      = {};   // "Sheet:rowIdx:col" => edited value
let sheetsSortCol    = null;
let sheetsSortAsc    = true;
let sheetsFilter     = '';
// cache vars declared at top of file
let sheetsShowAll    = false;
let _sheetsSearchTimer = null;
let _sheetsVsCount    = {};   // tab → rows visibles (virtual scroll)

const SHEETS_PAGE    = 300;  // Reducido: 300 filas iniciales vs 1000 — 3× más rápido

/* ─── Activate tab ─────────────────────────────────── */
function sheetsSetTab(key, btn){
  if(_ht['sheets'] && !_ht['sheets'].isDestroyed){ _ht['sheets'].destroy(); delete _ht['sheets']; }
  sheetsActiveTab    = key;
  sheetsSortCol      = null;
  sheetsSortAsc      = true;
  sheetsFilter       = '';
  sheetsShowAll      = false;
  _sheetsRowCache[key] = null;  // invalida sort cache
  const inp = document.getElementById('sheetsSearchInput');
  if(inp) inp.value = '';
  document.querySelectorAll('.sheets-tab').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else {
    const b = document.querySelector(`.sheets-tab[data-sheet="${key}"]`);
    if(b) b.classList.add('active');
  }
  sheetsRender();
}
/* __SHEETSSHOWALLROWS__ */

/* ─── Search / filter — debounced 150ms ─────────────── */
function sheetsSearch(){
  clearTimeout(_sheetsSearchTimer);
  _sheetsSearchTimer = setTimeout(() => {
    sheetsFilter = (document.getElementById('sheetsSearchInput')?.value || '').trim();
    // Re-render with filter applied — sheetsRender reads sheetsFilter
    sheetsRender();
  }, 150);
}


/* ─── Main render — cached cols + cached sort + virtual scroll ── */
/* ══════════════════════════════════════════════════════════════════════
   SHEETS page — Handsontable
   ══════════════════════════════════════════════════════════════════════ */
function sheetsRender(){
  const ph   = document.getElementById('sheetsPlaceholder');
  const htEl = document.getElementById('ht-sheets');
  const meta = document.getElementById('sheetsMeta');
  const tab  = sheetsActiveTab;

  if(!PD || !sheetData[tab]){
    if(ph) ph.style.display = '';
    if(htEl) htEl.style.display = 'none';
    return;
  }
  if(ph) ph.style.display = 'none';
  if(htEl) htEl.style.display = '';

  const rawRows = sheetData[tab] || [];
  const SKIP    = new Set(['_sheet','_rowIdx']);

  if(!_sheetsColsCache[tab]){
    const s = new Set();
    rawRows.forEach(r => Object.keys(r).forEach(k => { if(!SKIP.has(k)) s.add(k); }));
    _sheetsColsCache[tab] = _orderCols([...s]);
  }
  _sheetsAllCols = _sheetsColsCache[tab];
  if(meta) meta.textContent = `${rawRows.length.toLocaleString()} filas · ${_sheetsAllCols.length} cols`;
  const src = document.getElementById('sheetsRowCount'); if(src) src.textContent = rawRows.length.toLocaleString() + ' filas';

  // Build data — merge persisted edits
  const data = rawRows.map((r, i) => {
    const ri  = r._rowIdx ?? i;
    const row = { _ri: ri };
    _sheetsAllCols.forEach(c => {
      row[c] = sheetsEdits[`${tab}:${ri}:${c}`] ?? r[c] ?? '';
    });
    return row;
  });

  // Apply search filter — search all column values
  const filteredData = sheetsFilter
    ? data.filter(r => _sheetsAllCols.some(col => {
        const v = r[col]; return v != null && String(v).toLowerCase().includes(sheetsFilter.toLowerCase());
      }))
    : data;

  // Update row count badge with filtered count
  if(src) src.textContent = filteredData.length.toLocaleString() + ' filas' + (sheetsFilter ? ' (filtradas)' : '');

  const colHeaders = _sheetsAllCols.slice();
  const _numCols = new Set(['Dias','dias','age','count','qty','cantidad']);
  const columns = _sheetsAllCols.map(c => {
    const lc = c.toLowerCase();
    if(lc === 'status') return { data:c, renderer:'statusBadge', editor:'text', type:'text' };
    if(_numCols.has(lc))        return { data:c, editor:'text',               type:'numeric' };
    return { data:c, editor:'text', type:'text' };
  });

  // Prefer update over remount when same tab reloaded
  if(_ht['sheets'] && !_ht['sheets'].isDestroyed){
    _ht['sheets'].suspendRender();
    _ht['sheets'].updateSettings({ colHeaders, columns }, false);
    _ht['sheets'].loadData(filteredData);
    _ht['sheets'].resumeRender();
    return;
  }

  _htMount('sheets','ht-sheets', _htConfig({
    data: filteredData, colHeaders, columns,
    height: _htH('page-sheets', 105),
    width:  '100%',
    afterChange(changes, src){
      if(!changes || src === 'loadData') return;
      changes.forEach(([row, prop, , nv]) => {
        const r = data[row];
        if(r && prop !== '_ri') sheetsEdits[`${tab}:${r._ri}:${prop}`] = nv;
      });
      _searchTextCache = null;  // invalidate so edited values appear in search
    },
  }));
}
/* Legacy stubs — HOT handles virtual scroll natively */
function sheetsShowMoreRows(){ if(_ht['sheets'] && !_ht['sheets'].isDestroyed) _ht['sheets'].render(); }

/* ══════════════════════════════════════════════════════════════════════
   COMPARE page — Handsontable
   ══════════════════════════════════════════════════════════════════════ */
function _compareRenderSheet(){
  const key  = compareActiveTab;
  const comp = PD?.comparisons?.[key] || { data: [] };
  const rows = comp.data || [];
  const el   = document.getElementById('ht-compare');

  // Destroy any lingering HOT instance
  if(_ht['compare'] && !_ht['compare'].isDestroyed){ _ht['compare'].destroy(); delete _ht['compare']; }

  if(!rows.length){
    if(el) el.innerHTML = `<div class="dt-empty dt-ok">\u2713 Sin diferencias${key === '_combined' ? ' combinadas' : ' en ' + key}</div>`;
    return;
  }

  if(!_compareColsCache[key]){
    const SKIP = new Set(['_sheet','_rowIdx','_source','_missing']);
    const s    = new Set();
    rows.forEach(r => Object.keys(r).forEach(k => { if(!SKIP.has(k)) s.add(k); }));
    let prefix = [];
    if(key === '_combined') prefix = ['_source'];
    if(key === '_svnonly')  prefix = ['_missing'];
    _compareColsCache[key] = [...prefix, ..._orderCols([...s])];
  }
  _compareAllCols = _compareColsCache[key];

  // Build display rows — apply compareEdits
  const display = rows.map((r, i) => {
    const ri  = r._rowIdx ?? i;
    const row = { _ri: ri };
    _compareAllCols.forEach(c => {
      const raw   = c === '_source' ? (r._source || '') : (r[c] ?? '');
      row[c] = compareEdits[`${key}:${ri}:${c}`] ?? raw;
    });
    return row;
  });

  // Update row count badge
  const crb = document.getElementById('compareRowCount');
  if(crb) crb.textContent = display.length.toLocaleString() + ' filas';

  // Apply compare search filter
  const cq = (document.getElementById('compareSearch')?.value || '').toLowerCase().trim();
  const displayFiltered = cq
    ? display.filter(r => Object.values(r).some(v => v != null && String(v).toLowerCase().includes(cq)))
    : display;

  const compareHeaders = _compareAllCols.map(c => {
    if(c === '_source')  return 'Source';
    if(c === '_missing') return 'Ausente en';
    return c;
  });
  const compareColumns = _compareAllCols.map(col => {
    if(col.toLowerCase() === 'status') return { data: col, renderer: 'statusBadge', type: 'text' };
    return { data: col, type: 'text' };
  });

  if(_ht['compare'] && !_ht['compare'].isDestroyed){
    _ht['compare'].suspendRender();
    _ht['compare'].updateSettings({ colHeaders: compareHeaders, columns: compareColumns }, false);
    _ht['compare'].loadData(displayFiltered);
    _ht['compare'].resumeRender();
  } else {
    _htMount('compare', 'ht-compare', _htConfig({
      data:       displayFiltered,
      colHeaders: compareHeaders,
      columns:    compareColumns,
      height:     _htH('page-compare', 140),
      width:      '100%',
      afterChange(changes, src){
        if(!changes || src === 'loadData') return;
        changes.forEach(([row, prop, , nv]) => {
          const r = displayFiltered[row];
          if(r && prop !== '_ri') compareEdits[`${key}:${r._ri}:${prop}`] = nv;
        });
      },
    }));
  }
}

/* ══════════════════════════════════════════════════════════════════════
   OTHERS page — Handsontable
   ══════════════════════════════════════════════════════════════════════ */
function othersRenderSheet(){
  const key   = othersActiveSheet;
  const avail = SHEETS_LIST.filter(n => sheetData[n]);
  const htEl  = document.getElementById('ht-others');
  if(!htEl) return;

  // Destroy HOT when tab key changes (different schema)
  const prevKey = htEl.dataset.htKey;
  if(prevKey !== key && _ht['others'] && !_ht['others'].isDestroyed){
    _ht['others'].destroy(); delete _ht['others'];
  }
  htEl.dataset.htKey = key;

  /* ── Not-found tab ─────────────────────────────────────────── */
  if(key === '_notfound'){
    const missing = lastOthersResults.filter(r => !avail.some(n => r._presence[n]));
    if(!missing.length){
      htEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--found);font-size:.82rem">✓ Todos los seriales encontrados</div>';
      return;
    }
    const data = missing.map((r, i) => ({ '#': i + 1, Serial: r._serial, Estado: '✕ not found' }));
    _htMount('others','ht-others', _htConfig({
      data, colHeaders:['#','Serial','Estado'],
      columns:[{data:'#',readOnly:true,type:'numeric'},{data:'Serial',readOnly:true,type:'text'},{data:'Estado',readOnly:true,type:'text'}],
      height:_htH('page-others',124), width:'100%', readOnly:true,
    }));
    return;
  }

  /* ── Not-in-SvN tab ─────────────────────────────────────────── */
  if(key === '_notinsvn'){
    const notInSvn = lastOthersResults.filter(r => !(r._presence['SvN'] && r._presence['SvN'].length));
    if(!notInSvn.length){
      htEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--found);font-size:.82rem">✓ Todos los seriales están en SvN</div>';
      return;
    }

    // Show CMDB data from any available sheet, plus SvN status badge
    const cmdbCols = _orderCols(OTHERS_CMDB_COLS).filter(c => c !== 'Serial');
    const data = notInSvn.map((r, i) => {
      const ri  = r._rowIdx ?? i;
      const row = { _ri: ri, Serial: r._serial, SvN_Status: 'NOT IN SVN' };

      // Presence in other sheets (pills — show what sheets DO have it)
      let pills = '';
      for(let j = 0; j < avail.length; j++){
        const nm = avail[j];
        if(nm === 'SvN') continue;
        const f = !!(r._presence[nm] && r._presence[nm].length);
        pills += `<span class="hot-pill ${f?'found':'missing'}">${f?'✓':'✕'} ${nm}</span>`;
      }
      row['Otras Hojas'] = pills;

      for(let j = 0; j < cmdbCols.length; j++){
        const c = cmdbCols[j];
        row[c] = String(othersEdits[`${ri}:${c}`] ?? r[c] ?? '');
      }
      return row;
    });

    const colHeaders = ['Serial', 'SvN_Status', 'Otras Hojas', ...cmdbCols];
    const columns    = [
      { data:'Serial',      editor:'text', readOnly:true },
      { data:'SvN_Status',  renderer:'svnMissBadge', readOnly:true },
      { data:'Otras Hojas', renderer:'htmlPills',    readOnly:true, type:'text' },
      ...cmdbCols.map(c => c === 'Status'
        ? { data:c, renderer:'statusBadge', editor:'text', type:'text' }
        : { data:c, editor:'text', type:'text' }),
    ];

    _htMount('others','ht-others', _htConfig({
      data, colHeaders, columns,
      height:_htH('page-others',124), width:'100%',
      renderAllRows:false,
      viewportRowRenderingOffset:30,
      afterChange(changes, src){
        if(!changes || src === 'loadData') return;
        changes.forEach(([row, prop, , nv]) => {
          const r = data[row];
          if(r && prop !== '_ri' && prop !== 'SvN_Status' && prop !== 'Otras Hojas') { othersEdits[`${r._ri}:${prop}`] = nv; _searchTextCache = null; }
        });
      },
    }));
    return;
  }

  /* ── ALL tab — optimized: build index once, slice render ─── */
  if(key === '_all'){
    const cmdbCols = _orderCols(OTHERS_CMDB_COLS).filter(c => c !== 'Serial');
    // Build data synchronously but with minimal allocations
    const results  = lastOthersResults;
    const n        = results.length;
    const data     = new Array(n);
    for(let i = 0; i < n; i++){
      const r   = results[i];
      const ri  = r._rowIdx ?? i;
      const row = { _ri: ri, Serial: r._serial };
      // Presence pills — SvN missing gets a prominent warning pill
      let pills = '';
      for(let j = 0; j < avail.length; j++){
        const nm = avail[j];
        const f  = !!(r._presence[nm] && r._presence[nm].length);
        if(nm === 'SvN' && !f){
          pills += `<span class="hot-pill hot-pill--svn-miss">✕ SvN</span>`;
        } else {
          pills += `<span class="hot-pill ${f?'found':'missing'}">${f?'✓':'✕'} ${nm}</span>`;
        }
      }
      row['Hojas'] = pills;
      for(let j = 0; j < cmdbCols.length; j++){
        const c = cmdbCols[j];
        row[c] = String(othersEdits[`${ri}:${c}`] ?? r[c] ?? '');
      }
      data[i] = row;
    }

    const colHeaders = ['Serial','Hojas',...cmdbCols];
    const columns    = [
      { data:'Serial', editor:'text', type:'text' },
      { data:'Hojas',  renderer:'htmlPills', readOnly:true, type:'text' },
      ...cmdbCols.map(c => c === 'Status'
        ? { data:c, renderer:'statusBadge', editor:'text', type:'text' }
        : { data:c, editor:'text', type:'text' }),
    ];

    if(_ht['others'] && !_ht['others'].isDestroyed){
      _ht['others'].suspendRender();
      _ht['others'].updateSettings({ colHeaders, columns }, false);
      _ht['others'].loadData(data);
      _ht['others'].resumeRender();
      return;
    }
    _htMount('others','ht-others', _htConfig({
      data, colHeaders, columns,
      height: _htH('page-others', 124), width:'100%',
      renderAllRows: false,
      viewportRowRenderingOffset: 30,
      afterChange(changes, src){
        if(!changes || src === 'loadData') return;
        changes.forEach(([row, prop, , nv]) => {
          const r = data[row];
          if(r && prop !== '_ri' && prop !== 'Hojas') othersEdits[`${r._ri}:${prop}`] = nv;
        });
      },
    }));
    return;
  }

  /* ── Per-sheet tab ──────────────────────────────────────────── */
  const sheetRecs = sheetData[key] || [];
  if(!sheetRecs.length){
    htEl.innerHTML = `<div style="padding:32px;text-align:center;color:var(--txt3);font-size:.82rem">Sin datos para ${key}</div>`;
    return;
  }

  // Build serial→rows index lazily (cache per sheet)
  if(!_othersPerSheetIdx) _othersPerSheetIdx = {};
  if(!_othersPerSheetIdx[key]){
    const idx_ = Object.create(null);
    for(let i = 0; i < sheetRecs.length; i++){
      const k = norm(sheetRecs[i].Serial || '');
      if(!idx_[k]) idx_[k] = [];
      idx_[k].push(sheetRecs[i]);
    }
    _othersPerSheetIdx[key] = idx_;
  }
  const sheetIdx = _othersPerSheetIdx[key];

  const nCols = _orderCols(Object.keys(sheetRecs[0]).filter(c => c !== '_sheet' && c !== '_rowIdx'));

  const rows = [];
  const results = lastOthersResults;
  for(let i = 0; i < results.length; i++){
    const r    = results[i];
    const hits = sheetIdx[r._serial];
    if(!hits) continue;
    for(let h = 0; h < hits.length; h++) rows.push({ _serial:r._serial, _ri:r._rowIdx, _hi:h, _hit:hits[h] });
  }

  if(!rows.length){
    htEl.innerHTML = `<div style="padding:32px;text-align:center;color:var(--txt3);font-size:.82rem">Ningún serial del lookup encontrado en ${key}</div>`;
    return;
  }

  const data = rows.map(r => {
    const row = { _key:`${key}:${r._serial}:${r._hi}` };
    for(let i = 0; i < nCols.length; i++){
      const c = nCols[i];
      row[c] = String(othersEdits[`${key}:${r._serial}:${r._hi}:${c}`] ?? r._hit[c] ?? '');
    }
    return row;
  });
  const columns = nCols.map(c =>
    c.toLowerCase() === 'status'
      ? { data:c, renderer:'statusBadge', editor:'text' }
      : { data:c, editor:'text' }
  );

  _htMount('others','ht-others', _htConfig({
    data, colHeaders:nCols, columns,
    height:_htH('page-others',124), width:'100%',
    renderAllRows:false,
    viewportRowRenderingOffset:30,
    afterChange(changes, src){
      if(!changes || src === 'loadData') return;
      changes.forEach(([row, prop, , nv]) => {
        const r = data[row];
        if(r && prop !== '_key') othersEdits[`${r._key}:${prop}`] = nv;
      });
    },
  }));
}


/* ══════════════════════════════════════════════════════════════════════
   OBSOLESCENCIA table — Handsontable (read-only)
   ══════════════════════════════════════════════════════════════════════ */
function _obsRenderTable(){
  const metaEl  = document.getElementById('obsTableMeta');
  const titleEl = document.getElementById('obsTableTitle');
  if(titleEl) titleEl.textContent = `Detalle \u2014 ${_obsRecords.length.toLocaleString()} activos`;

  if(!_obsColsCache){
    const SKIP = new Set(['_sheet','_rowIdx']);
    const s    = new Set();
    (_obsAllRecords.slice(0, 80)).forEach(r => Object.keys(r).forEach(k => { if(!SKIP.has(k)) s.add(k); }));
    _obsColsCache = _orderCols([...s]);
  }
  const cols = _obsColsCache;
  if(metaEl) metaEl.textContent = `${_obsRecords.length.toLocaleString()} filas \xB7 ${cols.length} cols`;

  // Destroy any HOT instance
  if(_ht['obs'] && !_ht['obs'].isDestroyed){ _ht['obs'].destroy(); delete _ht['obs']; }

  // Apply search filter
  const _obsDisplayRows = _obsSearchQ
    ? _obsRecords.filter(r => Object.values(r).some(v => v != null && String(v).toLowerCase().includes(_obsSearchQ)))
    : _obsRecords;

  // Update badge
  const orb = document.getElementById('obsRowCount');
  if(orb) orb.textContent = _obsDisplayRows.length.toLocaleString() + ' filas';

  const obsHeaders = cols.slice();
  const obsColumns = cols.map(col => {
    if(col === 'u_eol' || col === 'start_date') return { data: col, renderer: 'eolDate',    type: 'text', readOnly: true };
    if(col.toLowerCase() === 'status')          return { data: col, renderer: 'statusBadge', type: 'text', readOnly: true };
    return { data: col, type: 'text', readOnly: true };
  });

  if(_ht['obs'] && !_ht['obs'].isDestroyed){
    _ht['obs'].suspendRender();
    _ht['obs'].updateSettings({ colHeaders: obsHeaders, columns: obsColumns }, false);
    _ht['obs'].loadData(_obsDisplayRows);
    _ht['obs'].resumeRender();
  } else {
    _htMount('obs', 'ht-obs', _htConfig({
      data:       _obsDisplayRows,
      colHeaders: obsHeaders,
      columns:    obsColumns,
      height:     _htH('page-obs', 200),
      width:      '100%',
    }));
  }
}
function obsShowAllRows(){ _obsShowAll = true; _obsRenderTable(); }

/* ══════════════════════════════════════════════════════════════════════
   SEARCH table — Handsontable (read-only, click opens modal)
   ══════════════════════════════════════════════════════════════════════ */
let _searchTextCache  = null;  // per-record text index for fast search
let _htLastSearchCols = '';

/* ── Compare table search filter ─────────────────────────── */
function compareTableFilter(){
  // Re-render with current filter — _compareRenderSheet reads compareSearch input
  _compareRenderSheet();
}

/* ── Others table search filter ──────────────────────────── */
function othersTableFilter(){
  clearTimeout(window._othersSearchTimer);
  window._othersSearchTimer = setTimeout(() => {
    const q = (document.getElementById('othersTableSearch')?.value || '').trim();
    if(_ht['others'] && !_ht['others'].isDestroyed){
      const sp = _ht['others'].getPlugin('search');
      if(sp){ sp.query(q); _ht['others'].render(); }
    }
    // Also update row count
    const b = document.getElementById('othersRowCount');
    if(b && _ht['others'] && !_ht['others'].isDestroyed){
      b.textContent = _ht['others'].countRows().toLocaleString() + ' filas';
    }
  }, 150);
}


function renderSearchTable(){
  const meta  = document.getElementById('tableMeta');
  const badge = document.getElementById('searchTotalBadge');
  const filteredCount = filteredRec.length;
  const totalCount    = allRec.length;
  const pct           = totalCount ? Math.round(filteredCount / totalCount * 100) : 0;
  const isFiltered    = filteredCount !== totalCount;

  if(meta){
    meta.innerHTML = isFiltered
      ? `<b style="color:var(--accent)">${filteredCount.toLocaleString()}</b>`
        + ` de <b>${totalCount.toLocaleString()}</b> registros`
        + ` <span style="color:var(--txt3)">(${pct}%)</span>`
      : `<b>${totalCount.toLocaleString()}</b> registros totales`;
  }
  if(badge){
    badge.textContent = isFiltered
      ? `\uD83D\uDD0D ${filteredCount.toLocaleString()} encontrados`
      : `\uD83D\uDCCB ${totalCount.toLocaleString()} registros`;
    badge.style.display = totalCount ? 'inline-flex' : 'none';
  }

  // Update row count badge
  const srb = document.getElementById('searchRowCount');
  if(srb) srb.textContent = filteredCount.toLocaleString() + ' filas';

  if(!filteredRec.length){
    if(_ht['search'] && !_ht['search'].isDestroyed){ _ht['search'].destroy(); delete _ht['search']; }
    const el = document.getElementById('ht-search');
    if(el) el.innerHTML = '<div class="dt-empty">No se encontraron registros</div>';
    return;
  }

  // Reorder: _sheet first
  const searchCols = ['_sheet', ...SEARCH_COLS.filter(c => c !== '_sheet')];
  const searchHeaders = searchCols.map(c => c === '_sheet' ? 'Sheet' : c);
  const searchColumns = searchCols.map(col => {
    if(col.toLowerCase() === 'status') return { data: col, renderer: 'statusBadge', type: 'text', readOnly: true };
    return { data: col, type: 'text', readOnly: true };
  });

  if(_ht['search'] && !_ht['search'].isDestroyed){
    _ht['search'].suspendRender();
    _ht['search'].updateSettings({ colHeaders: searchHeaders, columns: searchColumns }, false);
    _ht['search'].loadData(filteredRec);
    _ht['search'].resumeRender();
  } else {
    _htMount('search', 'ht-search', _htConfig({
      data:       filteredRec,
      colHeaders: searchHeaders,
      columns:    searchColumns,
      height:     _htH('page-search', 160),
      width:      '100%',
      readOnly:   true,
    }));
  }
}

/* ══════════════════════════════════════════════════════════════════════
   MODAL table — Handsontable (read-only)
   ══════════════════════════════════════════════════════════════════════ */
function renderModalTable(rows, cols){
  if(!rows || !rows.length) return;
  // Destroy any HOT instance
  if(_ht['modal'] && !_ht['modal'].isDestroyed){ _ht['modal'].destroy(); delete _ht['modal']; }
  _nativeTable('ht-modal', rows, cols, { emptyMsg: 'Sin datos' });
}

/* ══════════════════════════════════════════════════════════════════════
   FILTER DETAIL POPOVER — Handsontable
   ══════════════════════════════════════════════════════════════════════ */
let currentFilterPopData = [];
function showFilterDetail(filterKey, field, val, ev){
  if(ev) ev.stopPropagation();
  const fp = document.getElementById('filterPopover');
  const bg = document.getElementById('filterPopBg');
  if(!fp) return;

  const matching = allRec.filter(r => {
    const v = (field === '_sheet' ? r._sheet : (r[field] || '')).toString().trim() || '(blank)';
    return v === val;
  });
  currentFilterPopData = matching;

  const title = document.getElementById('filterPopTitle');
  const sub   = document.getElementById('filterPopSub');
  if(title) title.textContent = `${field === '_sheet' ? 'Sheet' : field}: ${val}`;
  if(sub)   sub.textContent   = `${matching.length.toLocaleString()} registros`;

  fp.classList.remove('hidden');
  if(bg) bg.classList.remove('hidden');

  // Destroy any HOT instance
  if(_ht['filterpop'] && !_ht['filterpop'].isDestroyed){ _ht['filterpop'].destroy(); delete _ht['filterpop']; }

  setTimeout(() => {
    _nativeTable('ht-filterpop', matching, SEARCH_COLS, { emptyMsg: 'Sin resultados' });
  }, 20);
}
function closeFilterPop(){
  document.getElementById('filterPopover')?.classList.add('hidden');
  document.getElementById('filterPopBg')?.classList.add('hidden');
  if(_ht['filterpop'] && !_ht['filterpop'].isDestroyed){ _ht['filterpop'].destroy(); delete _ht['filterpop']; }
}
function exportFilterPop(type){
  if(!currentFilterPopData.length){ showToast('No hay datos.','warn'); return; }
  const cols = SEARCH_COLS;
  if(type === 'excel'){
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      currentFilterPopData.map(r=>{ const o={}; cols.forEach(c=>{o[c]=r[c]??''}); return o; })
    ), 'Filter');
    _xlsxDownload(wb, 'cmdb_filter_detail.xlsx');
  } else {
    exportTableAsPNG(document.getElementById('ht-filterpop'), 'cmdb_filter_detail.png');
  }
}


/* "Ver más" carga 300 filas más sin recargar todo */




function sheetsResetEdits(){
  if(!Object.keys(sheetsEdits||{}).length){ showToast('No hay ediciones que resetear.','info'); return; }
  const ov = document.createElement('div'); ov.className='reset-confirm-overlay';
  ov.innerHTML=`<div class="reset-confirm-box"><h3>Reset Edits?</h3><p>All manual edits in this sheet will be discarded.</p><div class="btn-row"><button class="btn-ghost" onclick="this.closest('.reset-confirm-overlay').remove()">Cancel</button><button class="btn-ghost" style="border-color:rgba(218,54,51,.5);color:var(--missing)" onclick="sheetsEdits={};_sheetsRowCache={};sheetsRender();this.closest('.reset-confirm-overlay').remove()">Reset</button></div></div>`;
  document.body.appendChild(ov);
}

/* ─── Export ────────────────────────────────────────── */
function sheetsExportExcel(){
  if(!PD || !sheetData[sheetsActiveTab]){ showToast('No data to export.','warn'); return; }
  const rawRows = sheetData[sheetsActiveTab] || [];
  const skip    = new Set(['_sheet','_rowIdx']);
  const exportRows = rawRows.map((r, vi) => {
    const ri  = r._rowIdx ?? vi;
    const out = {};
    Object.keys(r).filter(k => !skip.has(k)).forEach(k => {
      out[k] = sheetsEdits[`${sheetsActiveTab}:${ri}:${k}`] ?? r[k] ?? '';
    });
    return out;
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), sheetsActiveTab);
  _xlsxDownload(wb, `cmdb_sheet_${sheetsActiveTab}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════════
   OBSOLESCENCIA — Dashboard interactivo de ciclo de vida (SvN)
   Columnas: start_date  u_eol  O.HW  O.So
   ═══════════════════════════════════════════════════════════════════ */

const OBS_COLS   = ['start_date', 'u_eol', 'O.HW', 'O.So'];
const OBS_TABLE_PAGE = 1000;

/* ── State ── */
let _obsRecords    = [];   // filtered records
let _obsAllRecords = [];   // all SvN records
let _obsShowAll    = false;
let _obsSearchQ    = '';
let _obsSearchTimer = null;
let _obsSortCol    = null;
let _obsSortAsc    = true;

let _obsEcHW = null, _obsEcSW = null, _obsEcEOL = null, _obsEcAge = null;

/* ── Helpers ── */
function _obsParseDate(v){
  if(!v) return null;
  const s = String(v).trim();
  // Handle Excel serial dates (numbers)
  if(/^\d{4,6}$/.test(s)){
    const d = new Date((+s - 25569) * 86400 * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function _obsYear(v){ const d=_obsParseDate(v); return d ? d.getFullYear() : null; }

/* ── Render entry ── */
function obsRender(){
  _obsColsCache = null; // reset on each data reload
  if(!PD || !sheetData['SvN']){
    document.getElementById('obsKpiRow').innerHTML='<div style="color:var(--txt3);font-size:.85rem;padding:20px">Load a CMDB file with an SvN sheet to view obsolescence data.</div>';
    return;
  }
  _obsAllRecords = (sheetData['SvN'] || []);
  _obsPopulateFilters();
  obsApplyFilters();
}

function _obsPopulateFilters(){
  const empresas = [...new Set(_obsAllRecords.map(r=>r.Empresa||'').filter(Boolean))].sort();
  const statuses = [...new Set(_obsAllRecords.map(r=>r.Status||'').filter(Boolean))].sort();
  const eEl = document.getElementById('obsFilterEmpresa');
  const sEl = document.getElementById('obsFilterStatus');
  if(eEl){ const prev=eEl.value; eEl.innerHTML='<option value="">Todas</option>'; empresas.forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; if(e===prev) o.selected=true; eEl.appendChild(o); }); }
  if(sEl){ const prev=sEl.value; sEl.innerHTML='<option value="">Todos</option>'; statuses.forEach(s=>{ const o=document.createElement('option'); o.value=s; o.textContent=s; if(s===prev) o.selected=true; sEl.appendChild(o); }); }
}

function obsApplyFilters(){
  const empresa = (document.getElementById('obsFilterEmpresa')?.value||'');
  const status  = (document.getElementById('obsFilterStatus')?.value||'');
  _obsRecords   = _obsAllRecords.filter(r =>
    (!empresa || (r.Empresa||'') === empresa) &&
    (!status  || (r.Status||'')  === status)
  );
  _obsShowAll = false;
  _obsSearchQ = '';
  const inp = document.getElementById('obsTableSearch');
  if(inp) inp.value = '';
  _obsRenderKPIs();
  _obsRenderCharts();
  _obsRenderTable();
}

/* ── KPI Row ── */
function _obsRenderKPIs(){
  const total = _obsRecords.length;
  const now   = new Date();

  // HW obsolete: O.HW contains Obsoleto/EOL/yes/si  
  const hwObs = _obsRecords.filter(r => /obsol|eol|yes|si/i.test(String(r['O.HW']||''))).length;
  const swObs = _obsRecords.filter(r => /obsol|eol|yes|si/i.test(String(r['O.So']||''))).length;

  // EOL passed
  const eolPassed = _obsRecords.filter(r => {
    const d = _obsParseDate(r.u_eol); return d && d < now;
  }).length;

  // Avg age
  let totalAge = 0, ageCount = 0;
  _obsRecords.forEach(r => {
    const d = _obsParseDate(r.start_date);
    if(d){ totalAge += (now - d) / (365.25 * 86400 * 1000); ageCount++; }
  });
  const avgAge = ageCount ? (totalAge / ageCount).toFixed(1) : '—';

  const kpis = [
    { val: total.toLocaleString(),        label: 'Total Assets (SvN)',    pct: 100,                                    color: '' },
    { val: hwObs.toLocaleString(),         label: 'HW Obsoleto',          pct: total ? hwObs/total*100 : 0,            color: 'var(--missing)' },
    { val: swObs.toLocaleString(),         label: 'SW Obsoleto',          pct: total ? swObs/total*100 : 0,            color: 'var(--missing)' },
    { val: eolPassed.toLocaleString(),     label: 'EOL Vencido',          pct: total ? eolPassed/total*100 : 0,        color: 'var(--missing)' },
    { val: avgAge + ' años',              label: 'Antigüedad Media',      pct: 0,                                      color: 'var(--accent)' },
  ];

  document.getElementById('obsKpiRow').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-val" style="${k.color?'color:'+k.color:''}">${k.val}</div>
      <div class="kpi-label">${k.label}</div>
      ${k.pct ? `<div class="kpi-bar-wrap"><div class="kpi-bar" style="width:${Math.min(k.pct,100).toFixed(1)}%"></div></div><div class="kpi-pct">${k.pct.toFixed(1)}%</div>` : ''}
    </div>`).join('');
}

/* ── ECharts helpers ── */
function _obsInitEc(id, existingRef){
  const el = document.getElementById(id);
  if(!el) return null;
  if(existingRef){ try{ existingRef.dispose(); }catch(e){} }
  if(typeof echarts === 'undefined') return null;
  return echarts.init(el, null, { renderer:'canvas' });
}
function _obsSetOpt(ec, opt){ if(ec){ ec.setOption(opt, true); } }

/* ── Charts ── */
function _obsRenderCharts(){
  const t  = _tv();
  const pal = ['#E08060','#D97757','#F5A87A','#C26040','#7A3820','#FFBA8A','#A04828','#FCD8B0'];

  /* ─ O.HW distribution ─ */
  const hwData = {};
  _obsRecords.forEach(r=>{ const v=String(r['O.HW']||'(blank)').trim()||'(blank)'; hwData[v]=(hwData[v]||0)+1; });
  const hwEntries = Object.entries(hwData).sort((a,b)=>b[1]-a[1]).slice(0,12);
  _obsEcHW = _obsInitEc('obsEchartsHW', _obsEcHW);
  _obsSetOpt(_obsEcHW, {
    backgroundColor: 'transparent',
    tooltip: { ..._tipCfg(t), formatter: p => `${p.name}: <b>${p.value}</b> (${(p.percent||0).toFixed(1)}%)` },
    series:[{ type:'pie', radius:['38%','68%'], center:['50%','50%'],
      data: hwEntries.map(([n,v],i)=>({ name:n, value:v, itemStyle:{ color:pal[i%pal.length] } })),
      label:{ color:t.txt2, fontSize:11 },
      emphasis:{ itemStyle:{ shadowBlur:10, shadowColor:'rgba(0,0,0,0.3)' } }
    }]
  });

  /* ─ O.So distribution ─ */
  const swData = {};
  _obsRecords.forEach(r=>{ const v=String(r['O.So']||'(blank)').trim()||'(blank)'; swData[v]=(swData[v]||0)+1; });
  const swEntries = Object.entries(swData).sort((a,b)=>b[1]-a[1]).slice(0,12);
  _obsEcSW = _obsInitEc('obsEchartsSW', _obsEcSW);
  _obsSetOpt(_obsEcSW, {
    backgroundColor: 'transparent',
    tooltip: { ..._tipCfg(t), formatter: p => `${p.name}: <b>${p.value}</b> (${(p.percent||0).toFixed(1)}%)` },
    series:[{ type:'pie', radius:['38%','68%'], center:['50%','50%'],
      data: swEntries.map(([n,v],i)=>({ name:n, value:v, itemStyle:{ color:pal[i%pal.length] } })),
      label:{ color:t.txt2, fontSize:11 },
      emphasis:{ itemStyle:{ shadowBlur:10, shadowColor:'rgba(0,0,0,0.3)' } }
    }]
  });

  /* ─ EOL Timeline ─ */
  const eolByYear = {};
  const now = new Date();
  _obsRecords.forEach(r=>{
    const y = _obsYear(r.u_eol);
    if(y){ eolByYear[y]=(eolByYear[y]||0)+1; }
  });
  const eolYears = Object.keys(eolByYear).map(Number).sort();
  _obsEcEOL = _obsInitEc('obsEchartsEOL', _obsEcEOL);
  _obsSetOpt(_obsEcEOL, {
    backgroundColor: 'transparent',
    tooltip: { ..._tipCfg(t), trigger:'axis', formatter: p => `${p[0].name}: <b>${p[0].value}</b> assets EOL` },
    grid: { top:12, right:8, bottom:36, left:40 },
    xAxis: { type:'category', data:eolYears, axisLabel:{ color:t.txt3, fontSize:10 }, axisLine:{ lineStyle:{color:t.brd2} } },
    yAxis: { type:'value', axisLabel:{ color:t.txt3, fontSize:10 }, splitLine:{ lineStyle:{color:t.gridL} } },
    series:[{ type:'bar', data:eolYears.map(y=>({
        value: eolByYear[y],
        itemStyle:{ color: y < now.getFullYear() ? 'rgba(248,113,113,0.75)' : y === now.getFullYear() ? t.accent : pal[0] }
      })),
      emphasis:{ itemStyle:{ opacity:.9 } }
    }]
  });

  /* ─ Antigüedad (start_date) — distribución por año de instalación ─ */
  const ageByYear = {};
  _obsRecords.forEach(r=>{
    const y = _obsYear(r.start_date);
    if(y){ ageByYear[y]=(ageByYear[y]||0)+1; }
  });
  const ageYears = Object.keys(ageByYear).map(Number).sort();
  _obsEcAge = _obsInitEc('obsEchartsAge', _obsEcAge);
  _obsSetOpt(_obsEcAge, {
    backgroundColor: 'transparent',
    tooltip: { ..._tipCfg(t), trigger:'axis', formatter: p => `${p[0].name}: <b>${p[0].value}</b> assets instalados` },
    grid: { top:12, right:8, bottom:36, left:40 },
    xAxis: { type:'category', data:ageYears, axisLabel:{ color:t.txt3, fontSize:10, rotate:ageYears.length>10?30:0 }, axisLine:{ lineStyle:{color:t.brd2} } },
    yAxis: { type:'value', axisLabel:{ color:t.txt3, fontSize:10 }, splitLine:{ lineStyle:{color:t.gridL} } },
    series:[{ type:'bar', data:ageYears.map(y=>ageByYear[y]),
      itemStyle:{ color: t.accent, opacity:0.80 },
      emphasis:{ itemStyle:{ opacity:1 } }
    }]
  });

  // Click handlers for drill-down
  [
    { ec: _obsEcHW,  field: 'O.HW'  },
    { ec: _obsEcSW,  field: 'O.So'  },
  ].forEach(({ec, field}) => {
    if(!ec) return;
    ec.off('click'); ec.on('click', p => {
      if(!p.name) return;
      const filtered = _obsRecords.filter(r => (String(r[field]||'(blank)').trim()||'(blank)') === p.name);
      openModal(`${field}: ${p.name}`, `${filtered.length} registros`, filtered);
    });
  });
  [_obsEcEOL, _obsEcAge].forEach((ec, idx) => {
    if(!ec) return;
    const dateField = idx===0 ? 'u_eol' : 'start_date';
    ec.off('click'); ec.on('click', p => {
      if(!p.name) return;
      const y = +p.name;
      const filtered = _obsRecords.filter(r => _obsYear(r[dateField]) === y);
      openModal(`${dateField}: ${y}`, `${filtered.length} registros`, filtered);
    });
  });
}

/* ── Detail Table ── */
function obsTableFilter(){
  clearTimeout(_obsSearchTimer);
  _obsSearchTimer = setTimeout(()=>{
    _obsSearchQ = (document.getElementById('obsTableSearch')?.value||'').toLowerCase().trim();
    if(_ht['obs'] && !_ht['obs'].isDestroyed){
      // Use HOT search plugin for live filtering
      const sp = _ht['obs'].getPlugin('search');
      if(sp){ sp.query(_obsSearchQ); _ht['obs'].render(); }
      const b = document.getElementById('obsRowCount');
      if(b) b.textContent = _ht['obs'].countRows().toLocaleString() + ' filas';
    } else {
      _obsRenderTable();
    }
  }, 150);
}







/* ── Row selection ── */

/* ── Export ── */
function obsExportExcel(){
  if(!_obsRecords.length){ showToast('No hay datos para exportar.','warn'); return; }
  const skip = new Set(['_sheet','_rowIdx']);
  const cols = [...new Set(_obsAllRecords.slice(0,300).flatMap(r=>Object.keys(r)))].filter(c=>!skip.has(c));
  const exportRows = _obsRecords.map(r => {
    const o = {}; cols.forEach(c => { o[c] = r[c]??''; }); return o;
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows), 'Obsolescencia');
  _xlsxDownload(wb, `cmdb_obsolescencia_${new Date().toISOString().slice(0,10)}.xlsx`);
}

/* ═══════════════════════════════════════════════════════════════
   FULLSCREEN — funciona en browser y en Electron
   ═══════════════════════════════════════════════════════════════ */

function _fsSetIcons(isFull){
  const expand = document.getElementById('fsIconExpand');
  const shrink = document.getElementById('fsIconShrink');
  if(expand) expand.style.display = isFull ? 'none' : '';
  if(shrink) shrink.style.display = isFull ? ''     : 'none';
}

function _fsApply(isFull){
  // is-fullscreen ya no oculta sidebar/topbar — solo actualiza el ícono del botón
  _fsSetIcons(isFull);
  if(typeof _ecResize === 'function') setTimeout(_ecResize, 120);
}

function toggleFullscreen(){
  // Electron: delegar al proceso principal vía IPC
  if(window.electronAPI){
    window.electronAPI.toggleFullscreen();
    return;
  }
  // Browser: API nativa
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen().catch(()=>{});
  } else {
    document.exitFullscreen().catch(()=>{});
  }
}

// Browser: escuchar evento nativo
document.addEventListener('fullscreenchange', ()=>{
  _fsApply(!!document.fullscreenElement);
});
document.addEventListener('webkitfullscreenchange', ()=>{
  _fsApply(!!(document.webkitFullscreenElement));
});

// Electron: escuchar evento desde main process
if(window.electronAPI){
  // OS fullscreen (F11): solo actualiza el ícono del botón
  // body.is-fullscreen (sidebar/topbar ocultos) se controla SOLO con el botón UI
  window.electronAPI.onFullscreenChange(isFull => _fsSetIcons(isFull));
}

// Atajo de teclado F11 (sólo browser — Electron lo maneja en main.js)
if(!window.electronAPI){
  document.addEventListener('keydown', e=>{
    if(e.key === 'F11'){ e.preventDefault(); toggleFullscreen(); }
  });
}


/* ═══════════════════════════════════════════════════════════════
   DOUBLE-CLICK TO EDIT + KEYBOARD NAVIGATION FOR SPREADSHEETS
   Applies to any td[contenteditable] inside .sel-table
   ═══════════════════════════════════════════════════════════════ */
(function(){
  /* Make all spreadsheet cells read-only by default.
     indexCells() is called by the MutationObserver in TableRangeSelect
     but we also call it whenever cells are rendered. */
  function makeCellsReadonly(table){
    // Select editable cells that are not currently being edited
    table.querySelectorAll('td[data-ek], td[data-ri]').forEach(td=>{
      if(td.classList.contains('cell-editing')) return; // leave active cells alone
      td.setAttribute('contenteditable','false');
      td.classList.add('cell-readonly');
      td.classList.remove('cell-editing');
    });
  }

  /* Switch a single cell into edit mode */
  function startEdit(td){
    if(!td || td.tagName !== 'TD') return;
    // Only editable cells have a data-ek or data-ri
    if(!td.dataset.ek && !td.dataset.ri && !td.dataset.col) return;
    // Already editing
    if(td.getAttribute('contenteditable') === 'true') return;

    // Close any currently open editor
    document.querySelectorAll('td.cell-editing').forEach(c => commitCell(c));

    td.setAttribute('contenteditable','true');
    td.classList.remove('cell-readonly');
    td.classList.add('cell-editing');

    // Place cursor at end
    td.focus();
    const range = document.createRange();
    range.selectNodeContents(td);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* Commit current cell value (fire oninput then blur) */
  function commitCell(td){
    if(!td || td.getAttribute('contenteditable') !== 'true') return;
    td.setAttribute('contenteditable','false');
    td.classList.remove('cell-editing');
    td.classList.add('cell-readonly');
    td.dispatchEvent(new Event('input', {bubbles:true}));
    td.dispatchEvent(new Event('blur',  {bubbles:true}));
  }

  /* Double-click → enter edit */
  document.addEventListener('dblclick', e=>{
    const td = e.target.closest('td');
    if(!td) return;
    if(!td.closest('table.sel-table')) return;
    startEdit(td);
    e.preventDefault();
  });

  /* Escape → cancel edit and restore original value */
  document.addEventListener('keydown', e=>{
    const editing = document.querySelector('td.cell-editing');
    if(!editing) return;

    if(e.key === 'Escape'){
      // Restore from data-original if set
      const orig = editing.dataset.original;
      if(orig !== undefined) editing.textContent = orig;
      commitCell(editing);
      e.preventDefault();
      return;
    }

    if(e.key === 'Enter' && !e.shiftKey){
      commitCell(editing);
      // Move down
      const tr = editing.closest('tr');
      const ci = Array.from(tr.cells).indexOf(editing);
      const nextTr = tr.nextElementSibling;
      if(nextTr) startEdit(nextTr.cells[ci]);
      e.preventDefault();
      return;
    }

    if(e.key === 'Tab'){
      const tr   = editing.closest('tr');
      const ci   = Array.from(tr.cells).indexOf(editing);
      commitCell(editing);
      const next = e.shiftKey ? tr.cells[ci-1] : tr.cells[ci+1];
      if(next) startEdit(next);
      else {
        // Move to next/prev row first cell
        const sibling = e.shiftKey ? tr.previousElementSibling : tr.nextElementSibling;
        if(sibling) startEdit(sibling.cells[e.shiftKey ? sibling.cells.length-1 : 0]);
      }
      e.preventDefault();
      return;
    }
  });

  /* Save original value before editing so Escape can restore */
  document.addEventListener('focusin', e=>{
    const td = e.target.closest('td.cell-editing');
    if(td && td.dataset.original === undefined){
      td.dataset.original = td.textContent;
    }
  });

  /* ── Keyboard navigation on read-only cells ── */
  /* Arrow keys move the sel-range focus when no cell is being edited */
  const ARROW = {ArrowRight:[0,1], ArrowLeft:[0,-1], ArrowDown:[1,0], ArrowUp:[-1,0]};
  document.addEventListener('keydown', e=>{
    // Skip if editing
    if(document.querySelector('td.cell-editing')) return;
    // Skip if in a text input
    const tag = document.activeElement?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;

    const dir = ARROW[e.key];
    if(!dir) return;

    // Find current anchor cell (the sel-range cell with lowest r,c)
    const selected = [...document.querySelectorAll('.sel-range[data-r]')]
      .filter(td=>+td.dataset.r >= 0);
    if(!selected.length) return;

    const table = selected[0].closest('table.sel-table');
    if(!table) return;

    // Current anchor = cell with min r, min c
    let minR=Infinity, minC=Infinity, maxR=-Infinity, maxC=-Infinity;
    selected.forEach(td=>{
      const r=+td.dataset.r, c=+td.dataset.c;
      if(r<minR)minR=r; if(c<minC)minC=c;
      if(r>maxR)maxR=r; if(c>maxC)maxC=c;
    });

    const newR = (dir[0]>0?maxR:minR) + dir[0];
    const newC = (dir[1]>0?maxC:minC) + dir[1];

    const target = table.querySelector(`td[data-r="${newR}"][data-c="${newC}"]`);
    if(!target) return;

    // Clear previous and select new cell
    table.querySelectorAll('.sel-range').forEach(td=>td.classList.remove('sel-range'));
    if(e.shiftKey){
      // Extend from anchor to target
      const anchorR = dir[0]>0 ? minR : maxR;
      const anchorC = dir[1]>0 ? minC : maxC;
      const lo_r=Math.min(anchorR,newR), hi_r=Math.max(anchorR,newR);
      const lo_c=Math.min(anchorC,newC), hi_c=Math.max(anchorC,newC);
      table.querySelectorAll('td[data-r]').forEach(td=>{
        const r=+td.dataset.r, c=+td.dataset.c;
        if(r>=lo_r&&r<=hi_r&&c>=lo_c&&c<=hi_c) td.classList.add('sel-range');
      });
    } else {
      target.classList.add('sel-range');
    }

    // Scroll into view
    target.scrollIntoView({block:'nearest', inline:'nearest'});
    e.preventDefault();
  });

  /* After any table re-render (MutationObserver fires), lock cells */
  const lockObserver = new MutationObserver(muts=>{
    muts.forEach(m=>{
      const tbl = m.target.closest?.('table.sel-table') || m.target.querySelector?.('table.sel-table');
      if(tbl) makeCellsReadonly(tbl);
    });
  });
  document.addEventListener('DOMContentLoaded', ()=>{
    // Only observe EDITABLE spreadsheet containers (NOT .table-wrap — that's read-only search)
    document.querySelectorAll('.others-sheet-table-wrap,.sheets-table-wrap,.compare-sheet-area,.obs-table-wrap').forEach(wrap=>{
      lockObserver.observe(wrap, {childList:true, subtree:false}); // subtree:false = only direct children, not every cell
    });
    document.querySelectorAll('table.sel-table').forEach(makeCellsReadonly);
  });

})();

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE — rAF render queue
   ═══════════════════════════════════════════════════════════════ */
window._rafQueue = [];
window._rafPending = false;
window.scheduleRender = function(fn){
  _rafQueue.push(fn);
  if(!_rafPending){
    _rafPending = true;
    requestAnimationFrame(()=>{
      const q = _rafQueue.splice(0);
      _rafPending = false;
      q.forEach(f=>f());
    });
  }
};

/* ═══════════════════════════════════════════════════════════════
   ELECTRON INTEGRATION
   Solo activo cuando corre dentro de Electron (window.electronAPI)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  const api = window.electronAPI;
  if (!api) return;   // no estamos en Electron → salir

  // Recibir archivos abiertos desde Menú → Archivo → Abrir
  api.onOpenFile(({ name, buffer }) => {
    try {
      const uint8 = new Uint8Array(buffer);
      const blob  = new Blob([uint8]);
      const file  = new File([blob], name);
      handleFile(file);   // función global de app.js
    } catch(e) {
      console.error('Electron open-file error:', e);
    }
  });


})();

/* ═══════════════════════════════════════════════════════════════
   TABLE RANGE SELECT — Native mouse-drag multi-cell selection
   Works on any table with class "sel-table".
   Click drag across cells to highlight a range.
   Ctrl+C copies selected data as TSV to clipboard.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  let _anchor = null;   // { tableId, ri, ci } - start cell
  let _active  = null;  // same table reference during drag
  let _isDragging = false;

  /* Find the closest TD/TH ancestor of an element */
  function cellOf(el){
    while(el && el !== document.body){
      if((el.tagName==='TD'||el.tagName==='TH') && el.closest('table.sel-table')) return el;
      el = el.parentElement;
    }
    return null;
  }

  /* Return {ri, ci} data attributes from a cell */
  function pos(td){
    return { ri: +td.dataset.r, ci: +td.dataset.c };
  }

  /* Apply data-r / data-c to all cells in a .sel-table */
  function indexTable(table){
    Array.from(table.tHead?.rows||[]).forEach((tr,ri)=>{
      Array.from(tr.cells).forEach((td,ci)=>{ td.dataset.r=-1; td.dataset.c=ci; });
    });
    Array.from(table.tBodies).forEach(tb=>{
      Array.from(tb.rows).forEach((tr,ri)=>{
        Array.from(tr.cells).forEach((td,ci)=>{ td.dataset.r=ri; td.dataset.c=ci; });
      });
    });
  }

  /* Re-index whenever a sel-table mutation occurs */
  const mo = new MutationObserver(muts=>{
    const seen = new Set();
    muts.forEach(m=>{
      const tbl = m.target.closest?.('table.sel-table');
      if(tbl && !seen.has(tbl)){ seen.add(tbl); indexTable(tbl); }
    });
  });
  function observeNewTables(){
    document.querySelectorAll('table.sel-table').forEach(t=>{
      if(!t.dataset.selObserved){
        t.dataset.selObserved='1';
        mo.observe(t, {childList:true, subtree:true});
        indexTable(t);
      }
    });
  }
  // Run on any DOM change at main level
  new MutationObserver(()=>observeNewTables()).observe(document.body,{childList:true,subtree:false});
  document.addEventListener('DOMContentLoaded', observeNewTables);

  /* Paint selection: highlight cells in [minR..maxR, minC..maxC] */
  function paint(table, r1, c1, r2, c2){
    const minR=Math.min(r1,r2), maxR=Math.max(r1,r2);
    const minC=Math.min(c1,c2), maxC=Math.max(c1,c2);
    Array.from(table.querySelectorAll('td, th')).forEach(td=>{
      const r=+td.dataset.r, c=+td.dataset.c;
      const inRange = r>=minR && r<=maxR && c>=minC && c<=maxC;
      td.classList.toggle('sel-range', inRange);
    });
  }

  /* Clear all sel-range in a table */
  function clearPaint(table){
    table?.querySelectorAll('.sel-range').forEach(td=>td.classList.remove('sel-range'));
  }

  /* Globally clear all selections */
  function clearAll(){
    document.querySelectorAll('.sel-range').forEach(td=>td.classList.remove('sel-range'));
    document.querySelectorAll('table.sel-table.is-selecting').forEach(t=>t.classList.remove('is-selecting'));
    _anchor=null; _active=null; _isDragging=false;
  }

  /* Mouse down — start selection */
  document.addEventListener('mousedown', e=>{
    const td = cellOf(e.target);
    if(!td){ clearAll(); return; }
    const table = td.closest('table.sel-table');
    // Don't intercept if clicking into contenteditable and already focused
    if(td.isContentEditable && document.activeElement === td) return;

    _isDragging = false;
    clearAll();
    _anchor = { table, ...pos(td) };
    _active = _anchor;
    paint(table, _anchor.ri, _anchor.ci, _anchor.ri, _anchor.ci);
    // Prevent text selection on drag
    if(!td.isContentEditable) e.preventDefault();
  });

  /* Mouse move — extend selection */
  document.addEventListener('mousemove', e=>{
    if(!_anchor || !(e.buttons & 1)) return;
    const td = cellOf(e.target);
    if(!td) return;
    const table = td.closest('table.sel-table');
    if(table !== _anchor.table) return;
    _isDragging = true;
    table.classList.add('is-selecting');
    clearPaint(table);
    paint(table, _anchor.ri, _anchor.ci, +td.dataset.r, +td.dataset.c);
    _active = { table, ...pos(td) };
  });

  /* Mouse up */
  document.addEventListener('mouseup', ()=>{
    _isDragging = false;
  });

  /* Keyboard: Shift+click extends range */
  document.addEventListener('click', e=>{
    if(!e.shiftKey || !_anchor) return;
    const td = cellOf(e.target);
    if(!td) return;
    const table = td.closest('table.sel-table');
    if(table !== _anchor.table) return;
    clearPaint(table);
    paint(table, _anchor.ri, _anchor.ci, +td.dataset.r, +td.dataset.c);
    e.preventDefault();
  });

  /* Ctrl+C — copy selected cells as TSV */
  document.addEventListener('keydown', e=>{
    if(!(e.ctrlKey||e.metaKey) || e.key.toLowerCase()!=='c') return;
    const selected = document.querySelectorAll('.sel-range[data-r]');
    if(!selected.length) return;
    // Get bounding box
    let minR=Infinity,maxR=-Infinity,minC=Infinity,maxC=-Infinity;
    selected.forEach(td=>{
      const r=+td.dataset.r,c=+td.dataset.c;
      if(r<minR)minR=r;if(r>maxR)maxR=r;
      if(c<minC)minC=c;if(c>maxC)maxC=c;
    });
    // Build 2D grid
    const grid={};
    selected.forEach(td=>{ grid[`${td.dataset.r},${td.dataset.c}`]=td.textContent.trim(); });
    const lines=[];
    for(let r=minR;r<=maxR;r++){
      const row=[];
      for(let c=minC;c<=maxC;c++) row.push(grid[`${r},${c}`]||'');
      lines.push(row.join('\t'));
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=lines.join('\n'); ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    });
    // Show brief toast
    if(typeof showToast==='function') showToast(`Copiado: ${selected.length} celdas`, 'ok');
  });

})();

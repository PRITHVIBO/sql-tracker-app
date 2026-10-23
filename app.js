(() => {
  'use strict';
  const STORAGE_KEY = 'queryquest.sql-tracker.v1';
  const CATALOG_VERSION = 3;
  const platformUrls = {
    LeetCode: 'https://leetcode.com/studyplan/top-sql-50/',
    TUF: 'https://takeuforward.org/practice/sql',
    GFG: 'https://www.geeksforgeeks.org/sql/sql-exercises/',
    HackerRank: 'https://www.hackerrank.com/domains/sql',
    DataLemur: 'https://datalemur.com/questions',
    SQLPractice: 'https://www.sqlpractice.in/sql75',
    Custom: ''
  };
  const topicMeta = {
    'Filtering': ['⌕', 'Filter rows with precise conditions'],
    'Filtering & NULL': ['◉', 'Handle missing values'],
    'Filtering & DISTINCT': ['▤', 'Unique rows and view filters'],
    'String Functions': ['Aa', 'Clean and match text'],
    'Joins': ['⛓', 'Connect related tables'],
    'Joins & Aggregation': ['⤳', 'Combine tables and counts'],
    'Self Join & Dates': ['◷', 'Compare rows over time'],
    'Aggregation': ['∑', 'Summaries with aggregate functions'],
    'GROUP BY & HAVING': ['▥', 'Group records and filter groups'],
    'Conditional Aggregation': ['◇', 'CASE expressions inside aggregates'],
    'Date Functions & Aggregation': ['▦', 'Time-based grouping'],
    'Subqueries & Aggregation': ['⌘', 'Nested query patterns'],
    'GROUP BY & DISTINCT': ['≡', 'Count unique values'],
    'Date Functions': ['◷', 'Extract and compare dates'],
    'GROUP BY & Subqueries': ['∑', 'Group-wise comparisons'],
    'Filtering & Sorting': ['↕', 'Sort and filter records'],
    'Weighted Average': ['∿', 'Weighted metrics'],
    'Aggregation & Percentages': ['％', 'Ratios and percentages'],
    'Aggregation & Rounding': ['≈', 'Round calculated metrics'],
    'Joins & NULL': ['⛓', 'Keep missing and unmatched rows'],
    'Weighted Average': ['∿', 'Weighted metrics'],
    'Self Join & Aggregation': ['⛓', 'Connect rows then summarize'],
    'CASE Expressions': ['◇', 'Conditional logic'],
    'Window Functions & Running Total': ['⌁', 'Running totals over ordered rows'],
    'Conditional Aggregation': ['◇', 'Conditional aggregation'],
    'Window Functions & Ranking': ['№', 'Rank rows within a group'],
    'String Matching': ['Aa', 'Search within strings'],
    'DELETE & Window Functions': ['⌫', 'Deduplicate records'],
    'Subqueries': ['⌘', 'Use queries inside queries'],
    'GROUP BY & String Aggregation': ['≡', 'Group and combine text'],
    'Regular Expressions': ['.*', 'Pattern matching'],
    'Aggregation & Grouping': ['∑', 'Summarize and group data'],
    'Joins & Relationships': ['⛓', 'Relate database entities'],
    'Window Functions': ['⌁', 'Analyze rows across a result set'],
    'Self Join & Date Analysis': ['◷', 'Compare row-level dates'],
    'Set Operations': ['∪', 'Combine compatible result sets'],
    'Subqueries & Set Logic': ['⌘', 'Set-based comparisons'],
    'Window Functions & Ranking': ['№', 'Rank results by rule'],
    'Sequences & Window Functions': ['⌁', 'Find runs and ranges'],
    'CTEs & Recursive Queries': ['↳', 'Name intermediate result sets'],
    'SELECT': ['▤', 'Choose columns and rows'],
    'WHERE Filtering': ['⌕', 'Filter with predicates'],
    'Aggregate Functions': ['∑', 'SUM, AVG, MIN, MAX and COUNT'],
    'GROUP BY': ['▥', 'Group rows for summaries'],
    'ORDER BY & LIMIT': ['↕', 'Sort and return top rows'],
    'Views': ['▣', 'Reusable query definitions'],
    'Indexes & Performance': ['ϟ', 'Improve lookup performance'],
    'DML & CRUD': ['✎', 'Insert, update, and delete rows'],
    'Joins': ['⛓', 'Combine records across tables'],
    'Duplicates & GROUP BY': ['≡', 'Find repeated values'],
    'Constraints & Keys': ['⚿', 'Protect data integrity'],
    'Transactions': ['⇄', 'Commit and roll back changes']
  };
  const topicEmoji = ['∑','⛓','⌁','⌕','◷','◇','№','Aa','▥','⌘','∪','↕'];
  const $ = (id) => document.getElementById(id);
  let questions = loadQuestions();
  let activeView = 'dashboard';
  let queueTab = 'All';
  let editingQuestionId = null;
  let openedQueryId = null;
  let currentSelectedIds = new Set();

  function questionKey(q) {
    return `${String(q?.platform || '').trim().toLocaleLowerCase()}|${String(q?.title || '').trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, '')}`;
  }
  function mergeNewCatalogue(savedQuestions) {
    const merged = Array.isArray(savedQuestions) ? [...savedQuestions] : [];
    const known = new Set(merged.map(questionKey));
    (window.SEED_QUESTIONS || []).forEach(seed => {
      const key = questionKey(seed);
      if (!seed.title || known.has(key)) return;
      merged.push({ ...seed, status: 'Not Started', attempts: 0, statement: '', bruteQuery: '', optimizedQuery: '', explanation: '', complexityTime: '', complexitySpace: '', notes: '', lastPracticed: '' });
      known.add(key);
    });
    return merged;
  }
  function loadQuestions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.questions)) {
          if (Number(parsed.catalogVersion || 0) < CATALOG_VERSION) {
            const merged = mergeNewCatalogue(parsed.questions);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, catalogVersion: CATALOG_VERSION, savedAt: new Date().toISOString(), questions: merged }));
            return merged;
          }
          return parsed.questions;
        }
      }
    } catch (error) { console.warn('Could not load saved SQL tracker data:', error); }
    return (window.SEED_QUESTIONS || []).map(q => ({ ...q }));
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, catalogVersion: CATALOG_VERSION, savedAt: new Date().toISOString(), questions }));
      return true;
    } catch (error) {
      toast('Unable to save to this browser. Export a JSON backup and free some storage.', true);
      console.error(error);
      return false;
    }
  }
  function uid() { return 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function safeUrl(value) {
    try { const u = new URL(String(value || '')); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; }
    catch { return ''; }
  }
  function toast(message, isError = false) {
    const node = document.createElement('div');
    node.className = 'toast' + (isError ? ' error' : '');
    node.textContent = message;
    $('toastRegion').appendChild(node);
    window.setTimeout(() => node.remove(), 3200);
  }
  function downloadFile(filename, contents, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function slugify(text) { return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55) || 'sql-question'; }
  function dateStamp() { return new Date().toISOString().slice(0, 10); }
  function getQuestion(id) { return questions.find(q => q.id === id); }
  function isQuerySaved(q) { return Boolean((q.bruteQuery || '').trim() || (q.optimizedQuery || '').trim()); }
  function hasAnyNotes(q) { return Boolean(isQuerySaved(q) || (q.explanation || '').trim() || (q.notes || '').trim()); }
  function normalizeQuestion(q, fallbackPlatform = 'Custom') {
    const now = new Date().toISOString();
    const title = String(q.title || q.question || q.name || q.question_title || q.problem_title || q.problem || '').trim();
    if (!title) return null;
    const platformRaw = String(q.platform || q.source || fallbackPlatform).trim();
    const platformKey = platformRaw.toLowerCase().replace(/[^a-z]/g, '');
    const platform = ['leetcode','lc'].includes(platformKey) ? 'LeetCode' : ['tuf','takeuforward'].includes(platformKey) ? 'TUF' : ['gfg','geeksforgeeks'].includes(platformKey) ? 'GFG' : ['hackerrank','hr'].includes(platformKey) ? 'HackerRank' : ['datalemur','dl'].includes(platformKey) ? 'DataLemur' : ['sqlpractice','sqlpracticein','sp'].includes(platformKey) ? 'SQLPractice' : 'Custom';
    const difficultyRaw = String(q.difficulty || 'Medium').trim().toLowerCase();
    const difficulty = difficultyRaw.startsWith('e') ? 'Easy' : difficultyRaw.startsWith('h') ? 'Hard' : 'Medium';
    const statusRaw = String(q.status || 'Not Started').trim().toLowerCase();
    const status = statusRaw.includes('solv') || statusRaw.includes('done') || statusRaw.includes('complete') ? 'Solved' : statusRaw.includes('progress') || statusRaw.includes('attempt') ? 'In Progress' : statusRaw.includes('review') || statusRaw.includes('revisit') ? 'Review' : 'Not Started';
    return {
      id: q.id || uid(), title, platform,
      topic: String(q.topic || q.tags || 'Other').trim() || 'Other',
      difficulty, url: safeUrl(q.url || q.link || q.problemUrl || ''), status,
      attempts: Math.max(0, Number(q.attempts || 0) || 0),
      statement: String(q.statement || q.problemStatement || ''),
      bruteQuery: String(q.bruteQuery || q.brute_force || q.brute || ''),
      optimizedQuery: String(q.optimizedQuery || q.optimized_query || q.optimized || ''),
      explanation: String(q.explanation || q.approach || ''),
      complexityTime: String(q.complexityTime || q.timeComplexity || ''),
      complexitySpace: String(q.complexitySpace || q.spaceComplexity || ''),
      notes: String(q.notes || q.revisionNote || ''),
      lastPracticed: String(q.lastPracticed || q.last_practiced || ''),
      createdAt: q.createdAt || now, updatedAt: now
    };
  }
  function switchView(view) {
    if (!['dashboard','questions','practice','saved'].includes(view)) view = 'dashboard';
    activeView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const labels = {dashboard:'Dashboard',questions:'All questions',practice:'Practice queue',saved:'Saved SQL'};
    $('breadcrumbCurrent').textContent = labels[view];
    document.title = `QueryQuest — ${labels[view]}`;
    $('sidebar').classList.remove('open');
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function filteredQuestions() {
    const search = ($('questionSearch')?.value || $('globalSearch').value || '').trim().toLowerCase();
    const platform = $('filterPlatform').value;
    const topic = $('filterTopic').value;
    const difficulty = $('filterDifficulty').value;
    const status = $('filterStatus').value;
    return questions.filter(q => {
      const hay = `${q.title} ${q.topic} ${q.platform} ${q.statement} ${q.notes}`.toLowerCase();
      return (!search || hay.includes(search)) && (platform === 'All' || q.platform === platform) && (topic === 'All' || q.topic === topic) && (difficulty === 'All' || q.difficulty === difficulty) && (status === 'All' || q.status === status);
    }).sort((a,b) => a.title.localeCompare(b.title));
  }
  function statusClass(status) { return String(status).toLowerCase().replace(/\s+/g, '-'); }
  function platformLetter(platform) { return ({LeetCode:'L',TUF:'T',GFG:'G',HackerRank:'H',DataLemur:'D',SQLPractice:'S',Custom:'Q'})[platform] || 'Q'; }
  function platformClass(platform) { return ({LeetCode:'lc',TUF:'tuf',GFG:'gfg',HackerRank:'hr',DataLemur:'dl',SQLPractice:'sp',Custom:'custom'})[platform] || 'custom'; }
  function difficultyClass(difficulty) { return String(difficulty).toLowerCase(); }
  function statusBadge(status) { return `<span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span>`; }
  function difficultyBadge(difficulty) { return `<span class="difficulty-badge ${difficultyClass(difficulty)}">${escapeHtml(difficulty)}</span>`; }
  function renderStats() {
    const total = questions.length;
    const solved = questions.filter(q => q.status === 'Solved').length;
    const progress = questions.filter(q => q.status === 'In Progress').length;
    const queries = questions.reduce((sum,q) => sum + Boolean((q.bruteQuery || '').trim()) + Boolean((q.optimizedQuery || '').trim()), 0);
    const rate = total ? Math.round(solved / total * 100) : 0;
    $('navQuestionCount').textContent = total;
    $('statTotal').textContent = total;
    $('statSolved').textContent = solved;
    $('statProgress').textContent = progress;
    $('statQueries').textContent = queries;
    $('solvedRate').textContent = `${rate}%`;
    $('solvedBar').style.width = `${rate}%`;
    $('progressBar').style.width = `${total ? Math.round(progress / total * 100) : 0}%`;
    $('queriesBar').style.width = `${total ? Math.min(100, Math.round(queries / (total * 2) * 100)) : 0}%`;
    $('todaySolved').textContent = `${questions.filter(q => q.status === 'Solved' && (q.lastPracticed || '').slice(0,10) === dateStamp()).length} solved`;
    $('sourceCount').textContent = `Across ${new Set(questions.map(q => q.platform)).size} platform${new Set(questions.map(q => q.platform)).size === 1 ? '' : 's'}`;
    $('difficultyTotal').textContent = total;
    const counts = ['Easy','Medium','Hard'].map(d => [d, questions.filter(q => q.difficulty === d).length]);
    $('difficultyChart').innerHTML = counts.map(([d,n]) => `<div class="difficulty-row"><span class="diff-name">${d}</span><div class="difficulty-track"><div class="difficulty-fill ${d.toLowerCase()}" style="width:${total ? n / total * 100 : 0}%"></div></div><span class="difficulty-number">${n}</span></div>`).join('');
  }
  function renderResume() {
    const priority = [...questions.filter(q => q.status === 'In Progress'), ...questions.filter(q => q.status === 'Review'), ...questions.filter(q => q.status === 'Not Started')].slice(0,4);
    if (!priority.length) {
      $('resumeList').innerHTML = `<div class="queue-empty"><strong>You're all caught up.</strong> Add more questions or import your next practice sheet.</div>`;
      return;
    }
    $('resumeList').innerHTML = priority.map(q => `<div class="resume-item"><div class="resume-icon ${platformClass(q.platform)}">${platformLetter(q.platform)}</div><div style="min-width:0"><div class="resume-title">${escapeHtml(q.title)}</div><div class="resume-meta">${escapeHtml(q.topic)} · ${escapeHtml(q.difficulty)} · ${escapeHtml(q.platform)}</div></div><button class="row-action" title="Open SQL workspace" data-query="${escapeHtml(q.id)}">↗</button></div>`).join('');
  }
  function renderTopics() {
    const previousTopic = $('filterTopic').value;
    const group = new Map();
    questions.forEach(q => {
      if (!group.has(q.topic)) group.set(q.topic, {total:0, solved:0});
      const v = group.get(q.topic); v.total++; if (q.status === 'Solved') v.solved++;
    });
    const list = [...group.entries()].sort((a,b) => b[1].total - a[1].total || a[0].localeCompare(b[0])).slice(0,8);
    $('topicGrid').innerHTML = list.map(([topic,info], i) => {
      const meta = topicMeta[topic] || [topicEmoji[i % topicEmoji.length], 'Build confidence in this SQL pattern'];
      const progress = info.total ? info.solved/info.total*100 : 0;
      return `<button class="topic-card" data-topic="${escapeHtml(topic)}"><div class="topic-top"><span class="topic-emoji">${escapeHtml(meta[0])}</span><span class="topic-count">${info.total} Qs</span></div><div class="topic-name" title="${escapeHtml(topic)}">${escapeHtml(topic)}</div><div class="topic-progress"><span style="width:${progress}%"></span></div><div class="topic-meta"><span>${info.solved} solved</span><span>${Math.round(progress)}%</span></div></button>`;
    }).join('');
    const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    $('filterTopic').innerHTML = `<option value="All">All topics</option>` + topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    $('filterTopic').value = topics.includes(previousTopic) ? previousTopic : 'All';
    $('topicOptions').innerHTML = topics.map(t => `<option value="${escapeHtml(t)}"></option>`).join('');
  }
  function renderQuestionsTable() {
    const data = filteredQuestions();
    $('resultsCount').textContent = data.length;
    $('tableFooterText').textContent = `Showing ${data.length} of ${questions.length} questions · changes save in this browser`;
    $('questionsTableBody').innerHTML = data.map((q, i) => {
      const url = safeUrl(q.url);
      return `<tr><td class="checkbox-col"><input type="checkbox" class="row-select" data-select="${escapeHtml(q.id)}" aria-label="Select ${escapeHtml(q.title)}" ${currentSelectedIds.has(q.id)?'checked':''}></td><td><div class="question-title-cell"><span class="q-number-icon">${String(i+1).padStart(2,'0')}</span><div style="min-width:0"><div class="q-name">${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" title="Open on source platform">${escapeHtml(q.title)} ↗</a>` : escapeHtml(q.title)}</div><div class="q-subtitle">${q.attempts ? `${q.attempts} attempt${q.attempts===1?'':'s'}` : 'Not attempted yet'}${q.lastPracticed ? ` · Last practiced ${escapeHtml(q.lastPracticed)}` : ''}</div></div></div></td><td><span class="platform-tag ${platformClass(q.platform)}">${escapeHtml(q.platform === 'TUF' ? 'TakeUForward' : q.platform === 'GFG' ? 'GeeksforGeeks' : q.platform)}</span></td><td><span class="topic-label" title="${escapeHtml(q.topic)}">${escapeHtml(q.topic)}</span></td><td>${difficultyBadge(q.difficulty)}</td><td><select class="inline-status" data-status-id="${escapeHtml(q.id)}" aria-label="Change status for ${escapeHtml(q.title)}"><option ${q.status==='Not Started'?'selected':''}>Not Started</option><option ${q.status==='In Progress'?'selected':''}>In Progress</option><option ${q.status==='Solved'?'selected':''}>Solved</option><option ${q.status==='Review'?'selected':''}>Review</option></select></td><td><div class="row-actions"><button class="row-action" title="Open query workspace" data-query="${escapeHtml(q.id)}">⌘</button><button class="row-action" title="Edit question" data-edit="${escapeHtml(q.id)}">✎</button><button class="row-action danger" title="Delete question" data-delete="${escapeHtml(q.id)}">×</button></div></td></tr>`;
    }).join('');
    $('emptyQuestions').hidden = data.length !== 0;
    $('questionsTableBody').parentElement.style.display = data.length ? '' : 'none';
    const allChecked = data.length > 0 && data.every(q => currentSelectedIds.has(q.id));
    $('selectAllRows').checked = allChecked;
    updateBulkActions();
  }
  function updateBulkActions() {
    const selected = [...currentSelectedIds].filter(id => questions.some(q => q.id === id));
    currentSelectedIds = new Set(selected);
    $('bulkActions').hidden = selected.length === 0;
    $('selectedCount').textContent = `${selected.length} selected`;
  }
  function renderQueue() {
    const pending = questions.filter(q => q.status !== 'Solved');
    const inProgress = questions.filter(q => q.status === 'In Progress').length;
    const review = questions.filter(q => q.status === 'Review').length;
    $('queueSummary').innerHTML = `<div class="queue-summary-card"><div class="queue-summary-icon">☷</div><div><strong>${pending.length}</strong><span>Questions to practice</span></div></div><div class="queue-summary-card"><div class="queue-summary-icon">◷</div><div><strong>${inProgress}</strong><span>Currently in progress</span></div></div><div class="queue-summary-card"><div class="queue-summary-icon">↻</div><div><strong>${review}</strong><span>Flagged for revision</span></div></div>`;
    let data = questions.filter(q => q.status !== 'Solved');
    if (queueTab !== 'All') data = data.filter(q => q.status === queueTab);
    if ($('queueDifficulty').value !== 'All') data = data.filter(q => q.difficulty === $('queueDifficulty').value);
    data.sort((a,b) => (({'In Progress':0,'Review':1,'Not Started':2}[a.status]) - ({'In Progress':0,'Review':1,'Not Started':2}[b.status])) || a.title.localeCompare(b.title));
    if (!data.length) {
      $('queueGrid').innerHTML = `<div class="queue-empty"><strong>${pending.length ? 'No questions in this filter.' : 'Your queue is clear!'}</strong>${pending.length ? 'Try a different status or difficulty.' : 'Mark questions for review or add a new one to keep learning.'}</div>`;
      return;
    }
    $('queueGrid').innerHTML = data.map(q => `<article class="queue-card"><div class="queue-card-head"><div class="queue-card-platform ${platformClass(q.platform)}">${platformLetter(q.platform)}</div><div style="min-width:0;flex:1"><h3 class="queue-card-title">${escapeHtml(q.title)}</h3><div class="queue-card-meta">${difficultyBadge(q.difficulty)}<span class="platform-tag ${platformClass(q.platform)}">${escapeHtml(q.platform === 'TUF' ? 'TUF' : q.platform)}</span></div></div>${statusBadge(q.status)}</div><div class="queue-card-topic">Topic: <strong>${escapeHtml(q.topic)}</strong>${q.attempts ? ` · ${q.attempts} attempt${q.attempts===1?'':'s'}` : ''}</div><div class="queue-card-bottom"><button class="btn btn-primary" data-query="${escapeHtml(q.id)}">Open practice workspace <span>→</span></button>${q.url ? `<a class="row-action" href="${escapeHtml(safeUrl(q.url))}" target="_blank" rel="noopener" title="Open source">↗</a>` : ''}<button class="row-action" data-edit="${escapeHtml(q.id)}" title="Edit">✎</button></div></article>`).join('');
  }
  function renderSavedQueries() {
    const search = $('savedSearch').value.trim().toLowerCase();
    const kind = $('savedKind').value;
    const data = questions.filter(q => hasAnyNotes(q) && `${q.title} ${q.topic} ${q.platform} ${q.explanation} ${q.notes}`.toLowerCase().includes(search) && (kind === 'All' || (kind === 'Brute force' ? Boolean((q.bruteQuery||'').trim()) : Boolean((q.optimizedQuery||'').trim())))).sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    const bruteCount = questions.filter(q => (q.bruteQuery||'').trim()).length;
    const optCount = questions.filter(q => (q.optimizedQuery||'').trim()).length;
    $('savedSummary').innerHTML = `<div class="saved-summary-main"><strong>${bruteCount + optCount}</strong><span>query versions saved</span></div><div class="saved-summary-divider"></div><div class="saved-summary-note"><strong style="color:#4d5b72">${bruteCount} brute force</strong> · <strong style="color:#168d6c">${optCount} optimized</strong><br>Save at least one SQL version in a question workspace.</div><button class="btn btn-secondary btn-small" id="savedExportInline">↓ Download .txt</button>`;
    if (!data.length) {
      $('savedQueryList').innerHTML = `<div class="saved-empty"><div class="empty-icon">⌘</div><h3>No saved SQL yet</h3><p>Open a question’s workspace and paste your first or optimized query. Both versions can be exported as plain text.</p><button class="btn btn-primary" data-go="practice">Start practicing <span>→</span></button></div>`;
      return;
    }
    $('savedQueryList').innerHTML = data.map(q => `<article class="saved-query-card"><div class="saved-query-head"><div><div class="saved-query-title">${escapeHtml(q.title)}</div><div class="saved-query-meta">${escapeHtml(q.platform)} <span>·</span> ${escapeHtml(q.topic)} <span>·</span> ${escapeHtml(q.difficulty)} ${statusBadge(q.status)}</div></div><div class="saved-query-actions"><button class="btn btn-small btn-outline" data-query="${escapeHtml(q.id)}">Edit solution</button><button class="btn btn-small btn-outline" data-export-single="${escapeHtml(q.id)}">Export TXT</button></div></div><div class="saved-query-panes"><div class="saved-query-pane"><div class="saved-query-pane-label"><span class="editor-dot"></span> BRUTE FORCE</div>${(q.bruteQuery||'').trim() ? `<pre>${escapeHtml(q.bruteQuery)}</pre>` : `<div class="saved-query-empty">No brute-force query saved.</div>`}</div><div class="saved-query-pane"><div class="saved-query-pane-label"><span class="editor-dot optimized-dot"></span> OPTIMIZED</div>${(q.optimizedQuery||'').trim() ? `<pre>${escapeHtml(q.optimizedQuery)}</pre>` : `<div class="saved-query-empty">No optimized query saved.</div>`}</div></div>${(q.explanation||'').trim() || (q.notes||'').trim() || q.complexityTime || q.complexitySpace ? `<div class="saved-explanation">${q.explanation ? `<strong>Approach:</strong> ${escapeHtml(q.explanation)} ` : ''}${q.complexityTime ? `<strong>Time:</strong> ${escapeHtml(q.complexityTime)} ` : ''}${q.complexitySpace ? `<strong>Space:</strong> ${escapeHtml(q.complexitySpace)} ` : ''}${q.notes ? `<br><strong>Revision note:</strong> ${escapeHtml(q.notes)}` : ''}</div>` : ''}</article>`).join('');
  }
  function renderAll() {
    renderStats(); renderResume(); renderTopics(); renderQuestionsTable(); renderQueue(); renderSavedQueries();
  }
  function openModal(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(id) { $(id).hidden = true; if (!document.querySelector('.modal-backdrop:not([hidden])')) document.body.style.overflow = ''; }
  function openQuestionModal(id = null) {
    editingQuestionId = id;
    const q = id ? getQuestion(id) : null;
    $('questionModalTitle').textContent = q ? 'Edit question' : 'Add a question';
    $('questionId').value = q?.id || '';
    $('questionTitle').value = q?.title || '';
    $('questionPlatform').value = q?.platform || 'LeetCode';
    $('questionDifficulty').value = q?.difficulty || 'Easy';
    $('questionTopic').value = q?.topic || '';
    $('questionStatus').value = q?.status || 'Not Started';
    $('questionUrl').value = q?.url || '';
    $('questionStatement').value = q?.statement || '';
    $('questionNotes').value = q?.notes || '';
    openModal('questionModal');
    window.setTimeout(() => $('questionTitle').focus(), 40);
  }
  function openQueryModal(id) {
    const q = getQuestion(id);
    if (!q) return;
    openedQueryId = q.id;
    $('queryQuestionId').value = q.id;
    $('queryModalTitle').textContent = q.title;
    $('queryModalSubtitle').textContent = `${q.platform} · ${q.topic} · ${q.difficulty}${q.url ? ' · Source opens in a separate tab' : ''}`;
    $('bruteQuery').value = q.bruteQuery || '';
    $('optimizedQuery').value = q.optimizedQuery || '';
    $('queryStatus').value = q.status || 'Not Started';
    $('queryAttempts').value = Number(q.attempts || 0);
    $('complexityTime').value = q.complexityTime || '';
    $('complexitySpace').value = q.complexitySpace || '';
    $('queryExplanation').value = q.explanation || '';
    $('queryNotes').value = q.notes || '';
    openModal('queryModal');
  }
  function deleteQuestion(id) {
    const q = getQuestion(id); if (!q) return;
    if (!window.confirm(`Delete “${q.title}” and its saved SQL? This cannot be undone unless you have a backup.`)) return;
    questions = questions.filter(x => x.id !== id); currentSelectedIds.delete(id); persist(); renderAll(); toast('Question deleted.');
  }
  function saveQuestion(event) {
    event.preventDefault();
    const id = $('questionId').value;
    const old = id ? getQuestion(id) : null;
    const now = new Date().toISOString();
    const urlText = $('questionUrl').value.trim();
    if (urlText && !safeUrl(urlText)) { toast('Enter a valid http:// or https:// URL.', true); return; }
    const q = normalizeQuestion({
      ...(old || {}), id: old?.id || uid(), title: $('questionTitle').value,
      platform: $('questionPlatform').value, topic: $('questionTopic').value,
      difficulty: $('questionDifficulty').value, status: $('questionStatus').value,
      url: urlText, statement: $('questionStatement').value, notes: $('questionNotes').value,
      attempts: old?.attempts || 0, bruteQuery: old?.bruteQuery || '', optimizedQuery: old?.optimizedQuery || '',
      explanation: old?.explanation || '', complexityTime: old?.complexityTime || '', complexitySpace: old?.complexitySpace || '',
      createdAt: old?.createdAt || now, updatedAt: now,
      lastPracticed: old?.lastPracticed || ($('questionStatus').value === 'Solved' ? dateStamp() : '')
    });
    if (old) questions = questions.map(x => x.id === old.id ? q : x); else questions.push(q);
    persist(); closeModal('questionModal'); renderAll(); toast(old ? 'Question updated.' : 'Question added to your bank.');
  }
  function saveQuery(event) {
    event.preventDefault();
    const q = getQuestion($('queryQuestionId').value);
    if (!q) { toast('Question no longer exists in the bank.', true); return; }
    const previousStatus = q.status;
    q.bruteQuery = $('bruteQuery').value;
    q.optimizedQuery = $('optimizedQuery').value;
    q.status = $('queryStatus').value;
    q.attempts = Math.max(0, parseInt($('queryAttempts').value || '0', 10) || 0);
    q.complexityTime = $('complexityTime').value.trim();
    q.complexitySpace = $('complexitySpace').value.trim();
    q.explanation = $('queryExplanation').value.trim();
    q.notes = $('queryNotes').value.trim();
    q.updatedAt = new Date().toISOString();
    if (q.status === 'Solved' || q.status !== previousStatus || q.bruteQuery.trim() || q.optimizedQuery.trim()) q.lastPracticed = dateStamp();
    if (q.status === 'In Progress' && q.attempts === 0) q.attempts = 1;
    persist(); closeModal('queryModal'); renderAll(); toast('Solution saved on this device.');
  }
  function exportQuestionTxt(id) {
    const q = getQuestion(id); if (!q) return;
    const lines = [
      `QUESTION: ${q.title}`, `PLATFORM: ${q.platform}`, `TOPIC: ${q.topic}`, `DIFFICULTY: ${q.difficulty}`, `STATUS: ${q.status}`, `SOURCE URL: ${q.url || '(not set)'}`,
      `ATTEMPTS: ${q.attempts || 0}`, `LAST PRACTICED: ${q.lastPracticed || '(not yet)'}`, '', '=== QUESTION / REMINDER ===', q.statement || '(not added)', '',
      '=== BRUTE FORCE SQL ===', q.bruteQuery || '(not saved)', '', '=== OPTIMIZED SQL ===', q.optimizedQuery || '(not saved)', '',
      '=== APPROACH / EXPLANATION ===', q.explanation || '(not added)', '', `TIME COMPLEXITY: ${q.complexityTime || '(not added)'}`, `SPACE COMPLEXITY: ${q.complexitySpace || '(not added)'}`, '', '=== REVISION NOTES ===', q.notes || '(not added)', '', `Exported from QueryQuest on ${new Date().toLocaleString()}`
    ];
    downloadFile(`${slugify(q.title)}-sql-notes.txt`, lines.join('\n'), 'text/plain;charset=utf-8');
    toast('TXT file downloaded.');
  }
  function exportAllTxt() {
    const saved = questions.filter(q => hasAnyNotes(q));
    const all = questions.filter(q => isQuerySaved(q));
    if (!all.length && !saved.length) { toast('Save at least one query or explanation first.', true); return; }
    const chunks = [`QUERYQUEST SQL TRACKER — SAVED SOLUTIONS`, `Exported: ${new Date().toLocaleString()}`, `Questions in bank: ${questions.length}`, `Questions with saved notes/SQL: ${saved.length}`, '\n' + '='.repeat(78)];
    saved.sort((a,b) => a.title.localeCompare(b.title)).forEach(q => {
      chunks.push('', `QUESTION: ${q.title}`, `PLATFORM: ${q.platform} | TOPIC: ${q.topic} | DIFFICULTY: ${q.difficulty} | STATUS: ${q.status}`, `URL: ${q.url || '(not set)'}`, '', '--- BRUTE FORCE SQL ---', q.bruteQuery || '(not saved)', '', '--- OPTIMIZED SQL ---', q.optimizedQuery || '(not saved)', '', '--- EXPLANATION ---', q.explanation || '(not added)', `Time complexity: ${q.complexityTime || '(not added)'}`, `Space complexity: ${q.complexitySpace || '(not added)'}`, '', '--- REVISION NOTES ---', q.notes || '(not added)', '', '-'.repeat(78));
    });
    downloadFile(`queryquest-sql-solutions-${dateStamp()}.txt`, chunks.join('\n'), 'text/plain;charset=utf-8');
    toast(`Exported ${saved.length} question note(s) to TXT.`);
  }
  function exportJson() {
    const data = { app: 'QueryQuest SQL Tracker', version: 1, exportedAt: new Date().toISOString(), questions };
    downloadFile(`queryquest-backup-${dateStamp()}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
    toast('JSON backup downloaded.');
  }
  function csvEscape(value) { const s = String(value ?? ''); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
  const CSV_FIELDS = ['title','platform','topic','difficulty','status','url','attempts','statement','bruteQuery','optimizedQuery','explanation','complexityTime','complexitySpace','notes','lastPracticed'];
  function exportCsv() {
    const body = [CSV_FIELDS.join(','), ...questions.map(q => CSV_FIELDS.map(k => csvEscape(q[k])).join(','))].join('\r\n');
    downloadFile(`queryquest-questions-${dateStamp()}.csv`, '\ufeff' + body, 'text/csv;charset=utf-8');
    toast('Question bank exported to CSV.');
  }
  function parseCsv(text) {
    const rows = []; let row = [], field = '', quote = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i+1];
      if (quote) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') quote = false;
        else field += c;
      } else {
        if (c === '"' && field.length === 0) quote = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row=[]; field=''; }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim() !== ''));
  }
  function importCsvFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result || '').replace(/^\ufeff/, ''));
        if (rows.length < 2) { toast('CSV needs a header row and at least one question.', true); return; }
        const headers = rows.shift().map(h => h.trim().toLowerCase().replace(/[\s-]+/g, '_'));
        const imported = [];
        rows.forEach(row => {
          const obj = {}; headers.forEach((h, i) => obj[h] = row[i] ?? '');
          const q = normalizeQuestion(obj); if (q) imported.push(q);
        });
        if (!imported.length) { toast('No valid question titles found in the CSV.', true); return; }
        const existingKeys = new Set(questions.map(q => `${q.platform.toLowerCase()}|${q.title.toLowerCase()}`));
        const unique = imported.filter(q => !existingKeys.has(`${q.platform.toLowerCase()}|${q.title.toLowerCase()}`));
        questions.push(...unique); persist(); renderAll(); toast(`Imported ${unique.length} new question(s).${imported.length !== unique.length ? ` Skipped ${imported.length - unique.length} duplicate(s).` : ''}`);
      } catch (error) { console.error(error); toast('Could not read this CSV. Check the headers and file format.', true); }
    };
    reader.onerror = () => toast('Could not read that file.', true);
    reader.readAsText(file);
  }
  function importJsonFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const list = Array.isArray(parsed) ? parsed : parsed.questions;
        if (!Array.isArray(list)) throw new Error('No questions array');
        const cleaned = list.map(q => normalizeQuestion(q)).filter(Boolean);
        if (!window.confirm(`Restore ${cleaned.length} question(s) from this backup? This replaces the current question bank.`)) return;
        questions = cleaned; currentSelectedIds.clear(); persist(); renderAll(); closeModal('dataModal'); toast(`Restored ${cleaned.length} question(s) from backup.`);
      } catch (error) { console.error(error); toast('That JSON file is not a valid QueryQuest backup.', true); }
    };
    reader.onerror = () => toast('Could not read that backup file.', true);
    reader.readAsText(file);
  }
  function bulkUpdateStatus() {
    const status = $('bulkStatus').value;
    if (!status) { toast('Choose the status to apply.', true); return; }
    const now = new Date().toISOString();
    questions = questions.map(q => currentSelectedIds.has(q.id) ? ({ ...q, status, lastPracticed: (status === 'Solved' || status === 'In Progress') ? dateStamp() : q.lastPracticed, updatedAt: now }) : q);
    currentSelectedIds.clear(); persist(); renderAll(); toast(`Updated selected question status to ${status}.`);
  }
  function randomPractice() {
    const pending = questions.filter(q => q.status !== 'Solved');
    if (!pending.length) { toast('Everything is marked solved. Add or reopen a question to practice.', true); return; }
    const q = pending[Math.floor(Math.random() * pending.length)];
    if (q.status === 'Not Started') q.status = 'In Progress';
    if (!q.attempts) q.attempts = 1;
    q.lastPracticed = dateStamp(); q.updatedAt = new Date().toISOString(); persist(); switchView('practice'); renderQueue(); openQueryModal(q.id);
  }

  // Navigation and common actions
  document.querySelectorAll('.nav-link').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
  document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.go)));
  document.querySelectorAll('.platform-link').forEach(btn => btn.addEventListener('click', () => { $('filterPlatform').value = btn.dataset.platform; $('globalSearch').value = ''; $('questionSearch').value = ''; switchView('questions'); renderQuestionsTable(); }));
  $('mobileMenu').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  $('addQuestionHero').addEventListener('click', () => openQuestionModal());
  $('addQuestionBtn').addEventListener('click', () => openQuestionModal());
  $('emptyAddBtn').addEventListener('click', () => openQuestionModal());
  $('startPracticeHero').addEventListener('click', () => switchView('practice'));
  $('practiceRandomBtn').addEventListener('click', randomPractice);
  $('questionForm').addEventListener('submit', saveQuestion);
  $('queryForm').addEventListener('submit', saveQuery);
  document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(backdrop.id); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(m => closeModal(m.id)); if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('globalSearch').focus(); } });
  $('questionSearch').addEventListener('input', () => { $('globalSearch').value = ''; renderQuestionsTable(); });
  $('globalSearch').addEventListener('input', () => { if ($('globalSearch').value && activeView !== 'questions') switchView('questions'); $('questionSearch').value = $('globalSearch').value; renderQuestionsTable(); });
  ['filterPlatform','filterTopic','filterDifficulty','filterStatus'].forEach(id => $(id).addEventListener('change', renderQuestionsTable));
  $('resetFilters').addEventListener('click', () => { $('questionSearch').value=''; $('globalSearch').value=''; $('filterPlatform').value='All'; $('filterTopic').value='All'; $('filterDifficulty').value='All'; $('filterStatus').value='All'; currentSelectedIds.clear(); renderQuestionsTable(); });
  $('questionsTableBody').addEventListener('click', e => {
    const query = e.target.closest('[data-query]'); if (query) { openQueryModal(query.dataset.query); return; }
    const edit = e.target.closest('[data-edit]'); if (edit) { openQuestionModal(edit.dataset.edit); return; }
    const del = e.target.closest('[data-delete]'); if (del) { deleteQuestion(del.dataset.delete); }
  });
  $('questionsTableBody').addEventListener('change', e => {
    const box = e.target.closest('[data-select]');
    if (box) { if (box.checked) currentSelectedIds.add(box.dataset.select); else currentSelectedIds.delete(box.dataset.select); updateBulkActions(); return; }
    const select = e.target.closest('[data-status-id]');
    if (select) { const q = getQuestion(select.dataset.statusId); if (!q) return; q.status = select.value; q.updatedAt = new Date().toISOString(); if (q.status === 'Solved' || q.status === 'In Progress') q.lastPracticed = dateStamp(); persist(); renderAll(); toast('Progress updated.'); }
  });
  $('selectAllRows').addEventListener('change', () => {
    filteredQuestions().forEach(q => { if ($('selectAllRows').checked) currentSelectedIds.add(q.id); else currentSelectedIds.delete(q.id); }); renderQuestionsTable();
  });
  $('applyBulkStatus').addEventListener('click', bulkUpdateStatus);
  $('deleteSelected').addEventListener('click', () => {
    const n = currentSelectedIds.size; if (!n) return;
    if (!confirm(`Delete ${n} selected question(s) and all saved queries inside them?`)) return;
    questions = questions.filter(q => !currentSelectedIds.has(q.id)); currentSelectedIds.clear(); persist(); renderAll(); toast(`Deleted ${n} question(s).`);
  });
  $('topicGrid').addEventListener('click', e => { const btn = e.target.closest('[data-topic]'); if (!btn) return; switchView('questions'); $('filterTopic').value = btn.dataset.topic; renderQuestionsTable(); });
  $('queueGrid').addEventListener('click', e => { const query = e.target.closest('[data-query]'); if (query) { openQueryModal(query.dataset.query); return; } const edit = e.target.closest('[data-edit]'); if (edit) openQuestionModal(edit.dataset.edit); });
  $('resumeList').addEventListener('click', e => { const query = e.target.closest('[data-query]'); if (query) openQueryModal(query.dataset.query); });
  $('queueSegments').addEventListener('click', e => { const btn = e.target.closest('[data-queue]'); if (!btn) return; queueTab = btn.dataset.queue; $('queueSegments').querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === btn)); renderQueue(); });
  $('queueDifficulty').addEventListener('change', renderQueue);
  $('savedSearch').addEventListener('input', renderSavedQueries); $('savedKind').addEventListener('change', renderSavedQueries);
  $('savedQueryList').addEventListener('click', e => { const query = e.target.closest('[data-query]'); if (query) { openQueryModal(query.dataset.query); return; } const ex = e.target.closest('[data-export-single]'); if (ex) exportQuestionTxt(ex.dataset.exportSingle); const go = e.target.closest('[data-go]'); if (go) switchView(go.dataset.go); });
  $('savedSummary').addEventListener('click', e => { if (e.target.closest('#savedExportInline')) exportAllTxt(); });
  $('exportAllBtn').addEventListener('click', exportAllTxt); $('exportAllTop').addEventListener('click', exportAllTxt); $('exportSingleTxt').addEventListener('click', () => exportQuestionTxt(openedQueryId));
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = $(btn.dataset.copy).value;
    if (!text) { toast('There is no query text to copy.', true); return; }
    try { await navigator.clipboard.writeText(text); toast('Query copied to clipboard.'); }
    catch { $(btn.dataset.copy).focus(); $(btn.dataset.copy).select(); document.execCommand('copy'); toast('Query copied.'); }
  }));
  $('importCsvBtn').addEventListener('click', () => $('csvFileInput').click()); $('dataImportCsv').addEventListener('click', () => $('csvFileInput').click());
  $('csvFileInput').addEventListener('change', e => { const file = e.target.files?.[0]; if (file) importCsvFile(file); e.target.value=''; });
  $('exportCsvBtn').addEventListener('click', exportCsv); $('exportJsonBtn').addEventListener('click', exportJson); $('dataExportJson').addEventListener('click', exportJson);
  $('dataImportJson').addEventListener('click', () => $('jsonFileInput').click()); $('jsonFileInput').addEventListener('change', e => { const file=e.target.files?.[0]; if(file) importJsonFile(file); e.target.value=''; });
  $('dataExportTxt').addEventListener('click', exportAllTxt);
  $('manageDataFooter').addEventListener('click', () => openModal('dataModal'));
  $('resetStarterBtn').addEventListener('click', () => {
    if (!confirm('Reset the entire question bank to the original starter questions? Your saved queries, added questions and progress will be lost unless backed up first.')) return;
    questions = (window.SEED_QUESTIONS || []).map(q => ({...q, id: uid()})); currentSelectedIds.clear(); persist(); renderAll(); closeModal('dataModal'); toast('Starter bank restored.');
  });

  // First render and storage sync across tabs.
  try { if (!localStorage.getItem(STORAGE_KEY)) persist(); } catch (error) { console.warn('Browser storage is unavailable; this session may not persist.', error); }
  renderAll();
  window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) { questions = loadQuestions(); renderAll(); toast('Tracker refreshed from another tab.'); } });
})();

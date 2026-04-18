type PairCardModel = {
  element: HTMLElement;
  id: number;
  difficulty: number;
  starter: string;
  position: string;
  assistUsed: boolean;
  tag: boolean;
  duoOnly: boolean;
  ultGaugePoint: number;
  ultGaugeAssist: number;
  tags: string[];
  damage: number;
};

type PairPageState = {
  difficulty: Set<string>;
  starter: string;
  position: string;
  tags: Set<string>;
  assist_used: boolean;
  tag: boolean;
  duo_only: boolean;
  ult_gauge_point: string;
  ult_gauge_assist: string;
  sort: string;
  page: number;
};

function isHTMLElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function initPairComboPage() {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  const WIKI_REF = 180;        // キャラ画像の参照元（2XKO Wiki）の基準サイズ (px)
  const PAGE_SIZE = 5;         // 1ページあたりのコンボ表示件数
  const HEADROOM_HEIGHT = 34;  // headroom-nav の高さ (px)。動画パネルの top オフセットに使用
  const headroomNav = document.getElementById('headroom-nav');
  const comboEmpty = document.getElementById('combo-empty');
  const pagination = document.getElementById('pagination');
  const pagePrev = document.getElementById('page-prev') as HTMLButtonElement | null;
  const pageNext = document.getElementById('page-next') as HTMLButtonElement | null;
  const pageStatus = document.getElementById('page-status');
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;
  const fuseLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('#fuse-nav a'));
  let activeComboId: string | null = null;
  let headroomVisible = false;
  let lastScrollY = window.scrollY;

  const allCards = Array.from(document.querySelectorAll<HTMLElement>('.combo-card'));
  const cardModels: PairCardModel[] = allCards.map((card) => ({
    element: card,
    id: Number(card.dataset.id || 0),
    difficulty: Number(card.dataset.difficulty || 0),
    starter: card.dataset.starter || '',
    position: card.dataset.position || '',
    assistUsed: card.dataset.assistUsed === 'true',
    tag: card.dataset.tag === 'true',
    duoOnly: card.dataset.duoOnly === 'true',
    ultGaugePoint: Number(card.dataset.ultGaugePoint || 0),
    ultGaugeAssist: Number(card.dataset.ultGaugeAssist || 0),
    tags: (card.dataset.tags || '').split(',').filter(Boolean),
    damage: Number(card.dataset.damage || 0),
  }));

  const state: PairPageState = {
    difficulty: new Set(),
    starter: '',
    position: '',
    tags: new Set(),
    assist_used: false,
    tag: false,
    duo_only: false,
    ult_gauge_point: '',
    ult_gauge_assist: '',
    sort: 'difficulty-asc',
    page: 1,
  };

  const scalePortraits = () => {
    document.querySelectorAll<HTMLElement>('[data-size]').forEach((el) => {
      const width = el.clientWidth;
      if (width === 0) return;
      const scale = width / WIKI_REF;
      el.style.backgroundSize = `${Number(el.dataset.size) * scale}px`;
      el.style.backgroundPosition = `${Number(el.dataset.posX) * scale}px ${Number(el.dataset.posY) * scale}px`;
    });
  };

  const updateVideoPanelTop = () => {
    const videoPanel = document.getElementById('video-panel');
    if (!videoPanel || activeComboId === null) return;
    videoPanel.style.top = `${headroomVisible ? HEADROOM_HEIGHT : 0}px`;
  };

  const updateHeadroom = () => {
    if (!headroomNav) return;
    const filterBottom = filterBar.getBoundingClientRect().bottom;
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    if (filterBottom >= 0) {
      if (headroomVisible) {
        headroomVisible = false;
        headroomNav.classList.remove('visible');
        updateVideoPanelTop();
      }
      return;
    }

    if (scrollingDown !== headroomVisible) {
      headroomVisible = scrollingDown;
      headroomNav.classList.toggle('visible', scrollingDown);
      updateVideoPanelTop();
    }
  };

  const extractVideoId = (url: string) => url.match(/youtu\.be\/([^?&]+)/)?.[1] || url.match(/[?&]v=([^&]+)/)?.[1] || null;
  const toEmbedUrl = (url: string) => {
    const id = extractVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}?rel=0&mute=1&autoplay=1&loop=1&playlist=${id}` : url;
  };

  const closeVideoPanel = () => {
    const videoPanel = document.getElementById('video-panel');
    const vpIframe = document.getElementById('vp-iframe') as HTMLIFrameElement | null;
    if (!videoPanel || !vpIframe) return;
    videoPanel.style.display = 'none';
    videoPanel.style.top = '';
    vpIframe.src = '';
    document.querySelectorAll('.combo-card.playing').forEach((card) => card.classList.remove('playing'));
    activeComboId = null;
  };

  const openVideoPanel = (card: HTMLElement) => {
    const videoPanel = document.getElementById('video-panel');
    const vpIframe = document.getElementById('vp-iframe') as HTMLIFrameElement | null;
    const vpLabel = document.getElementById('vp-label');
    const vpInputsCode = document.getElementById('vp-inputs-code');
    const btn = card.querySelector<HTMLElement>('.cc-video-btn');
    if (!btn || !videoPanel || !vpIframe || !vpLabel || !vpInputsCode) return;

    const videoUrl = btn.dataset.videoUrl;
    const inputs = btn.dataset.videoInputs;
    const comboId = btn.dataset.videoComboId;
    const damage = btn.dataset.videoDamage;
    const difficulty = btn.dataset.videoDifficulty;
    if (!videoUrl || !inputs || !comboId || !damage || !difficulty) return;

    if (activeComboId === comboId) {
      closeVideoPanel();
      return;
    }

    vpIframe.src = toEmbedUrl(videoUrl);
    vpInputsCode.textContent = inputs;
    vpLabel.textContent = `#${comboId}  ${'★'.repeat(Number(difficulty)) + '☆'.repeat(5 - Number(difficulty))}  ${Number(damage).toLocaleString()} dmg`; // 5: 難易度の最大段数
    videoPanel.style.display = '';
    document.querySelectorAll('.combo-card.playing').forEach((item) => item.classList.remove('playing'));
    card.classList.add('playing');
    activeComboId = comboId;
    updateVideoPanelTop();
    videoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    const setParam = (key: string, values: Set<string>) => {
      if (values.size > 0) params.set(key, Array.from(values).join(','));
    };

    setParam('difficulty', state.difficulty);
    if (state.starter) params.set('starter', state.starter);
    if (state.position) params.set('position', state.position);
    setParam('tags', state.tags);
    if (state.assist_used) params.set('assist_used', '1');
    if (state.tag) params.set('tag', '1');
    if (state.duo_only) params.set('duo_only', '1');
    if (state.ult_gauge_point) params.set('ult_gauge_point', state.ult_gauge_point);
    if (state.ult_gauge_assist) params.set('ult_gauge_assist', state.ult_gauge_assist);
    if (state.sort !== 'difficulty-asc') params.set('sort', state.sort);
    if (state.page > 1) params.set('page', String(state.page));
    return params;
  };

  const syncUrl = () => {
    const params = buildSearchParams();
    const query = params.toString();
    history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    fuseLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const urlObj = new URL(href, window.location.origin);
      urlObj.search = query;
      link.href = `${urlObj.pathname}${urlObj.search}`;
    });
  };

  const applyQueryState = () => {
    const params = new URLSearchParams(window.location.search);
    const readSet = (key: string, target: Set<string>) => {
      target.clear();
      const raw = params.get(key);
      if (!raw) return;
      raw.split(',').map((value) => value.trim()).filter(Boolean).forEach((value) => target.add(value));
    };

    readSet('difficulty', state.difficulty);
    state.starter = params.get('starter') || '';
    state.position = params.get('position') || '';
    readSet('tags', state.tags);
    state.assist_used = params.get('assist_used') === '1';
    state.tag = params.get('tag') === '1';
    state.duo_only = params.get('duo_only') === '1';
    state.ult_gauge_point = params.get('ult_gauge_point') || '';
    state.ult_gauge_assist = params.get('ult_gauge_assist') || '';
    state.sort = params.get('sort') || 'difficulty-asc';
    state.page = Math.max(1, Number(params.get('page') || '1'));
  };

  const syncUiFromState = () => {
    document.querySelectorAll<HTMLElement>('.filter-chips[data-filter]').forEach((group) => {
      const filter = group.dataset.filter || '';
      group.querySelectorAll<HTMLElement>('.chip').forEach((chip) => {
        const value = chip.dataset.value || '';
        const active = filter === 'difficulty'
          ? state.difficulty.has(value)
          : state.tags.has(value);
        chip.classList.toggle('active', active);
      });
    });

    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-filter]').forEach((input) => {
      input.checked = state[input.dataset.filter as keyof PairPageState] as boolean;
    });

    document.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((select) => {
      select.value = state[select.dataset.filter as keyof PairPageState] as string;
    });

    if (sortSelect) sortSelect.value = state.sort;
  };

  const matches = (card: PairCardModel) => !(
    (state.difficulty.size > 0 && !state.difficulty.has(String(card.difficulty))) ||
    (state.starter !== '' && state.starter !== card.starter) ||
    (state.position !== '' && state.position !== card.position) ||
    (state.tags.size > 0 && !Array.from(state.tags).some((tag) => card.tags.includes(tag))) ||
    (state.assist_used && !card.assistUsed) ||
    (state.tag && !card.tag) ||
    (state.duo_only && !card.duoOnly) ||
    (state.ult_gauge_point !== '' && card.ultGaugePoint > Number(state.ult_gauge_point)) ||
    (state.ult_gauge_assist !== '' && card.ultGaugeAssist > Number(state.ult_gauge_assist))
  );

  const sortCards = (cards: PairCardModel[]) => [...cards].sort((a, b) => {
    if (state.sort === 'damage-desc') return b.damage - a.damage || a.id - b.id;
    if (state.sort === 'difficulty-asc') return a.difficulty - b.difficulty || b.damage - a.damage;
    if (state.sort === 'difficulty-desc') return b.difficulty - a.difficulty || b.damage - a.damage;
    if (state.sort === 'id-desc') return b.id - a.id;
    return a.difficulty - b.difficulty || b.damage - a.damage; // fallback: difficulty-asc
  });

  const renderCards = () => {
    const filtered = sortCards(cardModels.filter(matches));
    const totalPages = filtered.length > 0 ? Math.ceil(filtered.length / PAGE_SIZE) : 1;
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const pageItems = filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
    const visibleIds = new Set(pageItems.map((item) => item.id));

    cardModels.forEach((card) => {
      card.element.style.display = visibleIds.has(card.id) ? '' : 'none';
    });

    if (activeComboId && !pageItems.some((item) => String(item.id) === activeComboId)) closeVideoPanel();
    if (comboEmpty) comboEmpty.style.display = filtered.length === 0 ? '' : 'none';
    if (pagination && pageStatus && pagePrev && pageNext) {
      pagination.style.display = filtered.length > 0 ? '' : 'none';
      pageStatus.textContent = `${state.page} / ${totalPages}`;
      pagePrev.disabled = state.page <= 1;
      pageNext.disabled = state.page >= totalPages;
    }

    syncUrl();
    syncUiFromState();
  };

  document.getElementById('filter-expand')?.addEventListener('click', () => {
    const panel = document.getElementById('filter-panel');
    const icon = document.getElementById('expand-icon');
    const hidden = panel?.style.display === 'none';
    if (panel) panel.style.display = hidden ? '' : 'none';
    if (icon) icon.textContent = hidden ? '▲' : '▼';
  });

  document.querySelectorAll<HTMLElement>('.filter-chips[data-filter]').forEach((group) => {
    const filter = group.dataset.filter || '';
    group.querySelectorAll<HTMLElement>('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value || '';
        const target = filter === 'difficulty' ? state.difficulty : state.tags;
        target.has(value) ? target.delete(value) : target.add(value);
        state.page = 1;
        renderCards();
      });
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-filter]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.filter as 'assist_used' | 'tag' | 'duo_only';
      state[key] = input.checked;
      state.page = 1;
      renderCards();
    });
  });

  document.querySelectorAll<HTMLSelectElement>('select[data-filter]').forEach((select) => {
    select.addEventListener('change', () => {
      const key = select.dataset.filter as 'starter' | 'position' | 'ult_gauge_point' | 'ult_gauge_assist';
      state[key] = select.value;
      state.page = 1;
      renderCards();
    });
  });

  sortSelect?.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.page = 1;
    renderCards();
  });

  pagePrev?.addEventListener('click', () => {
    state.page = Math.max(1, state.page - 1);
    renderCards();
  });

  pageNext?.addEventListener('click', () => {
    state.page += 1;
    renderCards();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeVideoPanel();
  });

  document.addEventListener('click', async (event) => {
    if (!isHTMLElement(event.target)) return;
    const target = event.target;

    if (target.closest('#vp-close')) {
      closeVideoPanel();
      return;
    }

    const linkButton = target.closest<HTMLElement>('.cc-action-btn[data-combo-id]');
    if (linkButton) {
      event.preventDefault();
      const comboId = linkButton.dataset.comboId;
      if (!comboId) return;
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${window.location.search}#combo-${comboId}`);
      return;
    }

    if (target.closest('#video-panel')) return;

    const videoBtn = target.closest('.cc-video-btn');
    if (videoBtn) {
      const card = videoBtn.closest<HTMLElement>('.combo-card');
      if (card) openVideoPanel(card);
      return;
    }

    const card = target.closest<HTMLElement>('.combo-card');
    if (card) {
      if (target.closest('button, a, input, select')) return;
      activeComboId ? closeVideoPanel() : openVideoPanel(card);
      return;
    }

    if (activeComboId) closeVideoPanel();
  });

  applyQueryState();
  syncUiFromState();
  scalePortraits();
  renderCards();
  window.addEventListener('resize', () => {
    scalePortraits();
    if (activeComboId) updateVideoPanelTop();
  });
  window.addEventListener('scroll', updateHeadroom, { passive: true });
}

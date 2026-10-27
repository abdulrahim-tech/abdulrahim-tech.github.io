/* Shared interactive Windows XP windows, taskbar, Start menu, navigation and theme. */
(function () {
    'use strict';
    const root = document.documentElement;
    const themeButton = document.getElementById('theme-toggle');
    const menuButton = document.getElementById('nav-menu-button');
    const navigation = document.getElementById('site-navigation');
    const startButton = document.getElementById('xp-start');
    const startMenu = document.getElementById('xp-start-menu');
    const windows = [...document.querySelectorAll('.xp-window[id]')];
    const taskButtons = [...document.querySelectorAll('[data-task-window]')];
    const clock = document.getElementById('xp-task-clock');

    function setTheme(theme) {
        root.dataset.theme = theme;
        if (themeButton) {
            const dark = theme === 'dark';
            themeButton.textContent = dark ? '☀️  XP Luna' : '🌙  Dark Mode';
            themeButton.setAttribute('aria-pressed', String(dark));
            themeButton.setAttribute('aria-label', dark ? 'Switch to classic Windows XP theme' : 'Switch to dark XP theme');
        }
    }
    let initialTheme = 'light';
    try { initialTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch (e) { /* storage unavailable */ }
    setTheme(initialTheme);
    themeButton?.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    });

    function setMenu(open) {
        if (!menuButton || !navigation) return;
        navigation.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    }
    menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    navigation?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

    function updateTaskbar() {
        taskButtons.forEach(button => {
            const win = document.getElementById(button.dataset.taskWindow);
            if (!win) return;
            const closed = win.classList.contains('is-closed');
            const minimized = win.classList.contains('is-minimized');
            const maximized = win.classList.contains('is-maximized');
            button.classList.toggle('is-inactive', closed || minimized);
            button.classList.toggle('is-active', maximized);
            button.setAttribute('aria-label', 'Open ' + win.dataset.windowTitle);
            button.setAttribute('aria-pressed', String(maximized));
            button.title = closed ? 'Reopen ' + win.dataset.windowTitle : minimized ? 'Restore ' + win.dataset.windowTitle : 'Jump to ' + win.dataset.windowTitle;
        });
    }
    function refreshMaxState() {
        document.body.classList.toggle('has-maximized-window', windows.some(w => w.classList.contains('is-maximized')));
    }
    function updateControlLabels(win) {
        const max = win.querySelector('[data-action="maximize"]');
        if (max) {
            const expanded = win.classList.contains('is-maximized');
            max.textContent = expanded ? '❐' : '□';
            max.setAttribute('aria-label', (expanded ? 'Restore ' : 'Maximize ') + win.dataset.windowTitle);
            max.setAttribute('title', (expanded ? 'Restore ' : 'Maximize ') + win.dataset.windowTitle);
        }
        const min = win.querySelector('[data-action="minimize"]');
        if (min) min.setAttribute('aria-expanded', String(!win.classList.contains('is-minimized')));
    }
    function restore(win, {scroll = true} = {}) {
        win.classList.remove('is-closed','is-minimized','is-maximized');
        updateControlLabels(win);
        refreshMaxState();
        updateTaskbar();
        if (scroll) win.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    function act(win, action) {
        if (action === 'minimize') {
            win.classList.remove('is-maximized','is-closed');
            win.classList.toggle('is-minimized');
        } else if (action === 'maximize') {
            const was = win.classList.contains('is-maximized');
            windows.forEach(other => { if (other !== win) { other.classList.remove('is-maximized'); updateControlLabels(other); } });
            win.classList.remove('is-minimized','is-closed');
            win.classList.toggle('is-maximized', !was);
        } else if (action === 'close') {
            win.classList.remove('is-maximized','is-minimized');
            win.classList.add('is-closed');
        }
        updateControlLabels(win);
        refreshMaxState();
        updateTaskbar();
    }
    document.addEventListener('click', event => {
        const control = event.target.closest('.xp-title-action[data-action]');
        if (control) {
            const win = control.closest('.xp-window');
            if (win) act(win, control.dataset.action);
            return;
        }
        const shortcut = event.target.closest('[data-open-window], [data-task-window]');
        if (shortcut) {
            const win = document.getElementById(shortcut.dataset.openWindow || shortcut.dataset.taskWindow);
            if (win) restore(win);
            closeStart();
        }
    });
    function closeStart() {
        if (!startMenu) return;
        startMenu.hidden = true;
        startButton?.setAttribute('aria-expanded','false');
    }
    startButton?.addEventListener('click', () => {
        const open = startMenu.hidden;
        startMenu.hidden = !open;
        startButton.setAttribute('aria-expanded',String(open));
    });
    document.getElementById('xp-restore-all')?.addEventListener('click', () => {
        windows.forEach(w => restore(w, {scroll:false}));
        closeStart();
    });
    document.addEventListener('pointerdown', event => {
        if (startMenu && !startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target)) closeStart();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeStart();
            setMenu(false);
            windows.filter(w => w.classList.contains('is-maximized')).forEach(w => restore(w,{scroll:false}));
        }
    });
    function showClock() {
        if (clock) clock.textContent = new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
    }
    showClock();
    setInterval(showClock, 30000);
    windows.forEach(updateControlLabels);
    updateTaskbar();
}());

var THEME_DARK_KEY = 'githubboke-theme-dark-mode';

function getThemeDarkMode() {
    var saved = localStorage.getItem(THEME_DARK_KEY);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeDarkMode(dark) {
    document.documentElement.classList.toggle('dark-mode', dark);
    document.body.classList.toggle('dark-mode', dark);
    var icon = document.getElementById('theme-dark-icon');
    if (icon) {
        icon.textContent = dark ? '☀️' : '🌙';
    }
}

function toggleThemeDarkMode() {
    var dark = !document.body.classList.contains('dark-mode');
    localStorage.setItem(THEME_DARK_KEY, dark);
    applyThemeDarkMode(dark);
}

function toggleMobileNav() {
    var nav = document.getElementById('siteNav');
    var btn = document.getElementById('hamburgerBtn');
    nav.classList.toggle('open');
    btn.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
}

/* ===== Music Player ===== */
var musicPlayers = [];

function getMusicPlayer(el) {
    if (el && el.classList.contains('music-play-btn')) {
        return el.closest('.music-player');
    }
    return el;
}

function toggleMusicPlayer(btn) {
    var player = btn.closest('.music-player');
    if (!player) return;
    var audio = player.querySelector('audio');
    if (!audio) return;

    if (player.classList.contains('playing')) {
        audio.pause();
        player.classList.remove('playing');
        setPlayIcon(btn);
    } else {
        pauseAllMusicPlayers();
        audio.play().then(function() {
            player.classList.add('playing');
            setPauseIcon(btn);
        }).catch(function() {});
    }
}

function pauseAllMusicPlayers() {
    document.querySelectorAll('.music-player.playing').forEach(function(p) {
        p.classList.remove('playing');
        var a = p.querySelector('audio');
        if (a) a.pause();
        setPlayIcon(p.querySelector('.music-play-btn'));
    });
}

function seekMusicPlayer(event, bar) {
    var player = bar.closest('.music-player');
    if (!player) return;
    var audio = player.querySelector('audio');
    if (!audio) return;
    var rect = bar.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width;
    if (x < 0) x = 0;
    if (x > 1) x = 1;
    audio.currentTime = x * audio.duration;
    updateMusicProgress(player, audio);
}

function updateMusicProgress(player, audio) {
    var current = player.querySelector('.music-current-time');
    var duration = player.querySelector('.music-duration');
    var progress = player.querySelector('.music-progress-current');
    if (!current || !duration || !progress) return;
    var ct = audio.currentTime || 0;
    var dt = audio.duration || 0;
    current.textContent = formatTime(ct);
    if (dt) {
        duration.textContent = formatTime(dt);
        progress.style.width = (ct / dt * 100) + '%';
    }
}

function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
}

function setPlayIcon(btn) {
    if (!btn) return;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}

function setPauseIcon(btn) {
    if (!btn) return;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
}

document.addEventListener('DOMContentLoaded', function() {
    var header = document.querySelector('.site-header.fixed');
    if (header) {
        var height = header.offsetHeight;
        document.querySelector('main').style.paddingTop = (height + 40) + 'px';
    }

    document.querySelectorAll('pre code').forEach(function(block) {
        var lines = block.textContent.split('\n').length;
        if (lines > 1) {
            block.parentElement.classList.add('has-line-numbers');
        }
    });

    var navLinks = document.querySelectorAll('.site-nav a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            var nav = document.getElementById('siteNav');
            var btn = document.getElementById('hamburgerBtn');
            nav.classList.remove('open');
            btn.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });

    applyThemeDarkMode(getThemeDarkMode());

    /* Initialize music players */
    document.querySelectorAll('.music-player audio').forEach(function(audio) {
        audio.addEventListener('timeupdate', function() {
            var player = this.closest('.music-player');
            if (player) updateMusicProgress(player, this);
        });
        audio.addEventListener('loadedmetadata', function() {
            var player = this.closest('.music-player');
            if (player) {
                var dur = player.querySelector('.music-duration');
                if (dur) dur.textContent = formatTime(this.duration);
            }
        });
        audio.addEventListener('ended', function() {
            var player = this.closest('.music-player');
            if (player) {
                player.classList.remove('playing');
                setPlayIcon(player.querySelector('.music-play-btn'));
                updateMusicProgress(player, this);
            }
        });
        audio.addEventListener('error', function() {
            var player = this.closest('.music-player');
            if (player) {
                var title = player.querySelector('.music-player-title');
                if (title) title.textContent = title.textContent + ' (加载失败)';
            }
        });
    });
});

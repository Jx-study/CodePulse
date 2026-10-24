try {
  var t = localStorage.getItem('codepulse_theme');
  if (t === 'dark' || t === 'light') {
    document.documentElement.dataset.theme = t;
  }
} catch {
  /* 無法讀取 localStorage 時使用預設主題 */
}

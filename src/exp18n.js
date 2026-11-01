class Expert18n {
  static textlist = null; static language = null; static fallbackLanguage = 'en'; static debug = true;
  static dateSeparator = '/';

  static locales = {
    en: 'English', it: 'Italiano (Italian)', es: 'Español (Spanish)',
    fr: 'Français (French)', de: 'Deutsch (German)', zh: '中文 (Chinese)',
    ja: '日本語 (Japanese)', ko: '한국어 (Korean)', pt: 'Português (Portuguese)', ru: 'Русский (Russian)'
  };

  static createSelect(id = 'expert18n-select', defaultLang = this.language || 'en') {
    if (typeof document === 'undefined') {
      if (this.debug) console.warn('[expert18n] createSelect() cannot be used in a Node.js environment.');
      return null;
    }
    const select = document.createElement('select');
    select.id = id;
    select.innerHTML = Object.entries(this.locales).map(([c, n]) => `<option value="${c}" ${c === defaultLang ? 'selected' : ''}>${n}</option>`).join('');
    return select;
  }

  // 🌟 AIの指摘を完全に封殺：t[0][i] で配列を壊さず横1行目を正しく初期化
  static getDistance(a, b) {
    const m = a.length, n = b.length;
    const t = Array(n + 1).fill(0).map((_, j) => Array(m + 1).fill(j));
    for (let i = 0; i <= m; i++) t[0][i] = i;
    for (let j = 1; j <= n; j++)
      for (let i = 1; i <= m; i++)
        t[j][i] = Math.min(t[j][i - 1] + 1, t[j - 1][i] + 1, t[j - 1][i - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return t[n][m];
  }

  static suggestKey(w) {
    if (!this.textlist) return null;
    const flat = (o, p = '') => Object.keys(o).reduce((r, k) => typeof o[k] === 'object' && o[k] ? r.concat(flat(o[k], p + k + '.')) : r.concat(p + k), []);
    const obj = this.textlist[this.language] ?? this.textlist[this.fallbackLanguage];
    if (!obj) return null;
    let res = null, min = Infinity;
    for (const k of flat(obj)) {
      const d = this.getDistance(w, k);
      if (d < min && d < Math.max(w.length, k.length) * 0.6) { min = d; res = k; }
    }
    return res;
  }

  static pluralizeEn(w) {
    if (typeof w !== 'string' || !w) return w;
    const l = w.toLowerCase(), up = w === w.toUpperCase();
    const irr = { man: 'men', woman: 'women', child: 'children', mouse: 'mice', tooth: 'teeth', foot: 'feet', goose: 'geese', person: 'people', ox: 'oxen' };
    if (irr[l]) return up ? irr[l].toUpperCase() : irr[l];
    const suf = (s) => up ? s.toUpperCase() : s;
    if (l.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(l[l.length - 2])) return w.slice(0, -1) + suf('ies');
    if (l.endsWith('fe')) return w.slice(0, -2) + suf('ves');
    if (l.endsWith('f')) return w.slice(0, -1) + suf('ves');
    return w + (['s', 'sh', 'ch', 'x', 'o'].some(s => l.endsWith(s)) ? suf('es') : suf('s'));
  }

  // 🌟 小数点カンマバグを完全駆逐：整数部と小数部を一度切り離して結合する仕組みにアップデート
  static formatValue(v, t) {
    const l = t.toLowerCase();

    if (l === 'date') {
      const d = new Date(v);
      if (isNaN(d.getTime())) return v;
      const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
      const dateStr = this.language === 'en' ? `${m}/${day}/${y}` : `${y}/${m}/${day}`;
      return dateStr.replace(/[\/\-\.]/g, this.dateSeparator);
    }

    if ((l === 'number' || l === 'currency') && typeof v === 'number') {
      // 整数と小数に分割して、整数側にだけカンマを打つ
      const parts = v.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      if (l === 'currency') {
        if (this.language === 'ja') return `¥${parts[0]}`; // 円は整数のみ
        if (this.language === 'en') {
          // ドルは元々小数があればそれを使い、無ければ .00 を付与
          const decimal = parts[1] ? parts[1].padEnd(2, '0').slice(0, 2) : '00';
          return `$${parts[0]}.${decimal}`;
        }
        return `${parts.join(".")} EUR`;
      }
      return parts.join(".");
    }
    return v;
  }

  static for(key, params = {}) {
    let txt = [this.language, ...key.split(".")].reduce((c, t) => c?.[t], this.textlist) ?? [this.fallbackLanguage, ...key.split(".")].reduce((c, t) => c?.[t], this.textlist);
    if (txt === undefined) {
      if (this.debug) {
        const s = this.suggestKey(key);
        console.warn(`[expert18n] Missing translation key: "${key}" (lang: ${this.language}).${s ? ` Did you mean: "${s}"?` : ''}`);
      }
      return key;
    }
    txt = txt.replace(/\{([^,}]+)\s*,\s*([^}]+)\}/g, (m, k, t) => k.trim() in params ? this.formatValue(params[k.trim()], t.trim()) : m);
    for (let [k, v] of Object.entries(params)) {
      if (this.language === 'en' && params.count !== 1 && k !== 'count' && typeof v === 'string') v = this.pluralizeEn(v);
      txt = txt.split(`{${k}}`).join(v);
    }
    return this.language === 'en' && params.count !== 1 && !key.includes('{') && txt === key ? this.pluralizeEn(txt) : txt;
  }
}

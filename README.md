# expert18n 🚀

A super-lightweight, zero-dependency, yet incredibly smart internationalization (i18n) engine for JavaScript. Designed as the ultimate upgraded version of `simple18n`.

## ✨ Key Features
- **Ultra-lightweight:** Minified. Perfect for performance-critical environments.
- **Smart Morphological Pluralization:** Native English regular/irregular grammar parser built-in (e.g., `child` -> `children`, `mouse` -> `mice`) without needing separate plural keys.
- **Custom Inline Formatters:** Zero reliance on `window.Intl`. Handles multi-regional date formats and bulletproof float currency formatting naturally.
- **Environment-Aware UI Generator:** Includes a browser-safe, Node-friendly method to automatically generate a language picker `<select>` element.

## 🛠️ Installation & Usage

```javascript
import Expert18n from './src/expert18n.js';

Expert18n.textlist = {
  en: { cart_info: "On {valDate, date}, you purchased {count} {item} for {total, currency}." },
  ja: { cart_info: "{valDate, date}に、{total, currency}で{item}を{count}個購入しました。" }
};

// Test it out
Expert18n.language = 'en';
console.log(Expert18n.for('cart_info', { valDate: new Date(), count: 5, item: 'apple', total: 12500 }));
// Output: "On 11/1/2026, you purchased 5 apples for \$12,500.00."
```
## logo
If you choose to use this library, we would appreciate it if you could display this logo somewhere visible to users (it is acceptable for it to be located in a deeper section, such as within a settings menu, provided that users can access it).

![expert18n's logo](./images/logo.png)


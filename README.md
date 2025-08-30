# WCAG Contrast Fixer

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![WCAG 2.1](https://img.shields.io/badge/WCAG-2.1_AA/AAA-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-orange.svg)](https://chrome.google.com/webstore)

A Chrome extension that automatically fixes text contrast issues to meet WCAG 2.1 accessibility standards, making the web more readable for everyone.

## 🌟 Features

- **Automatic Contrast Fixing** - Detects and fixes low-contrast text in real-time
- **WCAG 2.1 Compliance** - Choose between AA (4.5:1) or AAA (7:1) standards
- **Force High Contrast Mode** - Black text on white, white text on dark backgrounds
- **Force Bold Text** - Make all text bold for enhanced readability
- **Smart Detection** - Handles transparent backgrounds and dynamic content
- **Privacy First** - No data collection, works entirely offline

## 🚀 Installation

### From Chrome Web Store
[Install from Chrome Web Store](#) (Link coming soon)

### Manual Installation
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the repository folder

## 💻 Development

### Prerequisites
- Chrome or Chromium-based browser
- Git

### Setup
```bash
git clone https://github.com/yourusername/wcag-contrast.git
cd wcag-contrast
```

### Project Structure
```
wcag-contrast/
├── manifest.json       # Extension configuration
├── content.js         # Main contrast adjustment logic
├── background.js      # Service worker
├── popup.html        # Extension popup interface
├── popup.js          # Popup functionality
├── popup.css         # Popup styling
├── icon*.png         # Extension icons
└── docs/            # GitHub Pages (privacy policy)
```

## 🔧 Technical Details

### Contrast Calculation
The extension uses proper WCAG 2.1 luminance calculations:
- sRGB to linear RGB conversion
- Relative luminance formula: `0.2126 * R + 0.7152 * G + 0.0722 * B`
- Contrast ratio: `(lighter + 0.05) / (darker + 0.05)`

### WCAG Standards
- **Normal Text AA**: 4.5:1 contrast ratio
- **Large Text AA**: 3.0:1 contrast ratio (18pt+ or 14pt+ bold)
- **Normal Text AAA**: 7.0:1 contrast ratio
- **Large Text AAA**: 4.5:1 contrast ratio

## 🛡️ Privacy

This extension collects **NO data whatsoever**. All processing happens locally in your browser.

[View Full Privacy Policy](https://yourusername.github.io/wcag-contrast/)

## 📝 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

The AGPL-3.0 ensures that:
- The software remains free and open source
- Any modifications must also be open source
- Network use requires source disclosure
- Perfect for accessibility tools that benefit the community

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🏢 About System Execute, LLC

Developed by [System Execute, LLC (s11e)](https://github.com/yourusername) - Building accessible technology for everyone.

## 🙏 Acknowledgments

- WCAG 2.1 Guidelines by W3C
- Chrome Extensions documentation
- The accessibility community

## 📊 Browser Support

- Chrome/Chromium 88+
- Edge 88+
- Brave
- Opera
- Vivaldi

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Browser version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📮 Contact

- GitHub Issues: [Report a bug](https://github.com/yourusername/wcag-contrast/issues)
- Company: System Execute, LLC (s11e)

---

**Making the web accessible, one contrast fix at a time.** ♿
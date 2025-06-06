# WASKit (Web App Starter Kit)

WASKit is a professional CLI tool to scaffold modern web projects with Vite, Tailwind CSS, and flexible templates for JavaScript/TypeScript (Vanilla or React). It enables developers to kickstart projects with minimal configuration and best practices out of the box.

## Features

- ⚡ Blazing fast project scaffolding
- 🛠️ Modern tech stack: Vite, Tailwind CSS, React, TypeScript
- 🧩 Flexible templates: Vanilla/React × JS/TS
- 📦 Smart dependency management (Bun/NPM)
- 🎨 Optional Tailwind CSS integration
- 🐙 Git integration (optional)

## Installation

### With Bun (Recommended)
```bash
bun create waskit my-app
```

### With NPM
```bash
npm create waskit my-app
```

## Usage

```bash
create-waskit <project-directory> [options]
```

### Options

| Option                      | Description                                 |
|-----------------------------|---------------------------------------------|
| `-f, --force`               | Overwrite target directory if it exists      |
| `-s, --skip-install`        | Skip dependency installation                |
| `-g, --git`                 | Initialize git repository                   |
| `-t, --template <template>` | Specify a template (e.g., react-typescript) |
| `list`                      | List all available templates                |

### Example

```bash
bun create waskit my-app --template react-typescript --git
```

## Available Templates

| Template            | Tech Stack                        | Use Case                      |
|---------------------|-----------------------------------|-------------------------------|
| Vanilla JavaScript  | HTML + JS + Tailwind (optional)   | Lightweight projects          |
| Vanilla TypeScript  | HTML + TS + Tailwind (optional)   | Type-safe vanilla projects    |
| React JavaScript    | React 19 + JSX + Tailwind         | Modern React apps             |
| React TypeScript    | React 19 + TSX + Tailwind         | Scalable type-safe React apps |

## Development Workflow

```bash
bun run dev      # Start dev server
bun run build    # Build for production
bun run preview  # Preview production build
bun run deploy   # Deploy to GitHub Pages (if configured)
```

## System Requirements

- Bun v1.0+ (recommended)
- Node.js v18.0+ (if using npm)
- npm v8.0+ (if not using Bun)

## Contributing

We welcome contributions from the community! Here's how to get started:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-thing`)
3. 🧪 Test your changes (`bun test`)
4. 📝 Commit your changes (`git commit -m 'Add amazing thing'`)
5. 📤 Push to your branch (`git push origin feature/amazing-thing`)
6. 📣 Create a pull request with detailed description

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and read our [Contributing Guide](CONTRIBUTING.md) for more details.

## Support & Feedback

Having issues or have suggestions? We'd love to hear from you!

- 🐛 [Open an issue](https://github.com/pankaj72885/create-waskit/issues) for bugs
- 💡 [Request features](https://github.com/pankaj72885/create-waskit/discussions) 
- 🆘 [Ask for help](https://github.com/pankaj72885/create-waskit/discussions) in our discussions
- 📣 [Report security issues](SECURITY.md) directly to maintainers

## Getting Started

For a more detailed guide on how to get started with WASKit, please see the [GETTING_STARTED.md](GETTING_STARTED.md) file.

## License

This project is licensed under the [MIT License](LICENSE). 

MIT License grants:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

See [LICENSE](LICENSE) for the full text of the license agreement.

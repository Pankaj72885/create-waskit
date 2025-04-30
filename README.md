# create-waskit 🚀

`create-waskit` (Web App Starter Kit) is a **professional-grade CLI tool** for modern web development. It empowers developers to scaffold production-ready projects in seconds with:

- ✅ **Vite** for lightning-fast builds
- ✅ **Tailwind CSS** for utility-first styling (optional)
- ✅ Flexible templates for JavaScript/TypeScript with Vanilla/React
- ✅ Smart dependency management with Bun/NPM
- ✅ Enhanced Bun integration for optimal performance

This tool is designed for developers who value speed, modern tooling, and clean project structure.

## Key Features

| ✨ Feature                | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| **Blazing Fast Setup**    | Scaffold projects in seconds with optimized templates                       |
| **Modern Tech Stack**     | Built with Vite & optional Tailwind CSS for modern web development          |
| **Flexible Templates**    | 4 production-ready templates: Vanilla/React × JS/TS                         |
| **Smart Dependency Flow** | Uses Bun by default, falls back to NPM with automatic installation          |
| **Developer Experience**  | Rich CLI interface with progress indicators and success summaries           |
| **Cross-Platform**        | Works seamlessly on macOS, Linux, and Windows                               |
| **Git Integration**       | Optional automatic Git repository initialization                            |

## Installation

Use either Bun or NPM to install:

### With Bun (Recommended)
```bash
bun create waskit my-project
```

### With NPM
```bash
npm create waskit my-project
```

💡 **Pro Tip**: Using Bun provides faster installation and better DX with its integrated toolchain.

## Getting Started

### Quick Start
```bash
bun create waskit my-project  # Or: npm create waskit my-project
cd my-project
bun run dev
```

### Command Line Options

| Option                | Description                                      |
|-----------------------|--------------------------------------------------|
| `-f, --force`         | Overwrite target directory if it exists          |
| `-s, --skip-install`  | Skip dependency installation                     |
| `-g, --git`           | Initialize git repository                        |
| `-t, --template <template>` | Specify a template to use (e.g., react-javascript) |
| `list`                | List all available templates                     |

Examples:
```bash
# Create a project with git initialization
bun create waskit my-project --git

# Create a project using a specific template
bun create waskit my-project --template react-typescript

# Create a project and overwrite existing directory
bun create waskit my-project --force

# List all available templates
bun create waskit list
```

### Interactive Setup
1. Select your stack:
   - 🔹 Language: JavaScript or TypeScript
   - 🔹 Framework: Vanilla or React
   - 🔹 CSS Framework: Include Tailwind CSS or not

2. Watch as create-waskit:
   - 📁 Creates project structure
   - 📦 Installs dependencies
   - 🛠️  Configures Vite & Tailwind (if selected)
   - 🚀 Provides next steps

### Development Workflow
```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Deploy to GitHub Pages (if configured)
bun run deploy
```

🌐 Visit [http://localhost:5173](http://localhost:5173) to see your project

## Project Templates

We offer four professionally-crafted templates:

### 📦 Available Templates
| Template              | Tech Stack                     | Use Case                          |
|-----------------------|--------------------------------|-----------------------------------|
| Vanilla JavaScript    | HTML + JS + Tailwind (optional) | Lightweight projects              |
| Vanilla TypeScript    | HTML + TS + Tailwind (optional) | Type-safe vanilla projects        |
| React JavaScript      | React 19 + JSX + Tailwind (optional) | Modern React applications         |
| React TypeScript      | React 19 + TSX + Tailwind (optional) | Scalable type-safe React apps     |

### 🧱 Template Structure
All templates include:
- ✅ Vite configuration optimized for performance
- ✅ Tailwind CSS with default theme (if selected)
- ✅ Modern ES module setup
- ✅ Development and production scripts
- ✅ GitHub Pages deployment configuration
- ✅ Basic project structure with best practices

## System Requirements

| Dependency | Version  | Notes                          |
|------------|----------|--------------------------------|
| Bun        | v1.0+    | Recommended for faster setup   |
| Node.js    | v18.0+   | Required if using NPM          |
| npm        | v8.0+    | Required if not using Bun      |

💡 Tip: For optimal performance, we recommend using Bun as your package manager.

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

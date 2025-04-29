# create-waskit

`create-waskit` (Web App Starter Kit) is a command-line tool designed to streamline the setup of modern web projects. It scaffolds new projects with Vite and Tailwind CSS, offering flexible templates for JavaScript or TypeScript, with options for Vanilla or React setups. This tool enables developers to kickstart their projects with minimal configuration.

## Features

- **Fast Setup**: Scaffold a project in seconds using Bun or NPM.
- **Template Options**:
  - Vanilla JavaScript
  - Vanilla TypeScript
  - React with JavaScript
  - React with TypeScript
- **Integrated Tools**: Includes Vite for fast builds and Tailwind CSS for utility-first styling.
- **Automatic Dependency Installation**: Automatically installs dependencies using Bun (if available) or falls back to NPM.

## Installation

You can use `create-waskit` with either Bun or NPM.

### Using Bun

```bash
bun create waskit <project-name>
```

### Using NPM

```bash
npm create waskit <project-name>
```

Replace `<project-name>` with the desired name for your project directory.

## Usage

1. Run the command:

   ```bash
   bun create waskit my-project
   ```

   or

   ```bash
   npm create waskit my-project
   ```

2. Choose your preferred language:

   - JavaScript
   - TypeScript

3. Select a framework:

   - Vanilla
   - React

4. The tool will create a new directory (`my-project`), copy the selected template, and install dependencies automatically.

5. Navigate to your project directory:

   ```bash
   cd my-project
   ```

6. Start the development server:

   ```bash
   bun run dev
   ```

7. _(Optional)_ Watch for Tailwind CSS changes:

   ```bash
   bun run tailwind
   ```

8. Open your browser at [http://localhost:5173](http://localhost:5173) (Vite’s default port) to view your project.

## Template Options

`create-waskit` provides four template combinations:

- **Vanilla JavaScript**: A basic setup with Vite and Tailwind CSS.
- **Vanilla TypeScript**: A TypeScript-based setup with Vite and Tailwind CSS.
- **React JavaScript**: A React project with Vite and Tailwind CSS.
- **React TypeScript**: A React project with TypeScript, Vite, and Tailwind CSS.

Each template includes:

- A `package.json` configured for Vite and Tailwind CSS.
- A `vite.config.js` file for Vite settings.
- A basic `index.html` with Tailwind CSS linked.
- A `src/` directory with an entry point (`main.js`, `main.ts`, `main.jsx`, or `main.tsx`).

## Requirements

- **Bun** (optional but recommended for faster installs) or **NPM**.
- **Node.js** (if using NPM).

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Submit a pull request with a clear description of your changes.

## Issues

If you encounter any issues or have suggestions, please open an issue on the GitHub repository.

## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for details.


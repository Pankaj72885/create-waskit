# Bun Vanilla JavaScript Template

This template provides a basic setup for developing web applications using Bun and vanilla JavaScript with Tailwind CSS.

## Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)

## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run deploy` - Deploy Github Pages

## Project Structure

```
/
├── src/
│   └── main.js
├── public/
│   └── index.html
└── README.md
```

## Development

Add your JavaScript code in the `src` directory and your WebAssembly modules in the appropriate location. Bun will handle the bundling and serving of your application.

## Building

To build your project for production:

```bash
bun build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Feel free to submit issues and pull requests.

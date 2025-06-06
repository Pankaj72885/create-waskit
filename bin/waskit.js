#!/usr/bin/env bun

import { program } from "commander";
import path from "path";
import inquirer from "inquirer";
import { spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Configuration ---
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");

// --- Helper Functions ---

/**
 * Checks if Bun is the current runtime.
 * @returns {boolean}
 */
const isBun = () => process.versions.bun !== undefined;

/**
 * Spawns a synchronous process with common options.
 * @param {string} command - The command to run.
 * @param {string[]} args - The arguments for the command.
 * @param {string} cwd - The working directory.
 * @returns {import('child_process').SpawnSyncReturns<Buffer>}
 */
const spawn = (command, args, cwd) => {
  return spawnSync(command, args, { cwd, stdio: "inherit", shell: true });
};

/**
 * Copies a directory recursively.
 * @param {string} src - The source directory.
 * @param {string} dest - The destination directory.
 */
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Removes Tailwind CSS from the project.
 * @param {string} projectDirectory - The project directory.
 */
async function removeTailwind(projectDirectory) {
  const cssPaths = [
    path.join(projectDirectory, "src", "index.css"),
    path.join(projectDirectory, "src", "style.css"),
  ];

  for (const cssPath of cssPaths) {
    if (existsSync(cssPath)) {
      let content = await fs.readFile(cssPath, "utf8");
      content = content.replace(/@import ['"]tailwindcss['"];?/g, "");
      await fs.writeFile(cssPath, content);
      console.log(`✅ Removed Tailwind CSS from ${path.basename(cssPath)}`);
    }
  }

  const htmlPath = path.join(projectDirectory, "index.html");
  if (existsSync(htmlPath)) {
    let content = await fs.readFile(htmlPath, "utf8");
    content = content.replace(/class=".*?"/g, "");
    await fs.writeFile(htmlPath, content);
    console.log("✅ Removed Tailwind CSS classes from index.html");
  }

  // More robustly find vite config
  const viteConfig = (await fs.readdir(projectDirectory)).find((file) =>
    file.startsWith("vite.config.")
  );

  if (viteConfig) {
    const viteConfigPath = path.join(projectDirectory, viteConfig);
    let content = await fs.readFile(viteConfigPath, "utf8");
    content = content.replace(
      /import tailwindcss(?:(?:\/vite))? from ['"](?:@tailwindcss\/vite|tailwindcss(?:(?:\/vite)?))['"];\n?/g,
      ""
    );
    content = content.replace(/tailwindcss\(\),?/g, "");
    content = content.replace(/plugins: \[\s*,\s*\]/g, "plugins: []");
    await fs.writeFile(viteConfigPath, content);
    console.log(`✅ Removed Tailwind CSS plugin from ${viteConfig}`);
  }
}

// --- Core Functions ---

/**
 * Creates a new project.
 * @param {string} projectDirectory - The directory for the new project.
 * @param {Object} options - Command-line options.
 */
const createProject = async (projectDirectory, options) => {
  try {
    const projectName = path.basename(path.resolve(projectDirectory));
    const absoluteProjectPath = path.resolve(process.cwd(), projectDirectory);

    if (existsSync(absoluteProjectPath) && !options.force) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `Directory "${projectName}" already exists. Overwrite?`,
          default: false,
        },
      ]);
      if (!overwrite) {
        console.log("Project creation cancelled.");
        return;
      }
    }

    let { template } = options;
    let cssFramework = true;

    if (!template) {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "language",
          message: "Select a language:",
          choices: ["JavaScript", "TypeScript"],
        },
        {
          type: "list",
          name: "framework",
          message: "Select a framework:",
          choices: ["Vanilla", "React"],
        },
        {
          type: "confirm",
          name: "cssFramework",
          message: "Include Tailwind CSS?",
          default: true,
        },
      ]);
      template = `${answers.framework.toLowerCase()}-${answers.language.toLowerCase()}`;
      cssFramework = answers.cssFramework;
    }

    const templateDir = path.join(TEMPLATES_DIR, template);
    if (!existsSync(templateDir)) {
      console.error(
        `❌ Template "${template}" not found. Try 'create-waskit list'.`
      );
      return;
    }

    console.log(`\n📁 Creating project "${projectName}"...`);
    if (!existsSync(absoluteProjectPath)) {
      mkdirSync(absoluteProjectPath, { recursive: true });
    }
    await copyDir(templateDir, absoluteProjectPath);

    const packageJsonPath = path.join(absoluteProjectPath, "package.json");
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf8")
      );
      packageJson.name = projectName;
      if (!cssFramework) {
        delete packageJson.devDependencies["tailwindcss"];
        delete packageJson.devDependencies["postcss"];
        delete packageJson.devDependencies["autoprefixer"];
      }
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    if (!cssFramework) {
      console.log("\n🧹 Removing Tailwind CSS...");
      await removeTailwind(absoluteProjectPath);
    }

    if (options.git) {
      console.log("\n🔄 Initializing git repository...");
      if (spawn("git", ["init"], absoluteProjectPath).status === 0) {
        spawn("git", ["add", "."], absoluteProjectPath);
        spawn("git", ["commit", "-m", "Initial commit"], absoluteProjectPath);
        console.log("✅ Git repository initialized.");
      } else {
        console.warn("⚠️ Git initialization failed. Is git installed?");
      }
    }

    if (!options.skipInstall) {
      console.log("\n📦 Installing dependencies...");
      const manager = isBun() ? "bun" : "npm";
      if (spawn(manager, ["install"], absoluteProjectPath).status !== 0) {
        console.error(`❌ Failed to install dependencies with ${manager}.`);
      } else {
        console.log("✅ Dependencies installed.");
      }
    }

    console.log("\n🎉 Project setup complete! Next steps:");
    console.log(`  cd ${projectDirectory}`);
    console.log(`  ${isBun() ? "bun" : "npm"} run dev`);
  } catch (error) {
    console.error(`\n❌ An error occurred: ${error.message}`);
  }
};

/**
 * Lists available templates.
 */
const listTemplates = async () => {
  try {
    if (!existsSync(TEMPLATES_DIR)) {
      console.error("❌ Templates directory not found.");
      return;
    }
    const dirents = await fs.readdir(TEMPLATES_DIR, { withFileTypes: true });
    const templates = dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log("\n📋 Available templates:");
    templates.forEach((template) => console.log(`  - ${template}`));
  } catch (error) {
    console.error(`\n❌ Error listing templates: ${error.message}`);
  }
};

// --- CLI Setup ---
program
  .name("create-waskit")
  .description("Create modern web projects with minimal setup")
  .version("0.0.16"); // Bumped version for new feature

program
  .argument("[project-directory]", "Directory for the new project")
  .option("-f, --force", "Overwrite the target directory if it exists")
  .option("-s, --skip-install", "Skip dependency installation")
  .option("-g, --git", "Initialize a git repository")
  .option("-t, --template <template>", "Specify a template to use")
  .action(async (projectDirectory, options) => {
    let dir = projectDirectory;

    // If no project directory is provided, prompt the user for it.
    if (!dir) {
      const { newProjectDirectory } = await inquirer.prompt([
        {
          type: "input",
          name: "newProjectDirectory",
          message: "What is the name of your new project?",
          validate: (input) => {
            // Basic validation to ensure the directory name isn't empty.
            if (input.trim()) return true;
            return "Project name cannot be empty.";
          },
        },
      ]);
      dir = newProjectDirectory.trim();
    }

    // Call createProject. It will handle the rest, including
    // prompting for language/framework if no template is specified.
    await createProject(dir, options);
  });

program
  .command("list")
  .description("List all available templates")
  .action(listTemplates);

program.parse(process.argv);

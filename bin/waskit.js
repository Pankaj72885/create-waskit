#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import { existsSync } from "fs"; // existsSync is still synchronous
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import { performance } from "perf_hooks";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Utility function to validate project name
function isValidProjectName(name) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

// Utility function for error handling
class CLIError extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

const createProject = async (projectDirectory) => {
  const startTime = performance.now();
  const projectName = path.basename(projectDirectory);

  try {
    // Validate project name format
    if (!isValidProjectName(projectName)) {
      throw new CLIError(
        "Project name must be lowercase with optional hyphens (e.g., my-project)"
      );
    }

    // Check if project directory already exists
    if (existsSync(projectDirectory)) {
      throw new CLIError(
        `Directory "${projectDirectory}" already exists. Please choose a different name.`
      );
    }

    console.log(chalk.blue(`\n🚀 Creating new project: ${projectName}\n`));

    // Prompt user for template choices
    const { language, framework } = await inquirer.prompt([
      {
        type: "list",
        name: "language",
        message: chalk.cyan("Select a programming language:"),
        choices: ["JavaScript", "TypeScript"],
        default: "JavaScript"
      },
      {
        type: "list",
        name: "framework",
        message: chalk.cyan("Select a framework:"),
        choices: ["Vanilla", "React"],
        default: "Vanilla"
      },
    ]);

    // Determine the template directory using package-relative path
    const template = `${framework.toLowerCase()}-${language.toLowerCase()}`;
    const templateDir = path.resolve(__dirname, "..", "templates", template);

    if (!existsSync(templateDir)) {
      const availableTemplates = ["Vanilla-JavaScript", "Vanilla-TypeScript", "React-JavaScript", "React-TypeScript"]
        .map(t => chalk.yellow(t))
        .join("\n  ");
      
      throw new CLIError(
        `Template "${chalk.red(template)}" not found. Available templates:\n  ${availableTemplates}`
      );
    }

    console.log(chalk.cyan(`\n📁 Using template: ${template}`));

    // Copy template files to the project directory
    console.log(chalk.cyan(`\n COPYING FILES...`));
    await copyDir(templateDir, projectDirectory);

    // Update package.json with the project name
    const packageJsonPath = path.join(projectDirectory, "package.json");
    if (existsSync(packageJsonPath)) {
      const packageJsonText = await fs.readFile(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonText);
      packageJson.name = projectName;
      packageJson.description = `Project generated with create-waskit using ${language} and ${framework}`;
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } else {
      console.warn(chalk.yellow("Warning: package.json not found in the template."));
    }

    console.log(chalk.green(`\n✅ Project "${projectName}" created successfully with ${language} and ${framework}.`));

    // Install dependencies
    console.log(chalk.cyan(`\n INSTALLING DEPENDENCIES...`));
    try {
      execSync("bun --version", { stdio: "ignore" });
      console.log(chalk.magenta("Using Bun to install dependencies..."));
      execSync(`cd ${projectDirectory} && bun install`, { stdio: "inherit" });
    } catch {
      console.log(chalk.yellow("Bun not found. Falling back to npm..."));
      execSync(`cd ${projectDirectory} && npm install`, { stdio: "inherit" });
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(1);
    console.log(chalk.green(`\n🎉 Project setup completed in ${duration} seconds!`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(chalk.white(`1. cd ${projectName}`));
    console.log(chalk.white(`2. bun run dev  # or npm run dev if using npm`));
    console.log(chalk.white(`3. Start building your application!`));
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(error.code || 1);
  }
};

// Helper function to recursively copy directories (replacement for fs-extra's copySync)
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

program
  .version("0.0.3")
  .description("Create a new web project with Vite and Tailwind CSS")
  .argument("<project-directory>", "Name of the project directory")
  .action(createProject)
  .on("--help", () => {
    console.log(chalk.cyan(`\nExample usage:`));
    console.log(chalk.white(`  $ create-waskit my-project`));
    console.log(chalk.white(`  $ bun create waskit my-project`));
    console.log(chalk.white(`  $ npm create waskit my-project`));
  });

program.parse(process.argv);

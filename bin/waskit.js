#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import { existsSync } from "fs"; // existsSync is still synchronous
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createProject = async (projectDirectory) => {
  const projectName = path.basename(projectDirectory);

  try {
    // Prompt user for template choices
    const { language, framework } = await inquirer.prompt([
      {
        type: "list",
        name: "language",
        message: "Select a programming language:",
        choices: ["JavaScript", "TypeScript"],
      },
      {
        type: "list",
        name: "framework",
        message: "Select a framework:",
        choices: ["Vanilla", "React"],
      },
    ]);

    // Determine the template directory using package-relative path
    const template = `${framework.toLowerCase()}-${language.toLowerCase()}`;
    const templateDir = path.resolve(__dirname, "..", "templates", template);

    console.log(`Looking for template at: ${templateDir}`);

    if (!existsSync(templateDir)) {
      console.error(`Error: Template "${template}" not found.`);
      process.exit(1);
    }

    // Copy template files to the project directory
    console.log(`Creating project in "${projectDirectory}"...`);
    await copyDir(templateDir, projectDirectory);

    // Update package.json with the project name
    const packageJsonPath = path.join(projectDirectory, "package.json");
    if (existsSync(packageJsonPath)) {
      const packageJsonText = await fs.readFile(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonText);
      packageJson.name = projectName;
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } else {
      console.warn("Warning: package.json not found in the template.");
    }

    console.log(
      `Project "${projectName}" created successfully with ${language} and ${framework}.`
    );

    // Install dependencies
    console.log("Installing dependencies...");
    try {
      execSync("bun --version", { stdio: "ignore" });
      console.log("Using Bun to install dependencies...");
      execSync(`cd ${projectDirectory} && bun install`, { stdio: "inherit" });
    } catch {
      console.log("Bun not found. Falling back to npm...");
      execSync(`cd ${projectDirectory} && npm install`, { stdio: "inherit" });
    }

    console.log("Dependencies installed successfully.");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
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
  .version("1.0.7")
  .argument("<project-directory>", "Directory for the new project")
  .action(createProject);

program.parse(process.argv);



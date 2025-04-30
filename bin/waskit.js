#!/usr/bin/env bun

import { program } from "commander";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { spawnSync } from "child_process";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running with Bun
const isBun = process.versions.bun !== undefined;

/**
 * Creates a new project based on user-selected templates.
 * @param {string} projectDirectory - The directory where the project will be created.
 * @param {Object} options - Command options.
 */
const createProject = async (projectDirectory, options) => {
  // 1. Extract the project name from the directory path.
  const projectName = path.basename(projectDirectory);
  // 2. Resolve the absolute path to the project directory.
  const absoluteProjectPath = path.resolve(process.cwd(), projectDirectory);

  try {
    // 3. Validate project directory.
    if (existsSync(absoluteProjectPath) && !options.force) {
      // 4. If the directory exists and the user hasn't specified the --force option,
      // prompt the user to confirm whether they want to overwrite the directory.
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `Directory "${projectDirectory}" already exists. Do you want to overwrite it?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log("Project creation cancelled.");
        process.exit(0);
      }
    }

    let language, framework, cssFramework, template;

    // Check if a template is specified via command-line option.
    if (options.template) {
      // Use the specified template.
      template = options.template;
      const templateParts = template.split("-");
      if (templateParts.length !== 2) {
        console.error(
          `❌ Error: Invalid template format. Use framework-language (e.g., react-javascript)`
        );
        process.exit(1);
      }
      framework = templateParts[0];
      language = templateParts[1];
      cssFramework = "Yes"; // Assume Tailwind CSS is included

      const templateDir = path.resolve(__dirname, "..", "templates", template);
      if (!existsSync(templateDir)) {
        console.error(`❌ Error: Template "${template}" not found.`);
        process.exit(1);
      }

      console.log(`\nUsing template: ${template}`);
    } else {
      // Prompt user for template choices.
      const {
        language: selectedLanguage,
        framework: selectedFramework,
        cssFramework: selectedCssFramework,
      } = await inquirer.prompt([
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
        {
          type: "list",
          name: "cssFramework",
          message: "Include Tailwind CSS?",
          choices: ["Yes", "No"],
          default: "Yes",
        },
      ]);

      language = selectedLanguage;
      framework = selectedFramework;
      cssFramework = selectedCssFramework;

      // Determine the template directory using package-relative path.
      template = `${framework.toLowerCase()}-${language.toLowerCase()}`;

      // Validate the template name
      const templateDir = path.resolve(__dirname, "..", "templates", template);
      if (!existsSync(templateDir)) {
        console.error(`❌ Error: Template "${template}" not found.`);
        process.exit(1);
      }
    }
    // Resolve the template directory path.
    const templateDir = path.resolve(__dirname, "..", "templates", template);

    console.log(`\n🔍 Looking for template at: ${templateDir}`);

    if (!existsSync(templateDir)) {
      console.error(
        `❌ Error: Template directory "${template}" not found at ${templateDir}`
      );
      process.exit(1);
    }

    // Create project directory if it doesn't exist.
    if (!existsSync(absoluteProjectPath)) {
      mkdirSync(absoluteProjectPath, { recursive: true });
    }

    // Copy template files to the project directory.
    console.log(`\n📁 Creating project in "${projectDirectory}"...`);
    await copyDir(templateDir, absoluteProjectPath);

    // Update package.json with the project name.
    const packageJsonPath = path.join(absoluteProjectPath, "package.json");
    if (existsSync(packageJsonPath)) {
      let packageJson;

      if (isBun) {
        // Use Bun's built-in JSON parsing if available.
        packageJson = Bun.file(packageJsonPath).json();
        packageJson = await packageJson;
      } else {
        // Fallback to Node.js file reading.
        const fs = await import("fs/promises");
        const packageJsonText = await fs.readFile(packageJsonPath, "utf8");
        packageJson = JSON.parse(packageJsonText);
      }

      packageJson.name = projectName;

      // Remove Tailwind CSS if not selected.
      if (cssFramework === "No") {
        if (packageJson.dependencies) {
          delete packageJson.dependencies["tailwindcss"];
          delete packageJson.dependencies["@tailwindcss/vite"];
          delete packageJson.dependencies["postcss"];
          delete packageJson.dependencies["autoprefixer"];
        }
      }

      // Write updated package.json.
      if (isBun) {
        await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
      } else {
        const fs = await import("fs/promises");
        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2)
        );
      }
    } else {
      console.warn("⚠️ Warning: package.json not found in the template.");
    }

    // Remove Tailwind CSS if not selected.
    if (cssFramework === "No") {
      console.log("\n🧹 Removing Tailwind CSS...");
      await removeTailwind(absoluteProjectPath);
    }

    console.log(
      `\n✅ Project "${projectName}" created successfully with ${language} and ${framework}.`
    );

    // Initialize git repository if requested.
    if (options.git) {
      console.log("\n🔄 Initializing git repository...");
      try {
        const result = spawnSync("bun", ["x", "git", "init"], {
          cwd: absoluteProjectPath,
          stdio: "inherit",
          shell: true,
        });
        if (result.status !== 0) {
          throw new Error("Git init failed");
        }

        const addResult = spawnSync("bun", ["x", "git", "add", "."], {
          cwd: absoluteProjectPath,
          stdio: "inherit",
          shell: true,
        });
        if (addResult.status !== 0) {
          throw new Error("Git add failed");
        }

        const commitResult = spawnSync(
          "bun",
          ["x", "git", "commit", "-m", "Initial commit"],
          {
            cwd: absoluteProjectPath,
            stdio: "inherit",
            shell: true,
          }
        );
        if (commitResult.status !== 0) {
          throw new Error("Git commit failed");
        }
        console.log("✅ Git repository initialized successfully.");
      } catch (error) {
        console.warn(
          `⚠️ Warning: Failed to initialize git repository. Make sure git is installed. Error: ${error.message}`
        );
      }
    }

    // Install dependencies if not skipped.
    if (options.skipInstall) {
      console.log("\n📦 Installing dependencies...");

      try {
        // Check if Bun is available.
        execSync("bun --version", { stdio: "ignore" });
        console.log("🚀 Using Bun to install dependencies...");

        const result = spawnSync("bun", ["install"], {
          cwd: absoluteProjectPath,
          stdio: "inherit",
          shell: true,
        });

        if (result.status !== 0) {
          throw new Error("Bun install failed");
        }
      } catch (error) {
        console.log(
          "⚠️ Bun not found or installation failed. Falling back to npm..."
        );

        const npmInstall = Bun.spawn(["npm", "install"], {
          cwd: absoluteProjectPath,
          stdio: "pipe",
        });

        const npmResult = await npmInstall.exited;

        if (npmResult !== 0) {
          const decoder = new TextDecoder();
          const errorText = decoder.decode(
            await npmInstall.stderr.arrayBuffer()
          );
          console.error(
            `❌ Failed to install dependencies. Please run 'npm install' manually. Error:\n${errorText}`
          );
        }
      }

      console.log("✅ Dependencies installed successfully.");
    }

    // Show next steps.
    console.log("\n🎉 Project setup complete! Next steps:");
    console.log(`  cd ${projectDirectory}`);
    console.log("  bun run dev");
    console.log(
      "\n📚 For more information, check out the README.md file in your project directory."
    );
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Lists all available templates
 */
const listTemplates = () => {
  const templatesDir = path.resolve(__dirname, "..", "templates");

  if (!existsSync(templatesDir)) {
    console.error("❌ Error: Templates directory not found.");
    process.exit(1);
  }

  try {
    const templates = [];
    const fs = require("fs");
    const dirs = fs.readdirSync(templatesDir);

    dirs.forEach((dir) => {
      const templatePath = path.join(templatesDir, dir);
      if (fs.statSync(templatePath).isDirectory()) {
        templates.push(dir);
      }
    });

    console.log("\n📋 Available templates:");
    templates.forEach((template) => {
      console.log(`  - ${template}`);
    });
    console.log("\nUse: create-waskit <project-directory>");
  } catch (error) {
    console.error(`\n❌ Error listing templates: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Helper function to recursively copy directories
 * Uses Bun's file operations when available, falls back to Node.js fs
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
async function copyDir(src, dest) {
  if (isBun) {
    // Use Bun's file system operations if available
    try {
      // Create destination directory
      mkdirSync(dest, { recursive: true });

      // Read source directory
      const entries = await Bun.file(src).directory();

      // Process each entry
      for (const [name, type] of Object.entries(entries)) {
        const srcPath = path.join(src, name);
        const destPath = path.join(dest, name);

        if (type === "directory") {
          await copyDir(srcPath, destPath);
        } else {
          const content = await Bun.file(srcPath).arrayBuffer();
          await Bun.write(destPath, content);
        }
      }
    } catch (error) {
      // Fall back to Node.js implementation if Bun's API fails
      await nodeCopyDir(src, dest);
    }
  } else {
    // Use Node.js implementation
    await nodeCopyDir(src, dest);
  }
}

/**
 * Node.js implementation of directory copying
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
async function nodeCopyDir(src, dest) {
  const fs = await import("fs/promises");
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await nodeCopyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Removes Tailwind CSS from the project
 * @param {string} projectDirectory - The directory of the project
 */
async function removeTailwind(projectDirectory) {
  const fs = await import("fs/promises");

  // Remove Tailwind CSS from index.css
  const cssPath = path.join(projectDirectory, "src", "index.css");
  if (existsSync(cssPath)) {
    await fs.writeFile(cssPath, "", "utf8");
    console.log("✅ Removed Tailwind CSS from index.css");
  }

  // Remove Tailwind CSS classes from index.html
  const htmlPath = path.join(projectDirectory, "index.html");
  if (existsSync(htmlPath)) {
    let htmlContent = await fs.readFile(htmlPath, "utf8");
    htmlContent = htmlContent.replace(/class=".*?"/g, "");
    await fs.writeFile(htmlPath, htmlContent, "utf8");
    console.log("✅ Removed Tailwind CSS classes from index.html");
  }

  // Remove Tailwind CSS plugin from vite.config.js/ts/jsx
  const viteConfigPaths = [
    path.join(projectDirectory, "vite.config.js"),
    path.join(projectDirectory, "vite.config.ts"),
    path.join(projectDirectory, "vite.config.jsx"),
  ];

  for (const viteConfigPath of viteConfigPaths) {
    if (existsSync(viteConfigPath)) {
      let viteConfigContent = await fs.readFile(viteConfigPath, "utf8");
      viteConfigContent = viteConfigContent.replace(
        /import tailwindcss\/vite from 'tailwindcss\/vite';\n?/g,
        ""
      );
      viteConfigContent = viteConfigContent.replace(
        /import tailwindcss from "@tailwindcss\/vite";\n?/g,
        ""
      );
      viteConfigContent = viteConfigContent.replace(
        /tailwindcss\/vite\(\)/g,
        ""
      );
      viteConfigContent = viteConfigContent.replace(/tailwindcss\(\)/g, "");
      await fs.writeFile(viteConfigPath, viteConfigContent, "utf8");
      console.log(
        `✅ Removed Tailwind CSS plugin from ${path.basename(viteConfigPath)}`
      );
    }
  }
}

// Set up CLI commands and options
program
  .name("create-waskit")
  .description(
    "WASKit (Web App Starter Kit) - Create modern web projects with minimal setup"
  )
  .version("0.0.11");

program
  .argument("[project-directory]", "Directory for the new project")
  .option("-f, --force", "Overwrite the target directory if it exists")
  .option("-s, --skip-install", "Skip dependency installation")
  .option("-g, --git", "Initialize a git repository")
  .option(
    "-t, --template <template>",
    "Specify a template to use (e.g., react-javascript)"
  )
  .action((projectDirectory, options) => {
    if (!projectDirectory) {
      // Use default template if not provided
      options.template = "react-javascript";
      createProject(".", options);
    } else {
      // Set default template if not provided
      if (!options.template) {
        options.template = "react-javascript";
      }
      createProject(projectDirectory, options);
    }
  });

program
  .command("list")
  .description("List all available templates")
  .action(listTemplates);

program.parse(process.argv);

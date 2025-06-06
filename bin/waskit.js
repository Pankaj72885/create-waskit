import { program } from "commander";
import path from "path";
import inquirer from "inquirer";
import { spawnSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs/promises";
import chalk from "chalk";

// --- Configuration & Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORRECTED PATH: Go up one level from 'bin' to the project root to find the 'templates' folder.
const TEMPLATES_DIR = path.resolve(__dirname, "..", "templates");
let templatesConfig = {};

// --- Helper & Logging Functions ---

const log = {
  info: (msg) => console.log(chalk.blue(msg)),
  success: (msg) => console.log(chalk.green(msg)),
  warn: (msg) => console.log(chalk.yellow(msg)),
  error: (msg) => console.error(chalk.red(msg)),
  message: (msg) => console.log(msg),
};

/**
 * Loads the template configuration from templates.json.
 */
async function loadTemplatesConfig() {
  try {
    // CORRECTED PATH: Looks for templates.json in the same 'bin' directory as this script.
    const configPath = path.resolve(__dirname, "templates.json");
    if (!existsSync(configPath)) {
      log.error(
        "❌ Critical Error: templates.json not found in the 'bin' directory!"
      );
      process.exit(1);
    }
    const configData = await fs.readFile(configPath, "utf8");
    templatesConfig = JSON.parse(configData);
  } catch (err) {
    log.error(`❌ Critical Error loading templates.json: ${err.message}`);
    process.exit(1);
  }
}

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

// --- Core Project Creation Functions ---

/**
 * Prompts the user for any missing required options.
 * @param {string|undefined} projectDirectory
 * @param {Object} options
 * @returns {Promise<{projectDirectory: string, template: string, cssFramework: boolean}>}
 */
async function promptForMissingOptions(projectDirectory, options) {
  let dir = projectDirectory;
  let template = options.template;
  let cssFramework = options.template ? true : undefined;

  if (!dir) {
    const { newDir } = await inquirer.prompt([
      {
        type: "input",
        name: "newDir",
        message: "What is the name of your new project?",
        validate: (input) =>
          input.trim() ? true : "Project name cannot be empty.",
      },
    ]);
    dir = newDir.trim();
  }

  if (!template) {
    const { selectedTemplate, selectedCss } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedTemplate",
        message: "Select a project template:",
        choices: Object.entries(templatesConfig.templates).map(
          ([key, { name }]) => ({
            name: name,
            value: key,
          })
        ),
      },
      {
        type: "confirm",
        name: "selectedCss",
        message: "Include Tailwind CSS?",
        default: true,
      },
    ]);
    template = selectedTemplate;
    cssFramework = selectedCss;
  }

  return { projectDirectory: dir, template, cssFramework };
}

/**
 * Copies template files to the destination project directory.
 * @param {string} templateName - The name of the template.
 * @param {string} projectPath - The absolute path to the project.
 */
async function copyTemplateFiles(templateName, projectPath) {
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  if (!existsSync(templateDir)) {
    log.error(
      `❌ Template directory "${templateName}" not found. Please check your templates.json and folder structure.`
    );
    process.exit(1);
  }
  log.info(`\n📁 Creating project from template: ${templateName}...`);
  await copyDir(templateDir, projectPath);

  // Handle .gitignore renaming
  const gitignoreTemplatePath = path.join(projectPath, "gitignore.template");
  if (existsSync(gitignoreTemplatePath)) {
    await fs.rename(
      gitignoreTemplatePath,
      path.join(projectPath, ".gitignore")
    );
    log.success("✅ Created .gitignore file.");
  }
}

/**
 * Updates the project's package.json with the project name and cleans dependencies.
 * @param {string} projectPath - The absolute path to the project.
 * @param {string} projectName - The name of the project.
 * @param {boolean} useTailwind - Whether to keep or remove Tailwind dependencies.
 */
async function updatePackageJson(projectPath, projectName, useTailwind) {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (!existsSync(packageJsonPath)) {
    log.warn(
      "⚠️ No package.json found in the template. Skipping modification."
    );
    return;
  }

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  packageJson.name = projectName;

  if (!useTailwind) {
    log.info("🧹 Removing Tailwind CSS dependencies from package.json...");
    const tailwindDeps = templatesConfig.tailwind?.dependencies || [];
    if (packageJson.devDependencies) {
      for (const dep of tailwindDeps) {
        delete packageJson.devDependencies[dep];
      }
    }
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log.success("✅ Updated package.json.");
}

/**
 * Removes Tailwind-related files and code from the project.
 * @param {string} projectPath - The absolute path to the project.
 */
async function cleanupTailwindFiles(projectPath) {
  log.info("🧹 Removing Tailwind CSS configuration and code...");

  // Remove .prettierrc if it exists
  const prettierrcPath = path.join(projectPath, ".prettierrc");
  if (existsSync(prettierrcPath)) {
    await fs.unlink(prettierrcPath);
    log.success("✅ Removed .prettierrc.");
  }

  // Clean CSS files
  for (const cssFile of templatesConfig.tailwind?.cssFiles || []) {
    const cssPath = path.join(projectPath, "src", cssFile);
    if (existsSync(cssPath)) {
      let content = await fs.readFile(cssPath, "utf8");
      content = content
        .replace(/@import ['"]tailwindcss['"];?/g, "")
        .replace(/@tailwind .*;/g, "");
      await fs.writeFile(cssPath, content);
      log.success(`✅ Cleaned ${cssFile}.`);
    }
  }

  // Clean index.html
  const htmlPath = path.join(projectPath, "index.html");
  if (existsSync(htmlPath)) {
    let content = await fs.readFile(htmlPath, "utf8");
    content = content.replace(/class=".*?"/g, "");
    await fs.writeFile(htmlPath, content);
    log.success("✅ Cleaned index.html.");
  }
}

/**
 * Initializes a git repository in the project directory.
 * @param {string} projectPath - The absolute path to the project.
 */
function initializeGitRepo(projectPath) {
  log.info("\n🔄 Initializing git repository...");
  try {
    spawn("git", ["init"], projectPath);
    spawn("git", ["add", "."], projectPath);
    spawn(
      "git",
      ["commit", "-m", "Initial commit from create-waskit"],
      projectPath
    );
    log.success("✅ Git repository initialized successfully.");
  } catch (error) {
    log.warn(`⚠️ Could not initialize git repository. Is git installed?`);
  }
}

/**
 * Installs project dependencies using bun or npm.
 * @param {string} projectPath - The absolute path to the project.
 */
function installDependencies(projectPath) {
  const manager = isBun() ? "bun" : "npm";
  log.info(`\n📦 Installing dependencies with ${manager}...`);
  const result = spawn(manager, ["install"], projectPath);
  if (result.status !== 0) {
    log.error(
      `❌ Dependency installation failed. Please run '${manager} install' manually.`
    );
  } else {
    log.success("✅ Dependencies installed successfully.");
  }
}

/**
 * The main function to create a project.
 * @param {string} projectDirectory - The directory for the new project.
 * @param {Object} options - Command-line options.
 */
const createProject = async (projectDirectory, options) => {
  try {
    const userInput = await promptForMissingOptions(projectDirectory, options);
    const { template, cssFramework } = userInput;
    const finalProjectDir = userInput.projectDirectory;

    const projectName = path.basename(path.resolve(finalProjectDir));
    const absoluteProjectPath = path.resolve(process.cwd(), finalProjectDir);

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
        log.message("Project creation cancelled.");
        return;
      }
    }

    await copyTemplateFiles(template, absoluteProjectPath);
    await updatePackageJson(absoluteProjectPath, projectName, cssFramework);

    if (!cssFramework) {
      await cleanupTailwindFiles(absoluteProjectPath);
    }

    if (options.git) {
      initializeGitRepo(absoluteProjectPath);
    }

    if (!options.skipInstall) {
      installDependencies(absoluteProjectPath);
    }

    log.success("\n🎉 Project setup complete! Your journey begins now.");
    log.message(`\nNext steps:\n`);
    log.message(`  cd ${finalProjectDir}`);
    log.message(`  ${isBun() ? "bun" : "npm"} run dev\n`);
  } catch (error) {
    log.error(`\n❌ An unexpected error occurred: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Lists available templates from the configuration file.
 */
const listTemplates = async () => {
  log.info("\n📋 Available Templates:");
  for (const [key, { name, description }] of Object.entries(
    templatesConfig.templates
  )) {
    log.message(`  - ${chalk.cyan(key)}: ${name}`);
    log.message(`    ${description}`);
  }
  log.message("\nTo create a project using a template, run:");
  log.message("  create-waskit <project-directory> -t <template-name>\n");
};

// --- CLI Setup & Execution ---
async function main() {
  await loadTemplatesConfig();

  program
    .name("create-waskit")
    .description("A modern web project generator for the discerning developer.")
    .version("0.0.24"); // Version bump for the fix

  program
    .argument("[project-directory]", "The directory for the new project")
    .option("-f, --force", "Overwrite the target directory if it exists")
    .option("-s, --skip-install", "Skip dependency installation")
    .option("-g, --git", "Initialize a git repository")
    .option("-t, --template <template>", "Specify a template to use directly")
    .action(createProject);

  program
    .command("list")
    .description("List all available project templates")
    .action(listTemplates);

  program.parse(process.argv);
}

main().catch((err) => {
  log.error(`A critical error occurred: ${err.message}`);
  process.exit(1);
});

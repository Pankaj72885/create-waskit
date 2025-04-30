# Getting Started with WASKit

WASKit (Web App Starter Kit) is a command-line tool designed to streamline the setup of modern web projects. It scaffolds new projects with Vite and Tailwind CSS, offering flexible templates for JavaScript or TypeScript, with options for Vanilla or React setups. This guide will walk you through the process of creating a new project using WASKit.

## Prerequisites

*   [Bun](https://bun.sh/) (latest version recommended)

## Installation

To install WASKit, run the following command:

```bash
bun install -g create-waskit
```

## Usage

To create a new project, run the following command:

```bash
create-waskit <project-directory>
```

Replace `<project-directory>` with the name of the directory where you want to create the project.

You will be prompted to select a programming language, a framework, and whether to include Tailwind CSS.

Alternatively, you can use the `--template` option to specify a template directly from the command line:

```bash
create-waskit <project-directory> --template react-javascript
```

This will create a new project using the React JavaScript template.

## Available Templates

*   `react-javascript`
*   `react-typescript`
*   `vanilla-javascript`
*   `vanilla-typescript`

## Next Steps

Once the project is created, navigate to the project directory and run the following command to start the development server:

```bash
bun dev
```

For more information, check out the README.md file in your project directory.

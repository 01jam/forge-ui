import chalk from "chalk";
import { Command } from "commander";
import getPackageJsonInfo from "./config/loadConfig";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import validateNpmPackageName from "validate-npm-package-name";

export interface PackageJSON {
	name: string;
	version: string;
}
interface ProjectOptions {
	forge: {
		path: string;
		source: string;
		packageJSON: PackageJSON;
	};
	project: {
		name: string | null;
		path: string | null;
		packageJSON: PackageJSON | null;
	};
}

const options: ProjectOptions = {
	forge: {
		path: process.cwd(),
		source: "https://github.com/01jam/ui.git",
		packageJSON: getPackageJsonInfo(
			path.join(__dirname, "..", `package.json`) // this path should not be changed since the script will be bundled in a single file
		),
	},
	project: {
		name: null,
		path: null,
		packageJSON: null,
	},
};

const init = () => {
	/**
	 * Get project name
	 */
	const command = new Command();
	command
		.name(options.forge.packageJSON.name)
		.version(options.forge.packageJSON.version)
		.arguments("<project-directory>")
		.usage(`${chalk.green("<project-directory>")} [options]`)
		.action((name) => (options.project.name = name))
		.parse(process.argv);

	if (options.project.name === null) {
		console.error("Please specify the project directory:");
		console.log(
			`  ${chalk.cyan(command.name())} ${chalk.green(
				"<project-directory>"
			)}`
		);
		console.log();
		console.log("For example:");
		console.log(
			`  ${chalk.cyan(command.name())} ${chalk.green("my-react-app")}`
		);
		console.log();
		console.log(
			`Run ${chalk.cyan(`${command.name()} --help`)} to see all options.`
		);
		process.exit(1);
	}

	/**
	 * Validate project name
	 */
	const validationResult = validateNpmPackageName(options.project.name);

	if (!validationResult.validForNewPackages) {
		console.error(
			chalk.red(
				`Cannot create a project named ${chalk.green(
					`"${options.project.name}"`
				)} because of npm naming restrictions:\n`
			)
		);
		[
			...(validationResult.errors || []),
			...(validationResult.warnings || []),
		].forEach((error) => {
			console.error(chalk.red(`  * ${error}`));
		});
		console.error(chalk.red("\nPlease choose a different project name."));
		process.exit(1);
	}

	/**
	 * Generate paths
	 */
	options.project.path = path.join(options.forge.path, options.project.name);

	/**
	 * Generate project folder
	 */
	try {
		fs.mkdirSync(options.project.path);
	} catch (e) {
		if (e.code === "EEXIST") {
			console.log(
				`The file ${options.project.name} already exist in the current directory, please give it another name.`
			);
		} else {
			console.error(e.message);
		}
		process.exit(1);
	}

	/**
	 * Clone source repo
	 */
	try {
		console.log("Downloading files...");
		execSync(
			`git clone --depth 1 "${options.forge.source}" "${options.project.path}"`
		);

		// Enter cloned source folder
		process.chdir(options.project.path);

		// Install dependencies
		console.log("Installing dependencies...");
		execSync("npm install");

		// Clean cloned source folder
		console.log("Removing useless files");
		execSync(`npx rimraf "${path.join(options.project.path, ".git")}"`);

		// Copy cloned source package JSON
		options.project.packageJSON = getPackageJsonInfo(
			path.join(options.project.path, "package.json")
		);

		// Update cloned package JSON
		options.project.packageJSON.name = options.project.name;

		// Overwrite cloned source package JSON
		try {
			fs.writeFileSync(
				path.join(options.project.path, "package.json"),
				JSON.stringify(options.project.packageJSON, null, "\t")
			);
		} catch (e) {
			console.log(e);
		}

		// Success message
		console.log("The installation is done, this is ready to use !");
	} catch (e) {
		console.log(e.message);
	}
};

export default init;

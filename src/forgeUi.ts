import chalk from "chalk";
import { Command } from "commander";
import getPackageJsonInfo from "./config/loadConfig";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const init = () => {
	let projectName: string | null = null;
	const currentPath = process.cwd();
	const git_repo = "https://github.com/01jam/ui.git";
	const packageJson = getPackageJsonInfo(
		path.join(__dirname, "..", `package.json`)
	);

	const command = new Command();
	command
		.name(packageJson.name)
		.version(packageJson.version)
		.arguments("<project-directory>")
		.usage(`${chalk.green("<project-directory>")} [options]`)
		.action((name) => (projectName = name))
		.parse(process.argv);

	if (projectName === null) {
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

	const projectPath = path.join(currentPath, projectName);

	console.log(projectPath);
	try {
		fs.mkdirSync(projectPath);
	} catch (e) {
		if (e.code === "EEXIST") {
			console.log(
				`The file ${projectName} already exist in the current directory, please give it another name.`
			);
		} else {
			console.log("#2");
			console.log(e);
		}
		process.exit(1);
	}

	try {
		console.log("Downloading files...");
		execSync(`git clone --depth 1 "${git_repo}" "${projectPath}"`);

		process.chdir(projectPath);

		console.log("Installing dependencies...");
		execSync("npm install");

		console.log("Removing useless files");
		execSync(`npx rimraf ${path.join(projectPath, ".git")}`);

		// Update package.json file name
		const projectPackageJson = getPackageJsonInfo(
			path.join(__dirname, "..", `package.json`)
		);
		projectPackageJson.name = projectName;
		execSync(`npx rimraf ${path.join(projectPath, "package.json")}`);

		try {
			fs.writeFileSync(
				path.join(projectPath, "package.json"),
				JSON.stringify(projectPackageJson, null, "\t")
			);
		} catch (e) {
			console.log(e);
		}

		console.log("The installation is done, this is ready to use !");
	} catch (e) {
		console.log(e);
	}
};

export default init;

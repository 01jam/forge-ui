#!/usr/bin/env node

import init from "./forgeUi";

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split(".");
const major = Number(semver[0]);

if (major < 14) {
	console.error(
		"You are running Node " +
			currentNodeVersion +
			".\n" +
			"Forge UI requires Node 14 or higher. \n" +
			"Please update your version of Node."
	);
	process.exit(1);
}

init();

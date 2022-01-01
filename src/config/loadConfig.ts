import fs from "fs";
import { PackageJSON } from "../forgeUi";

export default (path: string): PackageJSON =>
	JSON.parse(fs.readFileSync(path, "utf-8"));

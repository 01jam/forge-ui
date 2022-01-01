const path = require("path");
const ShebangPlugin = require("webpack-shebang-plugin");

module.exports = {
	mode: "production",
	target: "node",
	entry: { index: "./src/index.ts" },
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js",
		libraryTarget: "umd",
		library: "ForgeUi",
		umdNamedDefine: true,
	},
	plugins: [new ShebangPlugin()],
};

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
	ignoredRouteFiles: ["**/.*"],
	serverModuleFormat: "cjs",
	watchPaths: ["./tailwind.config.ts"],
	serverPlatform: "node",
	tailwind: true,
	postcss: true,
	serverDependenciesToBundle: [
		/^@ts-particles\/react.*/,
		/^@ts-particles\/slim.*/,
	],
};

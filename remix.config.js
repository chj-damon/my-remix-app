/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  ignoredRouteFiles: ["**/.*"],
  publicPath: "/build/",
  serverModuleFormat: "cjs",
  tailwind: true,
};

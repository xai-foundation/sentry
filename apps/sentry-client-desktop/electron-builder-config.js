/**
 * @see https://www.electron.build/configuration
 */
module.exports = {
    appId: "com.github.xaifoundation.sentry",
    includeSubNodeModules: true,
    asar: true,
    productName: "Xai Sentry Node",
    directories: {
      output: "release"
    },
    files: [
      "dist",
      "dist-electron"
    ],
    dmg: {
      sign: false
    },
    mac: {
      target: [
        "dmg",
        "zip"
      ],
      artifactName: "sentry-client-macos.${ext}",
      icon: "public/xai.png",
      hardenedRuntime: true,
      entitlements: "build-config/entitlements.mac.plist",
      entitlementsInherit: "build-config/entitlements.mac.plist",
      gatekeeperAssess: false,
      notarize: {
        teamId: process.env["APPLE_TEAM_ID"] || ""
      }
    },
    win: {
      target: [
        "nsis"
      ],
      publisherName: "Xai Foundation",
      verifyUpdateCodeSignature: false,
      artifactName: "sentry-client-windows.${ext}",
      icon: "public/xai.ico"
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      deleteAppDataOnUninstall: false
    },
    linux: {
      target: [
        "AppImage"
      ],
      artifactName: "sentry-client-linux.${ext}"
    },
    protocols: [
      {
        name: "Xai Sentry",
        schemes: ["xai-sentry"]
      }
    ]
  };
  
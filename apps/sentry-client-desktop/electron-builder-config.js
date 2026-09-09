/**
 * @see https://www.electron.build/configuration
 */
module.exports = {
    appId: "com.github.xaifoundation.sentry",
    asar: true,
    productName: "Xai Sentry Node",
    // electron-builder 26 validates executableName, which otherwise derives from
    // the scoped package name as "@sentrysentry-client-desktop" and is rejected.
    // Linux only: Windows and macOS name the binary from productName.
    executableName: "xai-sentry-node",
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
    // Mac Signing 
    // mac: {
    //   target: [
    //     "dmg",
    //     "zip"
    //   ],
    //   artifactName: "sentry-client-macos.${ext}",
    //   icon: "public/xai.png",
    //   hardenedRuntime: true,
    //   entitlements: "build-config/entitlements.mac.plist",
    //   entitlementsInherit: "build-config/entitlements.mac.plist",
    //   gatekeeperAssess: false,
    //   notarize: {
    //     teamId: process.env["APPLE_TEAM_ID"] || ""
    //   }
    // },
    mac: {
      target: [
        "dmg",
        "zip"
      ],
      artifactName: "sentry-client-macos.${ext}",
      icon: "public/xai.png",

      identity: null,
      hardenedRuntime: false,
      entitlements: undefined,
      entitlementsInherit: undefined,
      gatekeeperAssess: false,
      notarize: undefined
    },
    win: {
      target: [
        "nsis"
      ],
      verifyUpdateCodeSignature: false,
      artifactName: "sentry-client-windows.${ext}",
      icon: "public/xai.ico",
      // electron-builder 26 moved the signtool options under signtoolOptions
      signtoolOptions: {
        publisherName: "Xai Foundation"
      }
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
  
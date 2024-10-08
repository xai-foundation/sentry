module.exports = {
    branches: [
        "master",
        { name: "develop", prerelease: true }
    ],
    tagFormat: "${version}",
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'angular',
            },
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                preset: 'angular',
                writerOpts: {
                    finalizeContext (context) {
                        const scopesToInclude = ['cli', 'desktop', 'operator'];

                        for (const commitGroup of context.commitGroups) {
                            const filteredCommits = []

                            for (const commit of commitGroup.commits) {
                                if (commit.scope && commit.scope.split(',').some(scope => scopesToInclude.includes(scope))) {
                                    filteredCommits.push(commit)
                                }
                            }

                            commitGroup.commits = filteredCommits
                        }

                        return context
                    },
                },
            },
        ],
        "@semantic-release/changelog",
        [
            '@semantic-release/github',
            {
                assets: [
                    { path: "CHANGELOG.md", label: "Changelog" },
                    { path: "release-desktop-macos-latest/latest-mac.yml", label: "macOS Latest YML" },
                    { path: "release-desktop-macos-latest/sentry-client-macos.dmg.blockmap", label: "macOS Blockmap" },
                    { path: "release-desktop-macos-latest/sentry-client-macos.dmg", label: "macOS DMG" },
                    { path: "release-desktop-ubuntu-latest/latest-linux.yml", label: "Linux Latest YML" },
                    { path: "release-desktop-ubuntu-latest/sentry-client-linux.AppImage", label: "Linux AppImage" },
                    { path: "release-signed-desktop-windows-latest/latest.yml", label: "Windows Latest YML" },
                    { path: "release-signed-desktop-windows-latest/sentry-client-windows.exe.blockmap", label: "Windows Blockmap" },
                    { path: "release-signed-desktop-windows-latest/signed-builds/sentry-client-windows.exe", label: "Windows EXE" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-macos.zip", label: "CLI macOS ZIP" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-linux.zip", label: "CLI Linux ZIP" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-windows.zip", label: "CLI Windows ZIP" },
                ],
            },
        ],
        "@semantic-release/git",
    ],
};
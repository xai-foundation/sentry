export default {
    branches: [
        { name: 'master' },
        { name: 'beta', prerelease: true },
    ],
    plugins: [
        'semantic-release-monorepo',
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'angular',
                releaseRules: [
                    { type: 'feat', scope: 'cli', release: 'minor' },
                    { type: 'fix', scope: 'cli', release: 'patch' },
                    { type: 'feat', scope: 'sentry-desktop-client', release: 'minor' },
                    { type: 'fix', scope: 'sentry-desktop-client', release: 'patch' },
                    { type: 'feat', scope: 'web-staking', release: 'minor' },
                    { type: 'fix', scope: 'web-staking', release: 'patch' },
                    { type: 'feat', scope: 'web-connect', release: 'minor' },
                    { type: 'fix', scope: 'web-connect', release: 'patch' },
                ],
            },
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'angular',
                writerOpts: {
                    transform: (commit, context) => {
                        // Split scopes by comma for multiple scopes
                        const scopes = commit.scope?.split(',').map(s => s.trim());

                        // If multiple scopes are present, process each one
                        if (scopes && scopes.length > 1) {
                            scopes.forEach(scope => {
                                const newCommit = { ...commit, scope };
                                context.commits.push(newCommit); // Add new commit for each scope
                            });
                            return false; // Skip the original commit to avoid duplication
                        }
                        return commit;
                    },
                },
            },
        ],
        [
            '@semantic-release/github',
            {
                successComment: false,
                failComment: false,
                releasedLabels: false,
                assets: [
                    { path: "CHANGELOG.md", label: "Changelog" },
                    { path: "release-desktop-macos-latest/latest-mac.yml", label: "macOS Latest YML" },
                    { path: "release-desktop-macos-latest/sentry-client-macos.dmg.blockmap", label: "macOS Blockmap" },
                    { path: "release-desktop-macos-latest/sentry-client-macos.dmg", label: "macOS DMG" },
                    { path: "release-desktop-ubuntu-latest/latest-linux.yml", label: "Linux Latest YML" },
                    { path: "release-desktop-ubuntu-latest/sentry-client-linux.AppImage", label: "Linux AppImage" },
                    { path: "release-desktop-windows-latest/latest.yml", label: "Windows Latest YML" },
                    { path: "release-desktop-windows-latest/sentry-client-windows.exe.blockmap", label: "Windows Blockmap" },
                    { path: "release-desktop-windows-latest/sentry-client-windows.exe", label: "Windows EXE" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-macos.zip", label: "CLI macOS ZIP" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-linux.zip", label: "CLI Linux ZIP" },
                    { path: "release-cli-ubuntu-latest/sentry-node-cli-windows.zip", label: "CLI Windows ZIP" },
                ],
                releaseName: (context) => {
                    const scope = context.commits[0]?.scope || 'general';
                    return `Release ${context.nextRelease.version}-${scope}`;
                },
            },
        ],
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    tagFormat: ({ nextRelease, commits }) => {
        const scope = commits[0]?.scope || 'general';
        if (nextRelease.prerelease) {
            return `${nextRelease.version}-${nextRelease.prerelease}.${nextRelease.prereleaseIndex}-${scope}`;
        }
        return `${nextRelease.version}-${scope}`;
    },
};

const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[build] started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[build] finished');
		});
	},
};

async function main() {
    if (watch) {
        const ctx = await esbuild.context({
            entryPoints: ['src/extension.ts'],
            bundle: true,
            format: 'cjs',
            minify: production,
            sourcemap: !production,
            sourcesContent: false,
            platform: 'node',
            outfile: 'dist/extension.js',
            external: ['vscode'],
            logLevel: 'silent',
            plugins: [esbuildProblemMatcherPlugin],
        });
        await ctx.watch();
    } else {
        await esbuild.build({
            entryPoints: ['src/extension.ts'],
            bundle: true,
            format: 'cjs',
            minify: production,
            sourcemap: !production,
            sourcesContent: false,
            platform: 'node',
            outfile: 'dist/extension.js',
            external: ['vscode'],
            logLevel: 'silent',
            plugins: [esbuildProblemMatcherPlugin],
        });
    }
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});

import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const PRODUCTION = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
	},
	plugins: [
		svelte({
			compilerOptions: {
				dev: !PRODUCTION,
			},
		}),
		
		css({
			output: 'bundle.css',
		}),
		
		// Locates modules using the Node.js resolution algorithm
		resolve({
			browser: true,
			dedupe: ['svelte'],
		}),
		
		// Allows CommonJS modules to be used in the browser
		commonjs(),
		
		// When not in production, run a lightweight dev server
		!PRODUCTION && serve(),
		
		// Minify for production
		PRODUCTION && terser(),
	],
	watch: {
		clearScreen: false,
	}
};

function serve() {
	let server;
	
	return {
		async writeBundle() {
			if (server) { return; }
			
			const getPort = require('get-port');
			const port = process.env.PORT || getPort.makeRange(5000, 5100);
			const hostname = process.env.HOST || 'localhost'; // Closed default
			
			const sirv = require('sirv')('public', { dev: true, single: true });
			server = require('http').createServer(sirv);
			server.listen(await getPort({ host: hostname, port }), hostname, (err) => {
				if (err) { throw err; }
				
				const { address, port } = server.address();
				console.log(`Listening on ${address}:${port}`);
			});
		}
	};
}

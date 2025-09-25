module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{png,ico}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
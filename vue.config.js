module.exports = {
	publicPath: '/',
	outputDir: 'dist/',
	configureWebpack: {
		module: {
		  rules: [
			{
			  test: /\.mjs$/,
			  include: /node_modules/,
			  type: "javascript/auto"
			}
		  ] 
		}
	}
}
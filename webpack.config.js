const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Fiber = require('fibers');

module.exports = {
	watch: true,
	watchOptions: {
		ignored: /node_modules/
	},
	entry: {
		main: './src/engine/js/script.js',
		// css: './src/styles/css',
	},

	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist/js')
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [{
					loader: "style-loader"
				}, {
					loader: "css-loader"
				}, {
					loader: "sass-loader",
					options: {
						implementation: require("sass"),
						fiber: Fiber
					}
				}]
			},
			
			// {
			// 	test: /\.css$/,
			// 	use: [{
			// 		loader: ['style-loader', 'sass-loader'],
			// 		options: { 
			// 			name: '../css/[name].[ext]'
			// 		} 
			// 	}],
				
			// },
			
			// {
			// 	test: /\.scss$/,
			// 	use: ExtractTextPlugin.extract({
			// 	  fallback: 'style-loader',
			// 	  use: ['css-loader', 'sass-loader']
			// 	})
			// },
			{
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file?name=public/fonts/[name].[ext]'
            },
			{
				test: /\.pug$/,
				use: 'pug-loader'
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: 'ts-loader',
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
				  loader: 'babel-loader',
				  options: {
					presets: ['@babel/preset-env']
				  }
				}
			},
			{
				test: /\.(png|jp(e*)g|svg)$/,  
				use: [{
					loader: 'file-loader',
					options: { 
						name: '../images/[hash]-[name].[ext]'
					} 
				}]
			}

		]
	},
	plugins: [ 
	  new ExtractTextPlugin(
		{filename: '/css/style.css'}
	  ),
	]
};

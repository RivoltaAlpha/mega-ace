import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: './src/index.js',
    output: {
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/symbols/[name][ext]'
                }
            },
            {
                test: /\.(mp3|wav)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/sounds/[name][ext]'
                }
            }
        ]
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: 10,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    performance: {
        hints: 'warning',
        maxEntrypointSize: 250000,
        maxAssetSize: 250000
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            inject: true
        })
    ],
    devServer: {
        static: [
            {
                directory: path.resolve(process.cwd(), 'public'),
                publicPath: '/'
            },
            {
                directory: path.resolve(process.cwd(), 'public/assets/symbols'),
                publicPath: '/assets/symbols'
            },
            {
                directory: path.resolve(process.cwd(), 'public/assets/ui'),
                publicPath: '/assets/ui'
            },
            {
                directory: path.resolve(process.cwd(), 'public/assets/sounds'),
                publicPath: '/assets/sounds'
            }
        ],
        compress: true,
        port: 3000,
        historyApiFallback: true,
        proxy: [
            {
                context: ['/api', '/user'],
                target: 'http://localhost:3001',
                secure: false,
                changeOrigin: true,
                onError: (err, req, res) => {
                    console.error('Proxy error:', err);
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Proxy error: Service temporarily unavailable');
                }
            }
        ]
    }
};
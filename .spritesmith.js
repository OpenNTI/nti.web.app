'use strict';

module.exports = {
	src: './src/main/resources/images/{icons,elements}/**/*.png',
	destImage: './src/main/resources/images/sprite.png',
	destCSS: './src/main/resources/scss/utils/_icons.scss',
	imgPath: '../images/sprite.png',
	padding: 2,
	algorithm: 'binary-tree',
	engine: 'pixelsmith'
};

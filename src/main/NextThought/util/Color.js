Ext.define('NextThought.util.Color',{
	alternateClassName: 'Color',
	singleton: true,
	requires: [
		'Ext.draw.Color'
	],


	toRGBA: function(color, alpha) {
		if (typeof color == 'string') {
			if(!(color = Ext.draw.Color.fromString(color)))
				return '#FFFF00';
		}

		return Ext.String.format('rgba({0},{1},{2},{3})',
				color.getRed(),
				color.getGreen(),
				color.getBlue(),
				alpha || '0.3'
		);
	},


	/**
	 *
	 * @param string either a 8 or 16 bit hex color, or a CSS color function (rgb() or rgba()).
	 * @param [alpha] If supplied, the float will override or add alpha to this color.
	 */
	parseColor: function(string, alpha){

//	   if (!string) return;

		var hex16 = /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i,
			hex8 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i,
			rgba = /^rgba?\((.+?)\)$/i,
			color,
			m;

		function parseHex(cCmp,is8bit){
			var r,g,b;
			r = parseInt(cCmp[1], 16) >> 0;
			g = parseInt(cCmp[2], 16) >> 0;
			b = parseInt(cCmp[3], 16) >> 0;
			if(is8bit){
				r += (r * 16);
				g += (g * 16);
				b += (b * 16);
			}
			return [r,g,b];
		}

		if((m = rgba.exec(string))){
			m = m[1].split(',');
		}
		else if((m = hex16.exec(string))){
			m = parseHex(m,false);
		}
		else if((m = hex8.exec(string))){
			m = parseHex(m,true);
		}
		else {
			Ext.Error.raise({message: 'Could not parse color', color: string});
		}

		color = Ext.create('Ext.draw.Color',m[0],m[1],m[2]);

		if(m[3] || (alpha && alpha<1)){
			console.debug('replacing toString() on color', m, alpha);
			color.toString = function(){
				return Ext.String.format(
						'rgba({0},{1},{2},{3})',
						this.getRed(),
						this.getGreen(),
						this.getBlue(),
						alpha || m[3]);
			};
		}

		return color;
	},


	toRGB: function(color) {
		if (typeof color == 'string') {
			if(!(color = Ext.draw.Color.fromString(color)))
				return '#FFFF00';
		}
		//color.toString() may return hex or rgba(see parseColor above)...so, just do this:
		return Ext.String.format('rgb({0},{1},{2})',
				color.getRed(),
				color.getGreen(),
				color.getBlue()
		);
	},


	/**
	 * http://ridiculousfish.com/blog/posts/colors.html
	 * @param idx
	 */
	hue: function(idx) {
		/*
		 * Here we use 31 bit numbers because JavaScript doesn't have a 32 bit
		 * unsigned type, and so the conversion to float would produce a negative
		 * value.
		 */
		var bitcount = 31, ridx = 0, i = 0, hue;

		/* Reverse the bits of idx into ridx */
		for (; i < bitcount; i++) {
			ridx = (ridx << 1) | (idx & 1);
			idx >>>= 1;
		}

		/* Divide by 2**bitcount */
		hue = ridx / Math.pow(2, bitcount);

		/* Start at .6 (216 degrees) */
		return (hue + 0.6) % 1;
	},


	getColor: function(idx){
		return Ext.draw.Color.fromHSL(Math.round(this.hue(idx) * 360), 100, 50);
	}

},
		function(){
			window.Color = this;
		}
);

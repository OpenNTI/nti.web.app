const Ext = require('@nti/extjs');

module.exports = exports = Ext.define('NextThought.util.Color', {
	hex16Re: /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i,
	hex8Re: /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i,
	rgbaRe: /^rgba?\((.+?)\)$/i,
	dsRGBARe: /^(\d+(\.\d+)?) (\d+(\.\d+)?) (\d+(\.\d+)?)( (\d+(\.\d+)?))?$/i,
	sources: [],

	isValidHexColor: function (code) {
		return this.hex16Re.test(code) || this.hex8Re.test(code);
	},

	toRGBA: function (color, alpha) {
		if (typeof color === 'string') {
			if (!(color = Ext.draw.Color.fromString(color))) {
				return 'rgba(255,255,0,1)';
			}
		}

		var red = color.getRed(),
			green = color.getGreen(),
			blue = color.getBlue();

		red = red.toFixed(0);
		green = green.toFixed(0);
		blue = blue.toFixed(0);

		return Ext.String.format(
			'rgba({0},{1},{2},{3})',
			red,
			green,
			blue,
			typeof alpha === 'number' ? alpha : 1
		);
	},

	/**
	 *
	 * @param {string} string either a 8 or 16 bit hex color, or a CSS color function (rgb() or rgba()).
	 * @param {number} [alpha] If supplied, the float will override or add alpha to this color.
	 * @returns {Object} Color components
	 */
	parse: function (string, alpha) {
		var me = this,
			color,
			m;

		function parseHex(cCmp, is8bit) {
			var r, g, b;
			r = parseInt(cCmp[1], 16) >> 0;
			g = parseInt(cCmp[2], 16) >> 0;
			b = parseInt(cCmp[3], 16) >> 0;
			if (is8bit) {
				r += r * 16;
				g += g * 16;
				b += b * 16;
			}
			return [r, g, b];
		}

		function parseRGBA(c) {
			var i = c.length - 1;
			for (; i >= 0; i--) {
				c[i] = +c[i];
			} //ensure they're numbers
			return c;
		}

		if ((m = me.dsRGBARe.exec(string))) {
			//console.log('DataServer color value: ',string);
			m = [
				+(parseFloat(m[1]) * 255).toFixed(0),
				+(parseFloat(m[3]) * 255).toFixed(0),
				+(parseFloat(m[5]) * 255).toFixed(0),
				+m[8],
			];
		} else if ((m = me.rgbaRe.exec(string))) {
			m = parseRGBA(m[1].split(','));
		} else if ((m = me.hex16Re.exec(string))) {
			m = parseHex(m, false);
		} else if ((m = me.hex8Re.exec(string))) {
			m = parseHex(m, true);
		} else {
			Ext.Error.raise({
				message: 'Could not parse color',
				color: string,
			});
		}

		m[3] =
			typeof alpha === 'number'
				? alpha
				: typeof m[3] === 'number' && !isNaN(m[3])
				? m[3]
				: 1;

		color = Ext.String.format(
			'rgba({0},{1},{2},{3})',
			m[0],
			m[1],
			m[2],
			m[3]
		);
		if (m[3].toFixed(3) === '0.000') {
			color = 'None';
		}

		return {
			r: m[0],
			g: m[1],
			b: m[2],
			a: m[3],
			toString: function () {
				return color;
			},
		};
	},

	rgbaToHex: function (color) {
		/**
		 * Converts rgba to rgb then to Hex. TODO: this func is ignoring the Alpha component.
		 * assuming that it is always 1 in our case.
		 *	Which might change
		 */

		var a = this.rgbaRe.exec(color),
			c,
			rgb,
			hex;
		if (!a) {
			return color;
		}
		try {
			c = a[1].split(',').slice(0, 3);
			rgb = 'rgb(' + c.join(',') + ')';
			hex = Ext.draw.Color.toHex(rgb);
			return hex;
		} catch (e) {
			console.log('Error: ', e);
		}
		return color;
	},

	/**
	 * http://ridiculousfish.com/blog/posts/colors.html
	 *
	 * @param {number} idx --
	 * @returns {number} --
	 */
	hue: function (idx) {
		/*
		 * Here we use 31 bit numbers because JavaScript doesn't have a 32 bit
		 * unsigned type, and so the conversion to float would produce a negative
		 * value.
		 */
		var bitcount = 31,
			ridx = 0,
			i = 0,
			hue;

		/* Reverse the bits of idx into ridx */
		for (; i < bitcount; i++) {
			ridx = (ridx << 1) | (idx & 1);
			idx >>>= 1;
		}

		/* Divide by 2**bitcount */
		hue = ridx / Math.pow(2, bitcount);

		/* Start at .561 (202 degrees) start at primary blue */
		return (hue + 0.561) % 1;
	},

	/**
	 * @param {number} idx - either the known index (a number) or a username with which to look up the index for
	 * @returns {Color} --
	 */
	getColor: function (idx) {
		if (typeof idx === 'string') {
			this.addSource(idx);
			idx = Ext.Array.indexOf(this.sources, idx);
		}

		return Ext.draw.Color.fromHSL(
			Math.round(this.hue(idx) * 360),
			0.91,
			0.606
		);
	},

	/**
	 * Return a unique hex value for the index
	 *
	 * @param  {number} idx the index
	 * @returns {string}	 the hex code
	 */
	getColorHex: function (idx) {
		return this.rgbaToHex(this.toRGBA(this.getColor(idx)));
	},

	addSource: function (userId) {
		if (userId && !Ext.Array.contains(this.sources, userId)) {
			this.sources.push(userId);
			Ext.Array.sort(this.sources);

			//keep the logged in user at index 0
			var id = $AppConfig.username;
			Ext.Array.remove(this.sources, id);
			this.sources.unshift(id);
		}
	},
}).create();

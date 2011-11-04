Ext.define('NextThought.util.Color',{
	alternateClassName: 'Color',
	requires: [
		'Ext.draw.Color'
	],
	statics: {

		toRGBA: function(color, alpha) {
			if (typeof color == 'string') {
				if(!(color = Ext.draw.Color.fromString(color)))
					return '#FFFF00';
			}

			return Ext.String.format('rgba({0},{1},{2},{3})',
					color.getRed(),
					color.getGreen(),
					color.getBlue(),
					alpha || '.3'
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
			var bitcount = 31;

			/* Reverse the bits of idx into ridx */
			var ridx = 0, i = 0;
			for (i=0; i < bitcount; i++) {
				ridx = (ridx << 1) | (idx & 1);
				idx >>>= 1;
			}

			/* Divide by 2**bitcount */
			var hue = ridx / Math.pow(2, bitcount);

			/* Start at .6 (216 degrees) */
			return (hue + .166) % 1;
		},

		getColor: function(idx){
			var degrees = Math.round(this.hue(idx) * 360);
			//console.debug('degrees', degrees);
			return hsl2rgb(degrees, 100, 50);

			/*
			 HSL to RGB function sourced from:
			 http://www.codingforums.com/showpost.php?s=acaa80143f9fa9f2bb768131c14bfa3b&p=54172&postcount=2
			 */
			function hsl2rgb(h, s, l) {
				var m1, m2, hue;
				var r, g, b
				s /=100;
				l /= 100;
				if (s == 0)
					r = g = b = (l * 255);
				else {
					if (l <= 0.5)
						m2 = l * (s + 1);
					else
						m2 = l + s - l * s;
					m1 = l * 2 - m2;
					hue = h / 360;
					r = HueToRgb(m1, m2, hue + 1/3);
					g = HueToRgb(m1, m2, hue);
					b = HueToRgb(m1, m2, hue - 1/3);
				}
				return Ext.create('Ext.draw.Color',r, g, b);
			}

			function HueToRgb(m1, m2, hue) {
				var v;
				if (hue < 0)
					hue += 1;
				else if (hue > 1)
					hue -= 1;

				if (6 * hue < 1)
					v = m1 + (m2 - m1) * hue * 6;
				else if (2 * hue < 1)
					v = m2;
				else if (3 * hue < 2)
					v = m1 + (m2 - m1) * (2/3 - hue) * 6;
				else
					v = m1;

				return Math.round(255 * v);
			}
		}
	}
});

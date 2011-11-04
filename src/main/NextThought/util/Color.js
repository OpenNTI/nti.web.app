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
			return (hue + .6) % 1;
		},

		getColor: function(idx){
			return Ext.draw.Color.fromHSL(Math.round(this.hue(idx) * 360), 100, 50);
		}
	}
});

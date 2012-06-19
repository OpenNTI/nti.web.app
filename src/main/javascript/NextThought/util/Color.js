Ext.define('NextThought.util.Color',{
	singleton: true,
	requires: [
		'Ext.draw.Color'
	],

	hex16Re: /^#?([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])$/i,
	hex8Re: /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i,
	rgbaRe: /^rgba?\((.+?)\)$/i,
	dsRGBARe: /^(\d+(\.\d+)?) (\d+(\.\d+)?) (\d+(\.\d+)?)( (\d+(\.\d+)?))?$/i,

	sources : [],

	toRGBA: function(color, alpha) {
		if (typeof color === 'string') {
			if(!(color = Ext.draw.Color.fromString(color))) {
				return 'rgba(255,255,0,1)';
			}
		}

		return Ext.String.format('rgba({0},{1},{2},{3})',
				color.getRed(),
				color.getGreen(),
				color.getBlue(),
				typeof alpha === 'number' ? alpha : 1
		);
	},


	/**
	 *
	 * @param string either a 8 or 16 bit hex color, or a CSS color function (rgb() or rgba()).
	 * @param [alpha] If supplied, the float will override or add alpha to this color.
	 */
	parse: function(string, alpha){
		var me = this,
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

		function parseRGBA(c){
			var i=c.length-1;
			for(;i>=0;i--){ c[i] = +c[i]; } //ensure they're numbers
			return c;
		}

		if(!!(m = me.dsRGBARe.exec(string))){
			console.log('DataServer color value: ',string);
			m = [
				+(parseFloat(m[1])*255).toFixed(0),
				+(parseFloat(m[3])*255).toFixed(0),
				+(parseFloat(m[5])*255).toFixed(0),
				+m[8]
			];
		}
		else if(!!(m = me.rgbaRe.exec(string))){
			m = parseRGBA(m[1].split(','));
		}
		else if(!!(m = me.hex16Re.exec(string))){
			m = parseHex(m,false);
		}
		else if(!!(m = me.hex8Re.exec(string))){
			m = parseHex(m,true);
		}
		else {
			Ext.Error.raise({message: 'Could not parse color', color: string});
		}

		m[3] = typeof alpha === 'number'
			? alpha
			: typeof m[3] === 'number' && !isNaN(m[3])
				? m[3]
				: 1;

		color = Ext.String.format('rgba({0},{1},{2},{3})', m[0],m[1],m[2],m[3]);
		if(m[3].toFixed(0)==='0'){
			color = 'None';
		}

		return{ r: m[0],
				g: m[1],
				b: m[2],
				a: m[3],
				toString: function(){return color;}};
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

	/**
	 *
	 * @param idx - either the known index (a number) or a username with which to look up the index for
	 */
	getColor: function(idx){
		if (typeof idx === 'string') {
			this.addSource(idx);
			idx = Ext.Array.indexOf(this.sources,idx);
		}

		return Ext.draw.Color.fromHSL(Math.round(this.hue(idx) * 360), 100, 50);
	},

	addSource: function(userId){
		if(userId && !Ext.Array.contains(this.sources, userId)){
			this.sources.push(userId);
			Ext.Array.sort(this.sources);

			//keep the logged in user at index 0
			var id = $AppConfig.username;
			Ext.Array.remove(this.sources,id);
			this.sources.unshift(id);
		}
	}
},
function(){
	window.Color = this;
}
);

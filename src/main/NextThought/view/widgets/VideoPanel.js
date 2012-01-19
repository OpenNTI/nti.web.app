Ext.define('NextThought.view.widgets.VideoPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.video',

	constructor: function(config) {
		this.callParent([
			Ext.applyIf(config, {
				width	: '100%',
				height   : '100%',
				autoplay : false,
				controls : true,
				bodyStyle: 'background-color:#000;color:#fff',
				html	 : '',
				suggestChromeFrame: false
			})]);

		this.on({
			scope		: this,
			render	   : this._render,
			beforedestroy: function() {
				this.video = null;
			},
			resize   : function(panel, width, height) {
				if (this.video) {
					this.video.setSize(width, height);
				}
			}
		});
	},

	_render: function() {
		var fallback = '',
			size = this.getSize(),
			cfg, i;

		if (this.fallbackHTML) {
			fallback = this.fallbackHTML;
		}
		else {
			fallback = "Your browser doesn't support html5 video. ";

			if (Ext.isIE && this.suggestChromeFrame) {
				/* chromeframe requires that your site have a special tag in the header
				 * see http://code.google.com/chrome/chromeframe/ for details
				 */
				fallback += '<a>Get Google Chrome Frame for IE</a>';
			} else if (Ext.isChrome) {
				fallback += '<a>Upgrade Chrome</a>';
			} else if (Ext.isGecko) {
				fallback += '<a>Upgrade to Firefox 3.5</a>';
			} else {
				fallback += '<a>Get Google Chrome</a>';
			}
		}

		/* match the video size to the panel dimensions */
		cfg = Ext.copyTo({
				tag   : 'video',
				width : size.width,
				height: size.height
			},
			this, 'poster,start,loopstart,loopend,playcount,autobuffer,loop');

		/* just having the params exist enables them */
		if (this.autoplay) { cfg.autoplay = 1; }
		if (this.controls) { cfg.controls = 1; }

		/* handle multiple sources */
		if (Ext.isArray(this.src)) {
			cfg.children = [];

			for (i = 0, len = this.src.length; i < len; i++) {
				if (!Ext.isObject(this.src[i])) {
					throw "source list passed to video panel must be an array of objects";
				}

				cfg.children.push(
					Ext.applyIf({tag: 'source'}, this.src[i])
				);
			}

			cfg.children.push({
				html: fallback
			});

		} else {
			cfg.src  = this.src;
			cfg.html = fallback;
		}

		this.video = this.body.createChild(cfg);
	}

});

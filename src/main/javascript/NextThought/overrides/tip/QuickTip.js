Ext.define('NextThought.overrides.tip.QuickTip',{
	override: 'Ext.tip.QuickTip',

	constructor: function(config){
		config = Ext.apply(config||{},{
			showDelay: 500,
			anchorTarget: true,
			trackMouse: false,
			shadow:false,
			interceptTitles: true
		});
		return this.callParent([config]);
	},

	getTargetXY: function(){
		this.anchorTarget = this.activeTarget.el;
		this.anchor = 'bottom';

		var doc = Ext.getDom(this.anchorTarget).ownerDocument,
			vW = ((!Ext.isStrict && !Ext.isOpera) ? doc.body.clientWidth :
		                   !Ext.isIE ? doc.documentElement.clientWidth : doc.parentWindow.innerWidth),

			r = this.callParent(arguments);

		if(r[1] < 50 ){
			//needs to swap down
			this.anchor = 'top';
		}

		if(r[0] < 50){
			//needs to swap left
			this.anchor = 'left';
		}
		else if((vW - r[0]) < 50){
			//needs to swap left
			this.anchor = 'right';
		}

		if(this.anchor !== 'bottom'){
			r = this.callParent(arguments);
		}

		return r;
	},


	getAnchorAlign: function() {
        switch (this.anchor) {
        case 'top': return 't-b';
        case 'left': return 'l-r';
        case 'right': return 'r-l';
        default: return 'b-t';
        }
    }

},function(){
	// Init the singleton.  Any tag-based quick tips will start working.
	Ext.tip.QuickTipManager.init();
});

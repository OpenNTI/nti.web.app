/**
 * This entire file is a hack.  The ExtJS implementation aligns and positions the tip before it updates the contents of
 * the tip. So, it is potentially offset.  This attempts to correct that by repeating alignment calculations when it
 * detects a discrepancy.
 *
 * We also try to apply sane defaults.
 */
Ext.define('NextThought.overrides.tip.QuickTip',{
	override: 'Ext.tip.QuickTip',

	EDGE_PADDING: 20, //pixals from any given edge to trigger a repositioning

	//Apply defaults
	constructor: function(config){
		config = Ext.apply(config||{},{
			showDelay: 500,
			anchorTarget: true,
			trackMouse: false,
			shadow:false
		});
		return this.callParent([config]);
	},

	//Override alignment and force the 'target' element to be the element with the title/tip attribute if not the
	// registered owner element. Default to a top centered position, unless screen position forces us to reposition.
	getTargetXY: function getTargetXY(){
		function getTarget(el){
			el = Ext.get(el);
			if(el.getAttribute('title') || el.getAttribute('data-qtip')){
				return el;
			}

			return el.up('[title]') || el.up('[data-qtip]') || el;
		}

		if(getTargetXY.recursiveCall){
			return this.callParent(arguments);
		}

		getTargetXY.recursiveCall = true;

		this.anchorTarget = Ext.getDom( getTarget(this.activeTarget.el) );
		this.anchor = 'bottom';

		var doc = Ext.getDom(this.anchorTarget).ownerDocument,
			vW = ((!Ext.isStrict && !Ext.isOpera) ? doc.body.clientWidth :
		                   !Ext.isIE ? doc.documentElement.clientWidth : doc.parentWindow.innerWidth),
			w = this.el.getWidth(),
			r = this.callParent(arguments);

		if(r[1] < this.EDGE_PADDING ){
			//needs to swap down
			this.anchor = 'top';
		}

		if(r[0] < this.EDGE_PADDING){
			//needs to swap left
			this.anchor = 'left';
		}
		else if((vW - (r[0] + w ) ) < this.EDGE_PADDING){
			//needs to swap right
			this.anchor = 'right';
		}

		if(this.anchor !== 'bottom'){
			r = this.callParent(arguments);
		}

		delete getTargetXY.recursiveCall;
		return r;
	},

	//Hack: The contents change during show, AFTER positioning and aligning, so if we change size, redo it all.
	showAt: function(){
		var size = this.el.getSize(),
			r = this.callParent(arguments),
			sizeAfter = this.el.getSize();

		if(size.width !== sizeAfter.width || size.height !== sizeAfter.height){
			this.showAt(this.getTargetXY());
		}

		return r;
	},


	//center the tip pointer
	//We prefer to align to the center posisitions instead of the corner positions.
	syncAnchor: function() {
        var me = this, pos;
		me.callParent();
        switch (me.tipAnchor.charAt(0)) {
        case 't': pos = 'b-t'; break;
        case 'r': pos = 'l-r'; break;
        case 'b': pos = 't-b'; break;
        default:  pos = 'r-l'; break;
        }
        me.anchorEl.alignTo(me.el, pos);
    },


	//We prefer to align to the center posisitions instead of the corner positions.
	getAnchorAlign: function() {
        switch (this.anchor) {
        case 'top': return 't-b?';
        case 'left': return 'l-r?';
        case 'right': return 'r-l?';
        default: return 'b-t?';
        }
    }

},function(){
	// Init the singleton.  Any tag-based quick tips will start working.
	Ext.tip.QuickTipManager.init();
});

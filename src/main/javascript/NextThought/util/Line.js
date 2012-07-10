Ext.define('NextThought.util.Line',{
	singleton: true,

	/** @private */
	blockElementRe: /(inline.*)|(none)|(fixed)/i,

	/** @private */
	firstElementOnLine: function (y,doc, limit, width){
		var right = width,
				el = null;
		while(right > 0 && (!el || el === limit || !Ext.fly(limit).contains(el))){
			el = doc.elementFromPoint(right,y);
			right -= 2;
		}
		return el;
	},


	/** @private */
	findBlockParent: function(e,doc,limit){
		if(!e || e===limit){return null;}
		var d = doc.defaultView.getComputedStyle(e).getPropertyValue('display');
		if(this.blockElementRe.test(d)){
			return this.findBlockParent(e.parentNode,doc, limit);
		}
		return e;
	},


	/** @private */
	resolveNodeAt: function(y,doc){
		var limit = doc.querySelector('#NTIContent > .page-contents');//TODO: knowing the selector path feels dirty. Use doc.body instead?
		var width = limit.getBoundingClientRect().width;
		var e = this.findBlockParent( this.firstElementOnLine(y,doc,limit,width), doc, limit);
		return Ext.fly(limit).contains(e) ? e : null;
	},


	/** @private */
	buildRangeFromRect: function(rect, node, parentWindow){
		var s = parentWindow.getSelection(),
				r, c = 0, step = 'line';

		function is(rectA,rectB){
			return rectA.top === rectB.top
					&& rectA.height === rectB.height;
		}

		function setup(step){
			s.removeAllRanges();
			s.selectAllChildren(node);
			s.collapseToStart();
			s.modify('extend', 'forward', step);
		}

		setup(step);

		while(!r && c < 100) {
			c++;
			r = s.getRangeAt(0);
			if(is(r.getClientRects()[0],rect)){
				break;
			}
			if(!Ext.fly(node).contains(r.startContainer)){
				if(step === 'line'){
					step = 'lineboundary';
					setup(step);
				}
				else {
					s.removeAllRanges();
					s.selectAllChildren(node);
					r =  s.getRangeAt(0);
					break;
				}
			}
			r = null;

			s.collapseToStart();
			s.modify('move', 'forward', 'line');
			s.modify('extend', 'forward', step);
		}

		s.removeAllRanges();
		return r;
	},


	/** @private */
	isCloseToMiddle: function(y,rect){
		var m = rect.top + (rect.height/2);
		return Math.abs((m - y)/rect.height) < 1;
	},


	/** @private */
	resolveClientRects: function(node){
		if(!node){return null;}
		var doc = node.ownerDocument,
				range = doc.createRange(),
				rects;

		range.selectNode(node);
		rects = Array.prototype.slice.call(range.getClientRects());
		range.detach();
		return rects.length > 1 ? rects.splice(1) : rects;
	},


	/**
	 * This is the main exported function in this utility.
	 *
	 * @param y
	 * @param [doc]
	 * @return {*}
	 */
	findLine: function(y, doc){
		doc = doc || document;
		var node = this.resolveNodeAt(y,doc);
		var rects = this.resolveClientRects( node )||[];
		var i=0;
		for(; i<rects.length; i++){
			if(this.isCloseToMiddle(y,rects[i])){
				return {
					rect: rects[i],
					range: this.buildRangeFromRect(rects[i],node,doc.parentWindow)
				};
			}
		}
		return null;
	}

}, function(){
	window.LineUtils = this;
});

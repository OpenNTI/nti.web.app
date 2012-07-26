Ext.define('NextThought.util.Line',{
	singleton: true,

	/** @private */
	inlineElementRe: /(inline.*)|(none)/i,

	getStyle: function(node,prop){
		if(!node){return '';}
		var view = node.ownerDocument.defaultView;
		return view.getComputedStyle(node,undefined).getPropertyValue(prop);
	},

	/** @private */
	firstElementOnLine: function (y, doc, limit){
		var right = doc.getElementsByTagName('body')[0].getBoundingClientRect().right,
			el, x = right;
		for(; !el && x >= 0; x-=10) {
			el = doc.elementFromPoint(x,y);
			if(el && (el.parentNode === limit || el === limit || !Ext.fly(limit).contains(el))){
				el = null;
			}
		}
		return el;
	},


	/** @private */
	findBlockParent: function(e,limit){
		if(!e || e===limit){return null;}
		var d = this.getStyle(e,'display');
		if(this.inlineElementRe.test(d)){
			return this.findBlockParent(e.parentNode, limit);
		}
		return e;
	},


	/** @private */
	resolveNodeAt: function(y,doc){
		var limit = doc.getElementById('NTIContent');
		return this.findBlockParent(
				this.firstElementOnLine(y,doc,limit),
				limit);
	},


	/** @private */
	buildRange: function(y, node){
		if(!node){ return null; }

		var me = this,
			d = node.ownerDocument,
			s = d.parentWindow.getSelection(),
			rect, r;
			//line = parseFloat(this.getStyle(node,'line-height'));

		function rr(){ return me.getRects(s.getRangeAt(0)).last(); }
		function f(fn,key){
			fn = fn || function(){return s.getRangeAt(0).getBoundingClientRect(); };
			key = key || 'bottom';
			return Math.ceil(fn()[key]);
		}


		function selectLine(){

			var tolerance = 6, string,
				bottom, newBottom;

			if(!s.isCollapsed){ s.collapseToStart(); }
			s.modify('extend', 'forward', 'character');
			s.modify('move','forward','character');
			s.modify('move', 'backward', 'lineboundary');
			s.collapseToStart();
			s.modify('extend','forward','character');
			bottom = f();

			do {
				string = s.toString();
				s.modify('extend', 'forward', 'lineboundary');
				s.modify('extend', 'forward', 'word');
				newBottom = f();

				if(string === s.toString()){
					console.log('end?');
					break;
				}
			}
			while(Math.abs(bottom - newBottom) <= tolerance);


			do {
				s.modify('extend','backward','character');
				newBottom = f(rr);
			}
			while(Math.abs(bottom - newBottom) > tolerance);
		}

		function step(){
			var t = f(null,'top'), tt, limit = 50;
			do{
				s.collapseToStart();
				s.modify('move', 'forward', 'line');
				s.modify('move', 'forward', 'character');
				s.modify('extend', 'forward', 'character');
				tt = f(null,'top');
				limit --;
			}
			while(t >= tt && limit>0);
			if(limit===0){
				throw 'limit';
			}
			selectLine();
		}

		function setup(){
			var range = d.createRange();
			s.removeAllRanges();

			range.setStartBefore(node);
			range.setEndBefore(node);
			s.addRange(range);

			s.collapseToStart();
			s.modify('move','forward','character');
			s.modify('extend','forward','character');
			selectLine();
		}

		setup();

		var c = 100;
		do {
			r = s.getRangeAt(0);
			rect = this.getRects(r);
			rect = rect[1]||rect[0];//if they are more than one rects the first one is the Bounding rect...not useful if it spans lines. So we attempt to get the first rect that represents the line.
			if(this.isCloseToMiddle(y, rect)){
				break;
			}
			else if(!rect || rect.top > y){
				break;
			}

			try {
				step();
			}
			catch(e){
				break;
			}
			r = null;
			c--;
		}
		while(!r && c>0);

		s.removeAllRanges();
		return r;
	},


	getRects: function(r){
		var rects = Array.prototype.slice.call(r.getClientRects()),
			c = rects.length- 1, o;

		for(;c>=0; c--){
			o = rects[c];
			if(!o.width || !o.height){
				rects.splice(c,1);//remove collapsed rects
			}
		}

		return rects;
	},


	/** @private */
	isCloseToMiddle: function(y,rect){
//		console.log(y,rect?rect.top:NaN, rect?rect.height:NaN);
		if(!rect){return false;}
		var m = rect.top + (rect.height/2);
		return Math.abs((m - y)/rect.height) < 1;
	},


	/**
	 * This is the main exported function in this utility.
	 *
	 * @param y
	 * @param [doc]
	 * @return {*}
	 */
	findLine: function(y, doc, tolerance){
		y = Math.round(y);
		doc = doc || document;

		var range = this.buildRange( y, this.resolveNodeAt(y,doc));

		if(range){
			return { rect: range.getBoundingClientRect(), range: range };
		}
		return null;
	}

}, function(){
	window.LineUtils = this;
});

Ext.define('NextThought.util.Rects',{
	singleton: true,


	merge: function(rects,lineHeight,clientWidth){
		console.log('rects', arguments);
		if(!lineHeight){
			Ext.Error.raise("Invalid Line Height");
		}

		rects = this.trimCrazies(rects, lineHeight, clientWidth);
		var r=[], ri,
			x,xx,y,yy, w,h,
			b, bins={},
			i = rects.length-1;

		for(; i>=0; i--){
			ri = rects[i];

			x = ri.left || ri.x;
			y = ri.top || ri.y;
			h = ri.height || (ri.bottom - ri.top);
			w = ri.width || (ri.right - ri.left);
			xx = ri.right || (x + ri.height);
			yy = ri.bottom || (y + ri.width);

			b = Math.floor(y+(h/2));//vertical center line of the rect

			if(!bins[b]){
				r.push( { left:x, top:y, right:xx, bottom:yy, width:w, height:h } );
				bins[b] = r.peek();
			}
			else {
				b = bins[b];
				b.left = b.left < x? b.left : x;
				b.top = b.top < y? b.top : y;
				b.right = b.right > xx ? b.right : xx;
				b.bottom = b.bottom > yy ? b.bottom : yy;

				b.width = b.right - b.left;
				b.height = b.bottom - b.top;
			}

		}
		return r;

	},


	trimCrazies: function(rects, lineHeight, clientWidth){
		function flip(a,i){ return Ext.apply({},a[i]); }

		function acceptableHeight(h){
			if (h < lineHeight){return false;}
			else if(lineHeight/h < .6) {return false;}
			return true;
		}

		var rs = Array.prototype.slice.call(rects),
				i = rs.length-1, out = [], o, h, w,
				lh2 = lineHeight*2;

		if(!i || Ext.isIE) { return rects; }

		for(;i>=0;i--){
			o = flip(rs,i);
			if (o.height < lineHeight){o.height = lineHeight;} //round up to look nice
			h = o.height;
			w = o.width;
			if( h > 0 && h < lh2 && w <= clientWidth && acceptableHeight(h)) {
				out.push(o);
			}
		}

		return out;
	}

},function(){
	window.RectUtils = this;
});

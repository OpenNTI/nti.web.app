Ext.define('NextThought.util.RectUtils',{
	singleton: true,


	merge: function(rects,lineHeight,clientWidth){
		if(!lineHeight){
			Ext.Error.raise("Invalid Line Height");
		}

		rects = this.trimCrazies(rects, lineHeight, clientWidth);
		var r=[], ri,
			x,xx,y,yy, w,h,
			b, bins={},
			i = rects.length-1,
			lh2 = lineHeight*2;

		for(; i>=0; i--){
			ri = rects[i];

			x = ri.left || ri.x;
			y = ri.top || ri.y;
			h = ri.height || (ri.bottom - ri.top);
			w = ri.width || (ri.right - ri.left);
			xx = ri.right || (x + ri.height);
			yy = ri.bottom || (y + ri.width);

			b = Math.floor((y/lh2));
			console.log('pseudo line:',b, y, lh2);

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

		var rs = Array.prototype.slice.call(rects),
				i = rs.length-1, out = [], o, h, w,
				lh2 = lineHeight*2;

		if(!i) { return rects; }

		for(;i>=0;i--){
			o = flip(rs,i);
			h = o.height;
			w = o.width;
			if( h > 0 && h < lh2 && w < clientWidth) {
				out.push(o);
			}
		}

		return out;
	}

},function(){
	window.RectUtils = this;
});

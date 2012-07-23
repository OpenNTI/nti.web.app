Ext.define('NextThought.util.Rects',{
	singleton: true,


	getFirstNonBoundingRect: function(range){
		var bound = range.getBoundingClientRect(),
			rects = Array.prototype.slice.call(range.getClientRects()) || [],
			i = rects.length - 1, r;

		//trim the empty ones
		for(; i>=0; i--){
			r = rects[i];
			if(!r.height || !r.width){ rects.splice(i,1); }
		}

		//i === 0 now
		for(; i<rects.length; i++){
			r = rects[i];
			if(r && (r.top !== bound.top
			|| r.bottom !== bound.bottom
			|| r.left !== bound.left
			|| r.right !== bound.right )){
				return r;
			}
		}

		return bound;
	},


	merge: function(rects,lineHeight,clientWidth){
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

			var tolerance = 3;

			b = Math.floor((y+h/2) / tolerance);//center line of the rect

			if(!bins[b] && !bins[b+1]){
				r.push( { left:x, top:y, right:xx, bottom:yy, width:w, height:h } );
				bins[b] = r.length;
				bins[b+1] = r.length; //Each bin points to the rectangle occupying it
			}
			else {
                b = r[(bins[b] || bins[b+1]) - 1];
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
			if(lineHeight){
				if (h < lineHeight){return false;}
				else if(lineHeight/h < 0.6) {return false;}
			}
			return true;
		}

		var rs = Array.prototype.slice.call(rects),
				i = rs.length-1, out = [], o, h, w,
				lh2 = lineHeight*2;

		if(!i || Ext.isIE || !lineHeight) { return rects; }

		for(;i>=0;i--){
			o = flip(rs,i);
			if (o.height < lineHeight){o.height = lineHeight;} //round up to look nice
			h = o.height;
			w = o.width;
			if( h > 0 && h < lh2 && w > 0 && (w <= clientWidth || !clientWidth) && acceptableHeight(h)) {
				out.push(o);
			}
		}

		return out;
	}

},function(){
	window.RectUtils = this;
});

Ext.define('NextThought.util.RectUtils',{
	singleton: true,


	merge: function(rects,lineHeight){

		rects = this.trimOutliers(rects);
		var r=[], ri,
			x,xx,y,yy, w,h,
			b, bins={},
			i = rects.length-1;

//		console.log(rects);

		for(; i>=0; i--){
			ri = rects[i];

			x = ri.left || ri.x;
			y = ri.top || ri.y;
			h = ri.height || (ri.bottom - ri.top);
			w = ri.width || (ri.right - ri.left);
			xx = ri.right || (x + ri.height);
			yy = ri.bottom || (y + ri.width);

			b = Math.floor((y/lineHeight));

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


	trimOutliers: function(rects){
		function gh(r){ return r.height||(r.bottom-r.top); }
		function sortFn(a,b){ return gh(a)>gh(b) ? 1 : -1; }
		function binSortFn(a,b){ return h[a] > h[b] ? -1 : 1; }
		function flip(a,i){ a[i]=Ext.apply({},a[i]); }

		//iteration :( at least its short
		var rs = Array.prototype.slice.call(rects).sort(sortFn),
			i = rs.length-1,
			h = {}, r, s, bins;

		//there is only one item...
		if(!i){ return rects; }

		//iteration :( ...ugh
		for(; i>=0; i--){
			s = gh(rs[i]);
			h[s] = h[s] === undefined? 1 : (h[s]+1);
			flip(rs,i);
		}

		//iteration :(
		bins = Object.keys(h).sort(binSortFn);

		//all the same height
		if(bins.length===1){ return rects; }

		//there is probably a more accurate way to trim the outliers, the first few should be the dominant heights.
		bins.splice(Math.ceil(bins.length*0.3));

		for(i=bins.length-1; i>=0; i--){ h[bins[i]]=true; }

		for(i=rs.length-1; i>=0; i--){
			try{
				if(h[gh(rs[i])]!==true){
					rs.splice(-1);
				}
			}
			catch(e){}
		}
		return rs;
	}


},function(){
	window.RectUtils = this;
});

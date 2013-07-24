Ext.define('NextThought.view.course.dashboard.AbstractView',{
	extend: 'Ext.container.Container',

	requires:[
		'NextThought.util.MasonryPacker'
	],

	GRID_WIDTH: 5,

	ui: 'course',
	cls: 'course-dashboard-container',
	layout: 'auto',

	items:{
		layout: 'auto',
		ui: 'course',
		cls: 'course-dashboard',
		xtype: 'container',
		defaultType: 'box',
		items:[]
	},

/* Debug code */
				//Used to test sorting
				shuffle: function shuffle(array) {
					var m = array.length, t, i;

					// While there remain elements to shuffle…
					while (m) {
						// Pick a remaining element…
						i = Math.floor(Math.random() * m--);

						// And swap it with the current element.
						t = array[m];
						array[m] = array[i];
						array[i] = t;
					}


					//make them ordered by "lastModified" :P
					Ext.each(array,function(i,x){
						var d = i.lastModified = new Date();
						d.setSeconds(d.getSeconds()-x);

						//adapt to the packer
						i.w = i.cols;
						i.h = i.rows;
					});
					return array;
				},
/* Debug code End */


	adjustWeights: function(items){
		Ext.each(items,function(i){
			i.weight = (i.weight||1);
			if(i.rows>1){i.weight += 0.000001;}
		});
	},


	buildMatrix: function(rows,columns){
		var i = rows, m = [];

		function row(len, val) {
		    var r = [];
		    while (--len >= 0) { r[len] = val; }
			r.toString = function(){ return this.join(',\t');};
		    return r;
		}

		for(i; i; i-- ){ m.push( row(columns,false) ); }

		m.position = [0,0];
		m.toString = function(){ return '\n\t'+this.join('\n\t')+'\n'; };
		return m;
	},


	needsFitting: function(items,rows,columns){
		var m = this.buildMatrix(rows,columns),
			hasHoles = false;

		function fullRow(row){
			function andR(row,i){
				if(i>=row.length){return true;}
				return row[i] && andR(row, i+1);
			}
			return andR(row,0);
		}

		function occupied(row){
			function orR(row,i){
				if(i>=row.length){return false;}
				return row[i] || orR(row, i+1);
			}
			return orR(row,0);
		}

		function fillMatrix(i,j,a){
			var p = m.position, x,y,
				xx = p[0] + i.w,
				yy = p[1] + i.h;
			console.groupCollapsed('Tile '+j);
			//current block will extend past last column, it must wrap
			if(xx>columns){
				p[1] += a[j-1].h;
				p[0] = m[p[1]].lastIndexOf(true)+1;//if the row already has stuff bump
				xx = p[0] + i.w;
				yy = p[1] + i.h;
			}

			i.pos = {x:p[0],y:p[1]};

			for(y=p[1];y<yy;y++){
				for(x=p[0];x<xx;x++){
					if(m[y][x]){
						console.error('p:', p, 'xy:',[x,y], 'sz:', [i.w, i.h], 'overlap!');
					} else {
						console.log('p:', p, 'xy:',[x,y], 'sz:', [i.w, i.h]);
						m[y][x] = true;
					}
				}
			}

			console.groupEnd();
			p[0] += i.w;
			//We've filled the row...begin a new one
			if(p[0]>=columns){
				p[1] += i.h;
				p[0] = m[p[1]].lastIndexOf(true)+1;//if the row already has stuff bump
			}
		}

		console.groupCollapsed('Filling Matrix');

		console.groupCollapsed('Iteration');
		Ext.each(items,fillMatrix);
		console.groupEnd();

		console.log(m.toString());

		console.groupEnd();

		//See what's filled
		function itr(row,i,a){
			var o = row.occ = occupied(row),
				f = row.full = fullRow(row),
				next = a[i+1];//we loop over the rows from bottom up (backwards, so "next" has already cashed occ&full)

			if(o && !f && next){
				hasHoles = next.occ;
			}

			return !hasHoles;
		}

		//run itr backwards
		Ext.each(m,itr,m,true);

		return hasHoles;
	},


	countRows: function(items,columns){
		var area = 0, rows;
		Ext.each(items,function(i){ area += i.cols * i.rows; });
		rows = Math.ceil(area/columns)+1;
		return rows;
	},


	sortTiles: function(items){
		var cols = this.GRID_WIDTH,
			rows = this.countRows(items,cols),
			p = new NextThought.util.MasonryPacker(cols,rows);

		try{
			//Sort the items by modified & weight
			Ext.Array.sort(items,function(a,b){
				var wA = a.weight * a.lastModified.getTime(),
					wB = b.weight * b.lastModified.getTime();
				return wA > wB ? -1 : wA === wB ? 0 : 1;
			});

			if(!this.needsFitting(items,rows,cols)){
				console.log('Nothing to do :)');
				return;
			}

			p.fit(items);

			Ext.Array.sort(items,function(a,b){

				var aR = a.fit.y,
					aC = a.fit.x,
					bR = b.fit.y,
					bC = b.fit.x;

				if(aR !== bR){
					return aR > bR ? 1 : -1;
				}

				return aC === bC ? 0 : aC > bC ? 1 : -1;
			});

			//debug
			if(this.self.isDebug && this.needsFitting(items,rows,cols)){
				Ext.each(items,function(i,x,a){
					var f = i.fit,
						p = i.pos, fn='log';

					if(f.x !== p.x || f.y !== p.y){
						fn = 'warn';

					}
					console[fn]('pos:',[p.x, p.y],'desired:',[f.x, f.y],i);

				});
			}

		}
		catch(e){
			console.error(e.stack||e.message);
		}
	},



	addTiles: function(items){
		//debug
		this.shuffle(items);

		this.adjustWeights(items);

		this.sortTiles(items);

		this.container.add(items);
	}
});

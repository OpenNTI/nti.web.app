Ext.define('NextThought.view.annotations.renderer.Manager',{
	singleton: true,

	requires: [
		'NextThought.util.Line'
	],

	events: new Ext.util.Observable(),
	registry: {},
	sorter: {},
	gutter: {},
	buckets: {},
	rendererSuspended: {},

	controlLineTmpl: Ext.DomHelper.createTemplate( { cls:'controlContainer'} ).compile(),
	widgetLineTmpl: Ext.DomHelper.createTemplate( {cls:'widgetContainer'} ).compile(),
	stackTmpl: Ext.DomHelper.createTemplate( {cls:'thumb nib-stack'} ).compile(),
	addNoteToOccupiedLineTmpl: Ext.DomHelper.createTemplate( {cls:'thumb note-gutter-widget add-note {0}', title:'Add Note'} ).compile(),


	/**
	 * @constructor Inner class
	 */
	Bucket: function(){
		this.values = {};
		this.length = 0;

		this.free = function(){
			this.each(function(v,k,o){ delete o[k]; },this);
			Ext.Object.each(this,function(k,o,me){ delete me[k]; });
		};

		this.put = function(o,key){
			key = typeof key === 'number'? key : guidGenerator();
			if(this.values[key]){throw 'existing value';}
			this.values[key] = o;
			this.length += 1;
			return key;
		};

		this.each = function(cb,s){
			Ext.Object.each(this.values,function(key,value,o){
				Ext.callback(cb,s,[value,key,o]);
			});
		};

		this.get = function(key){ return this.values[key]; };

		this.first = function(){
			var key;
			for (key in this.values){
				if (this.values.hasOwnProperty(key)){
					return this.get(key);
				}
			}
			return null;
		};
	},


	registerGutter: function(el, reader){
		var p = reader.prefix;
		if(!p){ Ext.Error.raise('Prefix required'); }
		if(this.gutter[p]){
			console.warn('replacing exisiting gutter?', this.gutter[p]);
		}
		this.gutter[p] = el;

		el.controls = el.down('.controls');
		el.widgets = el.down('.widgets');

		this.render(p);//renders wait for the gutter to exist
	},


	register: function(o){
		var p = o.prefix;
		if(!this.registry[p]){
			this.registry[p] = [];
		}
		this.registry[p].push(o);
		o.requestRender();
	},


	unregister: function(o){
		var p = o.prefix, r;
		r = this.registry[p];
		if(r){
			this.registry[p] = Ext.Array.remove(r,o);
			if(this.registry[p].legend===0){
				this.sorter[p] = null;
			}
		}
	},


	getReader: function(prefix){
		var cache = this.readerPanels, c;
		if(!cache ){ cache = this.readerPanels = {}; }

		c = cache[prefix];
		if(!c){
			c = cache[prefix] = ReaderPanel.get(prefix);
			c.on('destroy',function(){ delete cache[prefix]; });
		}

		return c;
	},


	getDoc: function(prefix){
		return this.getReader(prefix).getDocumentElement();
	},


	buildSorter: function(prefix){
		//Default sort will sort by lastModified
		return function(a, b){
			var c = 0, $a = (a.record || {}).get('Last Modified'), $b = (b.record || {}).get('Last Modified');
			if($a !== $b){
				c = $a < $b? 1 : -1;
			}

			return c;
		};
	},

	clearBuckets: function(prefix){
		function clear(d){
			while(d && d.firstChild){
				d.removeChild(d.firstChild);
			}
		}

		var g = this.gutter[prefix];

		clear(g.controls.dom);
		clear(g.widgets.dom);

		if( this.buckets[prefix] ){
			this.buckets[prefix].free();
		}
		this.buckets[prefix] = new this.Bucket();
	},


	getBucket: function(prefix, line){
//		var lineInfo,
//			originalLine = line;

		//while(!lineInfo && (originalLine - line) <= 100){
		//	lineInfo = LineUtils.findLine(line,this.getDoc(prefix));
		//	line-=5	;
		//}

//		if(!lineInfo){
//			console.error('could not resolve a line for '+prefix+' @'+line+', original line was ' + originalLine);
//			return;
//		}
		if (line < 0){
			//bad line, don't render:
			console.error('Annotation cannot be rendered in gutter');
			return null;
		}

		var c = this.buckets[prefix],
			lineTolerance = 40,
//			l = line.rect.top,//normalize lines
			b = c? c.get(line) : null,
			a = Math.round( line- (lineTolerance / 2)), z = Math.round( line + (lineTolerance / 2));

		if (!b && c) {
			c.each(function(value, key){
				var keyNum = parseInt(key, 10);
				if ( keyNum >=a && keyNum <= z){
					b = value;
					return false;
				}
				return true;
			});

			if (!b) {
				b = new this.Bucket();
				c.put(b,line);
			}
		}
		return b;
	},


	layoutBuckets: function(prefix){
		var addTpl = this.addNoteToOccupiedLineTmpl,
			r = this.getReader(prefix),
			g = this.gutter[prefix],
			b = this.buckets[prefix],
			cT = this.controlLineTmpl,
			wT = this.widgetLineTmpl,
			sT = this.stackTmpl,
			width = r.getAnnotationOffsets().gutter + 80,
			cls = (width <= 355)? 'narrow-gutter': '',
			maxAnnotations = Math.floor(width / 34) - 3,
			annotationOffsets = AnnotationsRenderer.getReader().getAnnotationOffsets();

		g.setWidth(width);
		g.controls.setLeft(width-50);
		g.widgets.setRight(50);

		r.noteOverlayClearRestrictedRanges();


		b.each(function(line,y){

			var widgets = [], siblings, block, rect, t, count=0;

			line.controls = line.controls || cT.append(g.controls,[],true);
			line.widgets = line.widgets || wT.append(g.widgets,[],true);

			(new Ext.CompositeElement([line.controls,line.widgets])).setTop(y+'px');

			line.each(function(o){
				r.noteOverlayAddRestrictedRange(o.getRestrictedRange(annotationOffsets));
				var c = o.getControl();
				if( c ){ c.appendTo( line.controls ); }
				if( o.hasGutterWidgets ){ widgets.push( o ); }
			});

			siblings = widgets.length-1;
			Ext.each(widgets,function(o){
				var w;
				if(count < maxAnnotations){
					count++;
					w = o.getGutterWidget(siblings);
					if(w){
						w.appendTo(line.widgets);
						w.addCls(cls);
					}
					else {
						console.warn('Annotation lied about having a gutter widget',o);
					}
				}
				else {
					sT.append(line.widgets);
					return false;//stop
				}
				return true; //continue
			});

			if(!line.controls.first()){ line.controls.remove(); delete line.controls; }
			if(!line.widgets.first()){ line.widgets.remove(); delete line.widgets; }
			else{

				r.noteOverlayRegisterAddNoteNib(
					line.first().getRecord().get('applicableRange'),
					addTpl.insertFirst(
							line.widgets,[
								siblings ? 'collapsed':'expanded'
							],true), line.first().getRecord().get('ContainerId'));
			}

			block = line.widgets || line.controls || null;
			if(block){
				t = block.dom.getBoundingClientRect();
				rect = { top:t.top, bottom:t.bottom, left:t.left, right:t.right, height:t.height, width:t.width };
				rect.top = rect.top + annotationOffsets.scrollTop;
				rect.bottom = rect.bottom + annotationOffsets.scrollTop;
				r.noteOverlayAddRestrictedRange(rect);
			}

		});
	},


	suspend: function(prefix) {
		this.rendererSuspended[prefix] = true;
	},


	resume: function(prefix) {
		delete this.rendererSuspended[prefix];
	},


	render: function(prefix){
		var me = this, containers = {};

		if(me.rendering){
			console.warn('Render called while rendering...');
			me.events.on('finish',me.render,me,{single:true});
			return;
		}
		if (this.rendererSuspended[prefix]) {
			return;
		}
		if(!me.gutter[prefix]){
			console.warn('no gutter');
			return;
		}

		if(!me.registry[prefix]){
			return;//nothing to do
		}

		me.rendering = true;
		me.events.fireEvent('rendering');
		console.log('Rendering annotations');
		if(console.time){
			console.time('Annotation render loop');
		}
		Ext.suspendLayouts();

		me.registry[prefix] = Ext.Array.unique(me.registry[prefix]);

		me.sorter[prefix] = me.sorter[prefix] || me.buildSorter(prefix);
		if(me.sorter[prefix]){
			Ext.Array.sort(me.registry[prefix], me.sorter[prefix]);
		}

		me.clearBuckets(prefix);

		var cloned = Ext.Array.clone(me.registry[prefix]);
		var descs = [], cids = [], doc = null;
		Ext.each(cloned, function(o){
			var desc = o.getRecordField ? o.getRecordField('applicableRange') : null;
			var cid = o.getRecordField ? o.getRecordField('ContainerId') : null;
			if(o.doc){doc = o.doc;}
			descs.push(desc);
			cids.push(cid);
		});

		if(cloned && cloned.length > 0 && doc){
			Anchors.preresolveLocatorInfo(descs, doc, ReaderPanel.get().getCleanContent(), cids);
			Ext.each(cloned, function(o){
				try {
					if(!o.isVisible){
						return;
					}

					var y, b,
					c = containers[o.getContainerId()] = (containers[o.getContainerId()]||[]);

					if(o.hasGutterWidgets){
						c.push(o);
					}

					y = o.render();

					//uncomment for testing
					//console.log('Rendered', o.getRecord().get('body')[0], y);

					if(!y){
						//console.log(o, 'returned a falsy y:',y);
					}
					else {
						b = me.getBucket(prefix,Math.ceil(y));
					}
					if(b){
						b.put(o);
					}
				}
				catch(e){
					console.error(o.$className,Globals.getError(e));
				}
			});

			me.layoutBuckets(prefix);
		}

		me.rendering = false;
		Ext.resumeLayouts(true);
		me.events.fireEvent('finish');
		if(console.timeEnd){
			console.timeEnd('Annotation render loop');
		}
	}

}, function(){
	window.AnnotationsRenderer = this;

	var me = this,
		fn = this.render,
		timerId = {};

	this.render = (function() {
		return function(prefix) {
			if (timerId[prefix]) {
				clearTimeout(timerId[prefix]);
			}
			timerId[prefix] = setTimeout(function(){ fn.call(me, prefix); }, 100);
		};

	}());
});

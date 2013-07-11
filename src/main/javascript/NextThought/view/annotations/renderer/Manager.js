Ext.define('NextThought.view.annotations.renderer.Manager',{
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

	isDebug: false,

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
		//TODO all this junk about prefixes should go away once we aren't using a singleton here...
		var p = reader.prefix;
		if(!p){ Ext.Error.raise('Prefix required'); }
		if(this.gutter[p]){
			console.warn('replacing exisiting gutter?', this.gutter[p]);
		}
		this.gutter[p] = el;

		//el.addCls('debug');

		el.controls = el.down('.controls');

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
		var cache = this.readers, c;
		if(!cache ){ cache = this.readers = {}; }

		c = cache[prefix];
		if(!c){
			c = cache[prefix] = ReaderPanel.get(prefix);
			c.on('destroy',function(){ delete cache[prefix]; });
		}

		return c;
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

		if( this.buckets[prefix] ){
			this.buckets[prefix].free();
		}
		this.buckets[prefix] = new this.Bucket();
	},


	getBucket: function(prefix, line){
		//console.debug('prefix:'+prefix, line);
		if (line < 0){
			//bad line, don't render:
			if(this.isDebug){
				console.error('Annotation cannot be rendered in gutter');
			}
			return null;
		}

		var c = this.buckets[prefix],
			lineTolerance = 40,
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
				b.line = line;
				c.put(b,line);
			}
		}
		return b;
	},


	layoutBuckets: function(prefix){
		var g = this.gutter[prefix],
			b = this.buckets[prefix],
			cT = this.controlLineTmpl;


		b.each(function(line,y){
			var count = 0;

			line.controls = line.controls || cT.append(g.controls,[],true);
			line.controls.setStyle('top',y+'px');
			line.controls.set({'data-line':y});

			line.each(function(o){ if(o.isNote){++count;} });
			if(count > 0){
				Ext.DomHelper.overwrite(line.controls,{cls:'count',html:count});
			}

			if(!line.controls.first()){
				line.controls.remove();
				delete line.controls;
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
		var me = this, containers = {}, renderedCount = 0,
			cleanContent, rootContainerId,
			cloned, descs = [], cids = [], doc = null;

		if(me.rendering){
			console.warn('Render called while rendering...');
			me.events.on('finish',Ext.bind(me.render,me,arguments),me,{single:true});
			return;
		}
		if (this.rendererSuspended[prefix]) {
			return;
		}
		if(!me.gutter[prefix]){
			console.error('no gutter');
			me.events.fireEvent('rendering');
			me.events.fireEvent('finish');
			return;
		}

		if(!me.registry[prefix]){
			me.events.fireEvent('rendering');
			me.events.fireEvent('finish');
			return;//nothing to do
		}

		me.rendering = true;
		me.events.fireEvent('rendering');
		console.log('Rendering annotations '+ prefix);
		if(console.time){
			console.time('Annotation render loop '+prefix);
		}
		Ext.suspendLayouts();

		me.registry[prefix] = Ext.Array.unique(me.registry[prefix]);

		me.sorter[prefix] = me.sorter[prefix] || me.buildSorter(prefix);
		if(me.sorter[prefix]){
			Ext.Array.sort(me.registry[prefix], me.sorter[prefix]);
		}

		me.clearBuckets(prefix);

		cloned = Ext.Array.clone(me.registry[prefix]);
		Ext.each(cloned, function(o){
			var desc = o.getRecordField ? o.getRecordField('applicableRange') : null,
				cid = o.getRecordField ? o.getRecordField('ContainerId') : null;
			if(o.doc){doc = o.doc;}
			descs.push(desc);
			cids.push(cid);
		});

		if(cloned && cloned.length > 0 && doc){
			cleanContent = me.getReader(prefix).getCleanContent();
			rootContainerId = Anchors.rootContainerIdFromDocument(doc);
			Anchors.preresolveLocatorInfo(descs, doc, cleanContent, cids, rootContainerId);
			Ext.each(cloned, function(o){
				var y, b, c;
				try {
					if(!o.isVisible){
						return;
					}

					c = containers[o.getContainerId()] = (containers[o.getContainerId()]||[]);

					if(o.isNote){
						c.push(o);
					}

					y = o.render();
					if(y !== NextThought.view.annotations.Base.HIDDEN){
						b = me.getBucket(prefix,Math.ceil(y));
						if(b){
							o.getRecord().set('line', b.line);
							renderedCount++;
							b.put(o);
						}
					}
				}
				catch(e){
					console.error(o.$className,Globals.getError(e));
				}
			});
			console[renderedCount === cloned.length ? 'log' : 'warn']('Rendered '+renderedCount+'/'+cloned.length+' annotations');
			me.layoutBuckets(prefix);
		}

		me.rendering = false;
		Ext.resumeLayouts(true);
		me.events.fireEvent('finish');
		if(console.timeEnd){
			console.timeEnd('Annotation render loop '+prefix);
		}
	}

}, function(){
	var me = this,
		fn = this.prototype.render,
		timerId = {};

	me.prototype.render = function(prefix) {
		var callerScope = this;
		if (timerId[prefix]) {
			clearTimeout(timerId[prefix]);
		}
		timerId[prefix] = setTimeout(function(){ fn.call(callerScope, prefix); }, 100);
	};
});

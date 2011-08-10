
Ext.define('NextThought.view.content.Reader', {
	extend:'NextThought.view.content.Panel',
	alias: 'widget.reader-panel',
	requires: ['NextThought.model.Highlight',
			   'NextThought.model.Note',
			   'NextThought.proxy.UserDataLoader',
			   'NextThought.util.AnnotationUtils'],
	cls: 'x-reader-pane',
	
	items: [{cls:'x-panel-reset', id:'NTIContent', margin: '0 0 0 50px'}],
	_highlights: [],
	_notes: [],
	_tracker: null,
	
    initComponent: function(){
    	this.addEvents('edit-note');
   		this.callParent(arguments);
		this._contextMenu = Ext.create('Ext.menu.Menu', {
			items : [
				{
					text : 'Highlight',
					iconCls : 'edit'//,
					// hadler : edit
				},
				{
					text : 'Note',
					iconCls : 'edit'//,
					// hadler : edit
				}
			]
		});
    },

	render: function(){
		this.callParent(arguments);
		
		var d=this.el.dom;
		
		if(Ext.isIE){
			d.unselectable = false;
			d.firstChild.unselectable = false;
		}

		if(!this._tracker)
			this._tracker = Ext.create(
				'NextThought.view.widgets.Tracker', d, d.firstChild);

		this.el.on('mouseup', this._onContextMenuHandler, this);
	},
	
	
	_onContextMenuHandler: function(e) {
		e.preventDefault();
		var range = this.getSelection();
		if( range && !range.collapsed ) {
			this.addHighlight(range);
			this._contextMenu.showAt(e.getXY());
		}
		else {
			
		}
	},
	
	
	clearAnnotations: function(){
		//same syntax, so just concat and go through all of these
		var stuffToCleanup = this._highlights.concat(this._notes);
		
		this._highlights = [];
		this._notes = [];

		Ext.each(stuffToCleanup, function(v){
			v.cleanup();
			delete v;
		});
	},
	
	addNote: function(range){
		if(!range) {
			return;
		}
		
		var note = AnnotationUtils.selectionToNote(range);
		note.set('ContainerId', this._containerId);
		console.log('the note', note);
		this.fireEvent('edit-note', note);
		this._createNoteWidget(note, true);	
	},
	
	addHighlight: function(range){
		if(!range) {
			return;
		}
		
		var highlight = AnnotationUtils.selectionToHighlight(range);
		highlight.set('ContainerId', this._containerId);
		console.log('the highlight', highlight);
		highlight.save({
			scope:this,
			success:function(){
				this._createHighlightWidget(range, highlight);
			}
		});	
	},
	
	
	_createHighlightWidget: function(range, record){
		this._highlights.push(
					Ext.create(
						'NextThought.view.widgets.Highlight', 
						range, record,
						this.items.get(0).el.dom.firstChild, 
						this));
	},
	
	_createNoteWidget: function(record, edit){
		try{ 
			this._notes.push(
					Ext.create(
						'NextThought.view.widgets.Note', 
						record,
						this.items.get(0).el.dom.firstChild, 
						this));
			return true;
		}
		catch(e){
			
		}
		return false;
	},
	
	getSelection: function() {
		if (window.getSelection) {  // all browsers, except IE before version 9
			var selection = window.getSelection();
			if (selection.rangeCount > 0) {
				return selection.getRangeAt(0);
			}
		}
		else {
			if (document.selection) {   // Internet Explorer 8 and below
				var range = document.selection.createRange();
				return range.getBookmark();
			}
		}
		
		return null;
	},

	
	
    contextHightlightAction: function(e){},
    
    contextNoteAction: function(e){},
    
    
    _appendHistory: function(book, path) {
	    history.pushState(
	        {
	        	book: book,
	        	path: path
	        },
	        "title","#"
	        );
	},
	
	
	_restore: function(state) {
		
		this.setActive(state.book, state.path, true);
	},
    
    _getNodeFromXPath: function(xpath) {
    	try {
    		return document.evaluate(xpath, document).iterateNext();
    	}
    	catch(e) {
    		if(NextThought.isDebug) {
    			console.log(xpath, e);
    		}
    		return null;
    	}
    },
    
    _objectsLoaded: function(bins) {
    	
    	Ext.each(bins.Note, 
    		function(r){
    			if (!this._createNoteWidget(r)){
    				console.log('removing bad note');
	    			r.destroy();
    			}
    		},
    		this
    	)
    	
    	Ext.each(bins.Highlight, 
    		function(r){
    			var range = this._buildRangeFromRecord(r);
    			if (!range){
    				console.log('removing bad highlight');
	    			r.destroy();
    			} 
    			else this._createHighlightWidget(range, r);
    		},
    		this
    	);
	},
    
    _buildRangeFromRecord: function(r) {
		var endElement = this._getNodeFromXPath(r.get('endXpath'));
		var startElement = this._getNodeFromXPath(r.get('startXpath'));
		var range = document.createRange();
	
		try {
			range.setEnd(endElement ? endElement : startElement, r.get('endOffset'));
			range.setStart(startElement, r.get('startOffset'));
			if (!startElement || range.collapsed) throw 'rageing tempor tantrum';
			return range;
		}
		catch(e) {
			if(NextThought.isDebug) {
				console.log('bad range', r, e, e.toString());
			}
		}
		
		return null;
		
    },
    
    _loadContentAnnotatoins: function(containerId){
    	this._containerId = containerId;
		UserDataLoader.getPageItems(containerId, {
			scope:this,
			success: this._objectsLoaded
		});
    },


    /**
     * Set the active page
     * @param {URL} path The page
     * @param {boolean} skipHistory Do not put this into the history
     */
    setActive: function(book, path, skipHistory, callback) {
        this.clearAnnotations();
    	this.activate();
        this.active = path;

        if(!skipHistory)
        	this._appendHistory(book, path);
        
        var b = this._resolveBase(this._getPathPart(path)),
        	f = this._getFilename(path),
			p = this.items.get(0),
			vp= Ext.getCmp('viewport').getEl();
        
        vp.mask('Loading...');
        
		Ext.getCmp('breadcrumb').setActive(book, f);
		
		//p.update('');
		//this.items.get(0).update('');
    	this.el.dom.firstChild.scrollTop = 0;
        
        Ext.Ajax.request({
			url: b+f,
			scope: this,
			disableCaching: true,
	        success: function(data){
	        	var c = data.responseText,
	        		rf= c.toLowerCase(),
	        		start = rf.indexOf(">", rf.indexOf("<body"))+1,
	        		end = rf.indexOf("</body"),
	        		head = c.substring(0,start),
	        		body = c.substring(start, end),
	        		css = /\<link.*href="(.*\.css)".*\>/gi,
	        		meta = /\<meta.*\>/gi,
	        		containerId;
	        	
	        	css = head.match(css);
	        	meta = head.match(meta);
	        	
	        	css = css?css.join(''):'';
	        	meta = meta?meta.join(''):'';
	        	
	        	c = meta.concat(css).concat(body)
	        					
	        		 .replace(	/src=\"(.*?)\"/mig, 
				                function fixReferences(s,g) {
				                    return (g.indexOf("data:image")==0)?s:'src="'+b+g+'"';
				                })
	        		 .replace(	/href=\"(.*?)\"/mig, 
				                function fixReferences(s,g) {
				                	if(g.indexOf("#")>=0 && NextThought.isDebug) console.log(g);
				                    return 'href="'+b+g+'"';
				                });
	        	
	        	p.update(c);
	            this.el.select('#NTIContent .navigation').remove();
	            this.el.select('#NTIContent .breadcrumbs').remove();
	            this.el.select('.x-reader-pane a[href]').on('click',this._onClick,this,{book: book, scope:this,stopEvent:true});
	            containerId = this.el.select('meta[name=NTIID]').first().getAttribute('content');
	            
	            this.relayout();
	            
	            if( callback ){
	            	callback();
	            }
	            
	            this._loadContentAnnotatoins(containerId);
	            vp.unmask();
	        },
	    	error: function(){ 
	    		if(NextThought.isDebug) {
	    			console.log("Error", arguments);
	    		} 
	    		vp.unmask(); 
	    	}
	    });
    },
    
    
    
    _onClick: function(e, el, o){
    	
    	var h = _AppConfig.server.host,
    		r = el.href,
    		p = r.substring(h.length);
    	
    	this.setActive(o.book, p);
    }
});


Ext.define( 'NextThought.view.widgets.annotations.Note', {
	extend: 'NextThought.view.widgets.annotations.Annotation',
	alias: 'widget.note-annotation',
	requires:[
		'NextThought.view.widgets.NotePanel'
	],

	constructor: function(record, component){
		Ext.apply(this, {
			anchorNode : null,
			noteContainer: null,
			originalPadding: 0,
			renderPriority: 0
		});

		this.callParent([record, component, record.isModifiable()? 'assets/images/charms/note-white.png' : null]);

		var me = this,
			a = this.query('a[name=' + record.get('anchorPoint') + ']')[0],
			c,
			root = Ext.get(this.doc.getElementById('NTIContent')),
			inBox;

		if(!a) {
			a = AnnotationUtils.getAnchors(this.doc).first();
		}
		else {
			a = Ext.get( AnnotationUtils.getNextAnchorInDOM(a) );
		}


		c = me.createNoteContainer(a.dom.getAttribute('name'));

		inBox = a.up('div', root.down('.page-contents'));
		if(inBox){
			a = inBox;
		}

		a.setStyle('display', 'block');

		me.anchorNode = a;
		me.noteContainer = c;
		me.originalPadding =
				a.dom.originalPadding!==undefined ?
						a.dom.originalPadding : a.getPadding('b');
		a.dom.originalPadding = me.originalPadding;

		// console.debug('original padding:',me.originalPadding);

		me.noteDiv = me.createElement('div',c.dom,'x-note-panel',(me.isVisible?'':'display:none;'));
		me.noteDiv.annotation = me;

		me.noteCmp = Ext.widget('note-entry',{ renderTo: me.noteDiv, annotation: me, owner: component });

		return me;
	},


	attachRecord: function(record){
		var children = this.record.children,
			parent = this.record.parent,
			old = this.record;

		this.record = record;

		record.on('updated',this.noteUpdated, this);
		record.children = record.children || children;
		record.parent = record.parent || parent;

		if(old !== record){
			old.un('updated', this.noteUpdated, this);
		}
	},


	getRects: function(){
		return [ this.noteCmp.getEl().getBox() ];
	},


	visibilityChanged: function(show){
		var me = this,
			c = Ext.get(me.noteDiv);

		if(show){c.show();}
		else{c.hide();}

		if(me.noteCmp){
			me.noteCmp.doLayout();
		}

		me.callParent(arguments);
	},


	noteUpdated: function(record){
		this.attachRecord(record);
		this.noteCmp.updateFromRecord(record);
		this.noteCmp.doLayout();
		this.requestRender();
	},


	buildMenu: function(){
		var items = [];

		if(this.isModifiable){
			items.push({
				text : 'Remove Note',
				handler: Ext.bind(this.remove, this)
			});
		}
		return this.callParent([items]);
	},


	createNoteContainer: function(id){
		var i = 'note-container-'+id,
			e = Ext.get(i),
			n = e ? e.dom : this.createElement('div',this.container,'document-notes');
		n.setAttribute('id',i);
		return Ext.get(n);
	},


	cleanup: function(removeAll){
		var hasReplies = this.noteCmp.hasReplies();
		if(hasReplies){
			this.noteCmp.cleanupReply(removeAll);
		}

		if (!hasReplies || removeAll) {
			this.noteCmp.destroy();
			delete this.noteCmp;
			Ext.get(this.noteDiv).remove();

			if(!this.noteContainer.first()){
				this.noteContainer.remove();
				this.anchorNode.setStyle('padding-bottom',this.originalPadding+'px');
			}
		}

		this.callParent(arguments);
	},


	render: function(){
		try{
			if(!this.noteCmp){return;}

			var me= this,
				p = Ext.get(me.container),
				c = me.noteContainer,
				a = me.anchorNode,
				i = me.originalPadding,
				box = !a.is('a'),
				w = (box? a : Ext.get(this.query('#nticontent .page-contents')[0])).getWidth(),
				h = 0,
				extra= 0,
				adjust=0,
				nx= a.next(),
				pr= a.prev(),

				ox = me.offsets.left,
				oy = me.offsets.top,

				x,y;

			c.setWidth(w);

			if(me.isVisible){
				adjust += pr?(pr.getPadding('b')+pr.getMargin('b')):0;
				extra += (nx?(nx.getPadding('t')+nx.getMargin('t')):0) + adjust;

				h = c.getHeight();
			}

			a.setStyle('padding-bottom',(i+h+extra)+'px');

			x = ox+a.getLeft();
			if(box){
				y = a.getBottom()-h;
			}
			else {
				y = a.getY()+( adjust? 0: extra);
			}

			c.setStyle({top: y+'px', left: x+'px'});

			//move the nib to the top-aligning corner of the note container
			if (me.img){
				Ext.get(me.img).moveTo(ox+p.getLeft(), c.down('.x-nti-note img').getTop());
			}

			//always move to the end
			if(c.dom.nextSibling){
				me.container.appendChild(c.dom);
			}

//			if (me.noteCmp){
//				me.noteCmp.doLayout();
//			}

		}
		catch(e){
			console.error('Note onResize: ',e,e.message, e.stack);
		}

		this.callParent();
	}
});

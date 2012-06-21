Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Annotation',
	alias: 'widget.note-annotation',
	requires:[
		'NextThought.view.annotations.NotePanel'
	],

	constructor: function(record, component){
		Ext.apply(this, {
			anchorNode : null,
			noteContainer: null,
			originalPadding: 0,
			renderPriority: 0
		});

		this.callParent([record, component]);

		//get the range this note is associated with:
		var me = this,
			range = Anchors.toDomRange(record.get('applicableRange'), this.doc),
			anchor = this.findOrCreateAnchorForParent(range.commonAncestorContainer),
			c = me.createNoteContainer(record.get('applicableRange').ancestor.getElementId()),
			a;

		range.commonAncestorContainer.appendChild(anchor);
		a = Ext.get(anchor);
		c.nib.add(me.img);

		a.setStyle({
			display: 'block',
			clear: 'both'
		});

		me.anchorNode = a;
		me.noteContainer = c;
		me.originalPadding =
				a.dom.originalPadding!==undefined ?
						a.dom.originalPadding : a.getPadding('b');
		a.dom.originalPadding = me.originalPadding;

		// console.debug('original padding:',me.originalPadding);

		me.noteDiv = me.createElement('div',c.dom,'x-note-panel',(me.isVisible?'':'display:none;'));
		me.noteDiv.annotation = me;

		me.noteCmp = Ext.widget({xtype: 'note-entry', renderTo: me.noteDiv, annotation: me, owner: component });

		return me;
	},


	/**
	 *
	 * @param parent - a DOM element that is the block parent we will look under
	 */
	findOrCreateAnchorForParent: function(parent) {
		if (!parent){
			Ext.Error.raise('Requires a parent');
		}
		var attr = 'data-artificial',
			p = Ext.get(parent),
			existingAnchors = p.query('['+attr+']'),
			result;

		//Do some double checking here, there should never be more than one, freak out if so:
		if (existingAnchors.length > 1) {
			console.error('Found more than one artificial anchor', existingAnchors);
			Ext.Error.raise('Found more than one artificial anchor, never should there be more than one!');
		}
		else if (existingAnchors.length === 0) {
			//none here, create one
			result = this.doc.createElement('a');
			result.setAttribute(attr, 'true');
			return result;
		}
		else {
			//found one, just return it
			return existingAnchors[0];
		}
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

		c.setVisibilityMode(Ext.Element.DISPLAY);

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
		var i = 'note-container-'+this.prefix+'-'+id,
			e = Ext.get(i),
			n = e ? e.dom : this.createElement('div',this.container,'document-notes');
		n.setAttribute('id',i);
		n.setAttribute('name',IdCache.getComponentId(this.record, null, this.prefix));

		if(Ext.isIE9){
			Ext.get(n).setStyle('z-index','2');
		}

		n = Ext.get(n);

		if(!n.nib){
			n.nib = Ext.create('Ext.CompositeElement');
		}

		return n;
	},


	cleanup: function(removeAll){
		if(!this.noteCmp){ return; }
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
				this.noteContainer.nib.clear();
				delete this.noteContainer.nib;
				delete this.noteContainer;
				this.anchorNode.setStyle('padding-bottom',this.originalPadding+'px');
			}
		}

		this.callParent(arguments);
	},


	render: function(isLastOfAnchor){
		try{
			if(!this.noteCmp){return;}

			this.callParent(arguments);

			var me= this,
				p = Ext.get(me.container),
				c = me.noteContainer,
				a = me.anchorNode,
				i = me.originalPadding,
				ifc = Ext.get(this.query('#nticontent .page-contents')[0]),
				w = ifc.getWidth(),
				extra = 0,
				adjust = 0,
				nx= a.next(),
				pr= a.prev(),
				ox = me.offsets.left,

				h,x,y;

			c.setWidth(w);

			h = c.getHeight();
			if(h){
				adjust += pr?(pr.getPadding('b')+pr.getMargin('b')):0;
				extra += (nx?(nx.getPadding('t')+nx.getMargin('t')):0) + adjust;
			}

			a.setStyle('padding-bottom',(i+h+extra)+'px');

			x = ox+ifc.getLeft();
			y = a.getY()+( adjust? 0: extra);

			c.setStyle({top: y+'px', left: x+'px'});

			ox = (ox+60)-(Ext.fly(me.img).getWidth()/2);
			//move the nib to the top-aligning corner of the note container
			c.nib.moveTo(ox+p.getLeft(), c.down('.x-nti-note img').getTop());

			//always move to the end
			if(c.dom.nextSibling){
				me.container.appendChild(c.dom);
			}
		}
		catch(e){
			console.error('Note onResize: ',e,e.message, e.stack);
		}
	}
});

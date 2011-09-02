Ext.define( 'NextThought.view.widgets.Note', {
	extend: 'NextThought.view.widgets.Annotation',
	requires:[
			'NextThought.view.widgets.NotePanel'
			],

	_anchorNode : null,
	_noteContainer: null,
	_noteDiv: null,
	
	_originalPadding: 0,

	constructor: function(record, container, component){
		this.callParent([record, container, component,'resources/images/charms/note-white.png']);

        var me = this,
            a = Ext.get(Ext.query('a[name=' + record.get('anchorPoint') + ']')[0]),
            c;

        me._cmp.on('afterlayout', me.onResize, me);

        a = a ? a : Ext.get(Ext.query('#nticontent a[name]')[0]);
        c = me._createNoteContainer(a.dom.getAttribute('name'));
        a.setStyle('display', 'block');

		me._anchorNode = a;
		me._noteContainer = c;
		me._originalPadding = a.dom.originalPadding!==undefined
			? a.dom.originalPadding
			: a.getPadding('b');
		a.dom.originalPadding = me._originalPadding;

		// console.log('original padding:',me._originalPadding);

		me.noteDiv = me.createElement('div',c.dom,'x-note-panel',(me._isVisible?'':'display:none;'));
		me.noteDiv._annotation = me;

		me.noteCmp = Ext.create('widget.notepanel',{ renderTo: me.noteDiv, _annotation: me, _owner: component });
		me.noteUpdated(record);
		me.noteCmp.doLayout();

		return me;
	},

    getCmp: function(){
        return this.noteCmp;
    },
	
	visibilityChanged: function(show){
		var me = this, c = Ext.get(me.noteDiv);
		me.callParent(arguments);
		show? c.show() : c.hide();
		if(me.noteCmp)
			me.noteCmp.doLayout();
		// me.onResize();
		setTimeout(function(){
            console.log('note visability changed, firing resize');
			me._cmp.fireEvent('resize');
		},100);
	},
	
	noteUpdated: function(record){
		// console.log('noteUpdated');
        var children = this._record.children,
            parent = this._record._parent;

        record.on('updated',this.noteUpdated, this);
        record.children = children;
        record._parent = parent;

        this._record = record;
        this.noteCmp.update(record.get('text'));
		this.onResize();
		this._cmp.fireEvent('resize',{});
	},
	
	_buildMenu: function(){
		var items = [];
		
		if(this._isMine)
			items.push({
				text : 'Remove Note',
				handler: Ext.bind(this.remove, this)
			});
		return this.callParent([items]);
	},
	
	_createNoteContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-notes unselectable');
		n.setAttribute('id',id);
		return Ext.get(n);
	},
	
	cleanup: function(){
		this.callParent(arguments);
        this._cmp.un('afterlayout', this.onResize, this);
//        if(this.noteCmp.hasReplies()){
//            this.noteCmp.removeReply();
//        }
//        else {
		    this.noteCmp.destroy();
		    delete this.noteCmp;
            Ext.get(this.noteDiv).remove();
//        }
		this.onResize();
	},
	
	onResize : function(){
		try{
		var me= this,
			p = Ext.get(me._cnt),
			c = me._noteContainer,
			a = me._anchorNode,
			i = me._originalPadding,
			w = Ext.get(Ext.query('#nticontent .page-contents')[0]).getWidth(),
			h = 0,
            extra= 0,
            adjust=0,
            nx= a.next(),
            pr= a.prev();

		c.setWidth(w);
//		a.setStyle('border', '1px solid green');

        adjust += pr.getPadding('b')+pr.getMargin('b');
        extra += nx.getPadding('t')+nx.getMargin('t') + adjust;

		h = c.getHeight();

		a.setStyle('padding-bottom',(i+h+extra)+'px');

		// c.alignTo(a, 'tl-bl?',[0,-h]);
		c.moveTo(p.getLeft()+p.getPadding('l'),a.getTop()+(adjust?0:extra));
        //move the nib to the top-aligning corner of the note container
        if (me._img)
		    Ext.get(me._img).moveTo(p.getLeft(), c.getTop());
		
		//always move to the end
		if(c.dom.nextSibling)
			me._cnt.appendChild(c.dom);
			
		if (me.noteCmp)
            me.noteCmp.doLayout();

		}
		catch(e){
			console.log(e,e.message, e.stack);
		}
	}
});
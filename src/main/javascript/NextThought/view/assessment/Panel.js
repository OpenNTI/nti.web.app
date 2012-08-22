Ext.define('NextThought.view.assessment.Panel',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.assessment-panel',

	placementHolderTpl: Ext.DomHelper.createTemplate({type:'application/vnd.nextthought.nascoreboard'}),

	inheritableStatics: {
		syncPositioning : Ext.Function.createBuffered(function(){
			Ext.each(Ext.ComponentQuery.query('assessment-panel'),function(q){ q.syncTop(); }); },10)
	},

	appendPlaceholder: false,
	plain: true,
	autoRender: true,
	ui: 'assessment',


	initComponent: function(){
		var d, el, insert = 'insertBefore', ix = 0;
		if(!this.contentElement){
			this.insertedElement = true;
			d = this.reader.getDocumentElement().getElementsByTagName('object');
			//TODO: ensure its a 'type=application/vnd.nextthought.naquestion'
			if(this.appendPlaceholder){
				insert = 'insertAfter';
				ix = d.length - 1;
			}

			el = d[ix];
			this.contentElement = this.placementHolderTpl[insert](el);
		}

		this.callParent(arguments);
	},


	destroy: function(){
		if(this.insertedElement){
			Ext.fly(this.contentElement).remove();
		}
		this.callParent(arguments);
	},


	hide: function(){
		Ext.fly(this.contentElement).setStyle({display:'none'});
		this.callParent(arguments);
	},


	show: function(){
		Ext.fly(this.contentElement).setStyle({display:'block'});
		this.callParent(arguments);
	},


	setupContentElement: function(){
		Ext.fly(this.contentElement).setStyle({
			overflow: 'hidden',
			display: 'block',
			margin: '30px auto',
			opacity: 0,
			'white-space': 'nowrap'
		});
		this.removeContent('.naqsolutions,.naqchoices,.rightwrongbox,.hidden,INPUT,p.par');
	},


	syncTop: function(){
		if(!this.contentElement){return;}
		var o = this.reader.getAnnotationOffsets(),
			myTop = Ext.fly(this.contentElement).getY(),
			ctTop = this.el.up('.x-reader-pane').getY(),
			top = (myTop + ctTop) - o.scrollTop;
		this.el.setY(top);
	},


	afterLayout: function(){
		this.syncElementHeight();
		this.callParent(arguments);
	},


	syncElementHeight: function(){
		var h = this.getHeight();
		try {
		Ext.fly(this.contentElement).setHeight(h);
		}
		catch(e){
			console.log('no contentElement');
		}
		this.self.syncPositioning();
	}
});

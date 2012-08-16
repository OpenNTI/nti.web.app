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
			Ext.get(this.contentElement).remove();
		}
		this.callParent(arguments);
	},


	hide: function(){
		var c = Ext.get(this.contentElement);
		c.setVisibilityMode(Ext.dom.Element.DISPLAY);
		c.hide();console.log('test hide');
		this.callParent(arguments);
	},


	show: function(){
		var c = Ext.get(this.contentElement);
		c.setVisibilityMode(Ext.dom.Element.DISPLAY);
		c.show();console.log('test show');
		this.callParent(arguments);
	},


	setupContentElement: function(){
		var el = Ext.get(this.contentElement);
		this.removeContent('.naqsolutions,.naqchoices,.rightwrongbox,.hidden,INPUT,p.par');

		el.setStyle({
			overflow: 'hidden',
			display: 'block',
			margin: '30px auto',
			opacity: 0,
			'white-space': 'nowrap'
		});
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
		Ext.get(this.contentElement).setHeight(h);
		}
		catch(e){
			console.log('no contentElement');
		}
		this.self.syncPositioning();
	}
});

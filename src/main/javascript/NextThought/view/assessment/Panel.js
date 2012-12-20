Ext.define('NextThought.view.assessment.Panel',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.assessment-panel',

	requires: ['NextThought.util.Anchors'],

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
		clearInterval(this.interval);
		this.callParent(arguments);
	},

	afterRender: function(){
		var me = this, lastY = 0, sameCount = 0;
		me.callParent(arguments);
		this.interval = setInterval(function(){
			var y;
			me.syncTop();

			if(!me.el || !me.el.dom){ sameCount = NaN; }
			else {
				y = me.el.getY();
				if(Math.abs(y-lastY)<2){ sameCount ++; }
				else { sameCount = 0; }
				lastY = y;
			}

			if(isNaN(sameCount) || sameCount> 5 ){
				clearInterval(me.interval);
			}
		},200);
	},


	hide: function(){
		Ext.fly(this.contentElement).setStyle({display:'none'});
		this.callParent(arguments);
	},


	show: function(){
		Ext.fly(this.contentElement).setStyle({display:'block'});
		this.callParent(arguments);
	},


	removeContent: function(selector){
		var el = Ext.get(this.contentElement);
		el.select(selector).remove();
	},


	setupContentElement: function(){
		Ext.fly(this.contentElement).setStyle({
			overflow: 'hidden',
			display: 'block',
			margin: '30px auto',
			opacity: 0,
			'white-space': 'nowrap'
		});

		var magic = {
			tag: 'span',
			html: 'ANCHOR_MAGIC',
			cls: 'anchor-magic'
		};

		this.removeContent('.naqsolutions,.naqchoices,.rightwrongbox,.hidden,INPUT,p.par,object,param');
		//TODO figure out how to not do this
		//IE line finding works off textnodes right now.  INject a magic one to ensure there is always some text.
		//Firefox blows as much as IE
		if(Ext.isIE9 || Ext.isGecko){
			magic[Anchors.NON_ANCHORABLE_ATTRIBUTE] = true;
			magic[Anchors.NO_ANCHORABLE_CHILDREN_ATTRIBUTE] = true;
			Ext.DomHelper.insertFirst(this.contentElement, magic);
		}
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

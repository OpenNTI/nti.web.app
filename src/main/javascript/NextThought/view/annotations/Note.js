Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',
	requires:[
		'NextThought.view.annotations.note.Window',
		'NextThought.view.annotations.note.GutterWidget'
	],


	multiGutterWidgetTmpl: Ext.DomHelper.createTemplate(
			{ cls: 'thumb note-gutter-widget multi' }).compile(),

	constructor: function(config){
		this.callParent(arguments);


		return this;
	},


	render: function(){
		return this.callParent();
		//TODO - initally just render the highlight, we want to use styles to not render highlights created from clicking on the left.
	},


	cleanup: function(){
		if (this.gutterCmp){this.gutterCmp.destroy(); delete this.gutterCmp;}
		if (this.singleGutterWidget){this.singleGutterWidget.remove(); delete this.singleGutterWidget;}
		if (this.multiGutterWidget){this.multiGutterWidget.remove(); delete this.multiGutterWidget;}

		return this.callParent(arguments);
	},

	//Notes don't have controls
	//getControl: function(){},


	openWindow: function(isReply){
		Ext.widget({
			xtype: 'note-window',
			record: this.getRecord(),
			activeAnnotations: [],
			isReply: isReply
		}).show();
	},


	attachListeners: function(el){
		var me = this;
		el.on({
			click: function(e){e.stopEvent();return false;},
			mouseup: function(e){
				me.openWindow(Boolean(e.getTarget('.reply')));
			}
		});
		return el;
	},


	getGutterWidget: function(numberOfSiblings){
		if (numberOfSiblings > 0){//siblings... there is "this" and n others
			if (!this.multiGutterWidget){
				this.createMultiGutterWidget();
			}
			return this.multiGutterWidget;

		}
		else {
			if (!this.singleGutterWidget){
				this.createSingleGutterWidget();
			}
			return this.singleGutterWidget;
		}
	},


	createSingleGutterWidget: function(){
		var dom = document.createElement('div');

		this.gutterCmp = Ext.widget({xtype: 'note-gutter-widget', record: this.getRecord(), renderTo: dom});
		this.singleGutterWidget = this.attachListeners( Ext.get(dom) );
	},


	createMultiGutterWidget: function(){
		var creator = this.record.get('Creator'),
			htmlString = this.multiGutterWidgetTmpl.apply(),
			dom = Ext.DomHelper.createDom({html:htmlString}).firstChild;

		//now create the ext object:
		this.multiGutterWidget = this.attachListeners( Ext.get(dom) );

		UserRepository.getUser(creator, function(u){
			var url = u[0].get('avatarURL');
			Ext.fly(this.multiGutterWidget).setStyle({backgroundImage: "url("+url+")"});
		}, this);
	}


});

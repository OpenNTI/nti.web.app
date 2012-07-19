Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',
	requires:[
		'NextThought.view.annotations.note.Window',
		'NextThought.view.annotations.note.GutterWidget'
	],


	multiGutterWidgetTmpl: Ext.DomHelper.createTemplate(
		{
			cls: 'thumb note-gutter-widget multi',
			cn: [
				//{	cls: 'bubble-wrapper',
				//	cn: [
						{
							cls: 'bubble',
							cn: [
								{
									cls: 'meta',
									cn: [
										{tag: 'span', cls: 'name', html: '{0}'},
										' - ',
										{tag: 'span', cls: 'time', html: '{1}'}
									]
								},
								{cls: 'text', html: '{2}'}
							]
						}
					//]
				//}
			]
		}
	).compile(),

	constructor: function(config){
		this.callParent(arguments);


		return this;
	},


	cleanup: function(){
		if (this.gutterCmp){
			this.ownerCmp.unRegisterScrollHandler(
					this.gutterCmp.onParentScroll,this.gutterCmp);
			this.gutterCmp.destroy();
			delete this.gutterCmp;
		}
		if (this.singleGutterWidget){this.singleGutterWidget.remove(); delete this.singleGutterWidget;}
		if (this.multiGutterWidget){this.multiGutterWidget.remove(); delete this.multiGutterWidget;}

		return this.callParent(arguments);
	},

	//Notes don't have controls
	//getControl: function(){},


	openWindow: function(isReply, isEdit){
		return Ext.widget({
			xtype: 'note-window',
			annotation: this,
			activeAnnotations: [],
			isReply: isReply && !isEdit,
			isEdit: isEdit
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
		var dom = Ext.get(document.createElement('div'));

		this.gutterCmp = Ext.widget({xtype: 'note-gutter-widget', record: this.getRecord(), renderTo: dom});
		this.singleGutterWidget = this.attachListeners( Ext.get(dom) );

		this.ownerCmp.registerScrollHandler(this.gutterCmp.onParentScroll,this.gutterCmp);
	},


	createMultiGutterWidget: function(){
		var creator = this.record.get('Creator'),
			htmlString = this.multiGutterWidgetTmpl.apply([
				creator,
				this.record.getRelativeTimeString(),
				this.record.getBodyText()]),
			dom = Ext.DomHelper.createDom({html:htmlString}).firstChild,
			el;

		//now create the ext object:
		el = this.multiGutterWidget = this.attachListeners( Ext.get(dom) );

		UserRepository.getUser(creator, function(u){
			var url = u[0].get('avatarURL'),
				name = u[0].getName();
			el.setStyle({backgroundImage: "url("+url+")"});
			el.down('.name').update(name);

		}, this);
	}


});

Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',
	requires:[],

	/*
	singleGutterWidget: null,
	multiGutterWidget: null,
	*/

	singleGutterWidgetTmpl: Ext.DomHelper.createTemplate( {
		cls: 'note-gutter-widget-single',
		children: [
			{
				cls: 'content',
				children: [
					{cls: 'name', html: '{0}'},
					{cls: 'text', html: '{1}'}
				]
			},
			{cls: 'mask'}
		]
	}).compile(),


	multiGutterWidgetTmpl: Ext.DomHelper.createTemplate( {
		cls: 'thumb note-gutter-widget-multi'
	}).compile(),

	constructor: function(config){
		this.callParent(arguments);


		return this;
	},


	render: function(){
		return this.callParent();
		//TODO - initally just render the highlight, we want to use styles to not render highlights created from clicking on the left.
	},

	//Notes don't have controls
	//getControl: function(){},


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
		var creator = this.record.get('Creator'),
			htmlString = this.singleGutterWidgetTmpl.apply([
				creator,
				AnnotationUtils.getBodyTextOnly(this.record)]),
			dom = Ext.DomHelper.createDom({html:htmlString}).firstChild;

		//now create the ext object:
		this.singleGutterWidget = Ext.get(dom);

		UserRepository.getUser(creator, function(u){
			var name = u[0].getName();
			this.singleGutterWidget.down('.name').update(name);
		}, this);
	},


	createMultiGutterWidget: function(){
		var creator = this.record.get('Creator'),
			htmlString = this.multiGutterWidgetTmpl.apply(),
			dom = Ext.DomHelper.createDom({html:htmlString}).firstChild;

		//now create the ext object:
		this.multiGutterWidget = Ext.get(dom);

		UserRepository.getUser(creator, function(u){
			var url = u[0].get('avatarURL');
			Ext.fly(this.multiGutterWidget).setStyle({backgroundImage: "url("+url+")"});
		}, this);
	}


});

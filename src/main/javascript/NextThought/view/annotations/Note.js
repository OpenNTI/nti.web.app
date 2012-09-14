Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',
	requires:[
		'NextThought.view.annotations.note.Window',
		'NextThought.view.annotations.note.GutterWidget'
	],


	multiGutterWidgetTmpl: Ext.DomHelper.createTemplate({
		cls: 'thumb note-gutter-widget multi',
		cn: [
			//{	cls: 'bubble-wrapper',
			//	cn: [
					{
						cls: 'bubble',
						cn: [
							{tag: 'div', cls: 'reply-count', html: '{3}'},
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
	}).compile(),

	constructor: function(config){
		this.callParent(arguments);
		this.on('open',function(scrollTo, replyTo){
			var reply, w = this.openWindow(Boolean(replyTo));
			if( scrollTo !== this.getRecord().getId() ){
				reply = w.down(
					Ext.String.format('[guid={0}]',IdCache.getIdentifier(scrollTo)));

				if( reply ){
					reply.scrollIntoView();
				}
			}
		},this);
		return this;
	},


	onDestroy: function(){
		var children = this.getRecord().children || [];

		if(children.length>0){
			this.ownerCmp.fireEvent('bubble-replys-up', children);
		}

		return this.callParent(arguments);
	},


	cleanup: function(){
		this.removeWidgets();
		return this.callParent(arguments);
	},


	removeWidgets: function(){
		if (this.gutterCmp){
			this.ownerCmp.unRegisterScrollHandler(
					this.gutterCmp.onParentScroll,this.gutterCmp);
			this.gutterCmp.destroy();
			delete this.gutterCmp;
		}
		if (this.singleGutterWidget){this.singleGutterWidget.remove(); delete this.singleGutterWidget;}
		if (this.multiGutterWidget){
			this.multiGutterWidget.remove();
			delete this.multiGutterWidget;
		}
	},


	openWindow: function(isReply, isEdit){
		Ext.each(Ext.ComponentQuery.query('note-window'),function(w){w.destroy();});
		return Ext.widget({
			xtype: 'note-window',
			annotation: this,
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

	getEl: function(){
		return Ext.get(this.activeWidget);
	},


	getGutterWidget: function(numberOfSiblings){
		if (numberOfSiblings > 0){//siblings... there is "this" and n others
			if (!this.multiGutterWidget){
				this.createMultiGutterWidget();
			}
			this.activeWidget = this.multiGutterWidget;
			return this.multiGutterWidget;

		}
		else {
			this.removeWidgets();
			this.createSingleGutterWidget();
			this.activeWidget = this.singleGutterWidget;
			return this.singleGutterWidget;
		}
	},


	createSingleGutterWidget: function(){
		var dom = Ext.get(document.createElement('div'));

		this.gutterCmp = Ext.widget({xtype: 'note-gutter-widget', annotation: this, record: this.getRecord(), renderTo: dom});
		this.singleGutterWidget = this.attachListeners( Ext.get(dom) );

		this.ownerCmp.registerScrollHandler(this.gutterCmp.onParentScroll,this.gutterCmp);
	},


	createMultiGutterWidget: function(){
		var creator = this.record.get('Creator'),
			replyCt = this.record.getReplyCount(),
			htmlString = this.multiGutterWidgetTmpl.apply([
				creator,
				this.record.getRelativeTimeString(),
				this.record.getBodyText(),
				replyCt]),
			dom = Ext.DomHelper.createDom({html:htmlString}).firstChild,
			el;

		//now create the ext object:
		el = this.multiGutterWidget = this.attachListeners( Ext.get(dom) );

		el.hover(function(){
			var b = el.down('.bubble'),
				rect = el.dom.getBoundingClientRect(),
				left = b.dom.getBoundingClientRect().left;

			el[(rect.top < 170)?'addCls':'removeCls']('show-under');

			if(left < 75) {
				left = 75 - el.getX();
				b.setStyle({left:left+'px', 'z-index': '9999'});
			}
		}, function(){ el.down('.bubble').setStyle({left:null, 'z-index': '99'});});

		UserRepository.getUser(creator, function(u){
			var url = u.get('avatarURL'),
				name = u.getName(),
				localEl = Ext.get(dom);
			localEl.setStyle({backgroundImage: "url("+url+")"});
			localEl.down('.name').update(name);

		}, this);
	}


});

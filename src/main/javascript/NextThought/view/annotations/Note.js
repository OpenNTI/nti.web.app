Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',
	requires:[
		'NextThought.view.annotations.note.Window',
		'NextThought.view.annotations.note.GutterWidget'
	],

	hasGutterWidgets: true,

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
		var me = this;
		me.callParent(arguments);

		me.hasSpecificRange = this.getRecordField('style') !== 'suppressed';

		me.on('open',function(scrollTo, replyToId){
			var reply, w = me.openWindow(replyToId), m;

			function cb(){
				reply = w.down( Ext.String.format('[guid={0}]',IdCache.getIdentifier(scrollTo)));
				if( reply ){
					reply.scrollIntoView();
				}
			}

			if( scrollTo !== me.getRecord().getId() ){
				m = w.down('note-main-view');
				if(m){
					w.down('note-main-view').hasCallback = cb;
				}
			}
		},me);

		me.record.on({
			scope: me,
			updated: me.recordUpdated,
			changed: me.recordUpdated
		});

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

	openWindow: function(replyToId, isEdit){
		if(Ext.isArray(replyToId)){
			replyToId = replyToId.slice(-1);
			replyToId = replyToId.length > 0 ? replyToId[0] :  null;
		}

		return Ext.widget('note-window', {
			annotation: this,
			replyToId: replyToId && !isEdit ? replyToId : null,
			isEdit: isEdit
		}).show();
	},


	attachListeners: function(el){
		var me = this;
		el.on({
			click: function(e){e.stopEvent();return false;},
			mouseup: function(e){
				me.openWindow(e.getTarget('.reply') ? me.getRecord().getId(): null);
			}
		});
		return el;
	},

	getEl: function(){
		return Ext.get(this.activeWidget);
	},


	render: function(){
		if(this.hasSpecificRange){
			return this.callParent(arguments);
		}

		return this.resolveVerticalLocation();
	},


	getGutterWidget: function(numberOfSiblings){
		if (numberOfSiblings > 0){//siblings... there is "this" and n others
			if (!this.multiGutterWidget){
				this.multiGutterWidget = this.createMultiGutterWidget();
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

		this.gutterCmp = Ext.widget('note-gutter-widget', {annotation: this, record: this.getRecord(), renderTo: dom});
		this.singleGutterWidget = this.attachListeners( Ext.get(dom) );

		this.ownerCmp.registerScrollHandler(this.gutterCmp.onParentScroll,this.gutterCmp);
	},

	setupMultiGutterDom: function(dom){
		var el = this.attachListeners( Ext.get(dom)),
            b = el.down('.bubble');

		el.hover(function(){
            var rect = el.dom.getBoundingClientRect(),
				bubbleRect = b.dom.getBoundingClientRect(),
				left = bubbleRect.left;

			//We preference showing it above the line, but if it won't fit
			//we show it below
            el[(rect.top - bubbleRect.height - 95 < 0)?'addCls':'removeCls']('show-under');

			if(left < 75) {
				left = 75 - el.getX();
				b.setStyle({left:left+'px', 'z-index': '9999'});
			}
		}, function(){ el.down('.bubble').setStyle({left:null, 'z-index': '99'});});


		return el;
	},

	recordUpdated: function(){
		var isActive = this.activeWidget === this.multiGutterWidget,
			oldWidget;
		if(!this.multiGutterWidget){
			return;
		}

		console.log('Need to update multi gutter widget');
		oldWidget = this.multiGutterWidget;
		
		this.multiGutterWidget = this.createMultiGutterWidget();
		if(isActive){
			this.activeWidget = this.multiGutterWidget;
		}
		this.multiGutterWidget.replace(oldWidget);
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

		el = this.setupMultiGutterDom(dom);

		UserRepository.getUser(creator, function(u){
			var url = u.get('avatarURL'),
				name = u.getName(),
				localEl = Ext.get(dom);
			localEl.setStyle({backgroundImage: "url("+url+")"});
			localEl.down('.name').update(name);

		}, this);

		return el;
	}


});

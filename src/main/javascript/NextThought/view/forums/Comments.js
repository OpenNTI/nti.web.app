Ext.define('NextThought.view.forums.Comments',{
	extend: 'Ext.view.View',
	alias: 'widget.forum-comment-thread',

	requires: [
		'NextThought.store.forums.Comments',
		'NextThought.util.UserDataThreader'
	],

	ui: 'forum-comment-thread',
	itemSelector: '.topic-comment',

	disableSelection: true,

	tpl: Ext.DomHelper.markup([
		{ cls: 'new-root'},
		{ tag: 'tpl', 'for': '.', cn:[
			{ tag: 'tpl', 'if': 'Deleted', cn: {
				cls: 'topic-comment placeholder {[values.threadShowing? "expanded" : "collapsed"]}',
				'data-depth': '{depth}',
				cn: [
					{ cls: 'expand'},
					{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
						{ cls: 'body', html: 'This item has been deleted.'}
					]}
				]
			}},
			{ tag: 'tpl', 'if': '!Deleted', cn: {
				cls: 'topic-comment {[values.threadShowing? "expanded" : "collapsed"]}',
				'data-depth': '{depth}',
				cn: [
					{ cls: 'controls', cn: [
						{cls: 'favorite-spacer'},
						{cls: 'like {[values.liked? "on" : "off"]}'}
					]},
					{ cls: 'expand'},
					{ cls: 'avatar', style: { backgroundImage: 'url({creatorAvatarURL});'}},
					{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
						{ cls: 'meta', cn: [
							{ tag: 'span', html: '{displayName}', cls: 'name link'},
							{ tag: 'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}'}
						]},
						{ cls: 'body', html: '{bodyContent}'},
						{ cls: 'foot', cn: [
							{ tag: 'span', cls: 'reply link', html: 'Reply'},
							{ tag: 'tpl', 'if': 'isModifiable', cn: [
								{ tag: 'span', cls: 'edit link', html: 'Edit'},
								{ tag: 'span', cls: 'delete link', html: 'Delete'}
							]},
							{ tag: 'tpl', 'if': '!isModifiable', cn: [
								{ tag: 'span', cls: 'flag link {[values.flagged? "on" : "off"]}', html: 'Report'}
							]}
						]},
						{ cls: 'editor-box' }
					]}
				]
			}}
		]}
	]),


	listeners: {
		itemclick: {
			element: 'el',
			fn: 'onItemClick'
		}
	},


	initComponent: function(){
		this.callParent(arguments);

		if(!this.topic){
			console.error('Cant create a comments view without a topic...');
			return;
		}

		this.buildStore();
	},


	afterRender: function(){
		var me = this;

		this.callParent(arguments);
		
		me.editor = Ext.widget('nti-editor', {ownerCt: me, renderTo: me.el, record: null, saveCallback: function(editor, postCmp, record){
			if(me.isNewRecord){
				me.store.insertSingleRecord(record);
			}
		}});
		me.editor.addCls('threaded-forum-editor');		
	},	


	buildStore: function(){
		var s = NextThought.store.forums.Comments.create({
			storeId: this.topic.get('Class') + '-' + this.topic.get('NTIID'),
			url: this.topic.getLink('contents')
		});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {},{
			sortOn: 'CreatedTime',
			sortOrder: 'ascending',
			filter: 'TopLevel'
		});

		this.mon(s,{
			'load': 'onStoreAdd',
			'add': 'onStoreAdd',
			'update': 'onStoreUpdate'
		});

		this.bindStore(s);

		this.store.load();
	},


	onStoreAdd: function(store, records){
		records.forEach(this.fillInData);
	},

	
	onStoreUpdate: function(store, record){
		this.fillInData(record);
	},


	fillInData: function(record){
		record.compileBodyContent(function(body){
			UserRepository.getUser(record.get('Creator'))
				.then(function(user){
					record.set({
						'bodyContent': body,
						'displayName': user.get('displayName'),
						'creatorAvatarURL': user.get('avatarURL')
					});
				})
				.fail(function(reason){
					console.error(reason);
				})
			
		}, this);
	},

	onItemClick: function(record, item, index, e){
		var record, load, me = this, width,
			el = Ext.get(item),
			box;

		if (el.hasCls('placeholder')) {
			if (el.hasCls('collapsed')) {
				me.store.showCommentThread(record);
			} else {
				me.store.hideCommentThread(record);
			}
			return;
		}

		if (el.hasCls('collapsed')) {
			me.store.showCommentThread(record);
			return;
		}

		if (e.getTarget('.expand')) {
			me.store.hideCommentThread(record);
			return;
		}
		width = el.down('.wrap').getWidth();

		if (e.getTarget('.reply')) {
			this.isNewRecord = true;
			newRecord = record.makeReply();
			this.openEditor(newRecord, el.down('.editor-box'), width);			
		}

		if (e.getTarget('.edit')) {
			delete this.isNewRecord;
			this.openEditor(record, el.down('.body'), width);
		}

		if (e.getTarget('.delete')) {
			/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
			Ext.Msg.show({
				msg: 'This will permanently remove this comment.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: me,
				icon: 'warning-red',
				buttonText: {'ok': 'Delete'},
				title: 'Are you sure?',
				fn: function(str) {
					if (str === 'ok') {
						var href = record.get('href'),
							depth = record.get('depth');

						if (!href) {
							console.error('The record doesnt have an href!?!?!');
							return;
						}

						Service.request({
							url: href,
							method: 'DELETE'
						}).done(function(){
							record.convertToPlaceholder();
							record.set({
								'depth': depth,
								'threadShowing': true,
								'Deleted': true
							});

						}).fail(function(reason){
							console.error(reason);
						});

					}
				}
			});
		}

		if (e.getTarget('.flag') && !record.isFlagged()) {
			me.flagging = true;
			TemplatesForNotes.areYouSure('Reporting this object cannot be undone.', function(btn) {
				delete me.flagging;
				if (btn === 'ok') { record.flag(me); }
			});
		}

		if (e.getTarget('.name')) {
			UserRepository.getUser(record.get('Creator'))
				.done(function(u){
					if(!isMe(u)){
						me.fireEvent('show-profile', u);
					}
				})
				.fail(function(reason){
					console.error(reason);
				});
		}

		if(e.getTarget('.like')) {
			record.like();
		}

	},


	openEditor: function(record, el, width) {
		var me = this,
			oldHeight = el.getHeight();

		width = width || el.getWidth();

		function size(){
			el.setHeight(me.editor.getHeight());
		}

		me.editor.record = record;
		me.editor.editBody((record && record.get('body')) || []);
		me.editor.activate();
		me.editor.focus();

		me.editor.alignTo(el, 'tl-tl');

		size();
		me.editor.setWidth(width);

		Ext.destroy(this.boxMonitor);

		me.boxMonitor = me.mon(this.editor,{
			destroyable: true,
			'grew': size,
			'shrank': size,
			'deactivated-editor': function(){
				el.setHeight(oldHeight);
			}
		});
	},


	addRootReply: function(){
		this.isNewRecord = true;
		this.openEditor(null, this.el.down('.new-root'));
	},


	getRefItems: function() {
		var items = [];
		if (this.editor) {
			items.push(this.editor);
		}
		return items;
	}
});
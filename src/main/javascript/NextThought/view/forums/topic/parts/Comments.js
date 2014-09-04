Ext.define('NextThought.view.forums.topic.parts.Comments', {
	extend: 'Ext.view.View',
	alias: 'widget.forums-topic-comment-thread',

	requires: [
		'NextThought.store.forums.Comments',
		'NextThought.util.UserDataThreader'
	],

	mixins: {
		searchHitHighlighting: 'NextThought.mixins.SearchHitHighlighting'
	},

	ui: 'forum-comment-thread',
	itemSelector: '.topic-comment-container',
	preserveScrollOnRefresh: true,

	disableSelection: true,
	//loadMask: { renderTo: 'view' },
	loadMask: false,
	updateFromMeMap: {},
	wbData: {},
	recordsToRefresh: [],

	tpl: Ext.DomHelper.markup([
		{ cls: 'new-root'},
		{ tag: 'tpl', 'for': '.', cn: [
			{ cls: 'topic-comment-container {[values.threadShowing? "expanded" : "collapsed"]}', 'data-depth': '{depth}', tabindex: -1, cn: [
				{ tag: 'tpl', 'if': 'Deleted', cn: {
					cls: 'topic-comment placeholder {[values.threadShowing? "expanded" : "collapsed"]}',
					'data-depth': '{depth}',
					cn: [
						{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
							{ cls: 'body', html: '{{{NextThought.view.forums.topic.parts.Comments.deleted}}}'},
							{ cls: 'foot', cn: [
								{ tag: 'tpl', 'if': 'depth == 0 &amp;&amp; ReferencedByCount &gt; 0', cn: [
									{ tag: 'span', cls: 'comments link toggle', html: '{ReferencedByCount:plural("Comment")}'}
								]}
							]}
						]}
					]
				}},
				{ tag: 'tpl', 'if': '!Deleted', cn: {
					cls: 'topic-comment {[values.threadShowing? "expanded" : "collapsed"]} {[values.depth === 0? "toggle" : ""]}',
					'data-depth': '{depth}',
					cn: [
						{ cls: 'controls', cn: [
							{cls: 'favorite-spacer'},
							{cls: 'like {[values.liked? "on" : "off"]}', html: '{likeCount}'}
						]},
						{ cls: 'commentAvatar', style: { backgroundImage: 'url({Creator:avatarURL()});'}},
						{ cls: 'wrap', 'data-commentid': '{ID}', cn: [
							{ cls: 'meta', cn: [
								{ tag: 'span', html: '{Creator:displayName()}', cls: 'name link'},
								{ tag: 'tpl', 'if': 'depth &gt; 4', cn: [
									{ tag: 'span', html: '{{{NextThought.view.forums.topic.parts.Comments.repliedto}}}'}
								]},
								{ tag: 'tpl', 'if': 'depth &lt; 5', cn: [
									{ tag: 'span', cls: 'datetime nodot', html: '{CreatedTime:ago}'}
								]}
							]},
							{ cls: 'body', html: '{bodyContent}'},
							{ cls: 'foot', cn: [
								{ tag: 'tpl', 'if': 'depth === 0', cn: [
									{ tag: 'span', cls: 'comments link toggle', html: '{ReferencedByCount:plural("Comment")}'}
								]},
								{ tag: 'span', cls: 'reply thread-reply link', html: '{{{NextThought.view.forums.topic.parts.Comments.reply}}}'},
								{ tag: 'tpl', 'if': 'isModifiable', cn: [
									{ tag: 'span', cls: 'edit link', html: '{{{NextThought.view.forums.topic.parts.Comments.edit}}}'},
									{ tag: 'span', cls: 'delete link', html: '{{{NextThought.view.forums.topic.parts.Comments.delete}}}'}
								]},
								{ tag: 'tpl', 'if': '!isModifiable', cn: [
									{
										tag: 'span',
										cls: 'flag link {flagged:boolStr("on","off")}',
										html: '{flagged:boolStr("NextThought.view.forums.topic.parts.Comments.reported","NextThought.view.forums.topic.parts.Comments.report")}'
									}
								]}
							]},

							{ cls: 'editor-box' }
						]}
					]
				}},
				{ cls: 'load-box'}
			]}
		]}
	]),


	listeners: {
		itemclick: {
			element: 'el',
			fn: 'onItemClick'
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		if (!this.topic) {
			console.error('Cant create a comments view without a topic...');
			return;
		}

		this.notLoadedYet = true;
		this.initialLoad = new Promise(this.buildStore.bind(this));
		this.buildReadyPromise();
	},


	buildReadyPromise: function() {
		var me = this;

		function ready() {
			me.ready = true;
			me.fireEvent('ready');
		}

		me.initialLoad.done(function() {
			if (me.activeComment) {
				me.goToComment(me.activeComment).done(ready);
			} else {
				ready();
			}
		});
	},


	afterRender: function() {
		var me = this, maskMon,
			scrollEl;

		this.callParent(arguments);

		this.canReply = this.topic && this.topic.getLink('add');

		if (!this.canReply) {
			this.addCls('no-reply');
		}

		scrollEl = me.up('{isLayout("card")}');

		if ((me.store.loading || this.notLoadedYet) && scrollEl) {
			maskMon = me.mon(me.store, {
				destroyable: true,
				load: function() {
					Ext.destroy(maskMon);
					scrollEl.el.unmask();
				}
			});
			scrollEl.el.mask();
		}

		me.editor = Ext.widget('nti-editor', {ownerCt: me, renderTo: me.el, record: null, saveCallback: function(editor, postCmp, record) {
			if (me.isNewRecord) {
				me.store.insertSingleRecord(record);
			}

			me.editor.deactivate();
		}});
		me.relayEvents(me.editor, ['activated-editor', 'deactivated-editor']);
		me.editor.addCls('threaded-forum-editor');
		me.el.selectable();

		if (me.scrollToComment) {
			me.goToComment(me.scrollToComment);
		}
	},


	buildStore: function(fulfill, reject) {
		var me = this,
			s = NextThought.store.forums.Comments.create({
				parentTopic: me.topic,
				storeId: me.topic.get('Class') + '-' + me.topic.get('NTIID'),
				url: me.topic.getLink('contents')
			});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {},{
			sortOn: 'CreatedTime',
			sortOrder: 'ascending',
			filter: 'TopLevel'
		});

		function storeLoad() {
			if (me.notLoadedYet) {
				delete me.notLoadedYet;
				fulfill();
			}

			me.onStoreAdd.apply(me, arguments);
		}

		me.mon(s, {
			scope: me,
			load: storeLoad,
			add: storeLoad,
			update: 'onStoreUpdate',
			'filters-applied': 'refreshQueue'
		});

		me.bindStore(s);
		me.store.load();
	},


	onStoreAdd: function(store, records) {
		//if its our first time through
		if (this.notLoadedYet) {
			delete this.notLoadedYet;
			this.initialLoad.fulfill(true);
		}

		(records || []).forEach(this.fillInData, this);
		this.clearLoadBox();
		this.fireEvent('realign-editor');
	},


	onStoreUpdate: function(store, record) {
		this.fillInData(record);
		this.clearLoadBox();
		this.fireEvent('realign-editor');
	},


	fillInData: function(record) {
		var me = this;

		if (typeof record.get('Creator') === 'string') {
			UserRepository.getUser(record.get('Creator'))
				.then(function(user) {
					record.set({
						'Creator': user
					});
				})
				.fail(function(reason) {
					console.error(reason);
				});
		}

		record.compileBodyContent(function(body) {
			var index;

			if (!me.store) {return;}

			me.store.suspendEvents();

			record.set({
				'bodyContent': DomUtils.adjustLinks(body, window.location.href)
			});

			me.store.resumeEvents();

			if (me.store.filtersCleared) {
				me.recordsToRefresh.push(record);
			} else {
				index = me.store.indexOf(record);
				me.refreshNode(index);
			}
		}, this, function(id, data) {
			me.wbData[id] = data;
		}, 226);
	},


	refreshQueue: function() {
		var me = this;

		me.recordsToRefresh.forEach(function(rec) {
			var index = me.store.indexOf(rec);

			me.refreshNode(index);
		});

		me.recordsToRefresh = [];
	},


	clearLoadBox: function() {
		if (!this.currentLoadBox) { return; }
		this.currentLoadBox.unmask();
		this.currentLoadBox.setHeight(0);
	},


	maskLoadBox: function(el) {
		this.currentLoadBox = el.down('.load-box');
		this.currentLoadBox.setHeight(40);
		this.currentLoadBox.mask('Loading...');
	},


	whiteboardContainerClick: function(record, container, e, el) {
		var me = this,
			guid = container && container.up('.body-divider').getAttribute('id');

		if (container && me.wbData[guid]) {
			container = e.getTarget('.reply:not(.thread-reply)', null, true);
			if (container) {
				me.replyTo(record, el)
					.done(function() {
						me.editor.addWhiteboard(Ext.clone(me.wbData[guid]), guid + '-reply');
					});
			} else {
				Ext.widget('wb-window', { width: 802, value: me.wbData[guid], readonly: true}).show();
			}
		}
	},


	loadThread: function(record, el) {
		if (!record.threadLoaded) {
			this.maskLoadBox(el);
		}

		this.store.showCommentThread(record);
	},


	onItemClick: function(record, item, index, e) {
		var load, me = this, width,
			t = e.getTarget('.whiteboard-container', null, true),
			el = Ext.get(item),
			box;

		if (me.editor.isActive()) {
			me.refocusEditor();
			return;
		}

		if (t) {
			this.whiteboardContainerClick(record, t, e, el);
			return;
		}

		if (e.getTarget('.body') && record.get('threadShowing')) {
			e.preventDefault();
			return;
		}

		width = el.down('.wrap').getWidth();

		if (e.getTarget('.reply')) {
			this.refocusVerb = getString('NextThought.view.forums.topic.parts.Comments.creatingverb');
			this.replyTo(record, el, width);
			return;
		}

		if (e.getTarget('.edit')) {
			this.refocusVerb = getString('NextThought.view.forums.topic.parts.Comments.editingverb');
			delete this.isNewRecord;
			t = el.down('.body');
			t.hide();
			this.openEditor(record, t, width, function() {
				t.show();
			}, true);
			return;
		}

		if (e.getTarget('.delete')) {
			this.deleteRecord(record);
			return;
		}

		if (e.getTarget('.flag') && !record.isFlagged()) {
			me.flagging = true;

			TemplatesForNotes.reportInappropriate(function(btn) {
				delete me.flagging;
				if (btn === 'ok') { record.flag(me); }
			});
			return;
		}

		if (e.getTarget('.name')) {
			UserRepository.getUser(record.get('Creator'))
				.done(function(u) {
					if (!isMe(u)) {
						me.fireEvent('show-profile', u);
					}
				})
				.fail(function(reason) {
					console.error(reason);
				});
			return;
		}

		if (e.getTarget('.like')) {
			record.like();
			return;
		}


		if (e.getTarget('.toggle') && record.get('depth') === 0) {
			me.clearSearchHit();
			if (record.get('threadShowing')) {
				me.store.hideCommentThread(record);
			} else {
				me.loadThread(record, el);
			}

			me.fireEvent('realign-editor');
		}

	},


	replyTo: function(record, el, width) {
		var me = this, newRecord;

		return new Promise(function(fulfill, reject) {
			me.isNewRecord = true;
			newRecord = record.makeReply();

			if (!record.threadLoaded && record.get('ReferencedByCount')) {
				me.store.on('add', function() {
					var el = me.getNode(record);

					el = Ext.get(el);

					me.openEditor(newRecord, el.down('.editor-box'), width);
					fulfill();
				}, me, {single: true});
				me.loadThread(record, el);
			} else {
				me.openEditor(newRecord, el.down('.editor-box'), width);
				fulfill();
			}
		});
	},


	deleteRecord: function(record) {
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: getString('NextThought.view.forums.topic.parts.Comments.deletewarning'),
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: this,
			icon: 'warning-red',
			buttonText: {'ok': getString('NextThought.view.forums.topic.parts.Comments.deletebutton')},
			title: getString('NextThought.view.forums.topic.parts.Comments.deletetitle'),
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
					}).done(function() {
						record.convertToPlaceholder();
						record.set({
							'depth': depth,
							'threadShowing': true,
							'Deleted': true
						});

					}).fail(function(reason) {
						console.error(reason);
					});

				}
			}
		});
	},


	openEditor: function(record, el, width, cancelCallback, isEdit) {
		var me = this, refreshMon;

		me.clearSearchHit();
		width = width || el.getWidth();

		function size() {
			el.setHeight(me.editor.getHeight());
		}

		me.editor.record = record;
		me.editor.editBody((record && record.get('body')) || []);
		me.editor.activate();

		Ext.defer(me.editor.focus, 100, me.editor);

		me.editor.alignTo(el, 'tl-tl');

		size();
		me.editor.setWidth(width);

		Ext.destroy(this.boxMonitor);

		if (!Ext.is.iOS) {
			me.editor.el.scrollCompletelyIntoView(me.el.getScrollingEl());
		}
		else {
			//Blur editor when first appears, to allow user to focus and bring up keyboard
			Ext.defer(function() {
				me.editor.el.down('.content').blur();
			}, 250);
			//scrollCompletelyIntoView was causing trouble occasionally in iPad
			me.editor.el.scrollIntoView(me.el.getScrollingEl());
		}

		refreshMon = me.mon(me, {
			destroyable: true,
			'realign-editor': function() {
				//if there isn't a record its a new top level comment and we don't need to resize/realign anything
				if (!record) {
					return;
				}
				//if i'm editing get the node for the record, if its a reply get its parent node
				var parentId = isEdit ? false : record.get('inReplyTo'),
					parent = parentId && me.store.getById(parentId),
					node = isEdit ? me.getNodeByRecord(record) : parent && me.getNodeByRecord(parent);

				//if we have a node, if its an edit get the body if its a reply get the editor-box
				node = node && isEdit ? Ext.fly(node).down('.body') : Ext.fly(node).down('.editor-box');

				if (!node) {
					console.error('Failed to find new node to align editor to, so closing it');
					me.editor.deactive();
					return;
				}

				//resize the editor and el to fit and realign the editor
				node.setHeight(me.editor.getHeight());
				me.editor.setWidth(width || node.getWidth());
				me.editor.alignTo(node, 'tl-tl');
			}
		});

		me.boxMonitor = me.mon(this.editor, {
			destroyable: true,
			'grew': size,
			'shrank': size,
			'deactivated-editor': function() {
				//if there isn't a record its a new top level comment
				if (!record) {
					el.setHeight(undefined);
					return;
				}
				//if I'm editing get the node for the record, if its a reply get its parent node
				var parentId = isEdit ? false : record.get('inReplyTo'),
					parent = parentId && me.store.getById(parentId),
					node = isEdit ? me.getNodeByRecord(record) : parent && me.getNodeByRecord(parent);

				// if we have a node, if its an edit get the body if its a reply get the editor-box
				node = node && isEdit ? Ext.fly(node).down('.body') : Ext.fly(node).down('.editor-box');

				Ext.destroy(refreshMon);
				Ext.callback(cancelCallback);

				if (!node) {
					console.error('Cant find the node to set the old height back on...');
					return;
				}

				//set the height to undefined, so that it can account for any height changes after an edit
				node.setHeight(undefined);
			}
		});
	},


	addRootReply: function() {
		if (this.editor.isActive()) {
			this.refocusEditor();
			return;
		}
		this.refocusVerb = getString('NextThought.view.forums.topic.parts.Comments.creatingverb');
		this.isNewRecord = true;
		this.openEditor(null, this.el.down('.new-root'));
	},


	addIncomingComment: function(comment) {
		if (this.topic.get('NTIID') === comment.get('ContainerId')) {
			this.store.insertSingleRecord(comment);
		}
	},


	refocusEditor: function() {
		var msg = getFormattedString('NextThought.view.forums.topic.parts.Comments.focuswarning', {verb: this.refocusVerb});

		if (!this.editor.isActive()) { return; }
		this.editor.el.scrollCompletelyIntoView(this.el.getScrollingEl());
		this.editor.focus();
		alert({msg: msg});
	},


	getRefItems: function() {
		var items = [];
		if (this.editor) {
			items.push(this.editor);
		}
		return items;
	},


	goToComment: function(comment) {
		if (!this.rendered) {
			this.scrollToComment = comment;
			return Promise.resolve();
		}

		var me = this;

		return new Promise(function(fulfill, reject) {
			var refs = comment.get('references');

			if (Ext.isEmpty(refs)) {
				me.initialLoad.done(function() {
					me.scrollCommentIntoView(comment);
					fulfill();
				});

				return;
			}

			me.initialLoad.done(function() {
				refs.forEach(function(ref) {
					var rec = me.store.getById(ref);

					if (rec && rec.get('depth') === 0) {
						me.mon(me.store, {
							single: true,
							buffer: 1,
							add: function() {
								me.scrollCommentIntoView(comment);
								fulfill();
							}
						});
						me.store.showCommentThread(rec);
					}
				});
			});
		});
	},


	scrollCommentIntoView: function(comment) {
		var node = this.getNode(comment);

		node = Ext.get(node);

		if (!node) {
			console.error('couldnt find a node for the comment to scrollto');
			return;
		}

		node.scrollCompletelyIntoView(node.getScrollingEl());
	},


	getSearchHitConfig: function() {
		return {
			key: 'forum',
			mainViewId: 'forums'
		};
	}
});

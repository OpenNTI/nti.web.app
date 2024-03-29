const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { Events } = require('@nti/web-session');
const TemplatesForNotes = require('internal/legacy/app/annotations/note/Templates');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');
const UserRepository = require('internal/legacy/cache/UserRepository');
const ForumsComments = require('internal/legacy/store/forums/Comments');
const Globals = require('internal/legacy/util/Globals');
const DomUtils = require('internal/legacy/util/Dom');
const Localization = require('internal/legacy/util/Localization');
const { isMe } = require('internal/legacy/util/Globals');
const Scrolling = require('internal/legacy/util/Scrolling');
const { getString } = require('internal/legacy/util/Localization');

require('internal/legacy/model/User');
require('internal/legacy/mixins/Searchable');
require('internal/legacy/mixins/ProfileLinks');
require('internal/legacy/util/UserDataThreader');
require('internal/legacy/app/whiteboard/Window');
require('internal/legacy/app/video/window/Window');

const ForumsActions = require('../../../Actions');

module.exports = exports = Ext.define(
	'NextThought.app.forums.components.topic.parts.Comments',
	{
		extend: 'Ext.view.View',
		alias: 'widget.forums-topic-comment-thread',

		mixins: {
			Searchable: 'NextThought.mixins.Searchable',
			profileLinks: 'NextThought.mixins.ProfileLinks',
		},

		cls: 'forum-comment-thread',
		ui: 'forum-comment-thread',
		itemSelector: '.topic-comment-container',
		preserveScrollOnRefresh: true,
		disableSelection: true,

		//loadMask: { renderTo: 'view' },
		loadMask: false,

		updateFromMeMap: {},
		wbData: {},
		videoData: {},
		recordsToRefresh: [],

		tpl: Ext.DomHelper.markup([
			{ cls: 'new-root' },
			{
				tag: 'tpl',
				for: '.',
				cn: [
					{
						cls: 'topic-comment-container {[values.threadShowing ? "expanded" : "collapsed"]} {[values.threadShowing && !values.repliesLoaded && values.ReferencedByCount > 0? "loading" : ""]}',
						'data-depth': '{depth}',
						tabindex: -1,
						cn: [
							{
								tag: 'tpl',
								if: 'Deleted',
								cn: {
									cls: 'topic-comment placeholder {[values.threadShowing? "expanded" : "collapsed"]}',
									'data-depth': '{depth}',
									cn: [
										{
											cls: 'wrap',
											'data-commentid': '{ID}',
											cn: [
												{
													cls: 'body',
													html: '{{{NextThought.view.forums.topic.parts.Comments.deleted}}}',
												},
												{
													cls: 'foot',
													cn: [
														{
															tag: 'tpl',
															if: 'depth == 0 &amp;&amp; ReferencedByCount &gt; 0',
															cn: [
																{
																	tag: 'span',
																	cls: 'comments link toggle',
																	html: '{ReferencedByCount:plural("Comment")}',
																},
															],
														},
													],
												},
											],
										},
									],
								},
							},
							{
								tag: 'tpl',
								if: '!Deleted',
								cn: {
									cls: 'topic-comment {[values.threadShowing ? "expanded" : "collapsed"]} {[values.depth === 0 && values.ReferencedByCount > 0 ? "toggle" : ""]}',
									'data-depth': '{depth}',
									cn: [
										{
											cls: 'controls',
											cn: [
												{ cls: 'favorite-spacer' },
												{
													cls: 'like {[values.liked? "on" : "off"]}',
													html: '{likeCount}',
												},
											],
										},
										'{Creator:avatar("commentAvatar")}',
										{
											cls: 'wrap',
											'data-commentid': '{ID}',
											cn: [
												{
													cls: 'meta',
													cn: [
														{
															tag: 'span',
															html: '{Creator:displayName()}',
															cls: 'name link',
														},
														{
															tag: 'tpl',
															if: 'depth &gt; 4',
															cn: [
																{
																	tag: 'span',
																	html: '{{{NextThought.view.forums.topic.parts.Comments.repliedto}}}',
																},
															],
														},
														{
															tag: 'tpl',
															if: 'depth &lt; 5',
															cn: [
																{
																	tag: 'span',
																	cls: 'datetime nodot',
																	html: '{CreatedTime:ago}',
																},
															],
														},
													],
												},
												{
													cls: 'body',
													html: '{bodyContent}',
												},
												{
													cls: 'foot',
													cn: [
														{
															tag: 'tpl',
															if: 'depth === 0',
															cn: [
																{
																	tag: 'span',
																	cls: 'comments  {[values.ReferencedByCount > 0 ? "link toggle" : ""]}',
																	html: '{ReferencedByCount:plural("Comment")}',
																},
															],
														},
														{
															tag: 'span',
															cls: 'reply thread-reply link',
															html: '{{{NextThought.view.forums.topic.parts.Comments.reply}}}',
														},
														{
															tag: 'tpl',
															if: 'isModifiable',
															cn: [
																{
																	tag: 'span',
																	cls: 'edit link',
																	html: '{{{NextThought.view.forums.topic.parts.Comments.edit}}}',
																},
																{
																	tag: 'span',
																	cls: 'delete link',
																	html: '{{{NextThought.view.forums.topic.parts.Comments.delete}}}',
																},
															],
														},
														{
															tag: 'tpl',
															if: '!isModifiable',
															cn: [
																{
																	tag: 'span',
																	cls: 'flag link {flagged:boolStr("on","off")}',
																	html: '{flagged:boolStr("NextThought.view.forums.topic.parts.Comments.reported","NextThought.view.forums.topic.parts.Comments.report")}',
																},
															],
														},
													],
												},

												{ cls: 'editor-box' },
											],
										},
									],
								},
							},
							{
								cls: 'load-box',
								cn: [{ tag: 'span', html: 'Loading...' }],
							},
						],
					},
				],
			},
		]),

		listeners: {
			itemclick: {
				element: 'el',
				fn: 'onItemClick',
			},
		},

		initComponent: function () {
			this.callParent(arguments);

			if (!this.topic) {
				console.error('Cant create a comments view without a topic...');
				return;
			}

			this.notLoadedYet = true;
			this.initialLoad = new Promise(this.buildStore.bind(this));
			this.buildReadyPromise();

			this.ForumActions = ForumsActions.create();
		},

		buildReadyPromise: function () {
			var me = this;

			function ready() {
				me.ready = true;
				me.fireEvent('ready');
			}

			me.initialLoad
				.then(function () {
					if (me.activeComment) {
						me.goToComment(me.activeComment).then(ready);
						delete me.store.proxy.extraParams.batchContaining;
					} else {
						ready();
					}
				})
				.catch(function (error) {
					console.error(
						'Failure to load Comments store. Error: ',
						error
					);
				});
		},

		afterRender: function () {
			var me = this,
				maskMon,
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
					load: function () {
						Ext.destroy(maskMon);
						scrollEl.el.unmask();
					},
				});
				scrollEl.el.mask();
			}

			me.editor = Ext.widget('nti-editor', {
				ownerCt: me,
				renderTo: me.el,
				record: null,
				enableVideo: true,
				enableFileUpload: true,
			});
			me.relayEvents(me.editor, [
				'activated-editor',
				'deactivated-editor',
			]);
			me.editor.addCls('threaded-forum-editor');
			me.el.selectable();

			me.mon(me.editor, 'save', me.saveComment.bind(me));

			me.on('refresh', () => {
				me.fireEvent('realign-editor');
			});

			if (me.scrollToComment) {
				me.goToComment(me.scrollToComment);
			}

			this.initSearch();
		},

		getContainerIdForSearch: function () {
			return this.topic.get('NTIID');
		},

		onceReadyForSearch: function () {
			return this.initialLoad.then(
				Promise.minWait(Globals.WAIT_TIMES.SHORT)
			);
		},

		allowNavigation: function () {
			if (!this.editor || !this.editor.isActive()) {
				return true;
			}

			const title = 'Are you sure?';
			let msg =
				'You are currently creating a topic. Would you like to leave without saving?';

			if (this.editor.record) {
				msg =
					'You are currently editing a topic. Would you like to leave without saving?';
			}

			return new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: title,
					msg: msg,
					buttons: {
						primary: {
							text: 'Leave Anyway',
							cls: 'caution',
							handler: fulfill,
						},
						secondary: {
							text: 'Cancel',
							handler: reject,
						},
					},
				});
			});
		},

		buildStore: function (fulfill /*, reject*/) {
			var me = this,
				s = ForumsComments.create({
					parentTopic: me.topic,
					storeId:
						me.topic.get('Class') + '-' + me.topic.get('NTIID'),
					url: me.topic.getLink('contents'),
					pageSize: 20,
					clearOnPageLoad: true,
				}),
				refs = me.activeComment && me.activeComment.get('references'),
				containingId;

			s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
				sortOn: 'CreatedTime',
				sortOrder: 'ascending',
				filter: 'TopLevel',
			});

			if (me.activeComment) {
				containingId = Ext.isEmpty(refs)
					? me.activeComment.getId()
					: refs[0];
				s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
					batchContaining: containingId,
				});
			}

			function storeLoad() {
				me.onStoreAdd.apply(me, arguments).then(function () {
					if (me.notLoadedYet) {
						delete me.notLoadedYet;
						fulfill();
					}
				});
			}

			me.mon(s, {
				scope: me,
				load: storeLoad,
				add: storeLoad,
				update: 'onStoreUpdate',
				'filters-applied': 'refreshQueue',
			});

			me.bindStore(s);
			me.store.load();
		},

		onStoreAdd: function (store, records) {
			var loading = (records || []).map(this.fillInData.bind(this));

			return Promise.all(loading).then(this.fireEvent('realign-editor'));
		},

		onStoreUpdate: function (store, record) {
			this.fillInData(record);
			this.fireEvent('realign-editor');
		},

		setAvatar: function (user, record) {
			record.set({
				Creator: user,
			});
			this.refresh();
		},

		fillInData: function (record) {
			var me = this,
				loadUser;

			if (typeof record.get('Creator') === 'string') {
				loadUser = UserRepository.getUser(record.get('Creator'))
					.then(function (user) {
						if (!me.store) {
							return;
						}

						me.store.suspendEvents();

						record.set({
							Creator: user,
						});

						me.store.resumeEvents();

						me.mon(user, {
							single: true,
							avatarChanged: me.setAvatar.bind(me, user, record),
						});
					})
					.catch(function (reason) {
						console.error(reason);
					});
			} else {
				loadUser = Promise.resolve();
			}

			return loadUser.then(function () {
				return new Promise(function (fulfill /*, reject*/) {
					record.compileBodyContent(
						function (body) {
							var index;

							if (!me.store) {
								return;
							}

							me.store.suspendEvents();

							record.set({
								bodyContent: DomUtils.adjustLinks(
									body,
									window.location.href
								),
							});

							me.store.resumeEvents();

							if (me.store.filtersCleared) {
								me.recordsToRefresh.push(record);
							} else {
								index = me.store.indexOf(record);
								me.refreshNode(index);
							}

							wait().then(fulfill);
						},
						this,
						function (id, data, type) {
							if (type === 'video') {
								me.videoData[id] = data;
							} else {
								me.wbData[id] = data;
							}
						},
						226,
						null,
						{ useVideoPlaceholder: true }
					);
				});
			});
		},

		refreshQueue: function () {
			var me = this;

			me.recordsToRefresh.forEach(function (rec) {
				var index = me.store.indexOf(rec);

				me.refreshNode(index);
			});

			me.recordsToRefresh = [];
		},

		isOnLastPage: function () {
			var targetPage = Math.ceil(
				(this.store.getTotalCount() + 1) / this.store.pageSize
			);

			return targetPage === this.store.getCurrentPage();
		},

		loadLastPage: function () {
			var targetPage = Math.ceil(
					(this.store.getTotalCount() + 1) / this.store.pageSize
				),
				me = this;

			return new Promise(function (fulfill /*, reject*/) {
				//if the pages are the same and the store has records don't bother
				if (
					me.store.getCurrentPage() === targetPage &&
					me.store.getCount()
				) {
					fulfill(true);
				} else {
					me.mon(me.store, {
						load: function () {
							fulfill();
						},
						single: true,
						delay: 1,
					});

					// Loading the lastPage will also have the last record, otherwise we risk adding it twice
					delete me.isNewRecord;
					me.store.loadPage(targetPage);
				}
			});
		},

		// clearLoadBox: function () {
		// 	if (!this.currentLoadBox) { return; }
		// 	this.currentLoadBox.unmask();
		// 	this.currentLoadBox.setHeight(0);
		// },

		// maskLoadBox: function (el) {
		// 	this.currentLoadBox = el.down('.load-box');
		// 	this.currentLoadBox.setHeight(40);
		// 	this.currentLoadBox.mask('Loading...');
		// },

		whiteboardContainerClick: function (record, container, e, el) {
			var me = this,
				guid =
					container &&
					container.up('.body-divider').getAttribute('id');

			if (container && me.wbData[guid]) {
				container = e.getTarget(
					'.reply:not(.thread-reply)',
					null,
					true
				);
				if (container) {
					me.replyTo(record, el).then(function () {
						me.editor.addWhiteboard(
							Ext.clone(me.wbData[guid]),
							guid + '-reply'
						);
					});
				} else {
					Ext.widget('wb-window', {
						width: 802,
						value: me.wbData[guid],
						readonly: true,
					}).show();
				}
			}
		},

		attachmentContainerClick: function (record, container, e) {
			let name =
				container &&
				container.getAttribute &&
				container.getAttribute('name');

			if (!name || !record) {
				return null;
			}

			if (e && e.getTarget && e.getTarget('.download')) {
				return;
			}

			e.stopEvent();

			let body = record.get('body') || [],
				part;

			body.forEach(function (p) {
				if (p.name === name) {
					part = p;
					return false;
				}
			});

			if (part) {
				let ContentViewerActions = ContentviewerActions.create();

				if (ContentViewerActions) {
					ContentViewerActions.showAttachmentInPreviewMode(
						part,
						this.record
					);
				}
			}
		},

		videoPlaceholderClick: function (record, container /*, e, el*/) {
			var me = this,
				guid =
					container &&
					container.up('.body-divider').getAttribute('id'),
				value = me.videoData[guid];

			if (container && value) {
				Ext.widget('video-window-window', {
					url: value.embedURL,
				}).show();
			}
		},

		loadThread: function (record) {
			this.store.showCommentThread(record);
		},

		onItemClick: function (record, item, index, e) {
			//Give other event listeners a chance to do something before we modify the store
			//causing the node that the click event is firing on to maybe be removed from the dom
			wait().then(
				this.handleItemClick.bind(this, record, item, index, e)
			);
		},

		handleItemClick: function (record, item, index, e) {
			var me = this,
				width,
				t,
				whiteboard = e.getTarget('.whiteboard-container', null, true),
				video = e.getTarget('.video-placeholder', null, true),
				attachment = e.getTarget('.attachment-part'),
				el = Ext.get(item);

			if (me.editor.isActive()) {
				me.refocusEditor();
				return;
			}

			if (whiteboard) {
				this.whiteboardContainerClick(record, whiteboard, e, el);
				return;
			}

			if (video) {
				this.videoPlaceholderClick(record, video, e, el);
				return;
			}

			if (attachment) {
				this.attachmentContainerClick(record, attachment, e, el);
				return;
			}

			if (e.getTarget('.body') && record.get('threadShowing')) {
				return;
			}

			width = el.down('.wrap').getWidth();

			if (e.getTarget('.reply')) {
				this.refocusVerb = getString(
					'NextThought.view.forums.topic.parts.Comments.creatingverb'
				);
				this.replyTo(record, el, width);
				return;
			}

			if (e.getTarget('.edit')) {
				this.refocusVerb = getString(
					'NextThought.view.forums.topic.parts.Comments.editingverb'
				);
				delete this.isNewRecord;
				t = el.down('.body');
				t.hide();
				this.openEditor(
					record,
					t,
					width,
					function () {
						t.show();
					},
					true
				);
				return;
			}

			if (e.getTarget('.delete')) {
				this.deleteRecord(record);
				return;
			}

			if (e.getTarget('.flag') && !record.isFlagged()) {
				me.flagging = true;

				TemplatesForNotes.reportInappropriate(function (btn) {
					delete me.flagging;
					if (btn === 'ok') {
						record.flag(me);
					}
				});
				return;
			}

			if (e.getTarget('.name')) {
				UserRepository.getUser(record.get('Creator'))
					.then(function (u) {
						me.mixins.profileLinks.navigateToProfile(u);
						if (!isMe(u)) {
							me.fireEvent('show-profile', u);
						}
					})
					.catch(function (reason) {
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

		replyTo: function (record, el, width) {
			var me = this,
				newRecord;

			return new Promise(function (fulfill /*, reject*/) {
				me.isNewRecord = true;
				newRecord = record.makeReply();

				if (
					!record.get('threadShowing') &&
					record.get('ReferencedByCount')
				) {
					me.store.on(
						record.threadLoaded ? 'filterchange' : 'add',
						function () {
							wait().then(() => {
								var node = me.getNode(record);

								node = Ext.get(node);

								me.openEditor(
									newRecord,
									node.down('.editor-box'),
									width
								);

								fulfill();
							});
						},
						me,
						{ single: true }
					);
					me.loadThread(record, el);
				} else {
					me.openEditor(newRecord, el.down('.editor-box'), width);
					fulfill();
				}
			});
		},

		deleteRecord: function (record) {
			Ext.Msg.show({
				msg: getString(
					'NextThought.view.forums.topic.parts.Comments.deletewarning'
				),
				//We need to bitwise OR these two, so stop the lint.
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: this,
				icon: 'warning-red',
				buttonText: {
					ok: getString(
						'NextThought.view.forums.topic.parts.Comments.deletebutton'
					),
				},
				title: getString(
					'NextThought.view.forums.topic.parts.Comments.deletetitle'
				),
				fn: function (str) {
					if (str === 'ok') {
						var href = record.get('href'),
							depth = record.get('depth');

						if (!href) {
							console.error(
								'The record doesnt have an href!?!?!'
							);
							return;
						}

						Service.request({
							url: href,
							method: 'DELETE',
						})
							.then(function () {
								record.getInterfaceInstance().then(obj => {
									const event = obj.isBlogComment
										? Events.BLOG_COMMENT_DELETED
										: Events.TOPIC_COMMENT_DELETED;

									Events.emit(event, obj);
								});

								record.convertToPlaceholder();
								record.set({
									depth: depth,
									threadShowing: true,
									Deleted: true,
								});
							})
							.catch(function (reason) {
								let msg = 'Unable to delete this comment.';

								if (reason && reason.status === 403) {
									msg = 'Forbidden to delete this comment.';
								}

								setTimeout(() => {
									alert({
										title: 'Attention',
										msg,
										icon: 'warning-red',
									});
								}, 500);
							});
					}
				},
			});
		},

		openEditor: function (record, el, width, cancelCallback, isEdit) {
			var me = this,
				refreshMon;

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
			} else {
				//Blur editor when first appears, to allow user to focus and bring up keyboard
				Ext.defer(function () {
					me.editor.el.down('.content').blur();
				}, 250);
				//scrollCompletelyIntoView was causing trouble occasionally in iPad
				me.editor.el.scrollIntoView(me.el.getScrollingEl());
			}

			refreshMon = me.mon(me, {
				destroyable: true,
				'realign-editor': function () {
					let node;

					//if there isn't a record its a new top level comment
					if (!record) {
						node = this.el.down('.new-root');
					} else {
						//if i'm editing get the node for the record, if its a reply get its parent node
						var parentId = isEdit ? false : record.get('inReplyTo'),
							parent = parentId && me.store.getById(parentId);

						node = isEdit
							? me.getNodeByRecord(record)
							: parent && me.getNodeByRecord(parent);

						//if we have a node, if its an edit get the body if its a reply get the editor-box
						node =
							node && isEdit
								? Ext.fly(node).down('.body')
								: Ext.fly(node).down('.editor-box');
					}

					if (!node) {
						console.error(
							'Failed to find new node to align editor to, so closing it'
						);
						me.editor.deactive();
						return;
					}

					//resize the editor and el to fit and realign the editor
					node.setHeight(me.editor.getHeight());
					me.editor.setWidth(width || node.getWidth());
					me.editor.alignTo(node, 'tl-tl');
				},
			});

			me.boxMonitor = me.mon(this.editor, {
				destroyable: true,
				grew: size,
				shrank: size,
				'deactivated-editor': function () {
					let node;
					//if there isn't a record its a new top level comment
					if (!record) {
						node = me.el.down('.new-root');
					} else {
						//if I'm editing get the node for the record, if its a reply get its parent node
						var parentId = isEdit ? false : record.get('inReplyTo'),
							parent = parentId && me.store.getById(parentId);

						node = isEdit
							? me.getNodeByRecord(record)
							: parent && me.getNodeByRecord(parent);

						// if we have a node, if its an edit get the body if its a reply get the editor-box
						node =
							node && isEdit
								? Ext.fly(node).down('.body')
								: Ext.fly(node).down('.editor-box');
					}

					Ext.destroy(refreshMon);
					Ext.callback(cancelCallback);

					if (!node) {
						console.error(
							'Cant find the node to set the old height back on...'
						);
						return;
					}

					//set the height to undefined, so that it can account for any height changes after an edit
					node.setHeight(undefined);
				},
			});
		},

		addRootReply: function () {
			if (this.editor.isActive()) {
				this.refocusEditor();
				return;
			}
			this.refocusVerb = getString(
				'NextThought.view.forums.topic.parts.Comments.creatingverb'
			);
			this.isNewRecord = true;
			this.openEditor(null, this.el.down('.new-root'));
		},

		addIncomingComment: function (comment) {
			if (this.topic.get('NTIID') === comment.get('ContainerId')) {
				this.store.insertSingleRecord(comment);
			}
		},

		refocusEditor: function () {
			var msg = Localization.getFormattedString(
				'NextThought.view.forums.topic.parts.Comments.focuswarning',
				{ verb: this.refocusVerb }
			);

			if (!this.editor.isActive()) {
				return;
			}
			this.editor.el.scrollCompletelyIntoView(this.el.getScrollingEl());
			this.editor.focus();
			alert({ msg: msg });
		},

		getRefItems: function () {
			var items = [];
			if (this.editor) {
				items.push(this.editor);
			}
			return items;
		},

		saveComment: function (editor, record, values) {
			var me = this;

			function unmask() {
				if (editor.el) {
					me.el.unmask();
				}
			}

			if (editor.el) {
				me.el.mask('Saving...');
				editor.el.repaint();
			}

			me.ForumActions.saveTopicComment(me.topic, record, values)
				.then(function (comment) {
					unmask();
					me.editor.deactivate();
					me.editor.setValue('');
					me.editor.reset();

					if (me.isNewRecord) {
						if (comment.isTopLevel() && !me.isOnLastPage()) {
							me.loadLastPage(true).then(function () {
								me.goToComment(comment);
							});
						} else {
							if (comment.isTopLevel()) {
								me.store.totalCount += 1;
							}

							me.store.insertSingleRecord(comment);
							me.goToComment(comment);
						}
					}
				})
				.catch(function (reason) {
					console.error('Error saving comment:' + reason);
					unmask();
				});
		},

		goToComment: function (comment) {
			if (!this.rendered) {
				this.scrollToComment = comment;
				return Promise.resolve();
			}

			var me = this;

			return new Promise(function (fulfill /*, reject*/) {
				var refs = comment.get('references');

				if (Ext.isEmpty(refs)) {
					me.initialLoad.then(function () {
						me.scrollCommentIntoView(comment);
						fulfill();
					});

					return;
				}

				me.initialLoad.then(function () {
					refs.forEach(function (ref) {
						var rec = me.store.getById(ref);

						if (rec && rec.get('depth') === 0) {
							if (rec.get('threadShowing')) {
								wait().then(() =>
									me.scrollCommentIntoView(comment)
								);
							} else {
								me.mon(me.store, {
									single: true,
									buffer: 1,
									add: function () {
										me.scrollCommentIntoView(comment);
										fulfill();
									},
								});
								me.store.showCommentThread(rec);
							}
						}
					});
				});
			});
		},

		scrollCommentIntoView: function (comment) {
			var node = this.getNode(comment),
				win = Ext.getCmp('window');

			node = Ext.get(node);

			if (!node) {
				console.error(
					'couldnt find a node for the comment to scrollto'
				);
				return;
			}

			if (win) {
				Scrolling.scrollCompletelyIntoView(node.dom, win.el.dom, 5);
			} else {
				node.scrollCompletelyIntoView(node.getScrollingEl());
			}
		},

		getSearchHitConfig: function () {
			return {
				key: 'forum',
				mainViewId: 'forums',
			};
		},

		expandAllCommentThreads() {
			this.store.expandAllCommentThreads();
		},

		collapseAllCommentThreads() {
			if (this.editor && this.editor.isActive()) {
				this.refocusEditor();
				return;
			}

			this.store.collapseAllCommentThreads();
		},
	}
);

const Ext = require('@nti/extjs');
const UserRepository = require('internal/legacy/cache/UserRepository');
const DomUtils = require('internal/legacy/util/Dom');
const { isMe } = require('internal/legacy/util/Globals');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');

const BlogActions = require('../../Actions');

require('internal/legacy/mixins/ProfileLinks');
require('internal/legacy/mixins/LikeFavoriteActions');
require('internal/legacy/mixins/FlagActions');
require('internal/legacy/editor/Editor');

module.exports = exports = Ext.define(
	'NextThought.app.blog.parts.old.Comment',
	{
		extend: 'Ext.Component',

		mixins: {
			enableProfiles: 'NextThought.mixins.ProfileLinks',
			likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
			flagActions: 'NextThought.mixins.FlagActions',
		},

		cls: 'topic-comment',
		ui: 'forum-comment',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'controls',
				cn: [{ cls: 'favorite-spacer' }, { cls: 'like' }],
			},
			{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});' } },
			{
				cls: 'wrap',
				'data-commentid': '{ID}',
				cn: [
					{
						cls: 'meta',
						cn: [
							{
								tag: 'span',
								html: '{displayName}',
								cls: 'name link',
							},
							{
								tag: 'span',
								cls: 'datetime',
								html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}',
							},
						],
					},
					{ cls: 'body' },
					{
						cls: 'foot',
						cn: [
							{
								tag: 'tpl',
								if: 'isModifiable',
								cn: [
									{
										tag: 'span',
										cls: 'edit link',
										html: 'Edit',
									},
									{
										tag: 'span',
										cls: 'delete link',
										html: 'Delete',
									},
								],
							},
							{
								tag: 'tpl',
								if: '!isModifiable',
								cn: [
									{
										tag: 'span',
										cls: 'flag link',
										html: 'Report',
									},
								],
							},
						],
					},
					{ cls: 'editor-box' },
				],
			},
		]),

		renderSelectors: {
			bodyEl: '.body',
			nameEl: '.name',
			avatarEl: '.avatar',
			ctrlEl: '.controls',
			liked: '.controls .like',
			editEl: '.foot .edit',
			deleteEl: '.foot .delete',
			flagEl: '.foot .flag',
			editorBoxEl: '.editor-box',
			metaEl: '.meta',
			footEl: '.foot',
		},

		initComponent: function () {
			this.mixins.likeAndFavoriteActions.constructor.call(this);
			this.mixins.flagActions.constructor.call(this);
			this.callParent(arguments);
			this.addEvents(['delete-post']);
			this.enableBubble(['delete-post']);
			this.mon(this.record, 'destroy', this.onRecordDestroyed, this);

			this.BlogActions = BlogActions.create();
		},

		beforeRender: function () {
			var me = this,
				r = me.record,
				rd;
			me.callParent(arguments);
			rd = me.renderData = Ext.apply(me.renderData || {}, r.getData());
			rd.LastModified = rd['Last Modified'];

			me.loadUser(r.get('Creator'));

			if (isMe(r.get('Creator'))) {
				this.addCls('me');
			}

			if (this.record.get('Deleted')) {
				this.addCls('deleted');
			}
		},

		loadUser: function (creator) {
			var me = this;
			UserRepository.getUser(creator, me.addUser, me);
		},

		addUser: function (u) {
			var me = this,
				r = me.record,
				rd = Ext.apply(me.renderData || {}, r.getData());
			rd.lastModified = rd['Last Modified'];
			me.userObject = u;
			Ext.applyIf(rd, u.getData());
			me.renderData = rd;
			if (me.rendered) {
				console.warn('Rendered late');
				me.nameEl.update(u.get('displayName'));
				me.avatarEl.setStyle(
					'backgroundImage',
					'url(' + u.get('avatarURL') + ')'
				);
			}
		},

		afterRender: function () {
			this.callParent(arguments);

			var bodyEl = this.bodyEl,
				ctrlEl = this.ctrlEl,
				metaEl = this.metaEl,
				footEl = this.footEl,
				hide,
				show;

			this.record.addObserverForField(
				this,
				'body',
				this.updateContent,
				this
			);
			this.updateContent();
			bodyEl.selectable();

			if (this.deleteEl) {
				this.mon(this.deleteEl, 'click', this.onDeletePost, this);
			}

			if (this.editEl) {
				this.mon(this.editEl, 'click', this.onEditPost, this);
			}

			if (this.record) {
				this.enableProfileClicks(this.nameEl, this.avatarEl);
			}

			this.reflectLikeAndFavorite(this.record);
			this.listenForLikeAndFavoriteChanges(this.record);
			this.reflectFlagged(this.record);
			this.listenForFlagChanges(this.record);

			if (this.record.get('Deleted')) {
				this.tearDownFlagging();
			}

			bodyEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			ctrlEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			metaEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			footEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

			hide = function () {
				bodyEl.hide();
				ctrlEl.hide();
				metaEl.hide();
				footEl.hide();
			};
			show = function () {
				bodyEl.show();
				ctrlEl.show();
				metaEl.show();
				footEl.show();
			};

			this.editor = Ext.widget('nti-editor', {
				record: this.record,
				ownerCt: this,
				renderTo: this.editorBoxEl,
				enableFileUpload: true,
			});
			this.mon(this.editor, {
				scope: this,
				'activated-editor': hide,
				'deactivated-editor': show,
				save: this.onEditorSaved.bind(this),
				'no-body-content': function (editor, el) {
					editor.markError(el, 'You need to type something');
					return false;
				},
			});
		},

		onDestroy: function () {
			if (this.editor) {
				delete this.editor.ownerCt;
				this.editor.destroy();
				delete this.editor;
			}

			if (this.bodyEl) {
				this.bodyEl.select('video').each(function (vid) {
					try {
						vid.dom.innerHTML = null;
						vid.dom.load();
					} catch (e) {
						//don't care?
					}
				});
			}

			this.callParent(arguments);
		},

		getRefItems: function () {
			return this.editor ? [this.editor] : [];
		},

		getRecord: function () {
			return this.record;
		},

		updateContent: function () {
			this.record.compileBodyContent(this.setContent, this, null, {
				'application/vnd.nextthought.embeddedvideo': 640,
			});
		},

		onBeforeDeactivate: function () {
			if (this.bodyEl) {
				this.bodyEl.select('video').each(function (v) {
					v.dom.innerHTML = null;
					v.dom.load();
				});
			}
		},

		onBeforeActivate: function () {
			var href;
			if (this.bodyEl) {
				this.bodyEl.select('video').each(function (v) {
					if (Ext.isEmpty((v.getHTML() || '').trim())) {
						href = v.dom.getAttribute('href');
						Ext.DomHelper.overwrite(v, {
							tag: 'source',
							src: href,
						});
					}
				});
			}
		},

		setContent: function (html, cb) {
			var el = this.bodyEl,
				me = this,
				cmps;

			el.update(html);
			DomUtils.adjustLinks(el, window.location.href);
			el.select('img.whiteboard-thumbnail').each(function (el2) {
				el2.replace(el2.up('.body-divider'));
			});

			this.mon(this.bodyEl, 'click', this.onBodyClick.bind(this));

			el.select('img').each(function (img) {
				img.on('load', function () {
					me.up('[record]').fireEvent('sync-height');
				});
			});

			if (Ext.isFunction(cb)) {
				cmps = cb(this.bodyEl, this);
				Ext.each(cmps, function (c) {
					me.on('destroy', c.destroy, c);
				});
			}
		},

		/*
		 * The normal pattern employed is to have the records destroy trigger this
		 * component to go away. But, for blog (and forum I assume) comments
		 * the server deletes them but then continues to return them as placeholder looking
		 * objects.	 With a little work we could employ the placeholder logic we give to notes,
		 * where a delete turns certain records into placeholders.	However we drive many different views
		 * history, activity off of destroy events that don't get fired in that case.  Since the ds still
		 * does all its other deletion logic as normal we opt to do the same.
		 *
		 * For now, for simplicity, we just have the record destroy remove our record reference and update the UI components
		 * appropriately.  We tear down any observers first so we don't get events and fall down code paths
		 * requiring the record.
		 *
		 * FIXME I don't really like this way of handling this.	 I really want to use the placeholder logic but sill have
		 * the ability for destroy and our store removal logic to kick in.
		 */
		onRecordDestroyed: function () {
			//First remove the delete and edit link listeners followed by the els
			if (this.deleteEl) {
				this.mun(this.deleteEl, 'click', this.onDeletePost, this);
				this.deleteEl.remove();
			}

			if (this.editEl) {
				this.mun(this.editEl, 'click', this.onEditPost, this);
				this.editEl.remove();
			}

			//Now tear down like and favorites
			this.tearDownLikeAndFavorite();

			//Now clear the rest of our field listeners
			this.record.removeObserverForField(
				this,
				'body',
				this.updateContent,
				this
			);

			//Now update the body to the same text the server uses.
			if (this.bodyEl && this.bodyEl.dom) {
				this.bodyEl.update('This item has been deleted.');
			}
			this.addCls('deleted');
		},

		onBodyClick: function (e) {
			let el = e.getTarget('.attachment-part'),
				part = this.getAttachmentPart(el);

			if (part && !e.getTarget('.download')) {
				e.stopEvent();
				if (!this.ContentViewerActions) {
					this.ContentViewerActions = ContentviewerActions.create();
				}

				this.ContentViewerActions.showAttachmentInPreviewMode(
					part,
					this.record
				);
			}
		},

		getAttachmentPart: function (el) {
			let name = el && el.getAttribute && el.getAttribute('name');

			if (!name || !this.record) {
				return null;
			}

			let body = this.record.get('body') || [],
				part;

			body.forEach(function (p) {
				if (p.name === name) {
					part = p;
					return false;
				}
			});

			return part;
		},

		onDeletePost: function (e) {
			e.stopEvent();
			var me = this;

			Ext.Msg.show({
				msg: 'This will permanently remove this comment.',
				//We need to bitwise OR these two, so stop the lint.
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: me,
				icon: 'warning-red',
				buttonText: { ok: 'Delete' },
				title: 'Are you sure?',
				fn: function (str) {
					if (str === 'ok') {
						me.fireDeleteEvent();
					}
				},
			});
		},

		fireDeleteEvent: function () {
			this.fireEvent('delete-topic-comment', this.record, this);
		},

		onEditPost: function (e) {
			e.stopEvent();
			var parentCmp = this.up('forums-topic');
			if (parentCmp && parentCmp.clearSearchHit) {
				parentCmp.clearSearchHit();
			}
			this.editor.editBody(this.record.get('body'));
			this.editor.activate();
		},

		onEditorSaved: function (editor, record, valueObject) {
			var me = this,
				comment = this.record;

			if (editor.el) {
				editor.el.mask('Saving...');
				editor.el.repaint();
			}

			this.BlogActions.saveBlogComment(comment, record, valueObject)
				.then(function (rec) {
					if (!me.isDestroyed) {
						rec.compileBodyContent(me.setBody, me);
						editor.deactivate();
						editor.setValue('');
						editor.reset();
						return rec;
					}
				})
				.always(function () {
					if (editor.el) {
						editor.el.unmask();
					}
				});
		},
	}
);

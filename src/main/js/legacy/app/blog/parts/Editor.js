var Ext = require('extjs');
var UserRepository = require('../../../cache/UserRepository');
var DomUtils = require('../../../util/Dom');
const {wait} = require('legacy/util/Promise');
require('../../../editor/Editor');
require('../Actions');
require('legacy/common/form/fields/FilePicker');


module.exports = exports = Ext.define('NextThought.app.blog.parts.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.profile-blog-editor',
	enableTags: true,
	enableTitle: true,
	enableVideo: true,
	enableShareControls: true,
	enableFileUpload: true,
	keyboardUp: false,
	amountScrolled: 0,
	cls: 'blog-editor scrollable',
	headerTplOrder: '{title}{toolbar}',

	//TODO: update CSS to not require this nesting.
	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html: '{super}' }),

	renderSelectors: {
		cancelEl: '.action.cancel',
		saveEl: '.action.save',
		publishEl: '.action.publish',
		titleWrapEl: '.title',
		footerEl: '.footer',
		editorBodyEl: '.content',
		editorEl: '.editor'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.addEvents(['save-post']);
		this.BlogActions = NextThought.app.blog.Actions.create();
	},

	afterRender: function () {
		this.callParent(arguments);
		var r = this.record,
			me = this,
			h, sharedWith, el;

		me.mon(me.tags, 'new-tag', 'syncHeight');
		if (r) {
			h = r.get('headline');
			me.editBody(h.get('body'));
			me.setTitle(h.get('title'));
			me.setTags(h.get('tags'));

			sharedWith = r.getSharingInfo();

			//make sure we set the publish button state, even if we don't have entities.
			me.setSharedWith({publicToggleOn: sharedWith.publicToggleOn, entities: []});

			//if we have entities, the callback will set them... (resolved)
			UserRepository.getUser(sharedWith.entities, function (entities) {
				if (sharedWith && sharedWith.publicToggleOn) {
					entities.push(Service.getFakePublishCommunity());
				}

				sharedWith.entities = Ext.Array.map(entities, function (u) {
					return u.get('Username');
				});

				me.setSharedWith(sharedWith);
			}, function () {
				console.error('failed to resolve:', sharedWith.entities, arguments);
			}, this);
		}


		Ext.EventManager.onWindowResize(this.syncHeight, this, null);

		Ext.defer(this.syncHeight, 500, this);//let the animation finish


		if (Ext.is.iOS) {
			el = me.editorBodyEl;

			el.dom.onmouseup = function (e) { me.scrollDiv = (e.pageY > 438); };

			//Shorten the editor body to fit on iPad screen when keyboard up
			el.on('focus', function () {
				if (!me.bodyheight) {
					me.bodyheight = el.getHeight();
				}
				Ext.defer(function () {
					//Make sure on-screen keyboard is up (and not physical keyboard connected)
					if (window.innerHeight < 600) {
						el.setHeight(window.scrollY - 16);
						//scroll div is selected part is no longer visible
						Ext.defer(function () {
							if (me.scrollDiv) {
								el.scrollBy(0, 100);
							}
						},250, me);
					}
				},250, me);
			});
			el.on('blur', function () {
				if (me.bodyheight) {
					el.setHeight(me.bodyheight);
				}
			});

		} else {
			this.titleEl.focus();
			this.moveCursorToEnd(this.titleEl);
		}
	},

	destroy: function () {
		Ext.EventManager.removeResizeListener(this.syncHeight, this);

		return this.callParent(arguments);
	},

	syncHeight: function () {
		var el = this.contentEl,
			container = this.ownerCt && this.ownerCt.el && this.ownerCt.el.dom,
			containerRect = container && container.getBoundingClientRect(),
			otherPartsHeight = 0,
			top, height, min = 300;

		if (!el) {
			return;
		}

		if (!containerRect) {
			el.setHeight(min);
		}

		top = Math.max(containerRect.top, 0);

		otherPartsHeight += this.titleEl.getHeight();
		otherPartsHeight += this.tagsEl.getHeight();
		otherPartsHeight += this.sharedListEl.getHeight();
		otherPartsHeight += this.footerEl.getHeight();

		height = Ext.Element.getViewportHeight() - (top + otherPartsHeight + 90 + 10);//top of window + height of other parts + height of header + padding

		el.setHeight(Math.max(min, height));

		wait(700)
			.then(this.updateLayout.bind(this));
	},

	onSave: function (e) {
		e.stopEvent();
		var me = this,
			v = this.getValue(),
			t, trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		if (DomUtils.isEmpty(v.body)) {
			me.markError(me.editorBodyEl, getString('NextThought.view.profiles.parts.BlogEditor.emptybody'));
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (Ext.isEmpty(v.title)) {
			me.markError(me.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.emptytitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^[^a-z0-9]+$/i.test(v.title)) {
			me.markError(me.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.specialtitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			me.markError(me.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.attitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (me.el) {
			me.el.mask('Saving...');
		}

		//console.debug('Save:',v);
		//If new there will not be a record on me, it will be undefined
		// NOTE: For now, as a matter of simplicit, we are ignoring the 'publish' field.
		// We will derive it from the sharedWith value. ~PM.
		me.BlogActions.savePost(me.record, me.blog, v.title, v.tags, v.body, v.sharingInfo)
			.then(function (rec) {
				if (me.el) {
					me.el.unmask();
				}

				me.fireEvent('after-save', rec);
			})
			.catch(me.onSaveFailure.bind(me));
	},

	onSaveSuccess: function () {
		this.destroy();
	},

	onSaveFailure: function (response) {
		var msg = getString('NextThought.view.profiles.parts.BlogEditor.unknown'), error;

		if (response && response.responseText) {
			error = Ext.decode(response.responseText, true) || {};
			if (error.code === 'TooLong') {
				msg = getString('NextThought.view.profiles.parts.BlogEditor.longtitle');
			}
			else if (error.code === 'MaxFileSizeUploadLimitError') {
				let maxSize = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(error.max_bytes),
					currentSize = NextThought.common.form.fields.FilePicker.getHumanReadableFileSize(error.provided_bytes);
				msg = error.message + ' Max File Size: ' + maxSize + '. Your uploaded file size: ' + currentSize;
			}
			else if (error.code === 'MaxAttachmentsExceeded') {
				msg = error.message + ' Max Number of files: ' + error.constraint;
			}
		}
		alert({title: getString('NextThought.view.profiles.parts.BlogEditor.error'), msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},

	onCancel: function (e) {
		e.stopEvent();

		this.fireEvent('cancel');

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});

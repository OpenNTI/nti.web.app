const Ext = require('@nti/extjs');
const { dispatch } = require('@nti/lib-dispatcher');
const { Forums } = require('@nti/web-discussions');

const {getString} = require('legacy/util/Localization');
const Post = require('legacy/model/forums/Post');
const FilePicker = require('legacy/common/form/fields/FilePicker');

const ForumsActions = require('../../../Actions');

require('legacy/editor/Editor');

module.exports = exports = Ext.define('NextThought.app.forums.components.topic.parts.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.forums-topic-editor',
	cls: 'forums-topic-editor-box',
	border: 1,
	enableTags: true,
	enableTitle: true,
	enableVideo: true,
	enableFileUpload: true,
	headerTplOrder: '{title}{toolbar}',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'forums-topic-editor', cn: { cls: 'editor active', html: '{super}' } }
	]),

	renderSelectors: {
		editor: '.editor',
		cancelEl: '.action.cancel',
		saveEl: '.action.save',
		titleWrapEl: '.title',
		footerEl: '.footer',
		publishEl: '.action.publish'
	},

	initComponent: function () {
		this.callParent(arguments);
		this.addEvents(['save-post']);
		this.ForumActions = ForumsActions.create();
	},

	afterRender: function () {
		this.callParent(arguments);
		var r = this.record,
			me = this,
			h,
			parentCtEl = this.ownerCt.getEl();
		// const hasScrollBar = Ext.getDom(parentCtEl).scrollHeight !== parentCtEl.getHeight();

		this.mon(this.tags, 'new-tag', this.syncHeight, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);

		if (r) {
			h = r.get('headline');
			this.editBody(h.get('body'));
			this.setTitle(h.get('title'));
			this.setTags(h.get('tags'));
			this.setPublished(r.isPublished());
		}

		parentCtEl.addCls('scroll-lock').scrollTo(0);

		Ext.EventManager.onWindowResize(this.syncHeight, this, null);
		if (!Ext.is.iOS) {
			Ext.defer(this.syncHeight, 1, this);

			this.titleEl.focus();
			this.moveCursorToEnd(this.titleEl);
			//window.scrollTo(this.titleEl.top);
		}

		if (Ext.is.iOS) {
			me.el.down('.editor').setHeight(350);
			me.el.down('.content').setHeight(215);


			this.el.down('.content').on('focus', function (e) {
				me.el.down('.content').scrollBy(0, 1000);
				Ext.defer(function () {
					me.el.down('.content').scrollBy(0, 1000);
				},250);
			});
		}
	},

	allowNavigation: function () {
		if (this.isEmpty()) {
			return Promise.resolve();
		}

		var msg = 'You are currently creating a topic. Would you like to leave without saving?';

		if (this.record) {
			msg = 'You are currently editing a topic. Would you like to leave without saving?';
		}

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Are you sure?',
				msg: msg,
				buttons: {
					primary: {
						text: 'Leave Anyway',
						cls: 'caution',
						handler: fulfill
					},
					secondary: {
						text: 'Cancel',
						handler: reject
					}
				}
			});
		});
	},

	// destroy: function() {
	//	var container = this.ownerCt.getEl();
	//	container.removeCls('scroll-lock scroll-padding-right');
	//	Ext.EventManager.onWindowResize(this.syncHeight, this, null);
	//	console.log(arguments);
	//	return this.callParent(arguments);
	// },


	onBeforeDeactivate: function () {
		/*
		 *	 NOTE: For now, since forums views aren't destroyed when you go away,
		 *	 and we like that behavior, don't warn the user if the editor is open, since it will still be there when we can back.
		 *	 If we change at some point, just uncomment the following lines to display a warning message.
		 */
		//		if(this.isVisible()){
		//			this.warnBeforeDismissingEditor();
		//		}
		//		return !this.isVisible();
		return true;
	},

	warnBeforeDismissingEditor: function () {
		var msg = getString('NextThought.view.forums.topic.parts.Editor.dismisswarn');
		Ext.defer(function () {
			alert({msg: msg});
		}, 1);
	},

	syncHeight: function () {
		var el = this.contentEl,
			p = this.ownerCt && Ext.getDom(this.ownerCt.getEl()),
			top;
		if (!el || !p) {
			return;
		}
		// top = el.getY() + p.scrollTop;
		top = Ext.getDom(el).getBoundingClientRect().top + p.scrollTop;

		if (!this.footerEl.getHeight() && (!this.syncHeightRetries || this.syncHeightRetries < 10)) {
			this.syncHeightRetries = (this.syncHeightRetries || 0) + 1;
			Ext.defer(this.syncHeight, 100, this);
			return;
		}

		if (this.syncHeightRetries) {
			console.debug('#syncHeight() Retried ' + this.syncHeightRetries + ' times');
			delete this.syncHeightRetries;
		}
		el.setHeight(Ext.Element.getViewportHeight() - (top + this.footerEl.getHeight() + 10));
		Ext.defer(this.updateLayout, 700, this, []);
	},


	getMimeType: function () {
		return this.record ? this.record.get('MimeType') :  Post.mimeType;
	},

	isEmpty () {
		const {body, title, tags} = this.getValue() || {};
		const re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;
		const str = x => (Array.isArray(x) ? x : [x]).join('').replace(re, '');
		return Ext.isEmpty(title)
			&& Ext.isEmpty(str(tags))
			&& Ext.isEmpty(str(body));
	},

	isValid: function () {
		var me = this,
			v = this.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g;

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			console.error('bad forum post');
			me.markError(me.contentEl, getString('NextThought.view.forums.topic.parts.Editor.emptycontent'));
			return false;
		}

		if (Ext.isEmpty(v.title)) {
			console.error('You need a title');
			me.markError(me.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.emptytitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return false;
		}

		/*if (/^[^a-z0-9]+$/i.test(v.title)) {
			console.error('Title cant be all special chars');
			me.markError(me.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.specialtitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
		}*/

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			me.markError(me.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.attitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return false;
		}
	},

	getAttachmentPart: function (el) {
		var name = el && el.getAttribute && el.getAttribute('name'), part;

		if (this.record) {
			let headline = this.record.get('headline'),
				body = headline && headline.get('body') || [];

			body.forEach(function (p) {
				if (p.name === name) {
					part = p;
					return false;
				}
			});
		}

		if (!part) {
			part = {
				MimeType: 'application/vnd.nextthought.contentfile',
				filename: el && el.getAttribute && el.getAttribute('data-fileName'),
				name: name,
				file: this.AttachmentMap[name]
			};
		}
		return part;
	},


	onSave: function (e) {
		e.stopEvent();

		let me = this,
			v = me.getValue(),
			trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		function unmask () {
			if (me.el) {
				me.el.unmask();
			}
		}

		if (this.isValid() === false) {
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (me.el) {
			me.el.mask('Saving...');
		}

		me.ForumActions.saveTopic(me, me.record, me.forum, v.title, v.tags, v.body, v.publish)
			.then(function (record) {
				unmask();
				dispatch(Forums.FORUM_TOPIC_CHANGE, { forum: me.forum.getId() });
				me.fireEvent('after-save', record);
			})
			.catch(function (reason) {
				unmask();
				me.onHandleSaveFailure(reason);
			});
	},


	onHandleSaveFailure: function (reason) {
		var error = reason && JSON.parse(reason && reason.responseText) || {},
			msg;

		console.error('Failed to save the discussion: ', reason);
		if (error.code === 'MaxFileSizeUploadLimitError') {
			let current = FilePicker.getHumanReadableFileSize(error.provided_bytes),
				expected = FilePicker.getHumanReadableFileSize(error.max_bytes);

			msg = current && expected ? 'Maximum Size Allowed: ' + expected + ', Your uploaded file size: ' + current : '';
			msg = (error.message || '') + ' ' + msg;
			alert({title: 'Attention', msg: msg,  icon: 'warning-red'});
		}
		else if (error.code === 'MaxAttachmentsExceeded') {
			msg = (error.message || '') + ' ' + 'Max Number of Files: ' + error.constraint;
			alert({title: 'Attention', msg: msg,  icon: 'warning-red'});
		}
		else if (error.code === 'TooLong') {
			msg = getString('NextThought.view.forums.topic.parts.Editor.longtitle');
			alert({title: getString('NextThought.view.forums.topic.parts.Editor.error'), msg: msg, icon: 'warning-red'});
		}
		else if (error.code === 'ImpossibleToMakeSpecificPartSafe') {
			msg = error.message;
			alert({title: getString('NextThought.view.forums.topic.parts.Editor.error'), msg: msg, icon: 'warning-red'});
		}
		else {
			alert('There was a problem saving the discussion');
		}
	},


	onSaveSuccess: function (record, isEdit) {
		this.savedSuccess = true;
		this.fireEvent(isEdit ? 'goto-record' : 'new-record', record);
		this.destroy();
	},

	onSaveFailure: function (proxy, response, operation) {
		this.onHandleSaveFailure(response);
	},

	onCancel: function (e) {
		e.stopEvent();
		this.allowNavigation()
			.then(() => this.fireEvent('cancel'))
			.catch(() => {});
	}
});

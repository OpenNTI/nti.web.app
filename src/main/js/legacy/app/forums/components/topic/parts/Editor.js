const Ext = require('extjs');
require('legacy/editor/Editor');
require('../../../Actions');


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
		this.ForumActions = NextThought.app.forums.Actions.create();
	},

	afterRender: function () {
		this.callParent(arguments);
		var r = this.record,
			me = this,
			h,
			parentCtEl = this.ownerCt.getEl(),
			hasScrollBar = Ext.getDom(parentCtEl).scrollHeight !== parentCtEl.getHeight();

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
		var msg = 'You are currently creating a topic. Would you like to leave without saving?';

		if (this.record) {
			msg = 'You are currently editing a topic. Would you like to leave without saving?';
		}

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				title: 'Attention!',
				msg: msg,
				buttons: {
					primary: {
						text: 'Leave',
						cls: 'caution',
						handler: fulfill
					},
					secondary: {
						text: 'Stay',
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
		top = el.getY() + p.scrollTop;

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
		return this.record ? this.record.get('MimeType') :  NextThought.model.forums.Post.mimeType;
	},


	onSave: function (e) {
		e.stopEvent();
		var me = this,
			v = me.getValue(),
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		if (v instanceof FormData) {
			me.ForumActions.saveTopicWithFormData(me, me.record, me.forum, v);
			return;
		}

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			console.error('bad forum post');
			me.markError(me.contentEl, getString('NextThought.view.forums.topic.parts.Editor.emptycontent'));
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (Ext.isEmpty(v.title)) {
			console.error('You need a title');
			me.markError(me.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.emptytitle'));
			me.titleWrapEl.addCls('error-on-bottom');
			return;
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
			return;
		}

		function unmask () {
			if (me.el) {
				me.el.unmask();
			}
		}

		if (me.el) {
			me.el.mask('Saving...');
		}

		me.ForumActions.saveTopic(me, me.record, me.forum, v.title, v.tags, v.body, v.publish)
			.then(function (record) {
				unmask();

				me.fireEvent('after-save', record);
			})
			.fail(function (reason) {
				unmask();
				console.error('Failed to save the discussion: ', reason);
				alert('There was trouble saving the discussion');
			});
	},


	onSaveSuccess: function (record, isEdit) {
		this.savedSuccess = true;
		this.fireEvent(isEdit ? 'goto-record' : 'new-record', record);
		this.destroy();
	},

	onSaveFailure: function (proxy, response, operation) {
		var msg = 'An unknown error occurred saving your Discussion.', error;

		if (response && response.responseText) {
			error = Ext.JSON.decode(response.responseText, true) || {};
			if (error.code === 'TooLong') {
				msg = getString('NextThought.view.forums.topic.parts.Editor.longtitle');
			}
		}
		alert({title: getString('NextThought.view.forums.topic.parts.Editor.error'), msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},

	onCancel: function (e) {
		e.stopEvent();

		this.fireEvent('cancel');
	}
});

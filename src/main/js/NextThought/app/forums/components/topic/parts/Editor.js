Ext.define('NextThought.app.forums.components.topic.parts.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.forums-topic-editor',

	cls: 'forums-topic-editor-box',
	border: 1,

	enableTags: true,
	enableTitle: true,
	enableVideo: true,

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


	initComponent: function() {
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	afterRender: function() {
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

		parentCtEl.addCls('scroll-lock' + (hasScrollBar ? ' scroll-padding-right' : '')).scrollTo(0);
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


			this.el.down('.content').on('focus', function(e) {
				me.el.down('.content').scrollBy(0, 1000);
				Ext.defer(function() {
					me.el.down('.content').scrollBy(0, 1000);
				},250);
			});
		}
	},


	// destroy: function() {
	//	var container = this.ownerCt.getEl();
	//	container.removeCls('scroll-lock scroll-padding-right');
	//	Ext.EventManager.onWindowResize(this.syncHeight, this, null);
	//	console.log(arguments);
	//	return this.callParent(arguments);
	// },


	onBeforeDeactivate: function() {
		/*
		 *   NOTE: For now, since forums views aren't destroyed when you go away,
		 *   and we like that behavior, don't warn the user if the editor is open, since it will still be there when we can back.
		 *   If we change at some point, just uncomment the following lines to display a warning message.
		 */
	//		if(this.isVisible()){
	//			this.warnBeforeDismissingEditor();
	//		}
	//		return !this.isVisible();
		return true;
	},


	warnBeforeDismissingEditor: function() {
		var msg = getString('NextThought.view.forums.topic.parts.Editor.dismisswarn');
		Ext.defer(function() {
			alert({msg: msg});
		}, 1);
	},


	syncHeight: function() {
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


	onSave: function(e) {
		e.stopEvent();
		var v = this.getValue(),
				re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
				trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			console.error('bad forum post');
			this.markError(this.contentEl, getString('NextThought.view.forums.topic.parts.Editor.emptycontent'));
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (Ext.isEmpty(v.title)) {
			console.error('You need a title');
			this.markError(this.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.emptytitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		/*if (/^[^a-z0-9]+$/i.test(v.title)) {
			console.error('Title cant be all special chars');
			this.markError(this.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.specialtitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}*/

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			this.markError(this.titleWrapEl, getString('NextThought.view.forums.topic.parts.Editor.attitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		this.fireEvent('save-post', this, this.record, this.forum, v.title, v.tags, v.body, v.publish);
	},


	onSaveSuccess: function(record, isEdit) {
		this.savedSuccess = true;
		this.fireEvent(isEdit ? 'goto-record' : 'new-record', record);
		this.destroy();
	},


	onSaveFailure: function(proxy, response, operation) {
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


	onCancel: function(e) {
		e.stopEvent();

		this.isClosed = true;
		if (this.closeCallback) {
			this.destroy();
			this.closeCallback.call();
		} else if (this.record) {
			this.fireEvent('goto-record', this.record);
		} else {
			this.fireEvent('pop-view');
		}
	}
});

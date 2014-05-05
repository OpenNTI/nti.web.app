Ext.define('NextThought.view.profiles.parts.BlogEditor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.profile-blog-editor',

	enableTags: true,
	enableTitle: true,
	enableVideo: true,
	enableShareControls: true,
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


	initComponent: function() {
		this.callParent(arguments);
		this.addEvents(['save-post']);
	},


	afterRender: function() {
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
			UserRepository.getUser(sharedWith.entities, function(entities) {
				sharedWith.entities = Ext.Array.map(entities, function(u) {
					return u.get('Username');
				});
				me.setSharedWith(sharedWith);
			}, function() {
				console.error('failed to resolve:', sharedWith.entities, arguments);
			}, this);
		}

		this.sizer = Ext.DomHelper.insertAfter(this.el, {}, true);
		this.sizer.setHeight(1000);

		Ext.EventManager.onWindowResize(this.syncHeight, this, null);

		Ext.defer(this.syncHeight, 500, this);//let the animation finish


		if (Ext.is.iOS) {
			el = me.editorBodyEl;

			el.dom.onmouseup = function(e) { me.scrollDiv = (e.pageY > 438); };

			//Shorten the editor body to fit on iPad screen when keyboard up
			el.on('focus', function() {
				if (!me.bodyheight) {
					me.bodyheight = el.getHeight();
				}
				Ext.defer(function() {
					//Make sure on-screen keyboard is up (and not physical keyboard connected)
					if (window.innerHeight < 600) {
						el.setHeight(window.scrollY - 16);
						//scroll div is selected part is no longer visible
						Ext.defer(function() {
							if (me.scrollDiv) {
								el.scrollBy(0, 100);
							}
						},250, me);
					}
				},250, me);
			});
			el.on('blur', function() {
				if (me.bodyheight) {
					el.setHeight(me.bodyheight);
				}
			});

		} else {
			this.titleEl.focus();
			this.moveCursorToEnd(this.titleEl);
		}
	},


	destroy: function() {
		Ext.get('profile').removeCls('scroll-lock scroll-padding-right');
		Ext.EventManager.onWindowResize(this.syncHeight, this, null);
		Ext.destroy(this.sizer);

		return this.callParent(arguments);
	},


	syncHeight: function() {
		//Run this only once for iPad
		if (Ext.is.iPad) {
			if (this.ipadSyncedAlready) {
				return;
			}
			this.ipadSyncedAlready = true;
		}
		var pEl = Ext.get('profile'),
			el = this.editorBodyEl,
			footEl = this.footerEl,
			vpH = Ext.Element.getViewportHeight(),
			top,
			containerTop = pEl.getY() + pEl.getScroll().top,
			scrollPos = vpH < 800 ? (containerTop - pEl.getY()) : 0,
			newHeight;

		if (!el) {
			return;
		}

		top = el.getY() + pEl.getScroll().top - scrollPos;

		newHeight = ((vpH - top) - footEl.getHeight()) - 8;
		if (this.sizer) {
			this.sizer.setHeight(newHeight);
		}

		el.setHeight(newHeight);

		Ext.defer(function() {
			pEl.scrollTo('top', scrollPos);
		}, 100);

		Ext.defer(this.updateLayout, 700, this, []);
	},


	onSave: function(e) {
		e.stopEvent();
		var v = this.getValue(),
			t,
			trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		if (DomUtils.isEmpty(v.body)) {
			this.markError(this.editorBodyEl, getString('NextThought.view.profiles.parts.BlogEditor.emptybody'));
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (Ext.isEmpty(v.title)) {
			this.markError(this.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.emptytitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^[^a-z0-9]+$/i.test(v.title)) {
			this.markError(this.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.specialtitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			this.markError(this.titleWrapEl, getString('NextThought.view.profiles.parts.BlogEditor.attitle'));
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		//console.debug('Save:',v);
		//If new there will not be a record on this, it will be undefined
		// NOTE: For now, as a matter of simplicit, we are ignoring the 'publish' field.
		// We will derive it from the sharedWith value. ~PM.
		this.fireEvent('save-post', this, this.record, v.title, v.tags, v.body, v.sharingInfo);
	},


	onSaveSuccess: function() {
		this.destroy();
	},


	onSaveFailure: function(proxy, response, operation) {
		var msg = getString('NextThought.view.profiles.parts.BlogEditor.unknown'), error;

		if (response && response.responseText) {
			error = JSON.parse(response.responseText) || {};
			if (error.code === 'TooLong') {
				msg = getString('NextThought.view.profiles.parts.BlogEditor.longtitle');
			}
		}
		alert({title: getString('NextThought.view.profiles.parts.BlogEditor.error'), msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},


	onCancel: function(e) {
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});

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
			h, sharedWith;

		me.mon(me.tags, 'new-tag', 'syncHeight');
		if (r) {
			h = r.get('headline');
			me.editBody(h.get('body'));
			me.setTitle(h.get('title'));
			me.setTags(h.get('tags'));

			sharedWith = r.getSharingInfo();
			me.setSharedWith(sharedWith);

			$AppConfig.service.getObjects(sharedWith.entities, function(entities) {
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

		Ext.defer(Ext.Function.createSequence(this.syncHeight, this.focus, this), 500, this);//let the animation finish


		if (Ext.is.iOS) {
            var el = me.editorBodyEl;

            el.dom.onmouseup = function(e){
                me.scrollDiv = false;
                if(e.pageY > 438){
                    me.scrollDiv = true;
                }
            }

            //Shorten the editor body to fit on iPad screen when keyboard up
            el.on('focus', function(){
                if(!me.bodyheight){
                    me.bodyheight = el.getHeight();
                }
                Ext.defer(function(){
                    //Make sure on-screen keyboard is up (and not physical keyboard connected)
                    if(window.innerHeight < 600){
                        el.setHeight(window.scrollY - 16);
                        //scroll div is selected part is no longer visible
                        Ext.defer(function(){
                            if(me.scrollDiv){
                                el.scrollBy(0,100);
                            }
                        },250, me);
                    }
                },250, me);
            });
            el.on('blur', function(){
                if(me.bodyheight){
                    el.setHeight(me.bodyheight);
                }
            });

		}
	},


	focus: function focus() {
		this.titleEl.focus();
		this.moveCursorToEnd(this.titleEl);
	},


	destroy: function() {
		Ext.get('profile').removeCls('scroll-lock scroll-padding-right');
		Ext.EventManager.onWindowResize(this.syncHeight, this, null);
		Ext.destroy(this.sizer);

		return this.callParent(arguments);
	},


	moveCursorToEnd: function(el) {
		//this is only for input/textarea elements
		el = Ext.getDom(el);
		if (typeof el.selectionStart === 'number') {
			el.selectionStart = el.selectionEnd = el.value.length;
		}
		else if (el.createTextRange !== undefined) {
			el.focus();
			var range = el.createTextRange();
			range.collapse(false);
			range.select();
		}
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
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g, t,
			trimEndRe = /((<p><br><\/?p>)|(<br\/?>))*$/g, l;

		if (!Ext.isArray(v.body) || v.body.join('').replace(re, '') === '') {
			console.error('bad blog post');
			this.markError(this.editorBodyEl, 'You need to type something');
			return;
		}

		l = v.body.length;
		if (l > 0 && v.body[l - 1].replace) {
			v.body[l - 1] = v.body[l - 1].replace(trimEndRe, '');
		}

		if (Ext.isEmpty(v.title)) {
			console.error('You need a title');
			this.markError(this.titleWrapEl, 'You need a title');
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^[^a-z0-9]+$/i.test(v.title)) {
			console.error('Title cant be all special chars');
			this.markError(this.titleWrapEl, "Title can't be all special characters.");
			this.titleWrapEl.addCls('error-on-bottom');
			return;
		}

		if (/^@{1,}/.test(v.title)) {
			console.error('Title cant start with @');
			this.markError(this.titleWrapEl, "Title can't start with @");
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
		var msg = 'An unknown error occurred saving your Thought.', error;

		if (response && response.responseText) {
			error = JSON.parse(response.responseText) || {};
			if (error.code === 'TooLong') {
				msg = 'Could not save your Thought. The title is too long. It can only be 140 characters or less';
			}
		}
		alert({title: 'Error', msg: msg, icon: 'warning-red'});
		console.debug(arguments);
	},


	onCancel: function(e) {
		e.stopEvent();

		//TODO: Logic... if edit go back to post, if new just destroy and go back to list.
		this.destroy();
	}
});

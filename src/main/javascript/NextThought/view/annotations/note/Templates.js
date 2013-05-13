Ext.define('NextThought.view.annotations.note.Templates',{
	singleton: true,

	getEditorTpl: function(enableTitle, enableSharing){
		return {
			cls: 'editor basic',
			cn:[{
				cls: 'main',
					cn:[
						{tag: 'tpl', 'if':'enableSharing', cn:
							{cls: 'aux', cn:[
								{cls: 'action publish', 'data-qtip': 'Publish State'},
								{cls: 'recipients'}
							]}
						},{
							tag: 'tpl', 'if':'enableTitle', cn:
							{cls: 'title',cn:[
								{tag:'input', type:'text', placeholder: 'Title...'}
							]}
						},{
							cls: 'content',
							contentEditable: true,
							tabIndex: 1,
							unselectable: 'off',
							cn: [{ //inner div for IE
								html: '&#8203;' //default value (allow the cursor in to this placeholder div, but don't take any space)
							}]
						}
					]
				},{
					cls: 'footer',
					cn: [{
						cls: 'left',
						cn: [{
							cls: 'action whiteboard', 'data-qtip': 'Create a whiteboard'
						},{
							cls: 'action text-controls', 'data-qtip': 'Text Controls', cn:[
								{cls:'popover controls', cn:[
									{cls:'control bold', tabIndex:-1, 'data-qtip': 'Bold'},
									{cls:'control italic', tabIndex:-1, 'data-qtip': 'Italic'},
									{cls:'control underline', tabIndex:-1, 'data-qtip': 'Underline'}
								]}
							]
						}]
					},{
						cls: 'right',
						cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
					}]
				}]
			};
	},


	getReplyOptions: function(){
		return {
			cls: 'reply-options',
			cn: [
				{ cls: 'reply', html: 'Reply' },
				{ cls: 'share', html: 'Share' },
				{ cls: 'more', 'data-qtip': 'Options', html: '&nbsp;'}
			]
		};
	},

	attachMoreReplyOptionsHandler: function(cmp, optionsEl, user, record){
		if(!optionsEl){return;}
		var scroller = optionsEl.up('{overflow=auto}');

		if(scroller){
			cmp.mon(scroller,{
				optionsEl: optionsEl,
				scope: cmp,
				scroll: this.replyOptionsScroll
			});
		}

		cmp.mon(optionsEl, {
			scope: cmp,
			click: this.replyOptionsClicked,
			mouseout: this.replyOptionsMouseOut,
			mouseover: this.replyOptionsMouseIn,
			mouseup: function(e){
				e.stopEvent();
				return false;
			},
			options: {
				user: user,
				record: record
			}
		});
	},


	replyOptionsScroll: function(e,el,opts){
		var menu = opts.optionsEl;
		menu.removeCls('active');
	},


	replyOptionsClicked: function(e, t, opts){
		e.stopEvent();

		var more = e.getTarget('.more', undefined, true), editItem, chatItem, flagItem, deleteItem, menu, items=[], mine,
			options = opts.options, menuTimer, involved, shared, hideDelete = false;

		if (!more || !more.dom){return false;}

		function moreMenuClick(item, e){
			e.stopEvent();
			var menuCls = 'on' + item.itemId;
			if (this[menuCls]){
				this[menuCls].call(this);
			}
			else {
				console.warn('unimplemented method', item.itemId, 'on component', this.$className);
			}
		}

		function flagItemClick(item , e){
			e.stopEvent();
			var menuCls = 'onFlag', me = this;

			TemplatesForNotes.areYouSure('Reporting this item cannot be undone', function(btn){
				if(btn !== 'ok'){ return; }
				if (me[menuCls]){
					me[menuCls].call(me);
				}
			});
		}

		function hasUser(users, name){
			var found = false;
			Ext.each(users, function(user){
				if(user === name || ( user.get && user.get('Username') === name) ){
					found = true;
				}
				return !found;
			});
			return found;
		}

		editItem = new Ext.Action({
			text: 'Edit',
			cls: 'reply-option edit',
			itemId: 'Edit',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler: moreMenuClick
		});

//		chatItem = new Ext.Action({
//			text: 'Start a chat',
//			cls: 'reply-option chat',
//			itemId: 'Chat',
//			scope: this,
//			ui: 'nt-menuitem', plain: true,
//			handler: moreMenuClick
//		});

		flagItem = new Ext.Action({
			text: 'Report',
			cls: 'reply-option flag',
			itemId: 'Flag',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler:flagItemClick
		});

		deleteItem = new Ext.Action({
			text: 'Delete',
			cls: 'reply-option delete',
			itemId: 'Delete',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler: moreMenuClick
		});

		if(options.user){ mine = isMe(options.user); }
		else{
			console.log("Error: user is null. The note/reply  owner is undefined, opts:", options);
		}

		if(mine){
			items.push(editItem);
		}

		if(options.record){
//			involved = (options.record.get('sharedWith') || []).slice();
//			shared = involved.length > 0;

			/* NOTE: We are hiding the 'start chat' feature from a note window,
				because right now, the note window is displayed in a modal view and
				we would want the chat window to be on top of note window. Since we can't have more than one modal view,
				the chat window gets hidden behind the window. As per Aaron, we will revisit this when needed.
			 */

//			if(options.user){involved.push(options.user);}
//			if(	$AppConfig.service.canChat()
//				&& shared
//				&& hasUser(involved, $AppConfig.username) ){
//				items.push(chatItem);
//			}

            if(!options.record.isModifiable() || (this.canDelete && !this.canDelete())){
                hideDelete = true;
            }

			if( options.record.isFlagged && options.record.isFlagged() ){
				flagItem.setText('Reported');
			}
		}
		items.push(flagItem);
		if(mine && !hideDelete){
			items.push(deleteItem);
		}


		menu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			cls: 'reply-options-menu',
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			closeAction: 'destroy',
			parentItem: this,
			items: items
		});

		menu.on('mouseover', function(){
			if(opts.scope.el && opts.scope.el.down('.single') && !opts.scope.el.down('.menu-open')){
				opts.scope.el.down('.single').addCls('menu-open');
			}
		});

		menu.on('mouseleave', function(){
			menuTimer = setTimeout(function(){
				menu.close();
				if(opts.scope.el && opts.scope.el.down('.single')){
					opts.scope.el.down('.single').removeCls('menu-open');
				}
			}, 100);
		});
		menu.on('mouseenter', function(){ clearTimeout(menuTimer); });

		menu.showBy(more, 'tl-bl?', [2, -7]);

		menuTimer = setTimeout(function(){ menu.close(); }, 1500);
		return false;
	},

	replyOptionsMouseOut: function(e) {
		var more = e.getTarget('.more', undefined, true);
		if (more){
			this.moreReplyOptionsMouseOutTimer = setTimeout(
				function(){
					more.removeCls('active');
				}
			,500);
		}
	},

	replyOptionsMouseIn: function() {
		clearTimeout(this.moreReplyOptionsMouseOutTimer);
	},

	areYouSure: function(msg,callback){
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: msg,
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			icon: 'warning-red',
			buttonText: {'ok': 'Report'},
			ui:'caution',
			title: 'Are you sure?',
			fn: callback
		});
	}


},function(){
	window.TemplatesForNotes = this;
});

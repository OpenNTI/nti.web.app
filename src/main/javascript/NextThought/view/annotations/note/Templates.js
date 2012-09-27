Ext.define('NextThought.view.annotations.note.Templates',{
	singleton: true,

	getEditorTpl: function(){
		return {
			cls: 'editor',
			cn:[{
				cls: 'main',
				cn:[{
					cls: 'toolbar',
					cn: [{
						cls: 'left',
						cn: [{cls: 'action bold', title: 'Bold'},{cls:'action italic', title: 'Italic'},{cls:'action underline', title: 'Underline'}]
					},{
						cls: 'right',
						cn: [{cls: 'action share', html: 'Only Me', title: 'Shared with'}]
					}]
				},{
					cls: 'content',
					contentEditable: true,
					tabIndex: 1,
					unselectable: 'off',
					html: '&nbsp;'
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard', title: 'Create a whiteboard'}]
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
				{ cls: 'more', title: 'Options', html: '&nbsp;'}
			]
		};
	},

	attachMoreReplyOptionsHandler: function(cmp, optionsEl, user, currentlyFlagged){
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
				currentlyFlagged: currentlyFlagged
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
			options = opts.options, menuTimer;

		if (!more || !more.dom){return false;}

		function moreMenuClick(item, e){
			e.stopEvent();

			menuCls = 'on' + item.itemId;
			if (this[menuCls]){
				this[menuCls].call(this);
			}
			else {
				console.warn('unimplemented method', item.itemId, 'on component', this.$className);
			}
		}

		editItem = new Ext.Action({
			text: 'Edit',
			cls: 'reply-option edit',
			itemId: 'Edit',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler: moreMenuClick
		});

		chatItem = new Ext.Action({
			text: 'Start a chat',
			cls: 'reply-option chat',
			itemId: 'Chat',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler: moreMenuClick
		});

		flagItem = new Ext.Action({
			text: 'Flag as Inappropriate',
			cls: 'reply-option flag',
			itemId: 'Flag',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler:moreMenuClick
		});

		deleteItem = new Ext.Action({
			text: 'Delete',
			cls: 'reply-option delete',
			itemId: 'Delete',
			scope: this,
			ui: 'nt-menuitem', plain: true,
			handler: moreMenuClick
		});

		mine = isMe(options.user);
		mine ? items.push(editItem):null;
		$AppConfig.service.canChat() && !mine ? items.push(chatItem):null;
		if( options.currentlyFlagged ){
			flagItem.setText('Flagged');
		}
		items.push(flagItem);
		mine ? items.push(deleteItem): null;


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
				menu.hide();
				if(opts.scope.el && opts.scope.el.down('.single')){
					opts.scope.el.down('.single').removeCls('menu-open');
				}
			}, 100);
		});
		menu.on('mouseenter', function(){ clearTimeout(menuTimer); });

		menu.showBy(more, 'tl-bl?', [2, -7]);

		menuTimer = setTimeout(function(){ menu.hide(); }, 1500);
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
	}


},function(){
	window.TemplatesForNotes = this;
});

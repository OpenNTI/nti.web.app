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
						cn: [{cls: 'action bold'},{cls:'action italic'},{cls:'action underline'}]
					},{
						cls: 'right',
						cn: [{cls: 'action share', html: 'Only Me'}]
					}]
				},{
					cls: 'content',
					contentEditable: true,
					unselectable: 'off',
					html: '&nbsp;'
				}]
			},{
				cls: 'footer',
				cn: [{
					cls: 'left',
					cn: [{cls: 'action whiteboard'}]
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
				{ cls: 'chat', html: 'Start a chat' },
				{ cls: 'more', title: 'Options', html: '&nbsp;',
					cn:[{
						tag: 'ol',
						cn: [
							{ tag: 'li', cls: 'share', html: 'Share' },
							/*
							{ tag: 'li', cls: 'flag',  html: 'Flag for Moderation' },
							{ tag: 'li', cls: 'add-contact', html: 'Add to Contacts' },
							{ tag: 'li', cls: 'follow', html: 'Follow ...' },
							{ tag: 'li', cls: 'block', html: 'Block ...' },
//							{ tag: 'li', cls: 'mute', html: 'Mute?' },*/
							{ tag: 'li', cls: 'delete', html: 'Delete' }
						]
					}]
				}
			]
		};
	},

	attachMoreReplyOptionsHandler: function(cmp, optionsEl){
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
			}
		});
	},


	replyOptionsScroll: function(e,el,opts){
		var menu = opts.optionsEl;
		menu.removeCls('active');
	},



	updateMoreReplyOptionsLabels: function(moreEl,user){
		var add = moreEl.down('li.add-contact');
		var flag = moreEl.down('li.flag');
		var follow = moreEl.down('li.follow');
		var block = moreEl.down('li.block');
		var name = user.getName();

		function addName(){
			Ext.each(arguments,function(o){
				if(o){ o.update(o.dom.textContent.replace(/\.{3}/,name)); } }); }

		function remove(){
			Ext.each(arguments,function(o){ if(o){o.remove();} }); }

		if(isMe(user)){ remove(add,flag,follow,block); }
		else { addName(follow,block); }
	},


	replyOptionsClicked: function(e){
		e.stopEvent();

		var menuItem = e.getTarget('li', undefined, true),
			more = e.getTarget('.more', undefined, true),
			y, h, menuCls,
			re = /\-([a-z])/igm;

		//handle any menu items clicked:
		if (menuItem) {
			menuCls = menuItem.getAttribute('class');
			menuCls = menuCls.replace(re, function(o, c){
				return c.toUpperCase();
			});
			menuCls = 'on' + Ext.String.capitalize(menuCls);
			if (this[menuCls]){
				this[menuCls].call(this);
			}
			else {
				console.warn('unimplemented method', menuCls, 'on component', this.$className);
			}
		}

		if (!more || !more.dom){return false;}

		y = more.getY();
		h = more.getHeight();
		more.down('ol').setStyle({'top': (y + h) + 'px'});

		//toggle it on or off:
		more.toggleCls('active');


		return false;
	},

	replyOptionsMouseOut: function(e) {
		var more = e.getTarget('.more', undefined, true);
		if (more){
			this.moreReplyOptionsMouseOutTimer = setTimeout(
				function(){
					more.removeCls('active');
				}
			,1500);
		}
	},

	replyOptionsMouseIn: function(e) {
		clearTimeout(this.moreReplyOptionsMouseOutTimer);
	}


},function(){
	window.TemplatesForNotes = this;
});

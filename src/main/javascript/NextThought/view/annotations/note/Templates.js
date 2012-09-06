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
				{ cls: 'chat', html: 'Start a chat' },
				{ cls: 'more', title: 'Options', html: '&nbsp;',
					cn:[{
						tag: 'ol',
						cn: [
							{ tag: 'li', cls: 'edit', html: 'Edit' },
							{ tag: 'li', cls: 'share', html: 'Share' },
							{ tag: 'li', cls: 'flag',  html: 'Flag as Inappropriate' },
							/*
							{ tag: 'li', cls: 'add-contact', html: 'Add to Contacts' },
							{ tag: 'li', cls: 'follow', html: 'Follow ...' },
							{ tag: 'li', cls: 'block', html: 'Block ...' },
							{ tag: 'li', cls: 'mute', html: 'Mute?' },
							*/
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
		var add = moreEl.down('li.add-contact'),
			edit = moreEl.down('li.edit'),
			flag = moreEl.down('li.flag'),
			follow = moreEl.down('li.follow'),
			block = moreEl.down('li.block'),
			mute = moreEl.down('li.mute'),
			del = moreEl.down('li.delete'),
			share = moreEl.down('li.share'),
			name = user.getName(),
			mine = isMe(user),
			fnA, fnB;

		function addName(){
			Ext.each(arguments,function(o){
				if(o){
					o.originalValue = o.originalValue || o.dom.textContent;
					o.update(
						o.originalValue.replace(/\.{3}/,name)); } }); }

		function make(action,list){
			Ext.each(list,function(o){
				if(o){o.setVisibilityMode(Ext.Element.DISPLAY);o[action]();} }); }

		function remove(){ make('hide',arguments); }
		function reset(){ make('show',arguments); }

		if (!mine && share){share.update('Get Info');}

		addName(follow,block);

		fnA = mine ? remove : reset;
		fnB = mine ? reset : remove;

		fnA(add,follow,block, mute);
		fnB(del,edit);

		if(!$AppConfig.service.canShare()){
			remove(share);
		}
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

		//TODO:
		//In IE setting position to "fixed" does not pop it out of the clipping rect of it's parent's box. So this menu (the OL node)
		// needs to be (for IE9 only-maybe 10) popped out to the document's body node and positioned when shown, then pushed back to this node on hide.
        if (more.down('ol').getStyle('position') === "fixed"){
            y = more.getY();
            h = more.getHeight();
            more.down('ol').setStyle({'top': (y + h) + 'px'});
        }

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
			,500);
		}
	},

	replyOptionsMouseIn: function() {
		clearTimeout(this.moreReplyOptionsMouseOutTimer);
	}


},function(){
	window.TemplatesForNotes = this;
});

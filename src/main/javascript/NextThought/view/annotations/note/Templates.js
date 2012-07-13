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
							{ tag: 'li', cls: 'flag',  html: 'Flag for Moderation' },
							{ tag: 'li', cls: 'add-contact', html: 'Add to Contacts' },
							{ tag: 'li', cls: 'follow', html: 'Follow {name}' },
							{ tag: 'li', cls: 'block', html: 'Block {name}' },
							{ tag: 'li', cls: 'delete', html: 'Delete' }
						]
					}]
				}
			]

		};
	},

	attachMoreReplyOptionsHandler: function(cmp, optionsEl){
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

	replyOptionsClicked: function(e){
		e.stopEvent();

		var more = e.getTarget('.more', undefined, true),
			y, h;

		if (!more){return false;}

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

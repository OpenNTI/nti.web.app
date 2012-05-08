Ext.define('NextThought.view.chat.Window',{
	extend: 'Ext.window.Window',
	alias: 'widget.chat-window',

	requires: [
		'NextThought.view.chat.View',
		'NextThought.view.chat.Gutter'
	],

	cls: 'chat-window',
	ui: 'chat-window',
	plain: true,
	shadow: false,

	border: false,
	frame: false,
	header: false,

	liveDrag: true,

	minWidth: 400,
	minHeight: 350,
	height: 350,

	renderSelectors: {
		closeEl: 'img.tool.close',
		minimizeEl: 'img.tool.minimize'
	},

	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	items: [
		{xtype:'chat-gutter'},
		{xtype:'chat-view', flex: 1}
	],


	initComponent: function(){
		this.callParent(arguments);

		if(!this.roomInfo){
			Ext.Error.raise('roomInfo required');
		}
		this.roomInfoChanged(this.roomInfo);
	},


	roomInfoChanged: function(roomInfo){
		if (!this.roomInfo){return;}  //Only do this if it's there.

		//Just checking to see if we got the correct room info
		if (roomInfo.getId() !== this.roomInfo.getId()) {
			console.error('Got a RoomInfo change event for a RoomInfo that has a different ID, current', this.roomInfo, 'new', roomInfo);
			return;
		}

		roomInfo.on('changed', this.roomInfoChanged, this);
		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;

		var list = this.down('chat-gutter');

		console.log(roomInfo.data);
		UserRepository.prefetchUser(roomInfo.get('Occupants'),function(users){
			list.updateList(users);
		});
	},


	initDraggable: function() {
		this.dd = new Ext.util.ComponentDragger(this, {
			constrain: true,
			constrainDelegate: true,
			constrainTo: Ext.getBody(),
			el: this.el,
			delegate: '#' + Ext.escapeId(this.id) + '-body'
		});
		this.relayEvents(this.dd, ['dragstart', 'drag', 'dragend']);


	},


	afterRender: function(){
		this.callParent(arguments);

		this.closeEl.on('click', this.close, this);
		this.minimizeEl.on('click', this.minimize, this);

		var me = this;

		this.dropZone = Ext.create('Ext.dd.DropZone', this.getEl(), {

			getTargetFromEvent: function(e) { return e.getTarget('.chat-window'); },
			onNodeEnter: function(target, dd, e, data){ Ext.fly(target).addCls('target-hover'); },
			onNodeOut: function(target, dd, e, data){ Ext.fly(target).removeCls('target-hover'); },

			onNodeOver: function(target, dd, e, data){
//				if(data && data.Username) {
					return Ext.dd.DropZone.prototype.dropAllowed;
//				}
			},

			onNodeDrop: function(target, dd, e, data){
				me.fireEvent('add-people', me, [data.username]);
				return true;
			}
		});
	},


	disableChat: function(){
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-entry').setDisabled(true);
	},


    left: function() {
		this.down('chat-entry').destroy();
    }


}, function(){
	var p = this.prototype,
		r = p.renderTpl,
		tpl = [	'<div class="controls">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}"	class="tool close">',
					'<img src="{[Ext.BLANK_IMAGE_URL]}" class="tool minimize">',
				'</div>' ];

	//if this is loaded after the inital classloader finishes, renderTpl will be an
	// XTemplate instance instead of a raw array of strings.
	if(Ext.isArray(r)){
		r = p.renderTpl = r.slice();
		r.push.apply(r, tpl);
	}
	else {
		p.renderTpl = new Ext.XTemplate(r.html,tpl.join(''));
	}
});

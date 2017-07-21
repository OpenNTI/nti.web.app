const Ext = require('extjs');

const IdCache = require('legacy/cache/IdCache');
const UserRepository = require('legacy/cache/UserRepository');
const NTIFormat = require('legacy/util/Format');
const NavigationActions = require('legacy/app/navigation/Actions');

const ChatActions = require('../../Actions');

require('legacy/layout/component/Natural');
require('legacy/util/Annotations');


module.exports = exports = Ext.define('NextThought.app.chat.components.log.Entry', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-log-entry',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'log-entry-wrapper {me}', cn: [
			'{user:avatar}',
			{tag: 'span', cls: 'control'},
			{cls: 'message-bounding-box', cn: [
				{cls: 'log-entry {me}', 'data-qtip': '{timestamp:htmlEncode}', cn: [
					{cls: 'name', html: '{name}'}, ' ',
					{cls: 'body-text', html: '{body}'}, ' '
				]}
			]}
		]},
		{id: '{id}-body', cls: 'replies', cn: ['{%this.renderContainer(out,values)%}']}
	]),

	componentLayout: 'natural',
	layout: 'auto',
	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderSelectors: {
		icon: '.avatar',
		name: '.name',
		text: '.body-text'
	},

	initComponent: function () {
		this.addEvents('rendered-late');
		this.enableBubble('rendered-late');
		this.callParent(arguments);
		this.update(this.message);
		this.ChatActions = ChatActions.create();
	},

	add: function () {
		var r = this.callParent(arguments),
			reply = this.down('chat-reply-to'),
			ci;

		if (reply && r !== reply) {
			ci = this.items.indexOf(reply);
			this.move(ci, this.items.getCount() - 1);
			reply.down('textfield').focus();
		}

		return r;
	},

	update: function (m) {
		var me = this,
			s = m.get('Creator');

		me.message = m;
		me.messageId = IdCache.getIdentifier(m.getId());

		me.renderData.name = 'resolving...';

		if (s !== $AppConfig.username) {
			//This entry is created by you, so don't show the reply whisper option
			me.renderData.enablewhisper = 'enable-whisper';
		} else {
			me.renderData.me = 'me';
		}

		me.renderData.timestamp = this.getTimeStamp(me.message.get('CreatedTime'));
		m.compileBodyContent(function (content) {
			me.renderData.body = content;

			if (me.rendered) {
				me.text.update(me.renderData.body);
				me.fireEvent('rendered-late');
			}
		});

		if (s) {
			UserRepository.getUser(s, function (u) {
				if (!u) {
					console.error('failed to resolve user', s, m);
					return;
				}

				me.fillInUser(u);
			},
			this);
		}

		//apply shadow class if necessary:
		me.addCls(/shadow/i.test(m.get('Status')) ? 'shadow' : '');
		me.addCls(m.getId() ? '' : ' nooid');
	},

	afterRender: function () {
		this.callParent(arguments);
		this.el.on('click', this.click, this);
		this.mon(this.ownerCt, 'afterlayout', 'setNameMaxWidth', this);
		this.mon(this.getEl().select('.control'), {
			scope: this,
			click: this.onControlClick
		});
	},

	setNameMaxWidth: function () {
		var width = this.ownerCt.getWidth() - 40;
		this.name.setStyle('max-width', width + 'px');
	},

	onControlClick: function () {
		this.el.down('.control').toggleCls('checked');
		this.el.down('.log-entry').toggleCls('flagged');
		//let our parent know so he can do something.
		this.up('chat-view').fireEvent('control-clicked');
	},

	isFlagged: function () {
		return this.el.down('.log-entry').hasCls('flagged');
	},

	click: function (event) {
		event.stopEvent();
		var me = this, t = event.getTarget('.whiteboard-container', null, true),
			a = event.getTarget('a');


		if (!t && !a) {return false;}

		if (event.getTarget('.reply')) {
			this.ChatActions.replyToWhiteboard(
				Ext.clone(this.message.get('body')[0]), //wbData
				this,
				this.message.getId(),			//midReplyOf
				this.message.get('channel'),	//channel
				this.message.get('recipients')	//recipients
			);
		}else if (a) {
			//its a link
			if (NavigationActions.navigateToHref(a.href)) {
				return false;
			}

		}else {
			me.ChatActions.zoomWhiteboard(this, me.message.get('body')[0]);
		}
		return false;
	},

	fillInUser: function (u) {
		var name = u.getName(), avatar;

		this.renderData.user = u;
		this.renderData.name = name;
		if (this.rendered) {
			avatar = NTIFormat.avatar(u);
			this.icon.dom.innerHTML = avatar;
			this.name.update(name);
		}
	},

	getTimeStamp: function (date) {
		function isToday (t) {
			var today = new Date();
			return today.getYear() === t.getYear() &&
					today.getMonth() === t.getMonth() &&
					today.getDate() === t.getDate();
		}
		return isToday(date) ? Ext.Date.format(date, 'g:i a') : Ext.Date.format(date, 'F j, Y, g:i a');
	},

	initializeDragZone: function (v) {
		v.dragZone = new Ext.dd.DragZone(v.getEl(), {
			getDragData: function () {
				var sourceEl = v.el.dom, d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					v.dragData = {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						data: v.message.data
					};
					return v.dragData;
				}
				return null;
			},

			getRepairXY: function () {
				return this.dragData.repairXY;
			}
		});
	}
});

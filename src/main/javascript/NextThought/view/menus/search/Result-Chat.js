Ext.define('NextThought.view.menus.search.Result-Chat', {
	extend: 'NextThought.view.menus.search.Result',
	alias: 'widget.search-result-messageinfo',
	cls: 'search-result',

	requires: [
		'NextThought.util.Search',
		'NextThought.util.Time'
	],

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'title', cn: [
			{tag: 'tpl', 'if': 'isRendered', cn: [
				{cls: 'occupants', cn: [
						{tag: 'span', cls: 'names', html: '{occupants}'}
				]}
			]},
			{cls: 'time', cn: [
				{tag: 'span', cls: 'started', html: '{{{NextThought.view.menus.search.Result-Chat.sent}}}'}

			]},
			{tag: 'tpl', 'if': 'isRendered', cn: [
				{cls: 'lasted', cn: [
					{tag: 'span', cls: 'lasted', html: '{{{NextThought.view.menus.search.Result-Chat.latest}}}'}
				]}
			]}
		]},

		{ cls: 'wrap',
			cn: [
				{cls: 'name', cn: [
					{tag: 'span', cls: 'created', html: '{{{NextThought.view.menus.search.Result-Chat.created}}}'}
				]},
				{cls: 'fragments', cn: [
						{tag: 'tpl', 'for': 'fragments', cn: [
							{cls: 'fragment', ordinal: '{#}', html: '{.}'}
						]}
				]}
			]
		}
	]),

	initComponent: function() {
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId'),
			date = new Date(hit.get('Last Modified')),
			name = hit.get('Creator');
			me.callParent(arguments);

			UserRepository.getUser(name, function(user) {
				me.renderData = Ext.apply(me.renderData || {},{
					creator: user.get('displayName'),
					sent: Ext.Date.format(date, 'M-j g:i A'),
					fragments: ''
				});
			});




	},

	fillInData: function() {
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId');

		function success(obj) {
			UserRepository.getUser(hit.get('Creator'), function(user) {
				var RoomInfo = obj.get('RoomInfo'),
					occupants = RoomInfo.get('Occupants'),
					started = RoomInfo.get('CreatedTime'),
					ended = hit.get('Last Modified'),
					date = new Date(hit.get('Last Modified')),
					creator = user.get('displayName');
					me.record = obj;

				//check if the user created it
				if (isMe(creator)) {
					creator = 'I';
				}

				me.renderData = Ext.apply(me.renderData || {},{
					isRendered: true,
					occupants: getFormattedString('NextThought.view.menus.search.Result-Chat.occupants', {
						others: Ext.util.Format.plural(occupants.length, 'other')
					}),
					sent: Ext.Date.format(date, 'M-j g:i A'),
					duration: TimeUtils.timeDifference(ended, started).replace(/ ago/i, ''),
					creator: creator
				});
				if (me.rendered) {
					me.renderTpl.overwrite(me.el, me.renderData);
				}
				else {
					me.renderTpl.overwrite(me.renderData);
				}
			});
		}

		function failure(req, resp) {
			console.log('Error fetching chat transcript');
		}
		this.wrapFragmentHits();
		ViewUtils.getTranscript(containerId, hit.get('Last Modified'), success, failure);
	},

	afterRender: function() {
		this.fillInData();
		this.callParent(arguments);
	},

	clicked: function(e) {
		var errMsg = getString('NextThought.view.menus.search.Result-Chat.errmsg');
		if (!this.record) {
			alert({ title: getString('NextThought.view.menus.search.Result-Chat.errtitle') , msg: errMsg, icon: 'warning-red'});
			return;
		}
		this.callParent(arguments);
	},

	doClicked: function() {
		this.fireEvent('open-chat-transcript', this.record, getString('NextThought.view.menus.search.Result-Chat.errorsup'));
	}
});

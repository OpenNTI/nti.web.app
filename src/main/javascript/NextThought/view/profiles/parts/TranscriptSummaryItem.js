Ext.define('NextThought.view.profiles.parts.TranscriptSummaryItem', {
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-transcriptsummary-item',

	ui: 'activity',
	cls: 'transcriptsummary-event',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'icon', style: {backgroundImage: "url('resources/images/icons/chat-32-blue.png')"}},
		{ cls: 'meta', cn: [
			{ cls: 'title', cn: [
				{tag: 'span', cls: 'name', html: '{owner}'},
				{tag: 'span', cn: [
					{tag: 'tpl', 'if': 'group', html: ' had a group chat with '},
					{tag: 'tpl', 'if': 'single', html: ' had a chat with '},
					{tag: 'tpl', 'if': 'lonely', html: ' had a chat'}
				]},
				{tag: 'span', cls: 'name recepients', html: '{recepient}.'}

			] },
			{cls: 'time', cn: [
				{tag: 'span', html: '{date}'},
				{tag: 'span', html: 'Lasted: {duration}'},
				{tag: 'span', html: '{messages}'}
			]}
		]}
	]),

	renderSelectors: {
		titleEl: '.meta .title'
	},

	initComponent: function() {
		this.callParent(arguments);
		//this.mon(this.record, 'destroy', this.destroy, this);
	},

	afterRender: function(cmp) {
		function getCreator(r) {
			var c = r.get('Creator');
			return c && c.isModel ? c.get('Username') : c;
		}

		var page, me = this,
			r = me.record,
			date = new Date(r.get('CreatedTime')),
			RoomInfo = r.get('RoomInfo'),
			involved = Ext.Array.unique(Ext.Array.merge(r.get('Contributors'), [getCreator(r)], [getCreator(RoomInfo)])),
			OwnerIndex = Ext.Array.indexOf(involved, getCreator(RoomInfo)),
			started = RoomInfo.get('CreatedTime'),
			ended = r.get('Last Modified'),
			duration = TimeUtils.timeDifference(ended, started).replace(/ ago/i, ''),
			messageCount = RoomInfo.get('MessageCount');


		//mask the element until its loaded
		me.el.mask('loading');
		me.callParent(arguments);

		//add the render data that shows up in every case
		me.renderData = Ext.apply(me.renderData || {},{
				date: Ext.Date.format(date, 'F j, Y'),
				duration: duration,
				messages: (messageCount === 1) ? '1 message' : messageCount + ' messages'
		});

		function unMask() {
			if (me.el) {
				me.el.unmask();
			}
		}


		function showRecepients(u) {
			var width, less,
				m = new Ext.util.TextMetrics(),
				occupantsString,
				owner = (OwnerIndex >= 0) ? u[OwnerIndex].get('Username') : getCreator(RoomInfo);
			m.bind(me.el.down('.title'));

			owner = (isMe(owner)) ? 'You' : u[OwnerIndex].toString();

			//remove the owner
			u = Ext.Array.remove(u, u[OwnerIndex]);

			//replace the users name with you in the array
			u.forEach(function(item,index,a) {
				if (isMe(item.get('ID'))) {
					u[index] = 'you';
				}else {
					u[index] = item.toString();
				}
			}, me);

			if (u.length <= 0) {
				me.renderData = Ext.apply(me.renderData || {},{
					owner: owner,
					lonely: true,
					recepient: ''
				});
			}

			for (less = u.length; less >= 0; less--) {

				me.renderData = Ext.apply(me.renderData || {},{
					owner: owner,
					group: (u.length > 1),
					single: (u.length <= 1),
					recepient: me.stringifyNames(u, less)
				});

				if (me.rendered) {
					//oops...we resolved later than the render...re-render
					me.renderTpl.overwrite(me.el, me.renderData);
          //				}else{
					//me.renderTpl.overwrite(me.el,me.renderData);
				}

				if (u.length > 1) {
					occupantsString = owner + 'had a group chat with' + me.stringifyNames(u, less - 1);
				}else {
					occupantsString = owner + 'had a chat with' + me.stringifyNames(u, less - 1);
				}
				//width of the element
				width = me.el.down('.title').getWidth() - parseInt(me.el.getStyle('padding-right'), 10);
				if (width < m.getSize(occupantsString).width) {
					break;
				}
			}
			unMask();
			m.destroy();
		}

		function success(obj) {

			if (obj && obj.isGroup) {
				if (obj.isDynamicSharing()) {
					//is group
					UserRepository.getUser(getCreator(RoomInfo), function(u) {
						me.renderData = Ext.apply(me.renderData || {},{
							owner: (isMe(u)) ? 'You' : u.getName(),
							group: true,
							recepient: obj.getName()
						});

						if (me.rendered) {
							//oops...we resolved later than the render...re-render
							me.renderTpl.overwrite(me.el, me.renderData);
              //						}else{
              //							me.renderTpl.overwrite(me.el,me.renderData);
						}
					});
					unMask();
					return;
				}
			}

			UserRepository.getUser(involved, showRecepients);
		}

		function failure(obj) {

			console.warn('Faild to load page info');
			UserRepository.getUser(involved, showRecepients);
		}

		//get the page info
		//check if its cached

		page = Ext.getStore('FriendsList').getById(RoomInfo.get('ContainerId'));

		if (page) {
			//its cached
			success(page);
		}else {
			Service.getObject(RoomInfo.get('ContainerId'), success, failure, this, true);
		}



		this.mon(this.el, 'click', this.onClick, this);
	},

	stringifyNames: function(names,less) {
		less = less || 0;
		names = names || 'no one';
		names = (Ext.isArray(names)) ? ((names.length === 0) ? ['no one'] : names) : [names];
		if (names.length === 1) {
			//only one name in the array
			return names[0];
		}else {
			//more than one name
			if (less === 0) {
				//show all the names
				if (names.length === 2) {
					return names[0] + ' and ' + names[1];
				}else {
					return names.slice(0, names.length - 1).join(', ') + ', and ' + names[names.length - 1];
				}
			}else {
				if (less >= names.length) {
					return names.length + ' others';
				}else if (less === names.length - 1) {
					//only show the first name
					return names[0] + ' and ' + less + ((less === 1) ? ' other' : ' others');
				}else {
					//show more than one name
					return names.slice(0, names.length - less).join(', ') + ', and ' + less + ((less === 1) ? ' other' : ' others');
				}
			}
		}
	},

	onClick: function() {
		var errMsg = 'Unable to load chat transcript.';
		if (!this.record) {
			alert({ title: 'Error' , msg: errMsg, icon: 'warning-red'});
			return;
		}
		this.fireEvent('open-chat-transcript', this.record, 'Opening chat transcript.');
	}


});

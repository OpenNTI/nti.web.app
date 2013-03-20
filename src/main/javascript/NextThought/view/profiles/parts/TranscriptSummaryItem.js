Ext.define('NextThought.view.profiles.parts.TranscriptSummaryItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-transcriptsummary-item',

	ui: 'activity',
	cls: 'transcriptsummary-event',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'icon', style: {backgroundImage: "url('resources/images/icons/chat-32-blue.png')"}},
		{ cls: 'meta', cn:[
			{ cls: 'title', cn: [
				{tag:'span', cls:'name', html: '{owner}'},
				{tag:'span', cn: [
					{tag:'tpl', 'if':'group', html:' had a group chat with '},
					{tag:'tpl', 'if':'single', html:' had a chat with '},
					{tag:'tpl', 'if':'lonely', html:' had a chat'}
				]},
				{tag:'span', cls:'name recepients', html: '{recepient}.'}

			] },
			{cls: 'date', html: '{date}'}

		]}
	]),

	renderSelectors: {
		titleEl: ".meta .title"
	},

	initComponent: function(){
		this.callParent(arguments);
		//this.mon(this.record, 'destroy', this.destroy, this);
	},

	afterRender: function(cmp){
		var page, me = this, 
			r = me.record,
			date = new Date(r.get('CreatedTime')),
			RoomInfo = r.get('RoomInfo'),
			involved = Ext.Array.merge(r.get('Contributors'),[r.get('Creator')],[RoomInfo.get('Creator')]),
			OwnerIndex = Ext.Array.indexOf(involved, RoomInfo.get('Creator'));

		me.callParent(arguments);

		function showRecepients(u){
			var width, less = 0,
				m = new Ext.util.TextMetrics(),
				occupantsString,
				owner = (OwnerIndex >= 0)? u[OwnerIndex].getId() : RoomInfo.get('Creator');
			m.bind(me.el.down('.title'));

			owner = (isMe(owner))? 'You' : u[OwnerIndex].get('displayName');

			//remove the owner
			u = Ext.Array.remove(u,u[OwnerIndex]);

			//replace the users name with you in the array
			u.forEach(function(item,index,a){
				if(isMe(item.get('ID'))){
					u[index] = 'you';
				}else{
					u[index] = item.get('alias');
				}
			}, me);

			if(u.length <= 0){
				ne.renderData = Ext.apply(me.renderData || {},{
					owner: owner,
					lonely: true,
					recepient: "",
					date: Ext.Date.format(date, 'F j, Y')
				});
			}

			for(less = u.length; less >= 0; less--){

				me.renderData = Ext.apply(me.renderData || {},{
					owner: owner,
					group: (u.length > 1),
					single: (u.length <= 1),
					recepient: me.stringifyNames(u,less),
					date:  Ext.Date.format(date, 'F j, Y')
				});

				if(me.rendered){
					//oops...we resolved later than the render...re-render
					me.renderTpl.overwrite(me.el,me.renderData);
				}else{
					me.renderTpl.overwrite(me.renderData);
				}

				if(u.length > 1){
					occupantsString = owner + "had a group chat with" + me.stringifyNames(u, less - 1);
				}else{
					occupantsString = owner + "had a chat with" + me.stringifyNames(u, less - 1);
				}
				//width of the element
				width = me.el.down('.title').getWidth() - parseInt(me.el.getStyle('padding-right'),10);
				if( width < m.getSize(occupantsString).width){
					break;
				}
			}
		}

		function success(obj){

			if(obj && obj.isGroup){
				if(obj.isDynamicSharing()){
					//is group
					UserRepository.getUser(RoomInfo.get('Creator'),function(u){
						me.renderData = Ext.apply(me.renderData || {},{
							owner: (isMe(u))? 'You': u.get('alias'),
							group: true,
							recepient: obj.get('alias'),
							date: Ext.Date.format(date," F j, Y")
						});

						if(me.rendered){
							//oops...we resolved later than the render...re-render
							me.renderTpl.overwrite(me.el,me.renderData);
						}else{
							me.renderTpl.overwrite(me.renderData);
						}
					});
					return;
				}
			}
			
			UserRepository.getUser(involved,showRecepients);
			
		}

		function failure(obj){
			console.log("Faild to load page info");
			UserRepository.getUser(involved,showRecepients);
		}

		//get the page info
		//check if its cached
		
		page = Ext.getStore('FriendsList').getById(RoomInfo.get('ContainerId'));

		if(page){
			//its cached
			success(page);
		}else{
			$AppConfig.service.getObject(RoomInfo.get('ContainerId'),success,failure,this,true);
		}
		
		

		this.mon(this.el,'click',this.onClick,this);
	},

	stringifyNames: function(names,less){
		less = less || 0;
		names = names || 'no one';
		names = (Ext.isArray(names))? ((names.length === 0)? ['no one']: names) : [names];
		if(names.length === 1){
			//only one name in the array
			return names[0];
		}else{
			//more than one name
			if(less === 0){
				//show all the names
				if(names.length === 2){
					return names[0] + " and " + names[1];
				}else{
					return names.slice(0,names.length - 1).join(', ') + ", and "+names[names.length -1];
				}
			}else{
				if(less >= names.length){
					return names.length + " others";
				}else if(less === names.length - 1){
					//only show the first name
					return names[0] + " and " + less + ((less === 1)? " other" : " others");
				}else{
					//show more than one name
					return names.slice(0, names.length - less).join(', ') + ", and " + less + ((less === 1)? ' other' : ' others');
				}
			}
		}
	},

	onClick: function(){
		var errMsg = "Unable to load chat transcript.";
		if(!this.record){
			alert({ title : 'Error' , msg : errMsg, icon: 'warning-red'});
			return;
		}
		this.fireEvent('open-chat-transcript',this.record,'Opening chat transcript.');
	}

	
});

Ext.define('NextThought.view.profiles.parts.TranscriptSummaryItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-transcriptsummary-item',

	ui: 'activity',
	cls: 'transcriptsummary-event',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style: {backgroundImage: ''}},
		{ cls: 'meta', cn:[
			{ cls: 'title', cn: [
				{tag:'span', cls:'name', html: '{owner}'},
				{tag:'span', cn: [
					{tag:'tpl', 'if':'group', html:' had a group chat with '},
					{tag:'tpl', 'if':'single', html:' had a chat with '}
				]},
				{tag:'span', cls:'name recepients', html: '{recepient}'}

			] },
			{cls: 'date', html: '{date}'}

		]}
	]),

	initComponent: function(){
		this.callParent(arguments);
		//this.mon(this.record, 'destroy', this.destroy, this);
	},

	afterRender: function(){
		var me = this, 
			r = me.record,
			date = new Date(r.get('CreatedTime')),
			RoomInfo = r.get('RoomInfo'),
			occupants = RoomInfo.get('Occupants'),
			occupantsString = '',
			OwnerIndex = Ext.Array.indexOf(occupants, RoomInfo.get('Creator'));

		me.callParent(arguments);


		UserRepository.getUser(occupants, function(u){
			var owner = (OwnerIndex > 0)? u[OwnerIndex].get('ID') : RoomInfo.get('Creator');
			//remove the owner
			u = Ext.Array.remove(u,u[OwnerIndex]);

			//replace the users name with you in the array
			u.forEach(function(item,index,a){
				if(isMe(item.get('ID'))){
					u[index] = 'you';
				}else{
					u[index] = item.get('ID');
				}
			}, me);

			//get recepients string
			me.renderData = Ext.apply(me.renderData || {},{
				owner: (isMe(owner))? 'You' : owner,
				group: (u.length != 1),
				single: (u.length == 1),
				recepient: me.stringifyNames(u),
				date:  Ext.Date.format(date, 'F j, Y')
			});
			if(me.rendered){
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el,me.renderData);
			}else{
				me.renderTpl.overwrite(me.renderData);
			}
		});
	},

	stringifyNames: function(names,less){
		less = less || 0;
		names = names || 'no one';
		names = (Ext.isArray(names))? ((names.length == 0)? ['no one']: names) : [names];
		if(names.length == 1){
			//only one name in the array
			return names[0]
		}else{
			//more than one name
			if(less == 0){
				//show all the names
				if(names.length == 2){
					return names[0] + " and " + names[1];
				}else{
					return names.slice(0,names.length - 1).join(', ') + ", and "+names[names.length -1];
				}
			}else{
				if(less >= names.length){
					return names.length + " others";
				}else if(less == names.length - 1){
					//only show the first name
					return names[0] + " and " + less + ((less == 1)? " other" : " others");
				}else{
					//show more than one name
					return names.slice(0, names.length - less).join(', ') + ", and " + less + ((less == 1)? ' other' : ' others');
				}
			}
		}
	}

	
});

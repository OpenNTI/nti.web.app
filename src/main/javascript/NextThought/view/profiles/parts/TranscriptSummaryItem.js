Ext.define('NextThought.view.profiles.parts.TranscriptSummaryItem',{
	extend: 'Ext.Component',
	alias: 'widget.profile-activity-transcriptsummary-item',

	ui: 'activity',
	cls: 'transcriptsummary-event',

	renderTpl: Ext.DomHelper.markup([
		/*{ cls: 'avatar', style: {backgroundImage: ''}},*/
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
			RoomInfo = r.get('RoomInfo'),
			occupants = RoomInfo.get('Occupants'),
			occupantsString = '',
			OwnerIndex = Ext.Array.indexOf(occupants, RoomInfo.get('Creator'));

		me.callParent(arguments);


		UserRepository.getUser(occupants, function(u){
			var owner = u[OwnerIndex].get('ID');
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
				recepient: (u.length == 1)? u[0] : (u.slice(0 , u.length - 2)).join(',') + ", and "+u[u.length - 1] 
			});
			if(me.rendered){
				//oops...we resolved later than the render...re-render
				me.renderTpl.overwrite(me.el,me.renderData);
			}else{
				me.renderTpl.overwrite(me.renderData);
			}
		});
	}

	
});

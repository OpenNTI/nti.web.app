Ext.define('NextThought.mixins.AddGroup', {

	attachAddGroupControl: function(parent, tag){
		var link;
		this.addGroupParent = parent;
		this.addGroupTag = tag;
		link = Ext.DomHelper.append( this.addGroupParent,
				{
					tag: this.addGroupTag,
					cls: 'add-group-action selection-list-item',
					role: 'button',
					children: [
						{ tag: 'a', href: '#', html: 'Add Group' },
						{ tag: 'input', type: 'text', cls: 'new-group-input', style: 'display: none;'  }
					]
				}, true);

		link.down('a').on('click', this.addGroupClicked, this);
		link.down('input').on({
			scope: this,
			keypress: this.newGroupKeyPressed,
			keydown: this.newGroupKeyDown
		});
	},

	newGroupKeyDown: function(event) {
		var specialKeys = {
			27: true,	//Ext.EventObject.prototype.ESC
			8: true,	//Ext.EventObject.prototype.BACKSPACE
			46: true	//Ext.EventObject.prototype.DELETE
		};

		Ext.fly(event.getTarget()).removeCls('error');
		event.stopPropagation();

		if(specialKeys[event.getKey()]){
			this.newGroupKeyPressed(event);
		}
	},


	newGroupKeyPressed: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			event.stopEvent();
			this.reset();
			return false;
		}
		else if (k === event.ENTER) {
			event.stopEvent();
			this.submitNewGroup(event.getTarget().value);
			return false;
		}

		event.stopPropagation();
	},


	submitNewGroup: function(groupName){
		var input = this.getEl().down(this.addGroupTag + ' > input'),
			me = this;

		if((groupName||'').length === 0){
			return;
		}

		this.fireEvent('add-group', groupName, function(success){
			if(!success){ input.addCls('error'); }
			me.afterGroupAdd(groupName);

		});
	},

	addGroupClicked: function(e){
		var a = Ext.get(e.getTarget('a',undefined,true));

		a.next('input').setStyle('display','').focus();
		a.remove();

		e.preventDefault();
		e.stopPropagation();
		return false;
	}
});

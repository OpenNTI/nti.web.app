Ext.define('NextThought.mixins.AddGroup', {

	attachAddGroupControl: function(parent, tag){
		var link;
		this.addGroupParent = parent;
		this.addGroupTag = tag;
		this.addGroupDom = link = Ext.DomHelper.append( this.addGroupParent,
				{
					tag: this.addGroupTag,
					cls: 'add-group-action selection-list-item',
					role: 'button',
					children: [
						{ tag: 'a', href: '#', html: 'Create New List' },
						{ cls: 'input-wrap empty', style: {display: 'none'}, cn: [
							{ cls: 'clear' },
							{ tag: 'input', type: 'text', cls: 'new-group-input' },
							{ cls: 'save-button save-button-disabled', html: 'Add' }
						]}
					]
				}, true);

		link.down('a').on('click', this.addGroupClicked, this);
		link.down('.clear').on('click',this.addGroupClearBox, this);
		link.down('.save-button').on('click',function(){
			this.submitNewGroup(link.down('input').dom.value);
		}, this);
		link.down('input').on({
			scope: this,
			keypress: this.newGroupKeyPressed,
			keyup: this.keyUp,
			keydown: this.newGroupKeyDown
		});
	},

	addGroupClearBox: function(){
		var w = this.addGroupDom.down('.input-wrap');
		w.addCls('empty');
		w.down('input').dom.value = '';
		delete this.newListInputBoxActive;
		this.reset();
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

	keyUp: function(event){
		var len = event.getTarget().value.trim().length;
		this.addGroupDom.down('.input-wrap')[(len > 0)? "removeCls" : "addCls"]('empty');
		this.addGroupDom.down('.save-button')[(len > 0)? "removeCls" : "addCls"]('save-button-disabled');
	},
	
	newGroupKeyPressed: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			event.stopEvent();
			this.addGroupClearBox();
			return false;
		}
		else if (k === event.ENTER) {
			event.stopEvent();
			this.submitNewGroup(event.getTarget().value);
			return false;
		}

		if(event.getTarget().value){
			this.addGroupDom.down('.input-wrap').removeCls('empty');
		}

		event.stopPropagation();
		return true;
	},


	submitNewGroup: function(groupName){
		var input = this.addGroupDom.down('input'),
			me = this,
			friends = [];

		if((groupName.trim()||'').length === 0){
			return;
		}

		//if the control has an associated username add it to the new group. (The username is the contact we're showing, not "Me")
		if(this.username){
			friends.push(this.username);
		}

		input.blur();
		this.fireEvent('add-group', groupName, friends, function(success){
			if(!success){ input.addCls('error'); }
			me.afterGroupAdd(groupName);

		});
		delete this.newListInputBoxActive;
	},

	addGroupClicked: function(e){
		var a = Ext.get(e.getTarget('a',undefined,true)),
            wrap = a.next('.input-wrap'),
            input = wrap.down('input');

		wrap.setStyle('display','');
		a.remove();

		e.preventDefault();
		e.stopPropagation();
		this.newListInputBoxActive = true;

        // Make sure nothing steals focus while the input is visible
        input.un('blur').on('blur', function() {
            if (input.isVisible())
                input.focus(200);
        }).focus();

		return false;
	}
});

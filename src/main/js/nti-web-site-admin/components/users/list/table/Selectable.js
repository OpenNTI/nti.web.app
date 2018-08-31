export default {
	selectAll () {
		this.set('selectedUsers', this.get('items'));

		this.emitChange('selectedUsers');
	},

	deselectAll () {
		this.set('selectedUsers', []);

		this.emitChange('selectedUsers');
	},

	isAllSelected () {
		const selected = this.get('selectedUsers');
		const items = this.get('items');

		return selected && selected.length === items.length;
	},

	onSelect (user) {
		let selected = this.get('selectedUsers');

		if(!selected) {
			selected = [user];
		}
		else {
			selected.push(user);
		}

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	},

	isSelected (user) {
		return (this.get('selectedUsers') || []).some(x => x.getID() === user.getID());
	},

	onDeselect (user) {
		let selected = this.get('selectedUsers');

		selected = selected.filter(x => x.getID() !== user.getID());

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	}
};

export default {
	selectAll() {
		const selected = this.get('selectedUsers') ?? [];
		const selectedSet = new Set(selected.map(s => s.getID()));

		this.set('selectedUsers', [
			...selected,
			...(this.get('items') ?? []).filter(
				i => !selectedSet.has(i.getID())
			),
		]);

		this.emitChange('selectedUsers');
	},

	deselectAll() {
		const items = this.get('items');
		const currentSet = new Set(items.map(s => s.getID()));

		const selected = this.get('selectedUsers') ?? [];

		this.set(
			'selectedUsers',
			selected.filter(s => !currentSet.has(s.getID()))
		);

		this.emitChange('selectedUsers');
	},

	clearSelection() {
		this.set('selectedUsers', []);
	},

	isAllSelected() {
		const selected = this.get('selectedUsers') ?? [];
		const items = this.get('items');

		const selectedSet = new Set(selected.map(s => s.getID()));

		return (
			selected.length > 0 &&
			items.length > 0 &&
			items.every(i => selectedSet.has(i.getID()))
		);
	},

	onSelect(user) {
		let selected = this.get('selectedUsers');

		if (!selected) {
			selected = [user];
		} else {
			selected.push(user);
		}

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	},

	isSelected(user) {
		return (this.get('selectedUsers') || []).some(
			x => x.getID() === user.getID()
		);
	},

	onDeselect(user) {
		let selected = this.get('selectedUsers');

		selected = selected.filter(x => x.getID() !== user.getID());

		this.set('selectedUsers', selected);

		this.emitChange('selectedUsers');
	},
};

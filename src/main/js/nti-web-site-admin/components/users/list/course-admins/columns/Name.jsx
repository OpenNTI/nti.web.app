import { NameColumn } from '../../shared-columns/Name';

export const Name = NameColumn.Create({
	getUser: i => i.user,
	context: 'site-admin.course-admins-list-item',
});

import React from 'react';
import {scoped} from '@nti/lib-locale';
import {decorate} from '@nti/lib-commons';
import {searchable, contextual} from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.Deactivated', {
	deactivated: 'Deactivated Users',
	emptyMessage: 'There are no deactivated users.'
});

class AdminsTable extends React.Component {
	static deriveStateKeyFromProps = () => 'DeactivatedTable';
	static deriveFilterFromProps = () => 'deactivated';

	render () {
		return (
			<UsersTable
				filter="deactivated"
				title={t('deactivated')}
				emptyMessage={t('emptyMessage')}
				noRoleChange
			/>
		);
	}
}

export default decorate(AdminsTable, [
	searchable(),
	contextual(t('deactivated')),
	Store.connect({}),
]);

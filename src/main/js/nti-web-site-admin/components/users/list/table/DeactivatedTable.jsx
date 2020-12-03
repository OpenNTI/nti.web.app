import React from 'react';
import {scoped} from '@nti/lib-locale';
import {searchable, contextual} from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.Deactivated', {
	deactivated: 'Deactivated Users',
	emptyMessage: 'There are no deactivated users.'
});

export default
@searchable()
@contextual(t('deactivated'))
@Store.connect({})
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

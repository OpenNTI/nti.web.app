import React from 'react';
import {scoped} from '@nti/lib-locale';
import {searchable, contextual} from '@nti/web-search';

import UsersTable from './UsersTable';
import Store from './Store';

const t = scoped('nti-web-site-admin.users.list.table.AdminsTable', {
	administrators: 'Administrators',
	emptyMessage: 'There are no current administrators'
});

export default
@searchable()
@contextual(t('administrators'))
@Store.connect({})
class AdminsTable extends React.Component {
	static deriveStateKeyFromProps = () => 'AdminsTable';
	static deriveFilterFromProps = () => 'admin';

	render () {
		return <UsersTable title={t('administrators')} emptyMessage={t('emptyMessage')}/>;
	}
}

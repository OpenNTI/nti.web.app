import React from 'react';
import {scoped} from '@nti/lib-locale';

import UsersTable from './UsersTable';

const t = scoped('nti-web-site-admin.users.list.table.AdminsTable', {
	administrators: 'Administrators',
	emptyMessage: 'There are no current administrators'
});

export default class AdminsTable extends React.Component {
	render () {
		return <UsersTable filter="admin" title={t('administrators')} emptyMessage={t('emptyMessage')}/>;
	}
}

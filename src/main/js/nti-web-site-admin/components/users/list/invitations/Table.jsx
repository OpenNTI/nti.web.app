import React from 'react';

import { Table } from '@nti/web-core';

import { InvitationsStore } from './Store';
import { Name } from './columns/Name';
import { Date } from './columns/Date';

const Columns = [Name, Date];

export function InvitationsTable() {
	const { items, loading } = InvitationsStore.useProperties();

	if (loading) {
		return <div>Table Placeholder</div>;
	}

	return <Table columns={Columns} items={items} />;
}

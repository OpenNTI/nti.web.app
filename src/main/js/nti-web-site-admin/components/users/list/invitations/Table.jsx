import React from 'react';

import { Table } from '@nti/web-core';

import { InvitationsStore } from './Store';
import { Name } from './columns/Name';

const Columns = [Name];

export function InvitationsTable() {
	const { items, loading } = InvitationsStore.useProperties();

	if (loading) {
		return <div>Table Placeholder</div>;
	}

	return <Table columns={Columns} items={items} />;
}

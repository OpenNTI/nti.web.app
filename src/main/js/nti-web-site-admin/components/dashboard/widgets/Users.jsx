import React from 'react';

import { ActiveUsers } from './ActiveUsers';
import { UserCount } from './UserCount';

const Users = styled('div')`
	color: white;
	margin: 5px;
	background-color: var(--primary-blue);
	width: 230px;
	height: 300px;
	box-shadow: 0 1px 2px 1px #ccc;
	display: flex;
	flex-direction: column;

	& > * {
		flex: 1 1 auto;
		max-height: calc(50% - 10px);

		:global(.value) {
			padding-bottom: 0;
			:global(.not-available) {
				font-size: 16px;
				line-height: 20px;
			}
		}
	}
`;

export default function ActiveSessions() {
	return (
		<Users>
			<ActiveUsers />
			<UserCount />
		</Users>
	);
}

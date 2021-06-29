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
	justify-content: space-between;

	& > * {
		flex: 0 0 auto;
		max-height: calc(50% - 10px);
		font-weight: 600;

		:global(.label.label) {
			padding-bottom: 0;
			font-weight: inherit;
		}

		:global(.value.value) {
			padding-bottom: 0;
			font-weight: inherit;

			:global(.not-available) {
				font-size: 16px;
				line-height: 20px;
			}
		}
	}
`;

export const smallStyles = stylesheet`
	.value.value.value {
		font-size: 28px;
		line-height: 38px;
		font-weight: 600;
		padding-bottom: 0;
	}
`;

export default function ActiveSessions() {
	const getStyles = React.useCallback(
		value => (value > 999 ? smallStyles : null),
		[]
	);
	return (
		<Users>
			<ActiveUsers getStyles={getStyles} />
			<UserCount getStyles={getStyles} />
		</Users>
	);
}

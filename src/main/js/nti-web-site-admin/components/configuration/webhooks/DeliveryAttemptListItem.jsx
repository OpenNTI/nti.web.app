import { DateTime } from '@nti/web-core';
import { LabeledValue } from '@nti/web-commons';

import { Status } from './Status';

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	gap: var(--padding-lg, 1em);
	padding: var(--padding-sm, 0.5em);
`

export function DeliveryAttemptListItem ({item}) {
	return (
			<Container>
				<LabeledValue label="Created">
					<DateTime.ISO date={item.getCreatedTime?.()} />
				</LabeledValue>
				<LabeledValue label="Status">
					<Status item={item} />
				</LabeledValue>
				<LabeledValue label="Message">
					<div>{item.message}</div>
				</LabeledValue>
			</Container>
	)
}

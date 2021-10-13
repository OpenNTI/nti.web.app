import { DateTime, /*Avatar,*/ DisplayName } from '@nti/web-core';
import { LabeledValue } from '@nti/web-commons';

import { Status } from '../parts/Status';

/** @typedef {import('@nti/lib-interfaces').Models.subscriptions.PersistentSubscription} PersistentSubscription */

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	gap: var(--padding-lg, 1em);
	padding: var(--padding-sm, 0.5em);
`;
/**
 *
 * @param {object} props
 * @param {PersistentSubscription} props.item
 * @returns {JSX.Element}
 */
export function SubscriptionListItem({ item }) {
	return (
		<Container>
			<LabeledValue label="Created">
				<DateTime.ISO date={item.getCreatedTime?.()} />
			</LabeledValue>
			<LabeledValue label="Status">
				<Status item={item} />
			</LabeledValue>
			<LabeledValue label="Owner">
				{/* <Avatar entity={item.OwnerId} /> */}
				<DisplayName entity={item.OwnerId} />
			</LabeledValue>
		</Container>
	);
}

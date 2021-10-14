import { LinkTo } from '@nti/web-routing';
import { useLink } from '@nti/web-core';
import { EmptyState, List } from '@nti/web-commons';

import { DeliveryAttemptListItem } from './DeliveryAttemptListItem';

const Item = styled('li')`
	box-shadow: 0 1px 0 var(--color-outline-light);
`;

export function DeliveryAttemptHistory({ item }) {
	const { Items: attempts } = useLink(item, 'delivery_history');
	const empty = !attempts?.length;

	return (
		<List.Unadorned>
			{empty ? (
				<EmptyState header="No Activity Yet." />
			) : (
				attempts?.map(attempt => (
					<Item key={attempt.getID()}>
						<LinkTo.Object object={attempt}>
							<DeliveryAttemptListItem item={attempt} />
						</LinkTo.Object>
					</Item>
				))
			)}
		</List.Unadorned>
	);
}

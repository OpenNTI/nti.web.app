import { DateTime } from '@nti/web-core';
import { LinkTo } from '@nti/web-routing';

const Card = styled.div`
	border: 1px solid red;
`

export function DeliveryAttemptListItem ({item}) {
	return (
		<LinkTo.Object object={item}>
			<Card>
				<DateTime date={item.getCreatedTime?.()} />
				<div>{item.status}</div>
				<div>{item.message}</div>
			</Card>
		</LinkTo.Object>
	)
}

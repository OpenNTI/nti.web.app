import { DateTime, /*Avatar,*/ DisplayName, Text } from '@nti/web-core';
import { LabeledValue } from '@nti/web-commons';

import { Status } from '../parts/Status';
import { OwnerColumn } from '../parts/columns/Owner';
import { StatusColumn } from '../parts/columns/Status';
import { DateColumn } from '../parts/columns/Date';
import { TargetColumn } from '../parts/columns/Target';
import t from '../strings';

/** @typedef {import('@nti/lib-interfaces').Models.subscriptions.PersistentSubscription} PersistentSubscription */

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	gap: var(--padding-lg, 1em);
	padding: var(--padding-sm, 0.5em);
	flex-wrap: wrap;
	background: var(--panel-background-alt);
	border: 1px solid var(--border-grey);
	border-radius: 3px;
`;
/**
 *
 * @param {object} props
 * @param {PersistentSubscription} props.item
 * @returns {JSX.Element}
 */
export function Item({ item }) {
	return (
		<>
			<Text as="h1">{t('detail')}</Text>
			<Container>
				<LabeledValue label={StatusColumn.Name}>
					<Status item={item} />
				</LabeledValue>
				<LabeledValue label={OwnerColumn.Name}>
					{/* <Avatar entity={item.OwnerId} /> */}
					<DisplayName entity={item.OwnerId} />
				</LabeledValue>
				<LabeledValue label={DateColumn.Name}>
					<DateTime.ISO date={item.getCreatedTime?.()} />
				</LabeledValue>
				<LabeledValue
					label={TargetColumn.Name}
					css={css`
						flex: 1 1 100%;
					`}
				>
					{item.Target}
				</LabeledValue>
			</Container>
		</>
	);
}

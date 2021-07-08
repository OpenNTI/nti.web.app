import { Avatar } from '@nti/web-commons';

const List = styled.ul`
	margin: 15px;
	padding: 0;
	list-style: none;
`;

export const styles = stylesheet`
	.container {
		height: 300px;
		box-shadow: 0 1px 2px 1px #ccc;
		color: #555;
		font-weight: 300;
	}

	.item {
		display: flex;
		position: relative;
		margin-bottom: 10px;
		align-items: center;
	}

	.name {
		font-size: 14px;
		max-width: 220px;
	}

	.description {
		font-size: 12px;
		color: var(--tertiary-grey);
	}

	.info {
		font-weight: 400;
	}

	.image {
		min-width: 40px;
		width: 40px;
		height: 40px;
		margin-right: 15px;
		background-size: cover;
	}

	figure.loading {
		position: relative;
		top: 20%;
	}

	.header {
		display: flex;
		position: relative;
		margin: 0 10px 20px 15px;
		padding-top: 15px;

		.title {
			font-size: 22px;
		}

		.pager {
			display: flex;
			position: absolute;
			right: 0;

			.page-control {
				border: solid 1px #e5e5e5;
				width: 34px;
				height: 30px;
				color: #888;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;

				&.disabled {
					color: #ccc;
					pointer-events: none;
				}

				&.previous {
					border-radius: 30px 0 0 30px;
				}

				&.next {
					border-radius: 0 30px 30px 0;
				}
			}
		}
	}

	.no-items {
		margin: 16px;
	}

	.items-container {
		margin: 15px;

		.items-header {
			display: flex;
			position: relative;
			color: var(--tertiary-grey);
			font-size: 14px;
			margin-bottom: 10px;

			.column-header.value {
				position: absolute;
				right: 0;
			}
		}
	}
`;

const keyFor = (item, index) =>
	item?.getID?.() || item?.NTIID || item?.id || item?.name || index;

function ItemList({ items, component: Cmp }) {
	return !items?.length ? null : (
		<List>
			{items.map((item, i) => (
				<li key={keyFor(item, i)}>
					<Cmp item={item} />
				</li>
			))}
		</List>
	);
}

/**
 *
 * @param {Object} props
 * @param {Object} props.item
 * @param {Object} props.item.entity
 * @returns {JSX.Element}
 */
function EntityItem({ item }) {
	return (
		<div className={styles.item}>
			<Avatar rounded className={styles.image} entity={item.entity} />
			<div className={styles.info}>
				<div className={styles.name}>{item.name}</div>
				<div className={styles.description}>{item.description}</div>
			</div>
			<div className="value">{item.value}</div>
		</div>
	);
}

export function EntityList(props) {
	return <ItemList {...props} component={EntityItem} />;
}

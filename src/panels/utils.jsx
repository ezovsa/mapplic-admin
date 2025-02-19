import { ArrowLeft, ArrowUpLeft, ArrowUpRight, ArrowDownRight, ArrowDownLeft, Minus, Plus, ChevronDown } from 'react-feather'
import classNames from 'classnames'

export const controlZones = {
	'top-left': <ArrowUpLeft size={16} />,
	'top-right': <ArrowUpRight size={16} />,
	'bottom-left': <ArrowDownLeft size={16} />,
	'bottom-right': <ArrowDownRight size={16} />
}

export const locationTypes = {
	'': '(Default)',
	'hidden': 'Hidden',
	'circle': 'Circle',
	'dot': 'Dot',
	'square': 'Square',
	'rounded': 'Rounded',
	'pin1': 'Pin 1',
	'pin2': 'Pin 2',
	'thumb': 'Thumbnail',
	'pulse': 'Pulsating',
	'text': 'Text'
}

export const locationActions = {
	'': '(Default)',
	tooltip: 'Tooltip',
	none: 'Do nothing',
	sidebar: 'Sidebar popup',
	link: 'Open link'
}

export const linkTargets = {
	'': '(Default)',
	'_blank': 'Blank',
	'_self': 'Self',
	'_parent': 'Parent',
	'_top': 'Top'
}

export const unique = (value, list, key) => {
	const valid = !list.some(i => i[key].toLowerCase() === value.toLowerCase());
	if (!valid) throw Error(key.toUpperCase() + ' must be unique!');
	return valid;
}

export const filled = (value) => {
	if (!value) throw Error('This field cannot be empty!');
	return value;
}

export const validClass = (value) => {
	if (!/^[a-zA-Z]/.test(value)) throw new Error('It cannot start with a number');
	if (/\s/.test(value)) throw new Error('It cannot contain spaces');
	if (!/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('It cannot contain special characters other than underscore (_) or hyphen(-).');
	return value;
}

export const getGroups = (groups) => groups?.reduce((acc, obj) => {
	acc[obj.name] = obj.name;
	return acc;
}, {});

export const TitleToggle = ({title, checked, onChange, back, chevron}) => {
	return (
		<div className="mapplic-title-toggle" style={{marginBottom: checked ? 0 : -10}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: back ? -8 : 0}}>
				{ back && <button type="button" className="mapplic-admin-button" onClick={back}><ArrowLeft size={16} /></button> }
				<h4>{ title }</h4>
			</div>
			<button type="button" className="mapplic-admin-button" onClick={() => onChange(!checked)}>
				{ chevron ? (
					<ChevronDown size={16} className={classNames('transition-all transform', {'rotate-180': checked})} />
				) : (
					checked ? <Minus size={16} /> : <Plus size={16} />
				)}
			</button>
		</div>
	)
}

export const Tab = ({active, children, ...props}) => {
	if (!active) return null;
	return (
		<div {...props}>
			{ children }
		</div>
	)
}

export const Conditional = ({active = false, children}) => {
	if (!active) return null;
	return children;
}

export const getUniqueID = (list, prefix, keyAttribute = 'id') => {
	let maxID = 0;
	if (list) {
		maxID = list?.reduce((max, item) => {
			const id = item[keyAttribute]?.startsWith(prefix) ? parseInt(item[keyAttribute].slice(prefix.length), 10) : list.length;
			return id > max ? id : max;
		}, 0) || list?.length;
	}

	return prefix + (maxID + 1);
}
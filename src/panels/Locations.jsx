import { lazy, Suspense, useState, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { Key, Crosshair, Minus } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Upload, Color, Coord } from '../AdminFields'
import { TitleToggle, Tab, Conditional, getUniqueID, locationTypes, locationActions, unique, filled, linkTargets, getGroups } from './utils'
import Papa from 'papaparse'
import useMapplicStore from '../../../mapplic/src/MapplicStore'

const Editor = lazy(() => import('../Editor'));

const attributes = ['id', 'title', 'about', 'thumb', 'image', 'link', 'phone', 'hours', 'desc', 'color', 'style', 'label', 'scale', 'type', 'more', 'sample', 'layer', 'group', 'coord', 'latlon', 'zoom', 'action', 'hide', 'disable'];

export const Locations = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);
	const csv = useMapplicStore(state => state.csv);
	const loc = useMapplicStore(state => state.location);
	const layer = useMapplicStore(state => state.layer);
	const estPos = useMapplicStore(state => state.estPos);
	const pos = useMapplicStore(state => state.pos);

	const [location, setLocation] = useState(false);
	const [locationTab, setLocationTab] = useState('content');

	const [sample, setSample] = useState(false);

	if (!data.locations) return null;

	const importCsv = () => {
		let ids = new Set(data?.locations?.map(l => l.id));
		setData({
			csv: [],
			settings: {
				...data.settings,
				csvEnabled: false,
				csv: ''
			},
			locations: [
				...data.locations,
				...csv.filter(l => !ids.has(l.id))
			]
		});
	}

	const exportCsv = () => {
		let csv = Papa.unparse(data.locations, { columns: getAllKeys()});
		window.open('data:text/csv;charset=utf-8,' + escape(csv));
	}

	const getStyles = (empty = '(Default)') => {
		const def = {'': empty};
		if (!data?.styles) return def;
		return data.styles.reduce((acc, obj) => {
			acc[obj.class] = obj.class;
			return acc;
		}, def);
	}

	const getLayers = (empty = '(All layers)') => data?.layers?.reduce((acc, obj) => {
		acc[obj.id] = obj.name;
		return acc;
	}, {'': empty});

	const getAllKeys = () => Array.from(new Set(data?.locations.flatMap(Object.keys))).filter(key => !['chosen', 'selected'].includes(key));

	const customAttributes = () => getAllKeys().filter(key => !attributes.includes(key));

	const singleLocation = (location, updateProperty, sampled) => (
		<>
			<select
				className="flex self-center text-xs text-gray-600 bg-transparent w-auto -mt-6"
				value={location.sample || ''}
				onChange={e => updateProperty('sample', e.target.value)}
			>
				{ data?.samples.map(s => <option key={s.id} value={s.id === 'def' ? '' : s.id}>{s.title || 'Undefined'}</option>) }
				{ data?.locations.filter(l => l.sample === 'true').map(l => <option key={l.id} value={l.id === 'def' ? '' : l.id}>{l.title || 'Undefined'}</option>) }
			</select>

			<Switch value={locationTab} values={{content: 'Content', visual: 'Visual', function: 'Function'}} onChange={setLocationTab} />
			<Tab active={locationTab === 'content'} className="option-group">
				<Manual
					label="ID"
					value={location.id}
					onChange={val => updateProperty('id', val)}
					validate={val => unique(val, data.locations, 'id') && filled(val)}
					icon={<Key size={16} />}
				/>
				<Input label="Title" value={location.title} onChange={val => updateProperty('title', val)} placeholder={sampled?.title || 'Location title'} autoFocus />
				<Input label="About" value={location.about} onChange={val => updateProperty('about', val)} placeholder={sampled?.about || 'Short description'} />
				<Upload label="Thumbnail" value={location.thumb} onChange={val => updateProperty('thumb', val)} placeholder={sampled?.thumb || 'URL or text'} button={true} />
				<Upload label="Image" value={location.image} onChange={val => updateProperty('image', val)} placeholder={sampled?.image || 'Image URL'} button={true} />
				<Input label="Link" value={location.link} onChange={val => updateProperty('link', val)} placeholder={sampled?.link || 'https://' } />
				<Input label="Phone" value={location.phone} onChange={val => updateProperty('phone', val)} placeholder={sampled?.phone || 'Telephone number'} />
				<Input label="Hours" value={location.hours} onChange={val => updateProperty('hours', val)} placeholder={sampled?.hours || 'Opening hours'} />
				<Suspense fallback={<p>Loading...</p>}>
					<Editor value={location.desc} onChange={val => updateProperty('desc', val)} placeholder={sampled?.desc?.replace(/<[^>]+>/g, '') || 'Description text'} />
				</Suspense>
				{ customAttributes().map(a => <Input key={a} label={a} value={location[a]} onChange={val => updateProperty(a, val)} /> )}
			</Tab>
			<Tab active={locationTab === 'visual'} className="option-group">
				<Color label="Color" value={location.color} onChange={val => updateProperty('color', val)} placeholder={sampled?.color || 'Default'} />
				<Dropdown label="Style" value={location.style} values={getStyles()} onChange={val => updateProperty('style', val)} />
				<Input label="Label" value={location.label} onChange={val => updateProperty('label', val)} placeholder={sampled?.label || 'Marker text'} />
				<Input label="Scale" type="number" min="0" step="0.1" value={location.scale} onChange={val => updateProperty('scale', parseFloat(val))} placeholder={sampled?.scale || '1'} />
				<Dropdown label="Type" value={location.type} values={locationTypes} onChange={val => updateProperty('type', val)} />
				<Input label="More" value={location.more} onChange={val => updateProperty('more', val)} placeholder={sampled?.more || data.settings.moreText || 'More'} />
			</Tab>
			<Tab active={locationTab === 'function'} className="option-group">
				<Dropdown label="Layer" value={location.layer} values={getLayers()} onChange={val => updateProperty('layer', val)} />
				<Dropdown label="Group" active={data?.groups || data.groups?.length > 0} value={location.group || []} multiple values={getGroups(data?.groups)} onChange={val => updateProperty('group', val)} />
				<Coord label="Coord" value={location.coord} onChange={val => updateProperty('coord', val)} icon={<Crosshair size={16} />} />
				<Coord label="Lat, lon" active={data.settings.geo} value={location.latlon} onChange={val => updateProperty('latlon', val)} icon={<Crosshair size={16} />} />
				<Input label="Zoom" type="number" min="0" step="0.1" value={location.zoom} onChange={val => updateProperty('zoom', parseFloat(val))} placeholder="Auto" />
				<Dropdown label="Action" value={location.action}  values={locationActions} onChange={val => updateProperty('action', val)} />
				<Dropdown label="Link target" value={location.target}  values={linkTargets} onChange={val => updateProperty('target', val)} />
				<Switch label="Directory" value={location.hide || false} values={{false: 'Show', true: 'Hide'}} onChange={val => updateProperty('hide', val)} />
				<Switch label="Disabled" value={location.disable || false} values={{true: 'True', false: 'False'}} onChange={val => updateProperty('disable', val)} />
			</Tab>
		</>
	)

	const singleSample = (location, updateProperty) => (
		<>
			<Switch value={locationTab} values={{content: 'Content', visual: 'Visual', function: 'Function'}} onChange={setLocationTab} />
			<Tab active={locationTab === 'content'} className="option-group">
				<Manual
					label="ID"
					value={location.id}
					onChange={val => updateProperty('id', val)}
					validate={val => unique(val, data.locations, 'id') && filled(val)}
					icon={<Key size={16} />}
				/>
				<Input label="Title" value={location.title} onChange={val => updateProperty('title', val)} autoFocus />
				<Input label="About" value={location.about} onChange={val => updateProperty('about', val)} placeholder={'Short description'} />
				<Upload label="Thumbnail" value={location.thumb} onChange={val => updateProperty('thumb', val)} placeholder="URL or text" button={true} />
				<Upload label="Image" value={location.image} onChange={val => updateProperty('image', val)} placeholder="Image URL" button={true} />
				<Input label="Link" value={location.link} onChange={val => updateProperty('link', val)} placeholder="https://" />
				<Input label="Phone" value={location.phone} onChange={val => updateProperty('phone', val)} placeholder="Telephone number" />
				<Input label="Hours" value={location.hours} onChange={val => updateProperty('hours', val)} placeholder="Opening hours" />
				<Suspense fallback={<p>Loading...</p>}>
					<Editor value={location.desc} onChange={val => updateProperty('desc', val)} placeholder={'Description text'} />
				</Suspense>
				{ customAttributes().map(a => <Input key={a} label={a} value={location[a]} onChange={val => updateProperty(a, val)} /> )}
			</Tab>
			<Tab active={locationTab === 'visual'} className="option-group">
				<Color label="Color" value={location.color} onChange={val => updateProperty('color', val)} placeholder="Default" />
				<Dropdown label="Style" value={location.style} values={getStyles()} onChange={val => updateProperty('style', val)} />
				<Input label="Label" value={location.label} onChange={val => updateProperty('label', val)} placeholder="Marker text" />
				<Input label="Scale" type="number" min="0" step="0.1" value={location.scale} onChange={val => updateProperty('scale', parseFloat(val))} placeholder="1" />
				<Dropdown label="Type" value={location.type} values={locationTypes} onChange={val => updateProperty('type', val)} />
				<Input label="More" value={location.more} onChange={val => updateProperty('more', val)} placeholder={data.settings.moreText || 'More'} />
			</Tab>
			<Tab active={locationTab === 'function'} className="option-group">
				<Dropdown label="Layer" value={location.layer} values={getLayers()} onChange={val => updateProperty('layer', val)} />
				<Dropdown label="Group" active={data?.groups || data.groups?.length > 0} value={location.group || []} multiple values={getGroups(data?.groups)} onChange={val => updateProperty('group', val)} />
				<Input label="Zoom" type="number" min="0" step="0.1" value={location.zoom} onChange={val => updateProperty('zoom', parseFloat(val))} placeholder="Auto" />
				<Dropdown label="Action" value={location.action}  values={locationActions} onChange={val => updateProperty('action', val)} />
				<Dropdown label="Link target" value={location.target}  values={linkTargets} onChange={val => updateProperty('target', val)} />
				<Switch label="Directory" value={location.hide || false} values={{false: 'Show', true: 'Hide'}} onChange={val => updateProperty('hide', val)} />
				<Switch label="Disabled" value={location.disable || false} values={{true: 'True', false: 'False'}} onChange={val => updateProperty('disable', val)} />
			</Tab>
		</>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group" style={{gap: 24}}>
						<AdminItems
							highlight
							selected={location}
							setSelected={setLocation}
							label="Locations"
							list={data.locations}
							setList={val => updateList('locations', val)}
							preselected={loc}
							newItem={{id: getUniqueID(data.locations, 'loc'), title: 'New location', desc: 'Add location description here.', coord: [pos?.x || 0.5, pos?.y || 0.5], layer: layer || false}}
							keyAttribute="id"
							nameAttribute="title"
							back={() => setOpened(false)}
							samples={true}
						/>

						<EstimatedCoordinates count={data.locations.filter(l => !l.coord && l.id in estPos).length} />
						<LocationRecognizer unlinked={Object.entries(estPos).filter(([k, v]) => data.locations.every(l => l.id !== k) && csv.every(l => l.id !== k) && v.layer === layer)} />
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={sample}
							setSelected={setSample}
							label="Samples"
							list={data.samples}
							setList={val => updateList('samples', val)}
							def={{id:'def', title: 'Default', group:[]}}
							newItem={{id: getUniqueID(data.samples, 'sample'), title: 'New sample'}}
							keyAttribute="id"
							nameAttribute="title"
						/>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="External CSV" checked={data.settings.csvEnabled} onChange={checked => updateSetting('csvEnabled', checked)} />
						<Conditional active={data.settings.csvEnabled}>
							<Upload label="CSV source" value={data.settings.csv} placeholder="Path to CSV" onChange={(val) => updateSetting('csv', val)} button="true" />
							<div className="mapplic-panel-inline">
								<button className="mapplic-button alt" disabled={!data.settings.csv} onClick={importCsv}>Import CSV</button>
								<button className="mapplic-button alt" disabled={data?.locations?.length < 1} onClick={exportCsv}>Export CSV</button>
							</div>
						</Conditional>
					</div>
				</div>
			</div>
			<div className="panel-child">
				<AnimatePresence>
					{ location &&
						<AdminItemSingle
							list={data.locations}
							setList={val => updateList('locations', val)}
							selected={location}
							setSelected={setLocation}
							keyAttribute="id" 
							nameAttribute="title"
							render={singleLocation}
							samples={data.samples}
						/>
					}
					{ sample &&
						<AdminItemSingle
							list={data.samples}
							setList={val => updateList('samples', val)}
							selected={sample}
							setSelected={setSample}
							keyAttribute="id" 
							nameAttribute="title"
							render={singleSample}
							def={sample === 'def'}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});

const EstimatedCoordinates = ({count}) => {
	const locations = useMapplicStore(state => state.data.locations);
	const setData = useMapplicStore(state => state.setData);
	const estPos = useMapplicStore(state => state.estPos);
	
	const saveEstimates = () => {
		setData({
			locations: locations.map(l => ({...l, ...estPos[l?.id]}))
		})
	}
	
	if (count < 1) return null;
	return (
		<p className="mapplic-notification mapplic-warning">
			<b>{count}</b> locations use estimated coordinates. <button onClick={saveEstimates}>Click here</button> to fix it.
		</p>
	)
}

const LocationRecognizer = ({unlinked}) => {
	const data = useMapplicStore(state => state.data);
	const setData = useMapplicStore(state => state.setData);

	const recognize = () => {
		if (unlinked.length < 1) alert('There are no unlinked interactive elements on this layer.');
		else if (confirm(`There are ${unlinked.length} unlinked interactive elements on this layer. Would you like to auto-populate them?`)) {
			const newLocations = unlinked.map(l => ({id: l[0], title: l[0].toUpperCase(), type: 'hidden', ...l[1]}));
			setData({
				locations: [...newLocations, ...data.locations]
			});
		}
	}

	if (unlinked.length < 1) return null;
	return <button className="mapplic-button alt bg-red-500" onClick={recognize}>Recognize SVG <Minus size="16" /> {unlinked.length}</button>
}
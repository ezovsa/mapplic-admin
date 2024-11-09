import { useState, forwardRef } from 'react'
import { Panel } from '../Panel'
import { AnimatePresence } from 'framer-motion'
import { AdminItems, AdminItemSingle } from '../AdminItems'
import { ArrowLeft, Key } from 'react-feather'
import { Switch, Input, Manual, Dropdown, Upload, Color } from '../AdminFields'
import { controlZones, TitleToggle, unique, filled, validClass, getUniqueID, Conditional } from './utils'
import useMapplicStore from '../../../mapplic/src/MapplicStore'

export const Settings = forwardRef(({setOpened, updateSetting, updateList}, ref) => {
	const data = useMapplicStore(state => state.data);
	const setTransition = useMapplicStore(state => state.setTransition);
	const setTarget = useMapplicStore(state => state.setTarget);

	const [breakpoint, setBreakpoint] = useState(false);
	const [legendItem, setLegendItem] = useState(false);

	const singleBreakpoint = (breakpoint, updateProperty) => (
		<div className="option-group">
			<Manual
				label="Text"
				value={breakpoint.name}
				onChange={val => updateProperty('name', val)}
				validate={val => unique(val, data?.breakpoints, 'name') && filled(val) && validClass(val)}
				icon={<Key size={16} />}
				autoFocus
			/>
			<Input label="Below" type="number" value={breakpoint.below} min="1" onChange={val => updateProperty('below', parseFloat(val))} suffix="PX" />
			<Switch label="Portrait" value={breakpoint.portrait || false} onChange={val => updateProperty('portrait', val)} />
			<Input label="Sidebar" type="number" active={!breakpoint.portrait} value={breakpoint.sidebar} min="1" placeholder="Default" onChange={val => updateProperty('sidebar', parseFloat(val))} suffix="W" />
			<Dropdown label="Type" value={breakpoint.type} values={{list: 'List', grid: 'Grid'}} onChange={val => updateProperty('type', val)} />
			<Input label="Column" type="number" value={breakpoint.column} min="1" placeholder="1" onChange={val => updateProperty('column', parseInt(val))} suffix="NR" />
			<Input label="Container" type="number" value={breakpoint.container} min="1" placeholder="Auto" onChange={val => updateProperty('container', parseFloat(val))} suffix="H" />
			<Input label="Element" active={breakpoint.portrait} type="number" value={breakpoint.element} min="1" placeholder="Auto" onChange={val => updateProperty('element', parseFloat(val))} suffix="H" />
		</div>
	)

	const singleLegendItem = (legendItem, updateProperty) => (
		<div className="option-group">
			<Manual
				label="ID"
				value={legendItem.id}
				onChange={val => updateProperty('id', val)}
				validate={val => unique(val, data?.legend, 'id') && filled(val)}
				icon={<Key size={16} />}
			/>
			<Input label="Text" value={legendItem.text} onChange={val => updateProperty('text', val)} placeholder="Visible text" autoFocus />
			<Upload label="Icon" value={legendItem.icon} onChange={val => updateProperty('icon', val)} placeholder="URL or text" button={true} />
			<Color label="Color" value={legendItem.color} onChange={val => updateProperty('color', val)} placeholder="Default" />
			<Input label="Scale" type="number" min="0" step="0.1" value={legendItem.scale} onChange={val => updateProperty('scale', parseFloat(val))} placeholder="1" />
			<Input label="Radius" type="number" min="0" step="1" value={legendItem.radius} onChange={val => updateProperty('radius', parseFloat(val))} placeholder="4" />
			<Switch label="Disabled" value={legendItem.disable || false} values={{true: 'True', false: 'False'}} onChange={val => updateProperty('disable', val)} />
		</div>
	)

	return (
		<Panel ref={ref}>
			<div className="panel-content">
				<div className="panel-inner">
					<div className="mapplic-panel-group">
						<div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8, marginTop: -8}}>
							<button type="button" className="mapplic-admin-button" onClick={() => setOpened(false)}><ArrowLeft size={16} /></button>
							<h4>Settings</h4>
						</div>
						<div className="mapplic-panel-options">
							<Switch label="Fullscreen" value={data.settings.fullscreen} values={controlZones} onChange={val => updateSetting('fullscreen', val)} nullValue="" />
							<Switch label="Hover tooltip" value={data.settings.hoverTooltip} onChange={checked => updateSetting('hoverTooltip', checked)} />
							<Switch label="Hover about" active={data.settings.hoverTooltip} value={data.settings.hoverAbout || false} onChange={checked => updateSetting('hoverAbout', checked)} />
							<Switch label="Deeplinking" value={data.settings.deeplinking || false} onChange={checked => updateSetting('deeplinking', checked)} />
							<Input label="Padding" type="number" min="0" value={data.settings.padding} suffix="PX" onChange={(val, step) => updateSetting('padding', parseFloat(val), step)} placeholder="0" />
							<Input label="Scroll top" type="number" min="0" value={data.settings.scrollTop} suffix="PX" onChange={(val, step) => updateSetting('scrollTop', parseFloat(val), step)} placeholder="0" />
							<Switch label="Accessibility" value={data.settings.accessibility || false} values={{true: 'Plus', false: 'Normal'}} onChange={val => updateSetting('accessibility', val)}/>
						</div>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={breakpoint}
							setSelected={setBreakpoint}
							label="Responsivity"
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							def={{name: 'all-screens', below: 8000}}
							newItem={{name: getUniqueID(data.breakpoints, 'breakpoint', 'name')}}
							keyAttribute="name"
							nameAttribute="name"
						/>
					</div>

					<div className="mapplic-panel-group">
						<TitleToggle title="Zoom and pan" checked={data.settings.zoom} onChange={checked => updateSetting('zoom', checked)} />
						<Conditional active={data.settings.zoom}>
							<div className="mapplic-panel-options">
								<Input
									label="Max zoom"
									type="number"
									min="1"
									value={data.settings.maxZoom}
									onChange={(val, step) => {
										const safeVal = Math.max(parseFloat(val), 1);
										updateSetting('maxZoom', safeVal, step);
										setTransition({duration: 0.4});
										setTarget({scale: safeVal});
									}}
								/>
								<Switch label="Reset button" value={data.settings.resetButton} values={controlZones} onChange={val => updateSetting('resetButton', val)} nullValue="" />
								<Switch label="Zoom buttons" value={data.settings.zoomButtons} values={controlZones} onChange={val => updateSetting('zoomButtons', val)} nullValue="" />
								<Switch label="Mousewheel" value={'mouseWheel' in data.settings ? data.settings.mouseWheel : true} onChange={checked => updateSetting('mouseWheel', checked)} />
								{/* <Switch label="Reduce motion" value={data.settings.reduceMotion || false} onChange={checked => updateSetting('reduceMotion', checked)} /> */}
								<Switch label="Shift key" value={data.settings.mouseWheelShift || false} active={data.settings.mouseWheel} onChange={checked => updateSetting('mouseWheelShift', checked)} values={{true: 'Required', false: 'No'}}  />
								<Switch label="Close reset" value={data.settings.closeReset || false} onChange={checked => updateSetting('closeReset', checked)} />
							</div>
						</Conditional>
					</div>

					<div className="mapplic-panel-group">
						<AdminItems
							selected={legendItem}
							setSelected={setLegendItem}
							label="Legend"
							list={data.legend}
							setList={val => updateList('legend', val)}
							newItem={{id: getUniqueID(data.legend, 'item'), text: 'Item text'}}
							keyAttribute="id"
							nameAttribute="text"
						/>
						<div className="mapplic-panel-options">
							<Switch label="Position" value={data.settings.legend} values={controlZones} onChange={val => updateSetting('legend', val)} nullValue="" />
							<Input label="Columns" type="number" min="1" value={data.settings.legendColumns} onChange={(val, step) => updateSetting('legendColumns', parseInt(val), step)} placeholder="1" />
							<Switch label="Horizontal" value={data.settings.legendHorizontal || false} values={{true: 'True', false: 'False'}} onChange={val => updateSetting('legendHorizontal', val)}/>
							<Switch label="Toggle" value={data.settings.legendToggle || false} onChange={checked => updateSetting('legendToggle', checked)} />
							<Switch label="By default" active={data.settings.legendToggle || false} value={data.settings.legendClosed || false} values={{false: 'Opened', true: 'Closed'}} onChange={checked => updateSetting('legendClosed', checked)} />
							<Input label="Title" value={data.settings.legendTitle} onChange={val => updateSetting('legendTitle', val)} placeholder="Map legend" />
						</div>
					</div>

					<div className="mapplic-panel-group">
						<h4>Translations</h4>
						<div className="mapplic-panel-options">
							<Input label="Button" value={data.settings.moreText} onChange={val => updateSetting('moreText', val)} placeholder="More" />
							<Input label="Search" value={data.settings.searchText} onChange={val => updateSetting('searchText', val)} placeholder="Search" />
							<Input label="Clear all" value={data.settings.clearText} onChange={val => updateSetting('clearText', val)} placeholder="Clear all" />
							<Input label="Found" value={data.settings.foundText} onChange={val => updateSetting('foundText', val)} placeholder="found" />
							<Input label="No results" value={data.settings.noresultsText} onChange={val => updateSetting('noresultsText', val)} placeholder="No results found." />
						</div>
					</div>
				</div>
			</div>

			<div className="panel-child">
				<AnimatePresence>
					{ breakpoint &&
						<AdminItemSingle
							list={data.breakpoints}
							setList={val => updateList('breakpoints', val)}
							selected={breakpoint}
							setSelected={setBreakpoint}
							keyAttribute="name" 
							nameAttribute="name"
							render={singleBreakpoint}
							def={breakpoint === 'all-screens'}
						/>
					}
					{ legendItem &&
						<AdminItemSingle
							list={data.legend}
							setList={val => updateList('legend', val)}
							selected={legendItem}
							setSelected={setLegendItem}
							keyAttribute="id" 
							nameAttribute="text"
							render={singleLegendItem}
						/>
					}
				</AnimatePresence>
			</div>
		</Panel>
	)
});
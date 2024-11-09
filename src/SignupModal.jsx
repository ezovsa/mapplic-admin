import { Modal } from 'react-responsive-modal'
import { X, Minus } from 'react-feather'

export const SignupModal = ({open, setOpen}) => {

	const closeModal = () => {
		setOpen(false);
	}

	return (
		<Modal open={open} onClose={closeModal} closeIcon={<X size={16}/>} center>
			<div className="flex flex-col gap-4 max-w-md">
				<h3 className="text-2xl font-bold">Saving disabled</h3>
				<p>Saving is disabled in <b>test mode</b>. To enable map saving, please create an account.</p>
				<div className="flex justify-between">
					<button className="btn btn-sm" onClick={() => setOpen(false)}>Keep exploring</button>
					<a href="/register" className="btn btn-secondary btn-sm">
						Sign up
						<Minus className="opacity-50" size={16} />
						<span className="font-normal text-sm">It's free</span>
					</a>
				</div>
			</div>
		</Modal>
	)
}
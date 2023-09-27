export function HasLicenses() {
	return (
		<div className="w-full flex flex-col gap-8">
			<div className="px-8 py-9">
				<div className="flex flex-col justify-center bg-[#F5F5F5] px-5 py-7 rounded-2xl gap-4">
					<p className="text-base font-semibold">Want to send more claims?</p>
					<p className="text-sm text-[#525252]">
						Purchase additional licenses to increase the number of claims submitted per challenge
					</p>
					<button
						onClick={() => alert("no")}
						className="w-48 bg-[#F30919] text-sm text-white p-2 uppercase font-semibold"
					>
						Buy Now
					</button>
				</div>
			</div>

			<div className="w-full">
				<table className="w-full bg-white">
					<thead className="text-[#A3A3A3]">
					<tr className="flex text-left text-[12px] uppercase px-8">
						<th className="w-12 px-4 py-2">No.</th>
						<th className="w-1/4 px-4 py-2">License</th>
						<th className="w-1/6 px-4 py-2">Date</th>
						<th className="w-1/6 px-4 py-2">Receipt</th>
					</tr>
					</thead>
					<tbody>
					<tr className="bg-[#FAFAFA] flex px-8 text-sm">
						<td className="w-12 px-4 py-2">1</td>
						<td className="w-1/4 px-4 py-2">Xai Vanguard Node License</td>
						<td className="w-1/6 px-4 py-2">2023-09-26</td>
						<td className="w-1/6 px-4 py-2">
							<a
								className="text-[#F30919] cursor-pointer"
								onClick={() => window.electron.openExternal("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
							>
								View
							</a>
						</td>
					</tr>
					<tr className="text-[#A3A3A3] text-sm flex px-8">
						<td className="w-12 px-4 py-2">-</td>
						<td className="w-1/4 px-4 py-2">Empty License Slot</td>
					</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

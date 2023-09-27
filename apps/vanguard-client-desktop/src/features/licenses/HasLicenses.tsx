export function HasLicenses() {
	return (
		<div className="w-full flex flex-col px-8 py-9 gap-8">
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

			<div className="container mx-auto p-4">
				<table className="w-full bg-white">
					<thead className="flex text-gray-400">
					<tr>
						<th className="w-4 px-4 py-2">No.</th>
						<th className="w-64 px-4 py-2">License</th>
						<th className="w-8 px-4 py-2">Date</th>
						<th className="w-8 px-4 py-2">Receipt</th>
					</tr>
					</thead>
					<tbody>
					<tr className="bg-[#F5F5F5]">
						<td className="border px-4 py-2">1</td>
						<td className="border px-4 py-2">Xai Vanguard Node License</td>
						<td className="border px-4 py-2">2023-09-26</td>
						<td className="border px-4 py-2">Receipt A</td>
					</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

export function BorderWrapperComponent({children, customStyle}: {children: React.ReactNode, customStyle?: string }) {
	return (
		<div className={`border-1 border-silverMist rounded-xl shadow-shadowGrey shadow-md mb-5 ${customStyle}`}>
			{children}
		</div>
	)
}
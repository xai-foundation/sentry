import {TestInput} from '@xai-vanguard-node/ui';

const Sandbox = () => {
    return (
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-bold text-center">Heading 1 </h1>
            <h2 className="text-xl font-semibold text-center">Heading 2</h2>
            <h3 className="text-lg font-medium text-center">Heading 3</h3>
            <p className="text-base text-center">This is a paragraph demonstrating the default text styles in Tailwind CSS.</p>
            <TestInput/>
            <button className="px-4 py-2 bg-blue-600 text-white rounded self-center">Button</button>
        </div>
    );
};

export default Sandbox;


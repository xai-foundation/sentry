import { InputHTMLAttributes } from 'react';

export const TestInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input {...props} className="shadow appearance-none border-2 border-red-500 rounded-full w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-4 focus:border-red-600 focus:shadow-outline" type="text" placeholder="Your text dasd." />
    );
};

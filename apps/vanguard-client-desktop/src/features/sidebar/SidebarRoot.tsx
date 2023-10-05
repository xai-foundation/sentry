import { Link } from 'react-router-dom';
import {FaDiscord} from 'react-icons/fa';
import {FiGitCommit} from "react-icons/fi";
import {RiKey2Line, RiTwitterXFill} from "react-icons/ri";
import {AiOutlineCloudUpload} from "react-icons/ai";
import {SiGitbook} from "react-icons/si";
import {Web3Button} from "@web3modal/react";

/**
 * Sidebar component
 * @returns JSX.Element
 */
function Sidebar() {
    return (
        <div className="sticky h-screen w-64 bg-white border-r border-gray-200 text-gray-600 p-5 z-10">
            <div className="mb-5">
                <h2 className="text-gray-400 text-base mb-2 uppercase">Vanguard Node</h2>
                <Link to="/" className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FiGitCommit className="mr-2" /> Home
                </Link>

                <Link to="/licenses" className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <RiKey2Line className="mr-2" /> Licenses  <span className="ml-auto bg-red-500 text-xs text-white rounded-full px-2">1</span>
                </Link>
            </div>

            <div className="mb-5">
                <h2 className="text-gray-400 text-base mb-2 uppercase">Help</h2>
                <a onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/")} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <AiOutlineCloudUpload className="mr-2" /> Set up on Cloud
                </a>
                <a onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/")} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <SiGitbook className="mr-2" /> Gitbook
                </a>
            </div>

            <div>
                <h2 className="text-gray-400 text-base mb-2 uppercase">Social</h2>
                <a onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaDiscord className="mr-2" /> Discord
                </a>
                <a onClick={() => window.electron.openExternal('https://twitter.com/xai_games')} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <RiTwitterXFill className="mr-2" /> X
                </a>
            </div>


            {/*		todo: for dev purposes only, delete once persisting storage is implemented		*/}
            <div className="absolute bottom-0 left-0 p-4">
                <Web3Button/>
            </div>
        </div>
    );
}

export default Sidebar;

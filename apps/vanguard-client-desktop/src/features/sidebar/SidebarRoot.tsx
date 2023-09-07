import { Link } from "@tanstack/react-router";
import { FaHome, FaCog, FaQuestion, FaEnvelope, FaTwitter, FaDiscord } from 'react-icons/fa';

/**
 * Sidebar component
 * @returns JSX.Element
 */
function Sidebar() {
    return (
        <div className="fixed h-screen w-64 bg-transparent border-r border-gray-400 text-gray-600 p-5">
            <div className="mb-5">
                <h2 className="text-gray-400 text-base mb-2 uppercase">Vanguard Node</h2>
                <Link to="/" className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaHome className="mr-2" /> Home
                </Link>
                <Link to="/licenses" className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaCog className="mr-2" /> Licenses  <span className="ml-auto bg-red-500 text-xs text-white rounded-full px-2">1</span>
                </Link>
            </div>
            <div className="mb-5">
                <h2 className="text-gray-400 text-base mb-2 uppercase">Help</h2>
                <Link to="/set-up-on-cloud" className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaQuestion className="mr-2" /> Set up on Cloud
                </Link>
                <a onClick={() => window.electron.openExternal('https://xai-foundation.gitbook.io/xai-network/xai-odyssey/thirdweb/creator-portal')} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaEnvelope className="mr-2" /> Gitbook
                </a>
            </div>
            <div>
                <h2 className="text-gray-400 text-base mb-2 uppercase">Social</h2>
                <a onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaDiscord className="mr-2" /> Discord
                </a>
                <a onClick={() => window.electron.openExternal('https://twitter.com/xai_games')} className="flex items-center mb-2 text-gray-600 hover:text-gray-400 cursor-pointer">
                    <FaTwitter className="mr-2" /> X
                </a>
            </div>
        </div>
    );
}

export default Sidebar;
import React from 'react';
import { ShareIcon } from '../icons/IconsComponents';

/**
 * Interface for ShareButton props
 */
interface ShareButtonProps {
    buttonTitle: string;            // The title to be shared.
    buttonText: string;             // The text to be shared.
    shareUrl: string;               // The URL to be shared.
    shareButtonClasses?: string;    // Custom CSS classes for the share button.
}

/**
 * ShareButton Component
 *
 * A button that uses the Web Share API to share a URL if supported.
 *
 * @param {ShareButtonProps} props - Component props.
 * @param {string} props.buttonText - The text to be shared.
 * @param {string} props.buttonTitle - The title to be shared.
 * @param {string} props.shareUrl - The URL to be shared.
 * @param {string} [props.shareButtonClasses] - Custom CSS classes for the share button.
 *
 * @returns {JSX.Element} - A button that enables sharing functionality.
 */
const ShareButton: React.FC<ShareButtonProps> = ({ buttonText, buttonTitle, shareUrl, shareButtonClasses }) => {

    /**
     * handleShare - Triggers the Web Share API to share the provided title, text, and URL.
     * Checks if the Web Share API is available before sharing.
     *
     * @async
     * @returns {Promise<void>}
     */
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: buttonTitle,
                    text: buttonText,
                    url: shareUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            console.error('Web Share API is not supported in this browser.');
        }
    };

    return (
        <button
            onClick={handleShare}
            className={shareButtonClasses || 'px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'}
            aria-label="Share this with a friend"
        >
            <ShareIcon />
        </button>
    );
};

export default ShareButton;

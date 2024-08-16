'use client'
import { useState } from "react";

function DownloadCliComponent() {
    const [downloadLink, setDownloadLink] = useState('');
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            console.log(downloadLink)
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ downloadLink }),
            });
            if (!response.ok) {
                throw new Error('Download failed');
            }
            const data = await response.json();
            const { version } = data;
            if (version) {
                setLatestVersion(version);
                setError(null)
            } else {
                setError(error || "Download failed")
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error downloading:', error);
            setError('Download failed. Check console for details.');
        }
    };

    const handleChange = (e: any) => {
        setDownloadLink(e.target.value);
    };

    return (
        <div>
            <p>
                Download
            </p>
            <br />
            {isLoading && <div className="loader"></div>}
            <div>
                <input
                    type="text"
                    id="cliVersion"
                    name="cliVersion"
                    value={downloadLink}
                    onChange={handleChange}
                    placeholder="Enter CLI download link"
                />
                <button onClick={handleDownload} disabled={!downloadLink}>
                    Download CLI version
                </button>
            </div>
            <br />
            <div>
                {latestVersion && <p>Latest version: {latestVersion}</p>}
                {error && <p>ERROR: {error}</p>}
            </div>
        </div>
    )
};

export default DownloadCliComponent;
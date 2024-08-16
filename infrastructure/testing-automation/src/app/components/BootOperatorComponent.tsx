'use client'
import { useEffect, useState } from "react";

function BootOperatorComponent() {

    const [versions, setVersions] = useState<string[]>([]);
    const [version, setVersion] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [isOperatorRunning, setIsOperatorRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorOperator, setErrorOperator] = useState(null);

    const handleStartOperator = async () => {
        setIsLoading(true);
        setResponseMessage('');
        try {
            const response = await fetch('/api/boot-operator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ version, privateKey }),
            });
            if (!response.ok) {
                throw new Error('Failed to start version');
            }
            const data = await response.json();
            setResponseMessage(data.message || 'Program started successfully');
            setError('');
            setIsOperatorRunning(true);
        } catch (error) {
            console.error('Error starting version:', error);
            setError('Failed to start version. Please try again.');
            setResponseMessage('');
        }
    };

    const handleStopOperator = async () => {
        setResponseMessage('');
        try {
            const response = await fetch('/api/stop-operator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to stop operator');
            }
            const data = await response.json();
            setResponseMessage(data.message || 'Program stopped successfully');
            setError('');
            setIsOperatorRunning(false);
        } catch (error) {
            console.error('Error stopping version:', error);
            setError('Failed to stop version.');
            setResponseMessage('');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch versions when component mounts
        const fetchVersions = async () => {
            try {
                const response = await fetch('/api/get-versions');
                if (!response.ok) {
                    throw new Error('Failed to fetch versions');
                }
                const data = await response.json();
                setVersions(data.versions || []);
            } catch (error) {
                console.error('Error fetching versions:', error);
                setVersions([]);
            }
        };
        const checkOperatorStatus = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/operator-status");
                const data = await response.json();

                if (response.ok) {
                    setIsOperatorRunning(data.running);
                } else {
                    setErrorOperator(data);
                }
            } catch (err: any) {
                setErrorOperator(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
        checkOperatorStatus();
    }, []);

    return (
        <div>
            <p>
                Boot Operator
            </p>
            {isOperatorRunning && <p>Please stop the previous operator before starting a new one</p>}
            <br />
            <div>
                <select value={version} onChange={(e) => setVersion(e.target.value)}>
                    <option value="">Select version</option>
                    {versions.map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
                <input
                    type="text"
                    id="privateKey"
                    name="privateKey"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter private key"
                />
            <button onClick={handleStartOperator} disabled={!version || !privateKey || isLoading || isOperatorRunning}>
                {isLoading ? 'Running...' : 'Start Operator'}
            </button>
            <button onClick={handleStopOperator} disabled={!isOperatorRunning}>
                Stop Operator
            </button>
            </div>
            <br />
            <div>
            {responseMessage && <p>{responseMessage}</p>}
            {error && <p>{error}</p>}
            </div>
        </div>
    )
};

export default BootOperatorComponent;
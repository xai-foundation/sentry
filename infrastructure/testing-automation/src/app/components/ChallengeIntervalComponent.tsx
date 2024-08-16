'use client'

import { useEffect, useState } from "react";

function ChallengeIntervalComponent() {

    const [intervalSecs, setIntervalSecs] = useState<number>();
    const [intervalRunning, setIntervalRunning] = useState(0);
    const [loading, setLoading] = useState(true);
    const [init, setInit] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallengeInterval = async () => {
            try {
                const response = await fetch('/api/get-challenge-interval');
                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                setIntervalRunning(data.interval);
                setLoading(false);
                setInit(true);
            } catch (error) {
                console.error('Error challenge interval:', error);
            }
        };
        if (!init) {
            fetchChallengeInterval();
        }
    }, [init]);

    const handleChange = (e: any) => {
        setIntervalSecs(e.target.value >= 0 ? e.target.value : 0);
    };

    const handleStartInterval = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/start-challenge-interval', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ interval: intervalSecs }),
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
            setIntervalRunning(intervalSecs!);
        } catch (error) {
            console.error('Error starting challenge interval:', error);
            setError(`Failed to start challenge interval. ${error}`);
        } finally {
            setLoading(false);
        }
    }

    const handleStopInterval = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stop-challenge-interval');
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
            const data = await response.json();
            setIntervalRunning(0);
        } catch (error) {
            console.error('Error stopping challenge interval:', error);
            setError(`Failed to stop challenge interval. ${error}`);
        } finally {
            setLoading(false);
        }
    }

    return (<div>
        <p>
            Challenge Interval
        </p>
        <br />
        <div>
            <input
                type="number"
                id="intervalSecs"
                name="intervalSecs"
                value={intervalSecs}
                onChange={handleChange}
                placeholder="Enter interval in seconds"
            />
            <button onClick={handleStartInterval} disabled={!intervalSecs || intervalRunning !== 0 || loading}>
                Start Challenge Interval
            </button>
            <button onClick={handleStopInterval} disabled={!intervalRunning || loading}>
                Stop Challenge Interval
            </button>
        </div>
        <br />
        {!loading && <div>
            {intervalRunning !== 0 ?
                <p style={{ color: 'green' }}>Challenge interval running with {intervalRunning} second{intervalRunning == 1 ? '' : 's'}.</p>
                :
                <p style={{ color: 'blue' }}>Challenge interval stopped.</p>}
            {error && <p style={{ color: 'red' }}>ERROR: {error}</p>}
        </div>}
    </div>);
}

export default ChallengeIntervalComponent;

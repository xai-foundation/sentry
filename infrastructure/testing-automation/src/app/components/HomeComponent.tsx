"use client";

import { useState } from "react";

export function HomeComponent() {
    const [data, setData] = useState("");
    const [loading, setLoading] = useState(false);

    const submitChallenge = async () => {
        try {
            setLoading(true);
            const response = await fetch("api/submit-challenge", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ operatorStart: true }),
            })

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit challenge: ${errorText}`);
            }

            const data = await response.json();
            console.log('Challenge submitted successfully:', data);
            setData(data.assertionId);
            setLoading(false);
            return data;

        } catch (error) {
            console.error('Error in submitChallenge:', error);
            throw error;
        }
    }

    return (
        <div style={{minWidth: "300px"}}>
            <p>
                Challenge
            </p>
            <br></br>
            <button onClick={() => submitChallenge()}>Submit Challenge</button>
            {loading && <p style={{ color: "blue", marginTop: "10px" }}>Loading...</p>}
            {data && !loading && <p style={{ color: "green", marginTop: "10px" }}>Submitted Challenge Assertion ID {data}</p>}
        </div>
    )
}
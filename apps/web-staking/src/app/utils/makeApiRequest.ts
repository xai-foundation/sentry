
export const makeApiRequest = async (uri: string, body: Record<string, unknown>) => {       
        //Fetch data
        const response = await fetch(uri, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Network response error");
        }

        //Parse response
        return response.json();
};
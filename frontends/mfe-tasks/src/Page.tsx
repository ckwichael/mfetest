import React from "react";

export interface MfePageProps {
    userName?: string;
}

const Page: React.FC<MfePageProps> = ({ userName }) => {
    return (
        <div>
            <h1>Tasks Page</h1>
            <p>This is a full-page static UI for the Tasks microfrontend.</p>

            <h3>Demo Tasks</h3>
            <ol>
                <li>Set up containers for shell + MFEs</li>
                <li>Configure registry endpoints</li>
                <li>Add more microfrontends dynamically</li>
            </ol>

            <p style={{ marginTop: 16 }}>
                Current user: <strong>{userName ?? "Guest"}</strong>
            </p>
        </div>
    );
};

export default Page;

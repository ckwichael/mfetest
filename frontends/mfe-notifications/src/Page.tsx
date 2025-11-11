import React from "react";

export interface MfePageProps {
    userName?: string;
}

const Page: React.FC<MfePageProps> = ({ userName }) => {
    return (
        <div>
            <h1>Notifications Page</h1>
            <p>Static notifications center for demo.</p>

            <ul>
                <li>[Info] CI pipeline completed successfully.</li>
                <li>[Info] Registry received 3 microfrontend registrations.</li>
                <li>[Warning] Demo certificate expires in 30 days.</li>
            </ul>

            <p style={{ marginTop: 16 }}>
                Viewer: <strong>{userName ?? "Guest"}</strong>
            </p>
        </div>
    );
};

export default Page;

"use client";

import { Button } from "./ui/button";

const PrintButton = () => {
    return (
        <Button
            className="btn-secondary flex-1"
            onClick={() => window.print()}
        >
            Download PDF Report
        </Button>
    );
};

export default PrintButton;

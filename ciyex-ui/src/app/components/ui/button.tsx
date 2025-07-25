import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline";
}

export const Button = ({ children, variant = "primary", ...props }: ButtonProps) => {
    const className =
        variant === "outline"
            ? "btn-outline"
            : "btn-primary";

    return (
        <button className={className} {...props}>
            {children}
        </button>
    );
};

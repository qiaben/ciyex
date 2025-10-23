"use client";
import Button from "@/components/ui/button/Button";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function SignInForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const keycloakEnabled = process.env.NEXT_PUBLIC_KEYCLOAK_ENABLED === 'true';
    const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
    const keycloakRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
    const keycloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: { exp: number } = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    router.push("/dashboard");
                }
            } catch {
                // Invalid token
            }
        }
    }, [router]);

    // Generate PKCE code verifier and challenge
    const generateCodeVerifier = () => {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    const generateCodeChallenge = async (verifier: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(hash)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    const handleKeycloakSignIn = async () => {
        if (!keycloakEnabled || !keycloakUrl || !keycloakRealm || !keycloakClientId) {
            console.error("Keycloak is not properly configured");
            return;
        }

        setLoading(true);

        try {
            // Generate PKCE parameters
            const codeVerifier = generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            // Store code verifier for later use in callback
            sessionStorage.setItem('pkce_code_verifier', codeVerifier);

            const redirectUri = window.location.origin + "/callback";
            const authUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth`;
            
            const params = new URLSearchParams({
                client_id: keycloakClientId,
                redirect_uri: redirectUri,
                response_type: "code",
                scope: "openid profile email",
                code_challenge: codeChallenge,
                code_challenge_method: "S256",
            });

            window.location.href = `${authUrl}?${params.toString()}`;
        } catch (error) {
            console.error("Error generating PKCE parameters:", error);
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="mb-3 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Welcome to Ciyex EHR
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign in with your Aran account to continue
                    </p>
                </div>

                <div className="space-y-4">
                    <Button 
                        className="w-full flex items-center justify-center gap-3 py-3" 
                        size="md" 
                        onClick={handleKeycloakSignIn}
                        disabled={loading || !keycloakEnabled}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Redirecting to Aran...</span>
                            </>
                        ) : (
                            <>
                                <svg 
                                    className="w-5 h-5" 
                                    fill="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                </svg>
                                <span>Sign in with Aran</span>
                            </>
                        )}
                    </Button>

                    {!keycloakEnabled && (
                        <div className="text-sm text-center text-amber-600 border border-amber-200 bg-amber-50 py-2 px-4 rounded">
                            Keycloak authentication is not configured. Please contact your administrator.
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}

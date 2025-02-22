"use client"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ExternalLink, RotateCw, SquareDashedMousePointer } from "lucide-react";

export default function RunHtml({ src }) {
    const [url, setUrl] = useState(src);
    const [enterUrl, setEnterUrl] = useState(src);
    const [erudaActive, setErudaActive] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        setUrl(src);
    }, [src]);

    const handleIframeLoad = () => {
        try {
            // Get current iframe URL safely
            const iframe = iframeRef.current;
            if (iframe && iframe.contentWindow) {
                const currentUrl = iframe.contentWindow.location.href;
                setEnterUrl(currentUrl);
                
                // Inject Eruda debugger
                const iframeDoc = iframe.contentWindow.document;
                const erudaScript = iframeDoc.createElement('script');
                erudaScript.src = '//cdn.jsdelivr.net/npm/eruda';
                erudaScript.onload = () => {
                    const initScript = iframeDoc.createElement('script');
                    initScript.textContent = `
                        eruda.init({
                            useShadowDom: false,
                            defaults: { displaySize: 50, theme: 'Dark' }
                        });
                        // Hide Eruda's native entry button
                        const style = document.createElement('style');
                        style.textContent = '.eruda-entry-btn { display: none !important; }';
                        document.head.appendChild(style);
                    `;
                    iframeDoc.head.appendChild(initScript);
                };
                iframeDoc.head.appendChild(erudaScript);
            }
        } catch (error) {
            // Handle cross-origin security errors
            console.log("Could not access iframe URL:", error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col ">
            <div className="flex gap-x-1 p-1 items-center">
                <div className="flex items-center justify-center">
                    <Button variant="outline"
                        className="h-6 w-6 p-1 hover:bg-accent focus:bg-accent [&_svg]:size-3"
                        onClick={() => {
                            const iframe = iframeRef.current;
                            if (iframe && iframe.contentWindow) {
                                iframe.contentWindow.location.reload();
                            }
                        }}
                    >
                        <RotateCw className="" />
                    </Button>
                </div>
                <Input
                    id="url-input"
                    value={enterUrl}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setUrl(enterUrl);
                        }
                    }}
                    onChange={(e) => {
                        setEnterUrl(e.target.value);
                    }}
                    placeholder="Enter URL"
                    className="w-full p-1 text-xs h-auto flex-1 hover:bg-accent focus:bg-accent"
                />
                <div className="flex items-center justify-center gap-x-1">
                    <Button variant="outline"
                        className="h-6 w-6 p-1 hover:bg-accent focus:bg-accent [&_svg]:size-3"
                        onClick={() => {
                            // open inspect in eruda
                            const iframe = iframeRef.current;
                            if (erudaActive) {
                                setErudaActive(false);
                                iframe.contentWindow.eruda.hide();
                            } else {
                                setErudaActive(true);
                                iframe.contentWindow.eruda.show();
                            }
                        }}
                    >
                        <SquareDashedMousePointer className="" />
                    </Button>
                    <Button variant="outline"
                        className="h-6 w-6 p-1 hover:bg-accent focus:bg-accent [&_svg]:size-3"
                        onClick={() => {
                            window.open(enterUrl, '_blank');
                        }}
                    >
                        <ExternalLink className="" />
                    </Button>
                </div>
            </div>
            <iframe 
                ref={iframeRef}
                src={url}
                onLoad={handleIframeLoad}
                className="w-full h-full border-0"
                title="Reforkit - HTML Preview"
                sandbox="allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-downloads-without-user-activation allow-presentation allow-orientation-lock allow-scripts"
                allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; display-capture; encrypted-media; execution-while-not-rendered; execution-while-out-of-viewport; fullscreen; gamepad; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; navigation-override; oversized-images; payment; picture-in-picture; publickey-credentials; speaker-selection; sync-xhr; unoptimized-images; unsized-media; usb; screen-wake-lock; web-share; xr-spatial-tracking; clipboard-read; clipboard-write"
                allowFullScreen={true}
                allowtransparency="true"
                allowpaymentrequest="true"
                allowpopups="true"
            />
        </div>
    );
}
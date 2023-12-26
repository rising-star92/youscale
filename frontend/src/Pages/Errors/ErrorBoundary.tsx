import React, { Component, ErrorInfo, ReactNode } from "react";
import './error.css'

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <section className="page_404">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 ">
                                <div className="col-sm-10 col-sm-offset-1  text-center">
                                    <div className="four_zero_four_bg">
                                        <h1 className="text-center ">Ooops</h1>
                                    </div>
                                    <div className="contant_box_404">
                                        <h3 className="h2">Youscale a rencontré un problème </h3>
                                        <p>Veuillez contactez un des administrateurs du site</p>
                                        <a href="" className="link_404">
                                            Revenir
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

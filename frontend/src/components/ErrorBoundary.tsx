import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";

// ... rest of the file is the same
interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}
class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
            <p className="mt-4">Please try refreshing the page or go back home.</p>
            <Link to="/" className="px-4 py-2 mt-6 font-semibold text-white rounded-md bg-primary">
                Go Home
            </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
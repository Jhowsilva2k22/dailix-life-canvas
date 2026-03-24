import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#F1F5F9" }}>
          <div className="flex flex-col items-center text-center px-4">
            <p style={{ color: "#0F172A", fontSize: 18, fontWeight: 400 }}>Algo deu errado.</p>
            <p className="mt-2" style={{ color: "#64748B", fontSize: 14, fontWeight: 300 }}>
              Tente recarregar a pagina.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-4 px-6 py-2.5 text-sm text-white rounded-lg"
              style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", fontWeight: 400 }}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

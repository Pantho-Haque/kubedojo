import { Component } from 'react';

// If the simulator ever throws while rendering, show a way out instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash" role="alert">
        <h1>Something broke in the simulator.</h1>
        <p>Your saved files are untouched. Reload to start a fresh simulated world.</p>
        <pre>{String(this.state.error && this.state.error.message || this.state.error)}</pre>
        <p><button type="button" className="btn btn-primary" onClick={() => location.reload()}>Reload</button> <a className="btn" href="/">Back to the home page</a></p>
      </div>
    );
  }
}

import React from "react";

import {
  AlertCircle,
  ArrowRight,
  Gem,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, information) {
    console.error(
      "YOUR MOMENT rendering error:",
      error,
      information
    );
  }

  reloadWebsite = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "25px",
          background: "#F8F5EE",
          color: "#173A35",
          fontFamily:
            "'DM Sans', Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "630px",
            padding:
              "clamp(30px, 6vw, 65px)",
            background: "#FFFDF8",
            border: "1px solid #E3E6D9",
            textAlign: "center",
            boxShadow:
              "0 30px 75px #102D2A0C",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "37px",
            }}
          >
            <Gem
              size={27}
              color="#A98E5B"
            />

            <strong
              style={{
                letterSpacing: "0.08em",
                fontSize: "1.02rem",
              }}
            >
              YOUR MOMENT.
            </strong>
          </div>

          <AlertCircle
            size={34}
            strokeWidth={1.4}
            color="#B39762"
          />

          <h1
            style={{
              margin: "25px 0",
              fontFamily:
                "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400,
              fontSize:
                "clamp(3.4rem, 8vw, 5.7rem)",
              lineHeight: 0.95,
            }}
          >
            A momentary
            <br />
            <em
              style={{
                color: "#A38A5C",
              }}
            >
              interruption.
            </em>
          </h1>

          <p
            style={{
              maxWidth: "450px",
              margin: "0 auto 31px",
              color: "#819083",
              fontSize: "0.88rem",
              lineHeight: 1.9,
            }}
          >
            Something unexpected interrupted
            this website concept. You can
            reload the page to try again.
          </p>

          <button
            type="button"
            onClick={this.reloadWebsite}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "11px",
              minHeight: "54px",
              padding: "15px 25px",
              background: "#173A35",
              border: "1px solid #173A35",
              color: "#FFFDF8",
              fontSize: "0.77rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={17} />

            Reload Experience

            <ArrowRight size={17} />
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginTop: "40px",
              color: "#9D956F",
              fontSize: "0.66rem",
            }}
          >
            <ShieldCheck size={17} />
            YOUR MOMENT · PORTFOLIO CONCEPT
          </div>
        </section>
      </main>
    );
  }
}
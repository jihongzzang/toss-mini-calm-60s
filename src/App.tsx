/** @jsxImportSource @emotion/react */
import {css, keyframes} from "@emotion/react";
import {lazy, Suspense} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import {ThemeProvider} from "@toss/tds-mobile";
import ErrorBoundary from "./components/ErrorBoundary";
import BottomNav from "./components/BottomNav";
import {TDSMobileAITProvider} from "@toss/tds-mobile-ait";

const Home = lazy(() => import("./pages/Home"));
const ModeSelect = lazy(() => import("./pages/ModeSelect"));
const Session = lazy(() => import("./pages/Session"));
const Complete = lazy(() => import("./pages/Complete"));
const History = lazy(() => import("./pages/History"));

const appLayoutStyle = css`
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
`;

const contentAreaStyle = css`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const pageEnter = keyframes`
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pageTransitionStyle = css`
  animation: ${pageEnter} 0.3s ease-out;
`;

export default function App() {
  const location = useLocation();

  return (
    <TDSMobileAITProvider>
      <ThemeProvider>
        <div css={appLayoutStyle}>
          <div css={contentAreaStyle}>
            <ErrorBoundary>
              <Suspense fallback={null}>
                <div key={location.pathname} css={pageTransitionStyle}>
                  <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/mode-select" element={<ModeSelect />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/complete" element={<Complete />} />
                    <Route path="/history" element={<History />} />
                  </Routes>
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
          <BottomNav />
        </div>
      </ThemeProvider>
    </TDSMobileAITProvider>
  );
}

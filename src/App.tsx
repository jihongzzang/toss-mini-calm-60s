/** @jsxImportSource @emotion/react */
import {css, keyframes} from "@emotion/react";
import {Routes, Route, useLocation} from "react-router-dom";
import {ThemeProvider} from "@toss/tds-mobile";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import ModeSelect from "./pages/ModeSelect";
import Session from "./pages/Session";
import Complete from "./pages/Complete";
import History from "./pages/History";
import {TDSMobileAITProvider} from "@toss/tds-mobile-ait";

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
            <div key={location.pathname} css={pageTransitionStyle}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/mode-select" element={<ModeSelect />} />
                <Route path="/session" element={<Session />} />
                <Route path="/complete" element={<Complete />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </div>
          </div>
          <BottomNav />
        </div>
      </ThemeProvider>
    </TDSMobileAITProvider>
  );
}

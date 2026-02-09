import {Routes, Route} from "react-router-dom";
import {ThemeProvider} from "@toss/tds-mobile";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import ModeSelect from "./pages/ModeSelect";
import Session from "./pages/Session";
import Complete from "./pages/Complete";
import History from "./pages/History";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mode-select" element={<ModeSelect />} />
        <Route path="/session" element={<Session />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/history" element={<History />} />
      </Routes>
      <BottomNav />
    </ThemeProvider>
  );
}

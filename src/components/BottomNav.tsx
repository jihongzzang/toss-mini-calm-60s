/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";
import {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Text, Asset} from "@toss/tds-mobile";
import {SafeAreaInsets} from "@apps-in-toss/web-bridge";

const wrapperStyle = css`
  flex-shrink: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
`;

const navStyle = css`
  height: 56px;
  display: flex;
  align-items: center;
`;

const tabStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const iconWrapStyle = css`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const activeColor = "#3182F6";
const inactiveColor = "#8B95A1";

const TABS = [
  {label: "홈", path: "/", icon: "icon-home-mono"},
  {label: "기록", path: "/history", icon: "icon-chart-mono"},
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bottomInset, setBottomInset] = useState(() => {
    try {
      return SafeAreaInsets.get().bottom;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const unsubscribe = SafeAreaInsets.subscribe({
      onEvent: (insets) => {
        setBottomInset(insets.bottom);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const hideNavPaths = ["/mode-select", "/session", "/complete"];
  const shouldHide = hideNavPaths.some((path) => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return (
    <div css={wrapperStyle} className="bottom-nav">
      <nav css={navStyle}>
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          const color = isActive ? activeColor : inactiveColor;

          return (
            <div key={tab.path} css={tabStyle} onClick={() => navigate(tab.path)}>
              <div css={iconWrapStyle}>
                <Asset.Icon name={tab.icon} color={color} frameShape={Asset.frameShape.CleanW24} />
              </div>
              <Text typography="t7" color={color}>
                {tab.label}
              </Text>
            </div>
          );
        })}
      </nav>
      {bottomInset > 0 && <div style={{height: bottomInset}} />}
    </div>
  );
}

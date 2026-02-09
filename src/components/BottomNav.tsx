/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Text } from '@toss/tds-mobile';

const navStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  z-index: 100;
`;

const tabStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const activeColor = '#3182F6';
const inactiveColor = '#8B95A1';

interface TabItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function TabItem({ label, icon, isActive, onClick }: TabItemProps) {
  return (
    <div css={tabStyle} onClick={onClick}>
      <div style={{ color: isActive ? activeColor : inactiveColor }}>
        {icon}
      </div>
      <Text
        typography="t7"
        style={{ color: isActive ? activeColor : inactiveColor }}
      >
        {label}
      </Text>
    </div>
  );
}

// 간단한 아이콘 SVG
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17v-6H7l5-7v6h4l-5 7z" />
    </svg>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // 플로우 화면에서는 탭 숨김
  const hideNavPaths = ['/mode-select', '/session', '/complete'];
  const shouldHide = hideNavPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  const tabs = [
    { label: '홈', path: '/', icon: <HomeIcon /> },
    { label: '기록', path: '/history', icon: <HistoryIcon /> },
  ];

  return (
    <nav css={navStyle} className="bottom-nav">
      {tabs.map(tab => (
        <TabItem
          key={tab.path}
          label={tab.label}
          path={tab.path}
          icon={tab.icon}
          isActive={location.pathname === tab.path}
          onClick={() => navigate(tab.path)}
        />
      ))}
    </nav>
  );
}

/** @jsxImportSource @emotion/react */
import {css} from "@emotion/react";
import {Component, type ReactNode} from "react";
import {Text, Button} from "@toss/tds-mobile";
import { textPrimary, textSecondary } from '../styles/tokens';

interface Props {
  children: ReactNode;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
}

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 40px 20px;
  text-align: center;
  gap: 12px;
`;

const emojiStyle = css`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ctaStyle = css`
  margin-top: 24px;
  width: 100%;
  max-width: 320px;
`;

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  handleReset = () => {
    this.setState({hasError: false});
    window.location.href = this.props.fallbackRoute ?? "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div css={containerStyle}>
          <span css={emojiStyle}>😵‍💫</span>
          <Text typography="t3" fontWeight="bold" color={textPrimary}>
            잠시 문제가 생겼어요
          </Text>
          <Text typography="t5" color={textSecondary}>
            다시 시도해 주세요
          </Text>
          <div css={ctaStyle}>
            <Button display="block" size="xlarge" color="primary" onClick={this.handleReset}>
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

'use client';

import { CSSProperties } from 'react';
import styled from 'styled-components';

interface Props {
  $css?: CSSProperties;
}

const Box = styled.div.attrs<Props>((props) => ({
  style: props.$css,
}))<Props>`
  box-sizing: border-box;
`;

export default Box;

import React from 'react';
import styled from 'styled-components';

const WebcamBox = React.forwardRef((p, ref) => (
    <WebcamBoxOuter>
        <WebcamBoxInner>
            <WebcamVideo autoPlay playsInline muted ref={ref} width="224" height="224" />
        </WebcamBoxInner>
    </WebcamBoxOuter>
));

const WebcamBoxOuter = styled.div`
    background: black;
    border: 1px solid #585858;
    border-radius: 4px;
    box-sizing: border-box;
    display: inline-block;
    padding: 9px;
`;

const WebcamBoxInner = styled.div`
    border: 1px solid #585858;
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    overflow: hidden;
    width: 160px;
`;

const WebcamVideo = styled.video`
    height: 160px;
    transform: scaleX(-1);
`;

export default WebcamBox;

import React from 'react';
import styled from 'styled-components';

const Header = props => {
    const { isWebcamFailed } = props;

    return (
        <header>
            <HeaderElement>
                Turn your <HeaderBold>Web Camera</HeaderBold> into a controller using a
                <HeaderBold> Neural Network</HeaderBold>.
            </HeaderElement>
            {isWebcamFailed && (
                <ErrorElement>
                    No webcam found. <br />
                    To use this demo, use a device with a webcam.
                </ErrorElement>
            )}
        </header>
    );
};

const HeaderElement = styled.header`
    background-color: #ef6c00;
    border-bottom: solid 1px rgba(0, 0, 0, 0.4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.7);
    font-size: 30px;
    font-weight: 300;
    line-height: 1.45em;
    overflow: hidden;
    padding: 20px 0;
    position: relative;
    text-align: center;
    -webkit-font-smoothing: antialiased;
`;

const ErrorElement = styled.div`
    text-align: center;
    font-size: 30px;
    color: white;
    padding: 30px;
    line-height: 30px;
`;

const HeaderBold = styled.b`
    color: rgba(255, 255, 255, 1);
    font-weight: 400;
`;

export default Header;

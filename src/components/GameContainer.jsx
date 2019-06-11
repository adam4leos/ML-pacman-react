import React from 'react';
import styled from 'styled-components';

const GameContainer = () => (
    <Container>
        <Logo id="logo">
            <LogoL id="logo-l">
                <LogoB id="logo-b" />
            </LogoL>
        </Logo>
    </Container>
);

const Container = styled.div`
    background: black;
    padding: 25px 0 40px;
`;

const Logo = styled.div`
    background: url('https://storage.googleapis.com/tfjs-examples/assets/webcam-transfer-learning/bck.png');
    background-repeat: no-repeat;
    background-position-y: -5px;
    margin: 0 auto;
    position: relative;
    transform: scale(1.2);
    width: 554px;

    #pcm-c {
        border-top: none;
        margin: 0 auto;
        position: relative;
        top: 20px;
    }
`;

const LogoL = styled.div`
    background: #990;
    display: none;
    height: 2px;
    left: 177px;
    overflow: hidden;
    position: absolute;
    top: 157px;
    width: 200px;
`;

const LogoB = styled.div`
    background: #ff0;
    height: 8px;
    left: 0;
    position: absolute;
    width: 0;
`;

export default GameContainer;

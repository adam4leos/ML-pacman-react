import React from 'react';
import styled from 'styled-components';

const PanelCell = ({ onMouseDown, side }) => (
    <div className="panel-cell">
        <ThumbBox>
            <ThumbBoxOuter>
                <ThumbBoxInner>
                    <ThumbCanvas width="224" height="224" id={`${side}-thumb`} />
                </ThumbBoxInner>
                <ReacordButton onMouseDown={onMouseDown}>
                    <ButtonLabel>Add Sample</ButtonLabel>
                </ReacordButton>
            </ThumbBoxOuter>
            <TotalLabel>
                <span id={`${side}-total`}>0</span> examples
            </TotalLabel>
        </ThumbBox>
    </div>
);

const ThumbBox = styled.div`
    display: inline-block;
`;

const ThumbBoxOuter = styled.div`
    background: black;
    border: 1px solid #585858;
    border-radius: 4px;
    box-sizing: border-box;
    display: inline-block;
    padding: 9px;
    position: relative;
    transition: box-shadow 0.3s;
`;

const ThumbBoxInner = styled.div`
    border: 1px solid #585858;
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    overflow: hidden;
    width: 66px;
`;

const ThumbCanvas = styled.canvas`
    height: 66px;
    transform: scaleX(-1);
`;

const ReacordButton = styled.button`
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
`;

const ButtonLabel = styled.span`
    background: #111;
    border: 1px solid #585858;
    border-radius: 3px;
    bottom: 9px;
    color: #f8f8f8;
    display: block;
    font-size: 8px;
    left: 9px;
    position: absolute;
    right: 9px;
    opacity: 0.5;
`;

const TotalLabel = styled.p`
    color: #8b8b8b;
    font-size: 10px;
    margin: 0;
    padding: 0;
    text-align: center;
`;

export default PanelCell;

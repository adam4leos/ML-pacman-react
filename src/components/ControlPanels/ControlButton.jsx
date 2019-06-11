import React from 'react';
import styled from 'styled-components';

import buttonImage from './../../../images/button.svg';

const CONTROL_BUTTON_IMAGE_SIZE = 66;

const ControlButton = ({ onClickHandler, label }) => (
    <ControlButtonElement onClick={onClickHandler}>
        <ControlButtonImage src={buttonImage} />
        <ControlButtonLabel>{label}</ControlButtonLabel>
    </ControlButtonElement>
);

const ControlButtonElement = styled.button`
    align-items: center;
    display: flex;
    flex-direction: row;
`;

const ControlButtonImage = styled.img`
    width: ${CONTROL_BUTTON_IMAGE_SIZE}px;
    height: ${CONTROL_BUTTON_IMAGE_SIZE}px;
`;

const ControlButtonLabel = styled.span`
    border-bottom: 2px solid #484848;
    border-top: 2px solid #484848;
    color: #aaa;
    display: inline-block;
    font-size: 18px;
    font-weight: 500;
    padding: 9px 11px;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
`;

export default ControlButton;

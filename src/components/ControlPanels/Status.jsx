import React, { Component } from 'react';
import styled from 'styled-components';

import pointerImage from './../../../images/pointer.svg';

const LOADING_STATUS_TEXT = 'Loading mobilenet...';
const TIP_STATUS_TEXT = 'Click to add the current camera view as an example for that control  \u2193';

const Status = ({ isLoading }) => <StatusElement>{isLoading ? LOADING_STATUS_TEXT : TIP_STATUS_TEXT}</StatusElement>;
const StatusElement = styled.div`
    color: #f8f8f8;
    font-weight: 300;
    margin: 12px 0;
    text-align: center;
`;

export default Status;

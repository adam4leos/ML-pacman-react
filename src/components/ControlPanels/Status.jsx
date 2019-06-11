import React, { Component } from 'react';
import styled from 'styled-components';

const Status = () => <StatusElement>Loading mobilenet...</StatusElement>;
const StatusElement = styled.div`
    color: #f8f8f8;
    font-weight: 300;
    margin: 12px 0;
    text-align: center;
`;

export default Status;

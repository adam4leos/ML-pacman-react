import React from 'react';
import styled from 'styled-components';

const Dropdown = ({ label, selectID, values }) => (
    <DropdownElement>
        <DropdownLabel>{label}</DropdownLabel>
        <DropdownSelectWrap className="select">
            <DropdownSelect id={selectID}>
                {values.map(value => (
                    <option value={value}>{value}</option>
                ))}
            </DropdownSelect>
        </DropdownSelectWrap>
    </DropdownElement>
);

const DropdownElement = styled.div`
    flex-direction: column;
    width: 110px;
    margin-bottom: 10px;
`;

const DropdownLabel = styled.label`
    color: #777;
    font-size: 11px;
    display: block;
    font-weight: 300;
    line-height: 1;
`;

const DropdownSelectWrap = styled.div`
    position: relative;

    &::after {
        content: 'arrow_drop_down';
        color: #999;
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 18px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        position: absolute;
        right: 0;
        top: 6px;
        pointer-events: none;
    }
`;

const DropdownSelect = styled.select`
    -webkit-appearance: none;
    -moz-appearance: none;
    background: none;
    border: none;
    border-bottom: solid 1px #313131;
    border-radius: 0;
    color: #c9c9c9;
    display: block;
    font-size: 12px;
    outline: none;
    padding: 6px 0;
    width: 100%;
`;

export default Dropdown;

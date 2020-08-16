import React from 'react';
import styled from 'styled-components';
import { shell } from 'electron';
import icon from '../../../assets/icon_256x256.png';

const About = ({ global }) => {
  const { store, actions } = global;
  const { version } = store;
  const isMac = window.navigator.platform === 'MacIntel';

  const openInBrowser = () => {
    shell.openExternal('https://alessioforte.github.io/transee/');
  };

  return (
    <Style>
      {isMac && <div id="frame">About</div>}
      <div className="container">
        <img id="icon" src={icon} />

        <div id="b_d">
          <div id="title">
            <b>Transee</b>
          </div>
          <div id="version">{version}</div>
          <div id="site">
            website:{' '}
            <a id="link" onClick={openInBrowser}>
              transee
            </a>
          </div>
          <div id="author">
            <p>
              Created with <span>❤</span> by Alessio Forte
              <br id="year" />
              {`Copyright © ${new Date().getFullYear()}`}
            </p>
          </div>
        </div>
      </div>
    </Style>
  );
};

export default About;

const Style = styled.div`
  * {
    padding: 0;
    margin: 0;
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
    color: #fff;
    max-height: 250px;
    overflow: hidden;
  }
  body {
    -webkit-user-select: none;
    cursor: default;
    overflow: hidden;
    background: rgba(42, 42, 42, 1);
  }
  #frame {
    color: #aaa;
    background: rgba(26, 26, 26, 1);
    padding-top: 5px;
    height: 18px;
    font-size: 12px;
    text-align: center;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }
  .container {
    margin: 23px;
  }
  #icon {
    width: 180px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    padding-right: 20px;
  }
  #b_d {
    display: inline-block;
    vertical-align: top;
    padding-top: 10px;
    margin-left: 40px;
    text-align: center;
  }
  #title {
    font-size: 28px;
    color: white;
  }
  #version {
    opacity: 0.8;
    margin: 0px;
    font-size: 12px;
    letter-spacing: 1.5px;
  }
  #site {
    margin: 0px;
    font-size: 12px;
    margin-top: 25px;
    letter-spacing: 1px;
  }
  #link {
    transition: 0.3s;
    color: #0077b5;
    cursor: pointer;
  }
  #link:hover {
    color: #00aff0;
  }
  #author {
    font-size: 12px;
    letter-spacing: 1px;
    margin-top: 30px;
    opacity: 0.5;
    letter-spacing: 1px;
    transition: 0.3s;
  }
  #author:hover {
    opacity: 1;
  }
  span {
    color: darkred;
  }
`;

import React from 'react';
import styled from 'styled-components';
// import { shell } from 'electron';
import Layout from '../../containers/Layout';
import icon from '../../../../assets/icon_256x256.png';
import theme, { getColorLuminance } from '../../theme';
import { useStore } from 'renderer/store';

const About = () => {
  const store = useStore()
  const { version } = store;

  const openInBrowser = () => {
    // shell.openExternal('https://alessioforte.github.io/transee/');
  };

  return (
    <Layout title="About">
      <Style>
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
                Created with <span>❤</span> by <b>Alessio Forte</b>
                <br id="year" />
                {`Copyright © ${new Date().getFullYear()}`}
              </p>
            </div>
          </div>
        </div>
      </Style>
    </Layout>
  );
};

export default About;


const { colors } = theme;

const Style = styled.div`
  * {
    padding: 0;
    margin: 0;
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
    color: ${colors.text.main};
    max-height: 250px;
    overflow: hidden;
  }
  body {
    -webkit-user-select: none;
    cursor: default;
    overflow: hidden;
  }
  .container {
    margin: 23px;
  }
  #icon {
    width: 180px;
    border-right: 1px solid ${colors.foreground};
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
    color: ${colors.text.main};
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
    color: ${colors.text.info};
    cursor: pointer;
  }
  #link:hover {
    color: ${getColorLuminance(colors.text.info, 0.9)};
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
    color: red;
    font-size: 16px;
  }
  b {
    font-weight: bold;
    color: ${colors.text.main};
  }
`;

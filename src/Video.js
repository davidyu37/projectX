import React, { Component } from 'react';
import './Video.css';
import CLE_LOGO from './assets/cle.png';
import WAR_LOGO from './assets/war.png';
import LOGO from './assets/Keepballin.png';

class Video extends Component {
    constructor(props) {
        super(props);
    }

    addPadding(number) {
        let finalString = number.toString();
        if (finalString.length < 2) {
            finalString = '0' + number
        }
        return finalString;
    }

    render() {
        const {
            stream,
            gameData,
            broadcaster
        } = this.props;
        const { homeScore, awayScore} = gameData;
        if(stream) {
            return (
                <div>
                    <div className="scoreboard">
                        <div className="column stand-pad">
                            <img className="team-logos" src={CLE_LOGO} />
                            <h3 className="team-title">Cleveland</h3>
                        </div>
                        <div className="column stand-pad">
                            <div className="scores">
                                <div className="column score">{homeScore ? homeScore : 0}</div>
                                <div className="column timer">
                                    {gameData.time && this.addPadding(gameData.time.minutes)}:{gameData.time && this.addPadding(gameData.time.seconds)}
                                    <hr/>
                                    {gameData.quarter}
                                </div>
                                <div className="column score">{awayScore ? awayScore : 0}</div>
                            </div>
                        </div>
                        <div className="column stand-pad">
                            <img className="team-logos" src={WAR_LOGO} />
                            <h3 className="team-title">Warriors</h3>
                        </div>
                    </div>
                    {broadcaster ? 
                    <video className="video-size" src={stream} autoPlay/> : 
                    <div className="video-placeholder">
                        <img className="team-logos" src={LOGO} />
                        <p>直播讯号停止</p>
                    </div>
                    }
                </div>
            );
        } else {
            return (
                <div>
                    <div className="scoreboard">
                        <div className="column stand-pad">
                            <img className="team-logos" src={CLE_LOGO}/>
                            <h3 className="team-title">Cleveland</h3>
                        </div>
                        <div className="column stand-pad">
                            <div className="scores">
                                <div className="column score">{homeScore ? homeScore : 0}</div>
                                <div className="column timer">
                                    --:--
                                    <hr/>
                                    <div style={{fontSize: '.5em'}}>
                                        未开始
                                    </div>
                                </div>
                                <div className="column score">{awayScore ? awayScore : 0}</div>
                            </div>
                        </div>
                        <div className="column stand-pad">
                            <img className="team-logos" src={WAR_LOGO} />
                            <h3 className="team-title">Warriors</h3>
                        </div>
                    </div>
                    <div className="video-placeholder">
                        <img className="team-logos" src={LOGO} />
                        <p>直播未开始</p>
                    </div>
                </div>
            )
        }
    }
}

export default Video;

import React, { Component } from 'react';
import './App.css';
import Video from './Video';
import socket from './api';
import { Select, Button, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'Initializing',
      socketID: '',
      selectedGame: '',
      joined: false,
      mediaStream: '',
      gameData: {},
      message: '',
      messages: [],
      broadcaster: null
    }
    this.textChange = this.textChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.selectGame = this.selectGame.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveGame = this.leaveGame.bind(this);
  }

  componentWillMount() {
    socket.connect((mySocket) => {
      this.setState({
        status: 'Connected As:',
        socketID: mySocket.id
      });
      socket.subscribeToJoin((socketID) => {
        socket.createPC(socketID, false, (event, obj) => {
          if (event === 'new_stream') {
            this.setState({
              broadcaster: socketID,
              mediaStream: URL.createObjectURL(obj.stream)
            });
          }
        })
      });
      socket.subscribeToGameUpdate((data) => {
        this.setState({
          gameData: data
        });
      })
      socket.subscribeToExchange();
      socket.subscribeToLeave((socketID) => {
        if(this.state.broadcaster === socketID) {
          this.setState({
            broadcaster: null
          });
        }
      });

      this.joinRoom('uclavsharvard')
    });
  }

  joinRoom(roomID) {
    if(roomID) {
      socket.joinRoom(roomID, (socketIds) => {
        for (var i in socketIds) {
          var socketId = socketIds[i];
  
          this.pc = socket.createPC(socketId, false, (event, obj) => {
            if (event === 'new_stream') {
              this.setState({
                broadcaster: socketId,
                mediaStream: URL.createObjectURL(obj.stream)
              });
            }
            if(event === 'new_message') {
              const messages = this.state.messages.slice(0);
              messages.push({user: socketId, message: obj.message});
              this.setState({
                messages
              })
            }
          });
        }
        this.setState({
          joined: true
        });
      });

    }
  }

  textChange(e) {
    this.setState({
      message: e.target.value
    })
  }

  sendMessage() {
    if (!this.state.message) {
      return
    }
    const messages = this.state.messages.slice();
    messages.push({ user: 'Me', message: this.state.message });
    this.pc.textDataChannel.send(this.state.message);
    this.setState({ messages, message: '' });
  }

  selectGame(e, {value}) {
    this.setState({
      selectedGame: value
    });
  }

  leaveGame() {
    const { selectedGame } = this.state;
    if(selectedGame) {
      socket.leaveRoom(selectedGame, (socketID) => {
        this.setState({
          joined: false
        })
      });
    }
  }

  render() {
    const {
      status,
      selectedGame,
      joined,
      mediaStream,
      message,
      messages,
      socketID,
      gameData,
      broadcaster
    } = this.state;
    const gameOptions = [
      {
        key: '1', value: 'uclavsharvard', text: 'UCLA vs. Harvard' 
      },
      {
        key: '2', value: 'standfordvsyale', text: 'Standford vs. Yale' 
      },
      {
        key: '3', value: 'arizonavspitts', text: 'Arizona vs. Pitts' 
      },
      {
        key: '4', value: 'columnbiavsberkley', text: 'Columnbia vs. Berkley' 
      },
      
    ]

    return (
      <div className="App">
        {/* <header className="App-header"> */}
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          {/* <h1 className="App-title">{status} {socketID}</h1>
          <h2>Game: {joined ? selectedGame : ''}
            {joined ? 
              <span className="leaveBtn">
                <Button onClick={() => { this.leaveGame(selectedGame) }}>
                  <Button.Content>Leave</Button.Content>
                </Button> 
              </span>
            : null}
          </h2> */}
        {/* </header> */}
        {/* {joined ? 
          <div>
            <input value={message} onChange={this.textChange} />
            <button onClick={() => { this.sendMessage(message) }}>Send</button>
          </div> 
        : null} */}
        {/* {joined ? <button onClick={this.leaveRoom}>Leave</button> :  */}
        {/* <div>
          {joined ? 
            null
            : 
            <div>
              <Select placeholder='Select Game' options={gameOptions} onChange={this.selectGame} />
              <Button color="red" animated onClick={() => { this.joinRoom(selectedGame) }}>
                <Button.Content visible>Watch</Button.Content>
                <Button.Content hidden>
                  <Icon name='right arrow' />
                </Button.Content>
              </Button>
            </div>
            }
        </div> */}
        <div className="video-container">
          <Video gameData={gameData} stream={mediaStream} broadcaster={broadcaster}/>
        </div>
        {/* {messages.map((m) => {
          return (
            <div>{m.user}: {m.message}</div>
          )
        })} */}
      </div>
    );
  }
}

export default App;

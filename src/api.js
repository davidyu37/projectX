import io from 'socket.io-client';
const socket = io('https://broadcast-web-rtc.herokuapp.com');
// const socket = io('http://localhost:4443');

const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
const RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };

var pcPeers = {};

function exchange(data) {
    var fromId = data.from;
    var pc;
    if (fromId in pcPeers) {
        pc = pcPeers[fromId];
    } else {
        pc = methods.createPC(fromId, false);
    }

    if (data.sdp) {
        // console.log('exchange sdp', data);
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            if (pc.remoteDescription.type == "offer")
                pc.createAnswer(function (desc) {
                    // console.log('createAnswer', desc);
                    pc.setLocalDescription(desc, function () {
                        // console.log('setLocalDescription', pc.localDescription);
                        socket.emit('exchange', { 'to': fromId, 'sdp': pc.localDescription });
                    }, logError);
                }, logError);
        }, logError);
    } else {
        // console.log('exchange candidate', data);
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
}

function logError(error) {
    // console.log("logError", error);
}



const methods = {
    connect(cb) {
        socket.on('connect', () => {
            cb(socket)
        })
    },
    joinRoom(roomID, cb) {
        socket.emit('join', roomID, function (socketIds) {
            // console.log('join', socketIds);
            cb(socketIds);
            // for (var i in socketIds) {
            //     var socketId = socketIds[i];

            //     this.createPC(socketId, true);
            // }
        });
    },
    subscribeToJoin(cb) {
        socket.on('enterRoom', function (data) {
            // console.log('someone joined', data);
            cb(data);
        });
    },
    subscribeToExchange() {
        socket.on('exchange', function (data) {
            exchange(data);
        })
    },
    subscribeToLeave() {
        const self = this
        socket.on('leave', (socketId) => {
            self.someoneLeft(socketId);
        });
    },
    subscribeToGameUpdate(cb) {
        socket.on('gameStatusUpdated', (data) => {
            cb(data);
        })
    },
    leaveRoom(roomID, cb) {
        socket.emit('leaveRoom', (socketIds) => {
            cb(socketIds);
        });
    },
    someoneLeft(socketId) {
        // console.log('leave', socketId);
        var pc = pcPeers[socketId];
        if(pc) {
            pc.close();
            delete pcPeers[socketId];
        }
    },
    createPC(socketId, isOffer, cb) {
        const pc = new RTCPeerConnection(configuration);
        pcPeers[socketId] = pc;

        pc.onicecandidate = function (event) {
            // console.log('onicecandidate', event);
            if (event.candidate) {
                socket.emit('exchange', { 'to': socketId, 'candidate': event.candidate });
            }
        };

        function createOffer() {
            pc.createOffer(function (desc) {
                // console.log('createOffer', desc);
                pc.setLocalDescription(desc, function () {
                    // console.log('setLocalDescription', pc.localDescription);
                    socket.emit('exchange', { 'to': socketId, 'sdp': pc.localDescription });
                }, logError);
            }, logError);
        }

        pc.onnegotiationneeded = function () {
            // console.log('onnegotiationneeded');
            if (isOffer) {
                createOffer();
            }
        }

        pc.oniceconnectionstatechange = function (event) {
            // console.log('oniceconnectionstatechange', event);
            if (event.target.iceConnectionState === 'connected') {
                createDataChannel();
            }
        };
        pc.onsignalingstatechange = function (event) {
            // console.log('onsignalingstatechange', event);
        };

        pc.onaddstream = function (event) {
            if(cb) {
                cb('new_stream', {stream: event.stream, socketId})
            }
            // var element = document.createElement('video');
            // element.id = "remoteView" + socketId;
            // element.autoplay = 'autoplay';
            // element.src = URL.createObjectURL(event.stream);
            // remoteViewContainer.appendChild(element);
        };
        // pc.addStream(localStream);

        function createDataChannel() {
            if (pc.textDataChannel) {
                return;
            }
            var dataChannel = pc.createDataChannel("text");

            dataChannel.onerror = function (error) {
                // console.log("dataChannel.onerror", error);
            };

            dataChannel.onmessage = function (event) {
                // console.log("dataChannel.onmessage:", event.data);
                if (cb) {
                    cb('new_message', { message: event.data })
                }
                // var content = document.getElementById('textRoomContent');
                // content.innerHTML = content.innerHTML + '<p>' + socketId + ': ' + event.data + '</p>';
            };

            dataChannel.onopen = function () {
                // console.log('dataChannel.onopen');
                // var textRoom = document.getElementById('textRoom');
                // textRoom.style.display = "block";
            };

            dataChannel.onclose = function () {
                // console.log("dataChannel.onclose");
            };

            pc.textDataChannel = dataChannel;
        }
        return pc;
    }
}

export default methods;
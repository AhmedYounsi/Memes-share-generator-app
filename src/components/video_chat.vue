<template>
  <div style="width: 100%; height: 100%">
    <!-- <div v-show="calling_video" class="camera_content">
      <div v-show="ready_call" class="camera_reiceve">
        <div @click="change_scale()" class="video_grid_1">
          <video
            height="100%"
            width="100%"
            id="video_1"
            class="video_chat video_1"
          ></video>
        </div>
        <div @click="change_scale()" class="video_grid_2">
          <video
            height="100%"
            width="100%"
            id="video_2"
            class="video_chat video_2"
          ></video>
        </div>
      </div>
    </div> -->

    <div v-show="calling_video" class="camera_content">
      <div v-show="ready_call" class="camera_reiceve">


  <vue-draggable-resizable
           :resizable="false"
          :parent="true"
          style="z-index:1;border:none" 
        >
      <video
          height="100%"
          width="100%"
          id="video_1"
          class="video_chat video_1"
        ></video>
  </vue-draggable-resizable>


  

        <video
          height="100%"
          width="100%"
          id="video_2"
          class="video_chat video_2"
        ></video>
      </div>
    </div>

    <!-- <vue-webrtc
        v-on:joined-room="joined"
      v-on:left-room="doAttendeeLeft"
        ref="webrtc"
        width="100%"
        :roomId="video_id"
      >
      </vue-webrtc> -->
    <!-- <h1>{{video_room_id}}</h1> -->

    <div v-if="display_btn && ready_call" class="buttons">
      <!-- <button  @click="doJoin">JOIN</button> -->
      <button
        style="border: none; background: none; outline: none"
        @click="end_call()"
      >
        <i class="fas fa-phone"></i>
      </button>
      <button
        style="border: none; background: none; outline: none"
        @click="hide"
      >
        <i class="fas fa-compress-arrows-alt"></i>
      </button>

      <button
        class="video_stat"
        style="border: none; background: none; outline: none"
        @click="Pause()"
      >
        <i class="fas fa-video"></i>
      </button>
    </div>
  </div>
</template>

<script>
import Peer from "peerjs";
let peer_id;
let id_peer_user;
let my_stream;
// import { resonsive } from "./responsive_camera";
import { socket } from "../init_socket";
export default {
  name: "video_chat",
  props: ["video_room_id", "videocall", "myPeerId", "call"],
  data() {
    return {
      peer_to: "",
      ready_call: false,
      calling_video: true,
      stream: "",
      username: "",
      username_id: "",
      call_started: false,
      trakcs: "",
      video_id: "",
      display_btn: true,
    };
  },
  watch: {
    video_room_id(val) {
      this.video_id = val;
    },
    videocall(val) {
      if (val) {
        this.$nextTick(() => {
          //  this.start_call()
        });
      }
    },
  },
  methods: {
    Pause() {
      const vid = this.stream.getVideoTracks();
      const video_stat = document.querySelector(".video_stat");
      var is_active = vid[0].enabled;
      if (is_active) {
        vid[0].enabled = false;
        video_stat.innerHTML = '<i class="fas fa-video-slash"></i>';
      } else {
        vid[0].enabled = true;
        video_stat.innerHTML = ' <i class="fas fa-video"></i>';
      }
    },
    change_scale() {
      var video1 = document.querySelector(".video_grid_1");
      var video2 = document.querySelector(".video_grid_2");
      var width_video_1 = video1.offsetWidth;
      var width_video_2 = video2.offsetWidth;

      video1.style.width = `${width_video_2}px`;
      video2.style.width = `${width_video_1}px`;
      //  const div = document.getElementById(`${e.target.id}`).offsetWidth
    },
    end_call() {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      socket.emit("END_CALL", this.call);
      //    const video = document.querySelector('.video_1')
      //      const stream = video.srcObject;
      //        const tracks = stream.getTracks()
      //       tracks.forEach(function(track) {
      // track.stop();
      // });
      // video.srcObject = null;
      // later you can do below
      // stop both video and audio
    },
    start_call(id) {
      this.calling_video = true;
      let video1 = document.querySelector(".video_1");
      let video2 = document.querySelector(".video_2");
      var _this = this;
      this.call_started = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            autoGainControl: true,
            echoCancellation: true,
            googAutoGainControl: true,
            noiseSuppression: true,
          },
          video: true,
        })
        .then((stream) => {
          my_stream = stream;
          _this.stream = stream;
          video1.muted = true;
          video1.srcObject = stream;
          video1.addEventListener("loadedmetadata", () => {
            this.ready_call = true;
            video1.play();
          });
          let call = peer_id.call(id, stream);
          call.on("stream", (remoteStream) => {
            video2.srcObject = remoteStream;
            video2.addEventListener("loadedmetadata", () => {
              this.ready_call = true;
              video2.play();
            });
          });
        })

        .catch((err) => console.log(err));
    },

    camera_off() {
      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        socket.emit("media", devices);
      });
      // const video = document.querySelector('video');
      // const mediaStream = video.srcObject;

      // // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
      // var tracks = mediaStream.getTracks();
      // console.log(tracks)
    },
    hide() {
      this.$emit("hide_call");
    },
    joined(JoinID) {
      console.log(JoinID);
      this.display_btn = true;
      this.$nextTick(() => {
        const media = document.getElementById(`${JoinID}`);
        console.log(media);
        media.removeAttribute("controls");
      });

      // media.removeAttribute('controls');
    },
    doAttendeeLeft(leftID) {
      this.display_btn = false;
      console.log(leftID);
      this.$refs.webrtc.leave();
      this.$emit("end_call");
      // this.$refs.webrtc.leave();
      // this.video_call = false;
    },
    open_room(roomid) {
      console.log(roomid);
    },
    doLeave() {
      this.$refs.webrtc.leave();
      this.$emit("end_call");
    },
    doJoin() {
      this.$refs.webrtc.join();
    },
    remove_video() {},
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");

    peer_id = new Peer();
    peer_id.on("open", function (id) {
      id_peer_user = id;
      console.log("My peer ID is: ", id_peer_user);
    });

    socket.on(`get_peer${this.username_id}`, (data) => {
      const id = data[0];
      socket.emit("get_back_peer", [id, id_peer_user]);
    });

    socket.on(`get_back_peer${this.username_id}`, (data) => {
      this.peer_to = data[1];
    });

    // END_CALL
    socket.on(`END_CALL${this.username_id}`, () => {
      if (my_stream) {
        my_stream.getTracks().forEach(function (track) {
          track.stop();
        });
      }

      this.ready_call = false;
      let video1 = document.querySelector(".video_1");
      let video2 = document.querySelector(".video_2");

      video1.srcObject = null;
      video2.srcObject = null;
      setTimeout(() => {
        this.calling_video = false;
        this.calling_video = false;

        this.$emit("call_is_ended");
      }, 1000);
    });
    // ACCEPT_CALL

    socket.on(`ACCEPT_CALL${this.username_id}`, (data) => {
      console.log(data);
      if (data[1] == "accept") {
        console.log("start");
        this.start_call(this.peer_to);
      }
    });

    var _this = this;
    peer_id.on("call", function (call) {
      console.log("recieveing");

      _this.calling_video = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            autoGainControl: true,
            echoCancellation: true,
            googAutoGainControl: true,
            noiseSuppression: true,
          },
          video: true,
        })
        .then((stream) => {
          let video1 = document.querySelector(".video_1");
          video1.srcObject = stream;
          my_stream = stream;
          _this.stream = stream;
          video1.addEventListener("loadedmetadata", () => {
            _this.ready_call = true;
            video1.muted = true;
            video1.play();
          });

          call.answer(stream);
          call.on("stream", (remoteStream) => {
            let video2 = document.querySelector(".video_2");
            video2.srcObject = remoteStream;
            video2.addEventListener("loadedmetadata", () => {
              _this.ready_call = true;
              video2.play();
            });
          });
        });
    });
  },
  mounted() {
    // let video1 = document.querySelector(".video_grid_1");
    // let video2 = document.querySelector(".video_grid_2");
    // resonsive(video1, video2);
  },
};
</script>

<style >
.camera_reiceve {
  width: 100%;
  height: 100vh;
}
.video_2 {
  position: absolute;
  width: 100%;
  left:0;
  z-index: 0;
}
.video_1 {
  position: absolute;
  width: 200px;
  height: 200px;
  bottom: 0;
  right: 0;
  z-index: 1;
}

.video_grid_1 {
  transition: 0.3s;
}
.video_grid_2 {
  transition: 0.3s;
}
.video_stat > i {
  background: darkgray;
  padding: 10px;
  border-radius: 51%;
  font-size: 22px !important;
}
.camera_content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera_reiceve {
  position: relative;
  text-align: center;   
  align-items: center;
  justify-content: center;
}
.video_chat {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg); /* Safari and Chrome */
  -moz-transform: rotateY(180deg); /* Firefox */
  transition: 0.3s;

  border-radius: 10px;
}
.buttons {
  z-index: 3;
  left: 0;
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.fa-compress-arrows-alt {
  background: burlywood;
  padding: 10px;
  border-radius: 51%;
  font-size: 22px !important;
}
.fa-phone {
  background: #f44336;
  padding: 10px;
  border-radius: 51%;
  font-size: 22px !important;
}
.video-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  background: transparent !important;
}
.video-item {
  margin-right: 10px;
  width: 40%;
  display: inline-block;
  background: transparent !important;
}
.video-item video {
  width: 100%;
  height: 100%;
}
::-webkit-media-controls {
  display: none !important;
}
@media screen and (min-width: 0) and (max-width: 650px) {
  .video-item {
    width: 70% !important;
  }
}
@media screen and (min-width: 650px) {
  .video-item {
    width: 45% !important;
  }
}
@media screen and (min-width: 0) and (max-width: 800px) {
  .video_grid_1 {
    margin-bottom: 15px;
  }
}
@media screen and (min-width: 700px) {
  .video_grid_1 {
    margin-right: 15px;
  }
}
</style>
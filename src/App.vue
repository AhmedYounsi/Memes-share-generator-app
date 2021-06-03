<template>
  <div style="min-height: 100vh" id="app">
    <img
      class="back_img"
      style="position: fixed; z-index: 0; top: 0"
      src="/images/background.jpg"
      alt=""
    />

    <!-- APPEL -->
    <div v-if="is_ring" class="div_appel">
      <p class="is_callig">{{ user_is_calling.from.name }} IS CALLING ...</p>
      <div class="btn_hang">
        <i @click="accept_call(true)" class="accept_call fas fa-phone"></i>
        <i @click="accept_call(false)" class="denied_call fas fa-phone"></i>
      </div>
    </div>

    <!-- <img class="background-memes" src="/images/bc-memes.jpg" alt="" /> -->
    <nav style="padding: 0 0" class="navbar">
      <div @click="render_app()" class="logo">
        <i
          v-if="!search_bar_active"
          style="font-size: 30px"
          class="fas fa-home"
        ></i>
        <!-- <img src="/images/logo.png" alt=""> -->
      </div>

      <div style="height: 100%; position: absolute; right: 0" id="navbarNav">
        <ul v-if="username != '' && username != null" class="">
          <div
            :class="{ search_div_active: search_bar_active }"
            class="search-div"
          >
            <i
              @click="search_bar_active = !search_bar_active"
              style="font-size: 30px; transform: translateX(-10px)"
              class="fas fa-search"
            ></i>
            <input
              @keyup="searching()"
              @click="focus_search()"
              placeholder="Search ..."
              v-model="search"
              class="search-bar"
              type="text"
            />
            <div v-if="show_search" class="search-result">
              <p class="m-0 p-2 no-rsl" v-if="search_rsl == 'No Results'">
                No Results
              </p>
              <div v-else>
                <p v-if="search_rsl.length > 0" class="m-0 p-2 no-rsl">
                  Search Results
                </p>
                <div
                  style="text-align: left; display: flex; color: #dfdfdf"
                  class="m-0 px-2 result_content"
                  v-for="search in search_rsl"
                  :key="search._id"
                  @click="main_profile(search._id)"
                >
                  <div
                    style="width: 46px; display: flex; justify-content: center"
                  >
                    <i
                      style="font-size: 35px"
                      v-if="!search.picture"
                      class="user_icone far fa-user-circle"
                    ></i>
                    <img
                      class="img_user_search"
                      v-else
                      :src="search.picture"
                      alt=""
                    />
                  </div>

                  {{ search.username }}
                </div>
              </div>
            </div>
            <div
              v-if="search != '' && search_rsl.length == 0"
              class="spinner-border spinner text-light"
              role="status"
            >
              <span class="sr-only">Loading...</span>
            </div>
          </div>

          <!-- <router-link class="nav-item" tag="li" :to="{ name: 'profile', params: { id: username_id }}">  -->
          <li @click="main_profile()" class="nav-item">
            <i v-if="!connected_user.picture" class="far fa-user-circle"></i>
            <img
              v-if="connected_user.picture"
              style="width: 40px; border-radius: 15px"
              :src="user_img()"
              alt=""
            />
          </li>
          <li
            style="position: relative"
            id="notifs"
            @click="show_notif = !show_notif"
            class="nav-item"
          >
            <i id="notifs" class="fas fa-bell"></i>
            <span v-if="Notification_num() > 0" class="notif_msg">{{
              Notification_num()
            }}</span>
          </li>

          <!-- </router-link> -->
          <router-link
            style="position: relative"
            class="nav-item"
            tag="li"
            to="/inbox"
          >
            <i class="fas fa-comments"></i>
            <span class="notif_msg" v-if="notif_msg > 0">{{ notif_msg }}</span>
          </router-link>
          <li @click="logout()" class="nav-item">
            <i class="fas fa-sign-out-alt"></i>
          </li>
          <!-- <li @click="notif()" class="nav-item">NOTIF</li> -->
        </ul>
      </div>
      <Notif
        :connected_user="connected_user"
        :notifs_num="notifs_num"
        :notifs="notifs"
        v-if="show_notif"
        :username="username"
        :username_id="username_id"
        id="notifs"
      />
      <div
        v-if="hide_video_call"
        @click="hide_video_call = false"
        class="hidden_call"
      >
        <i style="font-size: 30px" class="fas fa-video"></i>
      </div>
    </nav>

    <div v-show="videocall && !hide_video_call" class="calling">
      <VideoChat
        @call_is_ended="call_is_ended"
        :call="call"
        :myPeerId="myPeerId"
        @hide_call="hide_call"
        @end_call="end_call"
        :videocall="videocall"
        :video_room_id="video_room_id"
      />
    </div>
    <router-view
      :connected_user="connected_user"
      :logout_val="logout_val"
      style="position: relative"
      :myPeerId="myPeerId"
      @join="join($event)"
      :videocall="videocall"
      @SET_NOTIF_MSG_0="SET_NOTIF_MSG()"
      @refresh="refresh()"
      v-if="render"
      :show_inbox="show_inbox"
      :username_general="username"
      :id_general="username_id"
      @updateStatus="updateStatus"
    />
  </div>
</template>

<script>
// import Peer from "peerjs";
import VideoChat from "./components/video_chat";
import Notif from "./components/notification";
import { socket } from "./init_socket";

export default {
  name: "app",
  components: {
    Notif,
    VideoChat,
  },
  data() {
    return {
      logout_val: true,
      call_ended: false,
      call: "",
      is_ring: false,
      user_is_calling: "",
      myPeerId: "",
      hide_video_call: false,
      video_room_id: "",
      videocall: false,
      conversations: [],
      notif_msg: 0,
      render: true,
      connected_user: [],
      show_notif: false,
      search_bar_active: false,
      show_search: false,
      show_inbox: false,
      username: "",
      username_id: "",
      pro: [],
      search: "",
      search_rsl: [],
      notifs: [],
      notifs_num: 0,
      req_notif: 0,
      all_notif_num: 0,
    };
  },
  watch: {
    all_notif_num(val) {
      document.title =
        "(" + val + ") " + document.title.replace(/ *\([^)]*\) */g, "");
    },
    username_id(val) {
      if (val) {
        socket.emit("GET_CONNECTED_USER", this.username_id);
        socket.on("GET_CONNECTED_USER", (user) => {
          this.connected_user = user[0];
        });
        socket.emit("GET_NOTIF", this.username_id);
      }
    },
    $route() {
      this.show_notif = false;
    },
  },
  methods: {
    user_img() {
      if (!this.connected_user?.picture) {
        return false;
      } else {
        return this.connected_user?.picture;
      }
    },
    Close_Call() {
      this.call_ended = false;
    },
    call_is_ended() {
      this.videocall = false;
    },
    accept_call(response) {
      if (!response) {
        this.is_ring = false;

        socket.emit("ACCEPT_CALL", [this.user_is_calling, "reject"]);
        this.user_is_calling = "";
      } else {
        this.is_ring = false;
        this.videocall = true;
        socket.emit("ACCEPT_CALL", [this.user_is_calling, "accept"]);
        this.call = this.user_is_calling;
      }
    },
    hide_call() {
      this.hide_video_call = true;
    },
    end_call() {
      this.video_room_id = "";
      this.videocall = false;
    },
    join(id) {
      console.log(id)
      this.video_room_id = id._id;
      this.videocall = true;
    },
    searching() {
      if (this.search == "") {
        this.search_rsl = [];
        this.show_search = false;
      }
      if (this.search.length > 0) {
        this.search_rsl = [];
        this.show_search = true;
        socket.emit("SEARCH", this.search);
      }
    },
    SET_NOTIF_MSG() {
      // alert('ddd')
    },
    Notification_num() {
      return this.req_notif + this.notifs_num;
    },
    render_app() {
      if (this.$route.path != "/") {
        this.$router.push({
          path: "/",
        });
      }

      this.render = false;
      this.$nextTick(() => {
        this.render = true;
      });
    },
    number_notif() {
      var req = 0;
      var notif = 0;

      if (this.connected_user.request) {
        req = this.connected_user.request.length;
      }
      if (this.notifs.notif && this.notifs.seen == false) {
        notif = this.notifs.notif.length;
      }

      return req + notif;
    },
    focus_search() {
      this.search_bar_active = true;
    },
    leave_search() {
      this.search_rsl = [];
      this.show_search = false;
      this.search_bar_active = false;
    },
    main_profile(id) {
      this.search_rsl = [];
      this.show_search = false;
      this.search = "";
      var id_path = "";
      if (id) id_path = id;
      else id_path = this.username_id;
      this.$router.push({
        path: "/home",
      });
      this.$nextTick(() => {
        this.$router.push({
          name: "profile",
          params: { id: id_path },
        });
      });
    },
    updateStatus(data) {
      this.username = data.username;
      this.username_id = data._id;
    },

    logout() {
      this.logout_val = false;
      localStorage.removeItem("username");
      localStorage.removeItem("username_id");
      localStorage.removeItem("id_conv");
      this.username_id = "";
      this.username = "";
      this.notifs = [];
      this.conversations = [];
      this.connected_user = "";

      window.location.href = "/login";
    },
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");
      

   socket.on(`UPDATE_USERNAME${this.username_id}`,data=>{
    localStorage.setItem("username",data.username);
    this.username = localStorage.getItem("username");
   })


       socket.on(`updated_img${this.username_id}`,data=>{
      console.log(data.picture)
      this.connected_user = data
    })


    socket.on(`SOUND_NOTIF${this.username_id}`, () => {
      var audio = new Audio("/notif_sound.mp3");
      audio.volume = 0.2;
      audio.play();
    });

    // notif_likes
    socket.on(`notif_likes${this.username_id}`,data=>{
      console.log(data)
    })

    socket.on(`ACCEPT_CALL${this.username_id}`, (data) => {
      if (data[1] == "reject") {
        this.videocall = false;
      }
    });

    socket.on(`SAVE_CALL${this.username_id}`, (data) => {
      this.call = data;
      localStorage.setItem("call", data);
    });

    //  RING
    socket.on(`VIDEO_CALL_RING${this.username_id}`, (data) => {
      this.is_ring = true;
      this.user_is_calling = data;
    });

    window.onclick = (event) => {
      if (this.show_notif) {
        if (event.target.id != "notifs") {
          this.show_notif = false;
        }
      }
      if (
        event.target.className != "m-0 p-2 result_content" &&
        event.target.className != "search-bar"
      ) {
        this.search = "";
        this.show_search = false;
        this.search_bar_active = false;
      }
    };

    socket.on(`see_notif${this.username_id}`, (data) => {
      if (data) {
        this.notifs = data;
        this.notifs.notif = data.notif.reverse();
        var num = 0;
        for (let i = 0; i < data.notif.length; i++) {
          if (!data.notif[i].seen) num++;
        }
        this.notifs_num = num;
      } else this.notifs_num = 0;
    });

    //  GET_NOTIFS
    socket.emit("GET_NOTIF", this.username_id);
    socket.on(`GET_NOTIF${this.username_id}`, (data) => {
      if (data) {
        this.notifs = data;
        this.notifs.notif = data.notif.reverse();
        var num = 0;
        for (let i = 0; i < data.notif.length; i++) {
          if (!data.notif[i].seen) num++;
        }
        this.notifs_num = num;
      }
    });

    socket.on("SEARCH", (result) => {
      if (result == "No Results") this.search_rsl = "No Results";
      else this.search_rsl = result;
    });

    // ALL_NOTIF
    socket.on(`UPDATE_REQ2${this.username_id}`, (data) => {
      if (data._id == this.username_id) {
        this.connected_user = data;
      }
    });

    socket.on("UPDATE_REQ", (data) => {
      if (data[0]._id == this.username_id) {
        this.connected_user = data[0];
        this.req_notif = data[0].request.length;
      }
    });

    //  REQ_NOTIF

    socket.on("GET_CONNECTED_USER", (user) => {
      if (user[0].request) {
        this.connected_user = user[0];
        this.req_notif = user[0].request.length;
      }
    });
    socket.on(this.username_id, (user) => {
      if (user.request) {
        this.connected_user = user;
        this.req_notif = user.request.length;
      }
    });

    //  MESSAGE_NOTIF
    socket.emit("GET_MSG_NOTIF", this.username_id);
    socket.on("GET_MSG_NOTIF", (data) => {
      this.conversations = data;
      for (let i = 0; i < data.length; i++) {
        if (!data[i].seen && data[i].last_sender_id != this.username_id) {
          this.notif_msg++;
        }
      }
    });
    socket.on(`NOTIF${this.username_id}`, (data) => {
      this.conversations = data;
      this.notif_msg = 0;
      for (let i = 0; i < data.length; i++) {
        if (!data[i].seen && data[i].last_sender_id != this.username_id) {
          this.notif_msg++;
        }
      }
    });
  },
  mounted() {
    // navigator.serviceWorker.register("./service-worker.js");
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker
    //     .register("./service-worker.js", { scope: "./" })
    //     .then(function (registration) {
    //       console.log("Service Worker Registered");
    //       setTimeout(() => {
    //         registration.showNotification("dddd", {
    //        body: 'Buzz! Buzz!',
    //       icon: '/images/lock.png',
    //       vibrate: [200, 100, 200, 100, 200, 100, 200],
    //     })
    //         registration.update();
    //       }, 10);
    //     })
    //     .catch(function (err) {
    //       console.log("Service Worker Failed to Register", err);
    //     });
    // }
  },
};
</script>

<style>
.result_content {
  padding: 7px 0;
  text-align: left;
  display: flex;
  color: rgb(223, 223, 223);
  display: flex;
  font-size: 15px;
  align-items: center;
}
.img_user_search {
  width: 37px;
  border-radius: 15px;
  margin-right: 9px;
}
.hidden_call {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f44336;
  margin-top: 50px;
  border-bottom-left-radius: 20px;
  margin-left: auto;
  cursor: pointer;
}
.calling {
  top: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  justify-content: center;
  position: fixed;
  background: #060606eb;
  z-index: 999;
}
.notif_msg {
  filter: drop-shadow(2px 4px 6px black);
  width: 20px;
  height: 20px;
  background: #f44336;
  position: absolute;
  right: 0px;
  top: 4px;
  border-radius: 50%;
  display: flex;
  align-content: center;
  justify-content: center;
  font-size: 12px;
  font-family: none;
}
.notification_num {
  font-family: none;
  font-size: 14px;
  background: #f44336;
  padding: 0 5px;
  border-radius: 50%;
  font-weight: 900;
  filter: drop-shadow(2px 4px 6px black);
  position: absolute;
  right: 5px;
  top: 8px;
  width: 10px;
  height: 10px;
}
.user_icone {
  font-size: 24px;
  margin-right: 8px;
}
.no-rsl {
  width: 100%;
  color: burlywood;
}
.result_content {
  text-align: left;
  width: 100%;
}
.result_content:hover {
  background: #3d3d3d;
}
.search-result {
  overflow: auto;
  position: absolute;
  text-align: center;
  background: #171717;
  transform: translateY(100%);
  bottom: -10px;
  left: -13px;
  border: 1px solid #8080806e;
  border-radius: 15px;
  max-height: 300px;
  width: 270px;
}

.search-bar {
  background: transparent;
  border: none;
  border-bottom: 2px solid white;
  outline: none;
  color: white;
}
.search-div > input {
  width: 100%;
}
.search_div_active {
  width: 170px !important;
}
.search-div {
  margin-right: 10px;
  transition: width 0.4s;
  width: 106px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}
.logo > img {
  width: 140px;
  margin-left: 8px;
  margin-top: 4px;
}
.logo:focus {
  background: transparent;
}
.logo:hover {
  background: #ffffff3b;
}
.logo {
  cursor: pointer;
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  left: 0px;
  top: 0;
  padding: 0 11px;
}
router-link {
  color: white;
  cursor: pointer;
}

li {
  height: 100%;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
li > i {
  font-size: 30px;
}
li:hover,
.home_li:hover {
  background: #ffffff3b;
}
ul {
  cursor: pointer;
  list-style-type: none;
  color: white;
  display: flex;
  height: 100%;
  margin: 0;
  align-items: center;
  padding: 0 0;
}
.logout {
  margin-left: auto;
}
.navbar {
  border-bottom: 1px solid;
  height: 50px;
  width: 100%;
  color: white;
  background: linear-gradient(to right, #ec8650, #cf5881);
  position: fixed;
  top: 0;
  z-index: 99999999;
}

@media screen and (min-width: 200px) and (max-width: 450px) {
  .logo > img {
    width: 120px;
    margin-left: 8px;
    margin-top: 7px;
  }

  .home_li {
    padding: 0 10px;
  }
  li {
    padding: 0 5px;
  }
  li > i {
    font-size: 25px;
  }
}
::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: rgb(255, 255, 255);
  opacity: 1; /* Firefox */
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: rgb(255, 255, 255);
}

::-ms-input-placeholder {
  /* Microsoft Edge */
  color: rgb(255, 255, 255);
}
.spinner {
  position: absolute;
  right: 0;
  width: 20px;
  height: 20px;
  font-size: 12px;
  top: 13px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

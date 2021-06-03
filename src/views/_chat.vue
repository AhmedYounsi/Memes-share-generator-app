<template>
  <div class="mt-0 chat_messages" style="height: 100vh;">
    <div v-if="loading_message" class="loading_content">
      <div class="spinner-border loading_message" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div style="display: flex" class="tab_inbox">
      <div @click="$router.push({ name: 'inbox' })" class="back_to_inbox">
        <i class="fas fa-reply"></i>
      </div>
      <div @click="to_profile"  class="name_tab">
        <i data-v-532615dc="" class="far fa-user-circle"></i>
        <p >{{ get_name() }}</p>
      </div>
    </div>
    <div class="box_message">
      <div v-for="(msg, i) in private_msg" :key="i">
        <p class="time_message" v-if="show_date(i)">
          {{ get_time(msg.timestamp) }}
        </p>
        <div
          v-bind:class="{ message_send2: username == msg.sender }"
          class="px-2 py-0"
        >
          <div
            v-bind:class="{ message_send2: username == msg.sender }"
            style="
              width: max-content;
              max-width: 70%;
              display: flex;
              align-items: center;
              position: relative;
            "
            class=""
          >
            <!-- <i  v-if="show_user_img(i)" class="user_image_chat far fa-user-circle"></i> -->

            <div class="media-body">
              <div
                v-bind:class="{
                  message_send: username == msg.sender,
                  message_recieve: username != msg.sender,
                }"
                class="rounded py-2 px-3 mb-1"
              >
                <p style="overflow-wrap: anywhere" class="text-small mb-0">
                  {{ msg.message }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="box_input">
      <VEmojiPicker
        v-show="show_emoji"
        style="position: absolute; bottom: 85px; right: 25px"
        @select="selectEmoji"
      />

      <textarea
        @click="see_msg()"
        placeholder="message..."
        style=""
        cols="40"
        rows="2"
        type="text"
        v-model="message"
        class="input-msg"
      />
      <div style="position: absolute; top: 25px; right: 23px">
        <i
          @click="show_emoji_fun"
          style="
            color: burlywood;
            font-size: 25px;
            margin-right: 6px;
            cursor: pointer;
          "
          class="fas fa-smile-beam"
        ></i>
        <i
          v-if="!loading"
          @click="sendMessage()"
          style="color: burlywood; font-size: 25px; cursor: pointer"
          class="fas fa-paper-plane"
        ></i>
        <i
          v-if="loading"
          style="color: burlywood; font-size: 25px"
          class="fas fa-spinner loading"
        ></i>
      </div>
    </div>
  </div>
</template>

<script>
// var msg = []
window.addEventListener("click", () => {
  var div = document.getElementById("context-menu");
  if (div) div.classList.remove("active");
});
// import { v4 as uuidv4 } from "uuid";

import { VEmojiPicker } from "v-emoji-picker";
import io from "socket.io-client";
var socket = io("");
export default {
  props: ["conversation"],
  components: {
    VEmojiPicker,
  },
  name: "chat",
  data() {
    return {
      loading_message: false,
      reciever: [],
      private_msg: [],
      username: "",
      message: "",
      messages: [],
      id: "",
      loading: false,
      show_emoji: false,
      alert_msg: false,
      username_id: "",
    };
  },
  watch: {
    private_msg() {
      const div = document.querySelector(".box_message");
      
      div.scrollTop = div.scrollHeight;
    },
  },
  methods: {
    get_name(){

      if (this.conversation) {
          const user = this.conversation.usernames.find( el => el != this.username)

     return user
      }
    
    },
        to_profile() {
      this.$router.push({
        name: "profile",
        params: { id: this.$route.params.id },
      });
    },
    see_msg() {
      this.$emit("SEE_MSG");
    },
    get_time(timestamp) {
      var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      var date = new Date(timestamp);
      var min = date.getMinutes();
      var hour = date.getHours();
      var day = days[date.getDay()];
      var day_num = date.getDate();
      var mounth = monthNames[date.getMonth()];

      if (date.getMinutes() < 10) min = "0" + date.getMinutes();
      if (date.getHours() < 10) hour = "0" + date.getHours();

      var now = Date.now();

      var period = (now - timestamp) / 1000 / 3600 / 24;
      var date_fetch = "";
      if (0 < period && period < 1) {
        date_fetch = hour + ":" + min;
      }
      if (1 <= period && period < 7) {
        date_fetch = day + " " + hour + ":" + min;
      }
      if (7 <= period && period <= 30) {
        date_fetch = day_num + " " + mounth + " - " + hour + ":" + min;
      }
      if (period > 30) {
        date_fetch = mounth + " " + date.getFullYear();
      }

      return date_fetch;
    },
    show_date(i) {
      if (i == 0) return true;
      if (
        i > 0 &&
        this.private_msg[i].timestamp - this.private_msg[i - 1].timestamp >
          3600000
      )
        return true;
    },
    show_user_img(i) {
      if (i == 0) return true;
      if (
        (i > 0 &&
          this.private_msg[i].timestamp - this.private_msg[i - 1].timestamp >
            3600000) ||
        (i > 0 && this.private_msg[i].sender != this.private_msg[i - 1].sender)
      )
        return true;
    },
    handler: function (event, id) {
      this.id = id;
      event.preventDefault();
      var clientY = event.clientY;
      var clientX = event.clientX;
      var contextElement = document.getElementById("context-menu");
      var content_msg = document.querySelector(".msg-content");

      var new_X = 0;
      if (clientX + 110 < content_msg.offsetWidth) {
        new_X = clientX;
      } else {
        new_X = clientX - 110;
      }
      // show_menu
      contextElement.style.top = clientY + "px";
      contextElement.style.left = new_X + "px";
      contextElement.classList.add("active");
    },
    delete_msg() {
      this.loading = true;
      socket.emit("delete", this.id);
    },
    selectEmoji(emoji) {
      this.message = this.message + emoji.data;
    },
    show_emoji_fun() {
      this.show_emoji = !this.show_emoji;
    },
    sendMessage() {
      var today = new Date();
      if (this.message == "") {
        return;
      }

      var id_room = this.$route.params.id + localStorage.getItem("username_id");
      let msg = {
        id_room,
        message: {
          message: this.message,
          sender: this.username,
          sender_id: this.username_id,
          today,
          timestamp: Date.now(),
        },
        users: [this.$route.params.id, localStorage.getItem("username_id")],
        usernames: [this.username, this.reciever.username],
      };

      socket.emit("VERIFY_CONV_EXIST", msg);
      this.loading = true;
      this.message = "";
      this.show_emoji = false;
    },
  },
  created() {
    this.loading_message = true;
    // GET_FREIND
    socket.emit("GET_FRIEND", this.$route.params.id);
    socket.on("GET_FRIEND", (user) => {
      this.reciever = user;
    });

    var id1 = this.$route.params.id + localStorage.getItem("username_id");
    var id2 = localStorage.getItem("username_id") + this.$route.params.id;

    socket.on("display_private", (data) => {
      this.private_msg = data.messages;
      this.loading = false;
    });

    // GET_MESSAGE_CHAT
    socket.on(id1, (data) => {
      if (data) {
        this.private_msg = data.messages;
        this.$emit("REFRESH_INBOX");
      }
      this.loading_message = false;
      this.loading = false;
     
    });
    socket.on(id2, (data) => {
      if (data) {
        this.private_msg = data.messages;
        this.$emit("REFRESH_INBOX");
      }
      this.loading_message = false;
      this.loading = false;
      
    
    });

    socket.emit("GET_PRIVATE", id1, id2);

    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");

    if (this.username == null || this.username == "") {
      this.$router.push({
        name: "home",
        params: { username_empty: true, room: this.$route.params.username },
      });
    }

    // this.loading = true;
    window.onkeypress = (event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        this.sendMessage();
      }
    };
      
      if (this.conversation) {
          if (this.conversation.last_sender_id != this.username_id) {
      socket.emit("SEE_MESSAGE", [id1, id2, this.username_id]);
    }
      }
  
  },

  mounted() {
    const div = document.querySelector(".box_message");
    div.style.height = `${window.innerHeight - 80 - 110}px`;

    window.addEventListener("resize", () => {
      div.style.height = `${window.innerHeight - 80 - 110}px`;
    });
  },
};
</script>

<style>
.back_to_inbox > i {
  font-size: 30px;
  color: burlywood;
}
.name_tab > p {
  margin: 0;
  color: burlywood;
  text-decoration: underline;
}
.name_tab > i {
  font-size: 35px;
  margin-right: 6px;
  color: burlywood;
}
.name_tab {
  cursor: pointer;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back_to_inbox {
  position: absolute;
  top: 0px;
  left: 0;
  height: 100%;
  cursor: pointer;
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab_inbox {
  position: relative;
  justify-content: center;
  z-index: 1;
  background: #00000061;
  top: 50px;
  position: absolute;
  width: 100%;
  height: 60px;
}
.user_image_chat {
  position: absolute;
  color: #a3a3a3;
  font-size: 30px;
  top: 4px;
}
.time_message {
  color: darkgray;
  width: 100%;
  text-align: center;
  font-size: 13px;
}
.box_message {
  overflow-y: auto;
  margin-top: 110px;
  width: 100%;
  padding: 30px 0px;
}
.box_input {
  width: 100%;
  height: 80px;
  padding: 10px;
  position: absolute;
  bottom: 0;
}
.chat_messages {
  width: 100%;

  position: absolute;
  top: 0;
  height: -webkit-fill-available;
}
.input-fixed > i {
  color: burlywood;
}
textarea {
  height: 100%;
  outline: none;
  background: #0000007d;
  color: rgb(243, 243, 243);
}
.message_send2 {
  margin-left: auto;
  text-align: right;
  flex-direction: row-reverse;
}
.message_send > p {
  margin: 0;
}

.message_send {
  /* transform: translateX(-35px); */
  background: #da696e;
  color: white;
}
.message_recieve {
  background: #d3d3d3;
  color: black;
  /* transform: translateX(35px); */
}
.sender {
  margin: 0;
  color: gray;
  font-size: 15px;
}
.input-fixed {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 2px;
  bottom: 3px;
  width: 99%;
}
.fa-paper-plane:hover,
.fa-smile-beam:hover {
  color: rgb(87, 85, 85);
}
.input-msg {
  padding: 10px 60px 10px 10px;
  width: 100%;
}
.msg-content {
  transform: translateY(49px);
  width: 100%;
  height: 73vh;

  overflow: auto;
}
p {
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
  margin-top: 2px;
}
.msg-send {
  padding-bottom: 8px;
  font-size: 17px;
  width: 50%;
  background: #28a745bf;
  padding: 5px 10px;
  border-radius: 13px;
  border-top-left-radius: 0;
  color: white;
}
.loading {
  -webkit-animation-name: spin;
  -webkit-animation-duration: 4000ms;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-timing-function: linear;
  -moz-animation-name: spin;
  -moz-animation-duration: 4000ms;
  -moz-animation-iteration-count: infinite;
  -moz-animation-timing-function: linear;
  -ms-animation-name: spin;
  -ms-animation-duration: 4000ms;
  -ms-animation-iteration-count: infinite;
  -ms-animation-timing-function: linear;

  animation-name: spin;
  animation-duration: 4000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@-ms-keyframes spin {
  from {
    -ms-transform: rotate(0deg);
  }
  to {
    -ms-transform: rotate(360deg);
  }
}
@-moz-keyframes spin {
  from {
    -moz-transform: rotate(0deg);
  }
  to {
    -moz-transform: rotate(360deg);
  }
}
@-webkit-keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

#context-menu {
  font-weight: 600;
  position: fixed;
  z-index: 10000;
  width: 110px;
  background: #1b1a1a;
  border-radius: 5px;
  transform: scale(0);
  height: 35px;
  align-items: center;
  display: flex;
  justify-content: center;
}
#context-menu.active {
  transform: scale(1);
  transition: transform 100ms ease-in-out;
}
#context-menu .item {
  padding: 8px 10px;
  font-size: 15px;
  color: #eee;
}
#context-menu:hover {
  background: #555;
  cursor: pointer;
}
#context-menu .item i {
  display: inline-block;
  margin-right: 5px;
}
#context-menu hr {
  margin: 2px 0px;
  border-color: #555;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>

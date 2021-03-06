<template>
  <div class="mt-0">
    <div v-if="loading_message" class="loading_content">
      <div class="spinner-border loading_message" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <p class="text-center w-100" v-if="alert_msg">Say hi !</p>
    <!-- <div class="rooms to-user">
       {{reciever.username}}
       </div> -->
    <br />
    <div class="msg-content">
      <div v-for="(msg, index) in private_msg" :key="index">
        <div
          v-bind:class="{ message_send2: username == msg.sender }"
          class="px-2 py-0"
        >
          <!-- <p class="sender">{{ msg.sender }}</p> -->
          <div @click="delete_msg()" id="context-menu">
    
            <div class="item"><i class="fas fa-trash-alt"></i> Delete</div>
          </div>

          <div
            v-bind:class="{ message_send2: username == msg.sender }"
            style="width: max-content; max-width: 70%"
            class=""
          >
            <div class="media-body">
              
              <div
                v-bind:class="{
                  message_send: username == msg.sender,
                  message_recieve: username != msg.sender,
                }"
                @contextmenu="handler($event, msg._id)"
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

    <div style="" class="col-12 input-fixed">
      <VEmojiPicker
        v-show="show_emoji"
        style="position: absolute; bottom: 85px; right: 25px"
        @select="selectEmoji"
      />

      <textarea
        placeholder="message..."
        style=""
        cols="40"
        rows="2"
        type="text"
        v-model="message"
        class="input-msg"
      />
      <div style="position: absolute; top: 18px; right: 12px">
        <i
          @click="show_emoji_fun"
          style="font-size: 25px; margin-right: 6px; cursor: pointer"
          class="fas fa-smile-beam"
        ></i>
        <i
          v-if="!loading"
          @click="sendMessage()"
          style="font-size: 25px; cursor: pointer"
          class="fas fa-paper-plane"
        ></i>
        <i
          v-if="loading"
          style="font-size: 25px"
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
  components: {
    VEmojiPicker,
  },
name:"chat",
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
  watch: {},
  methods: {
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
        message: { message: this.message, sender: this.username ,today},
        users: [this.$route.params.id, localStorage.getItem("username_id")],
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

    socket.on(id1, (data) => {
      if (data) {
        this.private_msg = data.messages;
      }
      this.loading_message = false;
      this.loading = false;
      var div = document.querySelector(".msg-content");
      if (div) {
        div.scrollTo(0, div.scrollHeight);
      }
      
    });
    socket.on(id2, (data) => {
      if (data) {
        this.private_msg = data.messages;
      }
      this.loading_message = false;
      this.loading = false;
      var div = document.querySelector(".msg-content");
      div.scrollTo(0, div.scrollHeight);
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
  },
};
</script>

<style>
.message_send2 {
  margin-left: auto;
  text-align: right;
}
.message_send {
  background: #007bff;
  color: white;
}
.message_recieve {
  background: #d3d3d3;
  color: black;
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
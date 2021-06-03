<template>
  <div>
    
    <div  v-if="!responsive" style="display: flex" >
      <div class="container_messages">
        <div style="color: white" class="    ">
          <h4 class="title">
            <img class="btn_msg" src="/images/msg_icone.png" alt="" />
            MESSAGES
          </h4>
          <div
            class="single_message"
            v-for="(conv, i) in conversation"
            :key="conv._id"
            @click="private_room(conv.users, conv._id)"
            :class="{ new_message: new_message(i, conversation) }"
          >
            <p class="message_date">{{ get_time(conv.last_update) }}</p>
            <i style="" class="far fa-user-circle"></i>
            <div class="m-0">
              <div class="username" v-for="name in conv.usernames" :key="name">
                <span v-if="name != username"> {{ name }}</span>
              </div>
              <div class="display_message">
                <span class="text_overflow" style="color: grey">
                  <span v-if="conv.last_sender_id == username_id">You : </span>
                  {{ msg_display(conv.messages) }}</span
                >
              </div>
            </div>

            <span
              style="position: absolute; right: 7px; top: 17px"
              v-if="new_message(i, conversation)"
              class="new_msg_notif"
            ></span>
          </div>
        </div>
      </div>
      <div style="position: relative" class="inbox_field">
        <div v-if="$route.name == 'inbox'" style="display: grid; color: burlywood; text-align: center;
        filter: drop-shadow(2px 4px 6px black);">
          <i style="font-size: 60px" class="fas fa-paper-plane"></i>
          
          <h1>INBOX</h1>
        </div>
          <router-view
      :conversation="conversation.find(el => el._id == id_conv)"
        @SEE_MSG="see_msg()"
        @REFRESH_INBOX="refresh()"
        v-if="render"
      ></router-view>
      </div>
    </div>

    <div v-if="responsive" class="for_mobile">

   
    <div style="display: flex" class="" v-if="!$route.params.id">
      <div class="container_messages">
        <div style="color: white" class="    ">
          <h4 class="title">
            <img class="btn_msg" src="/images/msg_icone.png" alt="" />
            MESSAGES
          </h4>
          <div
            class="single_message"
            v-for="(conv, i) in conversation"
            :key="conv._id"
            @click="private_room(conv.users, conv._id)"
            :class="{ new_message: new_message(i, conversation) }"
          >
            <p class="message_date">{{ get_time(conv.last_update) }}</p>
            <i style="" class="far fa-user-circle"></i>
            <div class="m-0">
              <div class="username" v-for="name in conv.usernames" :key="name">
                <span v-if="name != username"> {{ name }}</span>
              </div>
              <div class="display_message">
                <span class="text_overflow" style="color: grey">
                  <span v-if="conv.last_sender_id == username_id">You : </span>
                  {{ msg_display(conv.messages) }}</span
                >
              </div>
            </div>

            <span
              style="position: absolute; right: 7px; top: 17px"
              v-if="new_message(i, conversation)"
              class="new_msg_notif"
            ></span>
          </div>
        </div>
      </div>
      <div class="inbox_field">
        <div style="display: grid; color: burlywood; text-align: center;
        filter: drop-shadow(2px 4px 6px black);">
          <i style="font-size: 60px" class="fas fa-paper-plane"></i>
          <h1>INBOX</h1>
        </div>
      </div>
    </div>
    <div class="">
      <router-view
      :conversation="conversation.find(el => el._id == id_conv)"
        @SEE_MSG="see_msg()"
        @REFRESH_INBOX="refresh()"
        v-if="render"
      ></router-view>
   
     </div>
      </div>


  </div>
</template>

<script>
import io from "socket.io-client";
var socket = io("");
// var socket = io("http://localhost:3000");
// import { v4 as uuidv4 } from "uuid";
export default {
  name: "inbox",
  props: ["username_general"],
  data() {
    return {
      responsive: false ,
      id_conv: "",
      conversation: [],
      render: true,
      user: "",
      username: "",
      username_id: "",
      success_msg: "",
      friends: [],
    };
  },
  watch: {
    "$route.params.id"(val) {
      if (val)
       console.log(val)
    },
    conversation() {},
    login_show() {
      this.alert_msg = "";
    },
    username_general(val) {
      this.username = val;
    },
  },
  methods: {
    get_time(time){
     

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

    var date = new Date(parseInt(time))
      var min = date.getMinutes();
      var hour = date.getHours();
      var day = days[date.getDay()];
      var day_num = date.getDate();
      var mounth = monthNames[date.getMonth()];

      if (date.getMinutes() < 10) min = "0" + date.getMinutes();
      if (date.getHours() < 10) hour = "0" + date.getHours();

        var now = Date.now()
     
      var period =  (now - parseInt(time)) / 1000 / 3600 / 24 ;
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
    new_message(i, conversation) {
      if (
        !conversation[i].seen &&
        conversation[i].messages[conversation[i].messages.length - 1].sender !=
          this.username
      )
        return true;
    },
    to_profile() {
      this.$router.push({
        name: "profile",
        params: { id: this.$route.params.id },
      });
    },
    msg_display(msg) {
      var i = msg.length;

      return msg[i - 1].message;
    },
    async see_msg() {
      const conv = await this.conversation.find((x) => x._id == this.id_conv);
      if (conv.last_sender_id == this.username_id) return;
      console.log('ggg')
      var id1 = this.$route.params.id + localStorage.getItem("username_id");
      var id2 = localStorage.getItem("username_id") + this.$route.params.id;
      socket.emit("SEE_MESSAGE", [id1, id2, this.username_id]);
    },
    refresh() {
      socket.emit("GET_CONV_MSG", this.username_id);
    },
    name_conv(name) {
      const found = name.find((element) => element != this.username);
      return found;
    },
    private_room(id, id_conv) {
      localStorage.setItem("id_conv", id_conv);
      this.id_conv = localStorage.getItem("id_conv");
      const found = id.find((element) => element != this.username_id);
      this.$router.push({
        name: "_chat",
        params: { id: found },
      });
      this.render = false;
      this.$nextTick(() => {
        this.render = true;
      });
    },
  },
  mounted(){
     if (window.innerWidth < 550 ) {
       this.responsive = true
      }
      else{
         this.responsive = false
      }
  window.addEventListener("resize", () => {
      if (window.innerWidth < 550 ) {
       this.responsive = true
      }
      else{
         this.responsive = false
      }
    });
  },
  created() {
    this.$emit("SET_NOTIF_MSG_0")
    this.id_conv = localStorage.getItem("id_conv");
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");

    if (this.username == null || this.username == "") {
      this.$router.push({
        name: "home",
        params: { username_empty: true, room: this.$route.params.username },
      });
    }

    // Display_User
    socket.emit("GET_FRIENDS_LIST", this.username_id);
    socket.on("GET_FRIENDS_LIST", (friends) => {
      this.friends = friends;

     
    });
  
  //  socket.on(`NOTIF${this.username_id}`,data=>{
  //        console.log(data)
  //     })


    socket.emit("GET_CONV_MSG", this.username_id);
    socket.on("GET_CONV_MSG", (data) => {
      this.conversation = data;
      for (let i = 0; i < this.conversation.length; i++) {
        if (this.conversation[i].users.includes(this.$route.params.id)) {
          this.id_conv = this.conversation[i]._id;
        }
      }
    });
    if (this.$route.params.username_empty) {
      this.alert_msg = "you have to enter a username !";
    }
    socket.on(this.username_id, () => {

      socket.emit("GET_CONV_MSG", this.username_id);
    });
  },
};
</script>

<style scoped>
.new_message {
  color: white !important;
  background: #9090903d !important;
}
.message_date {
  margin: 0;
  position: absolute;
  right: 20px;
  top: 13px;
  font-size: 13px;
  color: burlywood;
}
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
  background: #252525;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab_inbox {
  position: relative;
  justify-content: center;
  z-index: 1;
  background: #00000052;
  top: 50px;
  position: absolute;
  width: 100%;
  height: 60px;
}
.display_message {
  display: table;
  table-layout: fixed;
  width: 100%;
}
.text_overflow {
  display: table-cell;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.inbox_field {
  display: flex;
  width: 70%;
  align-items: center;
  justify-content: center;
}
.title {
    filter: drop-shadow(2px 4px 6px black);
  text-align: center;
  margin-bottom: 20px;
}
.single_message:hover {
  background: #4e4e4e52;
}
.single_message {
  color: rgb(170, 170, 170);
  cursor: pointer;
  transition: 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 10px;
  margin-bottom: 10px;
  border-radius: 20px;
  background: #00000052;
}
.single_message > i {
  font-size: 40px;
  margin-right: 10px;
}
.container_messages {
  padding: 70px 15px 0px 15px;
  width: 30%;
  background: #00000061;
  height: 100vh;
}
.new_msg_notif {
  width: 7px;
  height: 7px;
  background: #ff5722;
  position: absolute;
  right: 3px;
  top: 3px;
  border-radius: 50%;
}
/* width */
::-webkit-scrollbar {
  width: 5px;
  height: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgb(136 141 147);
  border-radius: 0px;
}

/* (min-width: 650px) */
@media screen and (min-width: 1000px) {
  .container_messages {
    width: 30%;
  }

  .inbox_field {
    width: 70%;
        position: relative !important;
  }
}
@media screen and (min-width: 750px) and (max-width: 1000px) {
  .container_messages {
    width: 40%;
  }

  .inbox_field {
    width: 70%;
  }
}

@media screen and (min-width: 600px) and (max-width: 750px) {
  .container_messages {
    width: 45%;
  }

  .inbox_field {
    width: 65%;
  }
}

@media screen and (min-width: 500px) and (max-width: 599px) {
  .container_messages {
    width: 45%;
  }

  .inbox_field {
    width: 55%;
  }
}

@media screen and (max-width: 500px) {
  .container_messages {
    background: transparent;
  }

  .container_messages {
    width: 100%;
  }

  .inbox_field {
    display: none;
  }
}
</style>

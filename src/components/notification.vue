<template>
  <div class="notif">
    <div style="position: relative" class="">
      <p
        :class="{ menu_active: menu_href }"
        id="notifs"
        @click="menu_href = true"
        class="menu col-6"
      >
        <i id="notifs" class="fas fa-users"> </i>
        <span v-if="req.length > 0" class="notif_num">{{
          connected_user.request.length
        }}</span>
      </p>
      <p
        id="notifs"
        :class="{ menu_active: !menu_href }"
        @click="menu_href = false"
        class="menu col-6"
      >
        <i id="notifs" class="fas fa-bell"></i>
        <span v-if="!notifs.seen && notifs.notif" class="notif_num">{{
          notifs.notif.length
        }}</span>
      </p>
    </div>
    <div class="loading-div" v-if="loading_notif">
     <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
    <div v-else>
      <div v-if="menu_href" class="request">
        <p class="req_not_found" v-if="req.length == 0">
          <i class="fas fa-exclamation-circle"></i>
          You have no request
        </p>
        <div   v-if="req.length > 0">

        <div
      
          id="notifs"
          class="_display"
          v-for="user in connected_user.request.reverse()"
          :key="user._id"
        >
          <p id="notifs" class="m-0">{{ user.sender }} send a request</p>
          <button id="notifs" style="float: right" @click="confirm(user)">
            Accept
          </button>
        </div>
        
        </div>
      </div>
      <div id="notifs" v-else class="notification">
        <div v-if="notifs.notif" id="notifs" class="request_accepted">
          <p
            id="notifs"
            class="notif_p"
            v-for="not in notifs.notif"
            :key="not.id"
          >
            <i class="fas fa-user-check"></i>
            <span>{{ not._from_name }}</span> accepted your request
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
var socket = io("http://localhost:3000");
export default {
  name: "notification",
  props: ["username_id", "username"],
  data() {
    return {
      loading_notif : true ,
      req: [],
      connected_user: [],
      menu_href: true,
      notifs: [],
    };
  },
  watch: {
    menu_href(val){
      if (!val) {
        socket.emit("see_notif",this.username_id)
      }
    },
    connected_user() {
      this.req = this.connected_user.request;
    },
    //  socket.emit("GET_CONNECTED_USER",this.username_id)
  },

  methods: {
    confirm(user) {
        let data = {
        user_name: this.username,
        user: this.username_id,
        sender_name: user.sender,
        sender: user.sender_id,
      };

      socket.emit("CONFIRM_FRIEND", data);
    },
  },
  created() {

    socket.on("see_notif",data=>{
        this.notifs.seen = data.seen
    })
    socket.on("update_notif", (data) => {
      if (data && data.id_user == this.username_id) {
        this.notifs = data;
           this.loading_notif = false
         
      }
    });
    //  GET_NOTIFS
    socket.emit("GET_NOTIF", this.username_id);
    socket.on("GET_NOTIF", (data) => {
      if (data && data.id_user == this.username_id) {
        this.notifs = data;
        this.loading_notif = false
      }
    });
    socket.on(this.username_id, (user) => {
      this.connected_user = user;
      this.loading_notif = false
    });

    socket.emit("GET_CONNECTED_USER", this.username_id);
    socket.on("GET_CONNECTED_USER", (user) => {
      
      this.connected_user = user[0];
      this.loading_notif = false
      
    });

    socket.on("FRIENDS_ACCEPTED", (data) => {
      this.$router.push({
        path: "/home",
      });
      this.$nextTick(() => {
        this.$router.push({
          name: "profile",
          params: { id: data },
        });
      });
    });
  },
};
</script>

<style scoped>
.loading-div{
     height: 212px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(.6);
}
.notification {
  height: 248px;
  overflow: auto;
}
.notif_p:hover {
  background: #2c2c2c;
}
.notif_p > span {
  font-size: 18px;
  color: #e67d5b;
  margin: 0 5px;
  text-decoration: underline;
}
.notif_p > i {
  font-size: 20px;
  color: #e67d5b;
  margin-bottom: 3px;
}
.notif_p {
  border-bottom: 1px solid #80808021;
  cursor: pointer;
  color: #eeeeee;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 10px;
  width: 100%;
}
.req_not_found {
  width: 100%;
  text-align: center;
  font-size: 20px;
  margin: 0;
  position: absolute;
  color: #e67d5b;
  font-weight: 600;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
._display {
  cursor: pointer;
  padding: 10px;
}
._display:hover {
  background: #2c2c2c;
}

.menu > i {
  background: transparent;
  font-size: 30px;
}
.notif {
  max-width: 100%;
  background: #131313fa;
  width: 344px;
  height: 302px;
  position: fixed;
  z-index: 9;
  right: 0;
  top: 60px;
}
.menu_active {
  color: #e67d5b !important;
  background: #2c2c2c;
}
.menu {
  cursor: pointer;
  color: #eeeeee;
  text-align: center;
  margin: 0;
  padding: 10px;
  transition: 0.3s;
}
.menu:hover {
  background: #2c2c2c;
}
.notif_num {
  color: white;
  position: absolute;
  left: lef;
  left: 0;
  top: 0;
  background: #f44336;
  padding: 0px 6px;
  border-bottom-right-radius: 9px;
}
.lds-spinner {
  color: official;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-spinner div {
  transform-origin: 40px 40px;
  animation: lds-spinner 1.2s linear infinite;
}
.lds-spinner div:after {
  content: " ";
  display: block;
  position: absolute;
  top: 3px;
  left: 37px;
  width: 6px;
  height: 18px;
  border-radius: 20%;
  background: #fff;
}
.lds-spinner div:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -1.1s;
}
.lds-spinner div:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: -1s;
}
.lds-spinner div:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: -0.9s;
}
.lds-spinner div:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: -0.8s;
}
.lds-spinner div:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: -0.7s;
}
.lds-spinner div:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: -0.6s;
}
.lds-spinner div:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: -0.5s;
}
.lds-spinner div:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: -0.4s;
}
.lds-spinner div:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: -0.3s;
}
.lds-spinner div:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: -0.2s;
}
.lds-spinner div:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: -0.1s;
}
.lds-spinner div:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0s;
}
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
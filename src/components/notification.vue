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
        <span v-if="notifs_num > 0" class="notif_num"> {{ notifs_num }} </span>
      </p>
    </div>
    <div class="loading-div" v-if="loading_notif">
      <div class="lds-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div v-else>
      <div v-if="menu_href" class="request">
        <p class="req_not_found" v-if="req.length == 0">
          <i class="fas fa-exclamation-circle"></i>
          You have no request
        </p>
        <div v-if="req.length > 0">
          <div id="notifs" class="_display" v-for="user in req" :key="user._id">
            <p @click="to_profil(user.sender_id)" id="notifs" class="m-0">
              <a class="sender_notif">{{ user.sender }}</a> send a request
            </p>
            <div style="margin-left: auto" class="">
              <button
                id="notifs"
                class="accept_btn mr-1"
                @click="confirm(user)"
              >
                <i class="fas fa-check"></i>
              </button>

              <button id="notifs" class="accept_btn" @click="del_req(user._id)">
                <i id="notifs" class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="notifs" v-else class="notification">
        <div v-if="notifs.notif" id="notifs" class="request_accepted">
          <!-- <i class="fas fa-user-check"></i> -->

          <div
            style="display: flex; align-items: center"
            id="notifs"
            class="notif_p"
            v-for="not in notifs.notif"
            :key="not.id"
            @click="to_profil(not._from)"
          >
            <div class="img_or_logo">
              <img v-if="not.img_notif" :src="not.img_notif" alt="" />
              <i
                v-else
                style="font-size: 35px; color: burlywood"
                class="far fa-user-circle"
              ></i>
            </div>

            <div style="width: 100%; display: grid">
              <div style="display: flex">
                <span class="sender_notif">{{ not._from_name }}</span>
                <span class="data_notif">
                  {{ notif_time(not.date) }}
                </span>
              </div>
              <p class="m-0">accepted your request</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../init_socket";
export default {
  name: "notification",
  props: ["username_id", "username", "notifs", "notifs_num"],
  data() {
    return {
      loading_notif: true,
      req: [],
      connected_user: [],
      menu_href: true,
    };
  },
  watch: {
    menu_href(val) {
      if (!val) {
        socket.emit("see_notif", this.username_id);
      }
    },
    connected_user() {
      this.req = this.connected_user.request;
    },
    //  socket.emit("GET_CONNECTED_USER",this.username_id)
  },

  methods: {
    del_req(id) {
      socket.emit("delete_req", [this.username_id, id]);
    },
    notif_time(time) {
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

      var date = new Date(time);
      var min = date.getMinutes();
      var hour = date.getHours();
      var day = days[date.getDay()];
      var day_num = date.getDate();
      var mounth = monthNames[date.getMonth()];

      if (date.getMinutes() < 10) min = "0" + date.getMinutes();
      if (date.getHours() < 10) hour = "0" + date.getHours();

      var now = Date.now();

      var period = (now - time) / 1000 / 3600 / 24;
      var date_fetch = "";
      if (0 < period && period < 1) {
        date_fetch = hour + ":" + min;
      }
      if (1 <= period && period < 7) {
        date_fetch = day + " " + hour + ":" + min;
      }
      if (7 <= period && period <= 30) {
        date_fetch = day_num + " " + mounth;
      }
      if (period > 30) {
        date_fetch = mounth + " " + date.getFullYear();
      }

      return date_fetch;
    },
    to_profil(id) {
      if (this.$route.name == "profile") {
        this.$router.push({
          path: "/home",
        });
        this.$nextTick(() => {
          this.$router.push({
            name: "profile",
            params: { id },
          });
        });
      } else {
        this.$router.push({
          name: "profile",
          params: { id },
        });
      }
    },
    confirm(user) {
      let data = {
        user_name: this.username,
        user: this.username_id,
        sender_name: user.sender,
        sender: user.sender_id,
        img_notif: this.connected_user?.picture,
      };

      socket.emit("CONFIRM_FRIEND", data);
    },
  },
  created() {
    socket.on(this.username_id, (user) => {
      this.connected_user = user;
    });

    socket.emit("GET_CONNECTED_USER", this.username_id);
    socket.on("GET_CONNECTED_USER", (user) => {
      this.connected_user = user[0];
      this.loading_notif = false;
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
.img_or_logo {
  margin-right: 8px;
  width: 50px;
  display: flex;
  justify-content: center;
}
.img_or_logo > img {
  width: 45px;
  border-radius: 15px;
}
.data_notif {
  margin-left: auto !important;
  font-size: 15px !important;
  color: burlywood !important;
}
.accept_btn:hover {
  transform: scale(1.1);
}
.accept_btn {
  transition: 0.3;

  border: none;
  background: #9e9e9e;
}
.sender_notif {
  color: burlywood !important;
  font-size: 16px;
  text-decoration: underline !important;
}
.loading-div {
  height: 212px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.6);
}
.notification {
  height: 248px;
  overflow: auto;
}
.notif_p:hover {
  background: #2c2c2c;
}
.notif_p > span {
  font-size: 16px;
  color: #e67d5b;
  margin: 0 5px;
  text-decoration: underline;
}
.notif_p > i {
  font-size: 20px;
  color: #e67d5b;
}
.notif_p {
  border-bottom: 1px solid #80808021;
  cursor: pointer;
  color: #eeeeee;
  display: flex;
  align-items: flex-end;
  margin: 0;
  padding: 10px;
  width: 100%;
  font-size: 13px;
}
.req_not_found {
  width: 100%;
  text-align: center;
  font-size: 17px;
  margin: 0;
  position: absolute;
 color: burlywood;
  font-weight: 600;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
._display {
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
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
  width: 400px;
  height: 302px;
  position: fixed;
  z-index: 9;
  right: 9px;
  top: 60px;
}
.menu_active {
  background: #2c2c2c;
}
.menu {
  cursor: pointer;
  color: #7d7d7d;
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
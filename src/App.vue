<template>
  <div style="background: #262626; heigh: 400vh" id="app">
    <nav style="padding: 0 0" class="navbar">
      <router-link class="logo" tag="div" to="/">
        <i
          v-if="!search_bar_active"
          style="font-size: 30px"
          class="fas fa-home"
        ></i>
        <!-- <img src="/images/logo.png" alt=""> -->
      </router-link>

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
                  class="m-0 p-2 result_content"
                  v-for="search in search_rsl"
                  :key="search._id"
                  @click="main_profile(search._id)"
                >
                  <i s class="user_icone far fa-user-circle"></i>
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
            <i class="far fa-user-circle"></i>
          </li>
          <li
            style="position: relative"
            id="notifs"
            @click="show_notif = !show_notif"
            class="nav-item"
          >
            <i id="notifs" class="fas fa-bell"></i>
            <span class="notification_num">{{ number_notif() }}</span>
          </li>

          <!-- </router-link> -->
          <router-link class="nav-item" tag="li" to="/inbox">
            <i class="fas fa-comments"></i>
          </router-link>
          <li @click="logout()" class="nav-item">
            <i class="fas fa-sign-out-alt"></i>
          </li>
        </ul>
      </div>
      <Notif
        v-if="show_notif"
        :username="username"
        :username_id="username_id"
        id="notifs"
      />
    </nav>

    <router-view
      :pro="pro"
      :show_inbox="show_inbox"
      :username_general="username"
      @updateStatus="updateStatus"
    />
  </div>
</template>

<script>
import Notif from "./components/notification";
import io from "socket.io-client";
var socket = io("http://localhost:3000");

export default {
  name: "app",
  components: {
    Notif,
  },
  data() {
    return {
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
      
    };
  },
  watch: {
    username_id() {
      socket.emit("GET_CONNECTED_USER", this.username_id);
      socket.on("GET_CONNECTED_USER", (user) => {
        this.connected_user = user[0];
      });
      socket.emit("GET_NOTIF", this.username_id);
    },
    $route() {
      this.show_notif = false;
    },
    search(val) {
      if (val == "") {
        this.search_rsl = [];
        this.show_search = false;
      }
      if (val.length > 0) {
        this.search_rsl = [];
        this.show_search = true;
        socket.emit("SEARCH", val);
      }
    },
  },
  methods: {
    number_notif() {
      var req = 0 
      var notif = 0
     
     if(this.connected_user.request){
       req = this.connected_user.request.length;
     }
      if (this.notifs.notif && this.notifs.seen == false ) {
        notif = this.notifs.notif.length 
      }
      return req + notif
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
      localStorage.removeItem("username");
      localStorage.removeItem("username_id");
      this.username_id = "";
      this.username = "";
      this.notifs = []
      this.connected_user = "";

      if (this.$route.path != "/") {
        this.$router.push("/");
      }
    },
  },
  created() {
    this.username = localStorage.getItem("username");
    this.username_id = localStorage.getItem("username_id");

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

    socket.on("SEARCH", (result) => {
      if (result == "No Results") this.search_rsl = "No Results";
      else this.search_rsl = result;
    });

    socket.on("update_notif", (data) => {
      if (data && data.id_user == this.username_id) {
        this.notifs = data;
      }
    });
    //  GET_NOTIFS

    socket.on("GET_NOTIF", (data) => {
      if (data && data.id_user == this.username_id) {
        this.notifs = data;
      }
    });

    socket.on("UPDATE_REQ", (data) => {
      if (data[0]._id == this.username_id) {
        this.connected_user = data[0];
      }
    });
    socket.on("GET_CONNECTED_USER", (user) => {
      this.connected_user = user;
    });
    socket.on(this.username_id, (user) => {
      console.log("ddd");
      this.connected_user = user;
    });
  },
  mounted() {},
};
</script>

<style>
.notification_num {
  font-family: monospace;
  font-size: 14px;
  background: #f44336;
  padding: 0 5px;
  border-radius: 50%;
  font-weight: 900;
  filter: drop-shadow(2px 4px 6px black);
  position: absolute;
  right: 0;
  top: 4px;
}
.user_icone {
  font-size: 24px;
  margin-right: 8px;
}
.no-rsl {
  width: 100%;
  color: #e07265;
  font-weight: 600;
}
.result_content {
  text-align: left;
  width: 215px;
}
.result_content:hover {
  background: #3d3d3d;
}
.search-result {
  width: 215px;
  max-height: 250px;
  overflow: auto;
  position: absolute;
  text-align: center;
  background: #171717;
  transform: translateY(100%);
  bottom: -10px;
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
  width: 190px !important;
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
</style>
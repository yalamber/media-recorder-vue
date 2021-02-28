<template>
  <div class="respond">
    <button id="show-modal" @click="active = true">{{ label }}</button>
    <transition v-if="active" name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <h3>Record your thoughts</h3>
              <button class="modal-close-button" @click="active = false">
                x
              </button>
            </div>
            <div class="modal-body">
              <input type="text" v-model="email" placeholder="your email address" />
              <div class="media-buttons">
                Respond in:
                <button
                  @click="mediaType = 'video'"
                  :class="[(mediaType === 'video' ? 'active' : 'inactive')]"
                >
                  Video
                </button>
                <button
                  @click="mediaType = 'photo'"
                  :class="[(mediaType === 'photo' ? 'active' : 'inactive')]"
                >
                  Photo
                </button>
                <button
                  @click="mediaType = 'audio'"
                  :class="[(mediaType === 'audio' ? 'active' : 'inactive')]"
                >
                  Audio
                </button>
              </div>
              <div id="content-container">
                <VideoCapture v-if="mediaType === 'video'" />
                <PhotoCapture v-if="mediaType === 'photo'" />
                <AudioCapture v-if="mediaType === 'audio'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import VideoCapture from "./VideoCapture";
import PhotoCapture from "./PhotoCapture";
import AudioCapture from "./AudioCapture";
export default {
  name: "Responder",
  props: {
    label: String,
  },
  data: () => ({
    active: false,
    mediaType: null,
    email: "",
  }),
  components: {
    VideoCapture,
    AudioCapture,
    PhotoCapture,
  },
  methods: {
    onSubmit: () => {
      
    }
  }
};
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  max-width: 100%;
  width: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}
@media only screen and (max-width: 600px) {
  .modal-container {
    width: inherit;
    margin: 0px auto;
  }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}
.media-buttons {
  padding: 10px;
}
.modal-body button {
  margin: 0 5px;
}
.modal-body input {
  padding: 5px;
  width: 250px;
  max-width: 100%;
}
.modal-close-button {
  align-self: flex-start;
  border-radius: 50px;
  width: 25px;
  padding: 5px;
  border: none;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
button {
  border: 2px solid #000;
  border-radius: 5px;
  padding: 5px;
}
button.active {
  background: #42b983;
}
</style>

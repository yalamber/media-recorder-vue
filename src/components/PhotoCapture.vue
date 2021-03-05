<template>
  <section :style="styling" v-if="isValid" class="photo-capture">
    <video
      v-show="showVideo"
      ref="player"
      class="camera"
      autoplay
      playsinline
    />
    <canvas v-show="!showVideo" class="preview" ref="canvas" />
    <Loader v-show="isUploading" />
    <div v-if="!hideBtns" class="center photo-capture-actions">
      <button v-if="showVideo && videoInput > 1" @click="changeCameraFacing" class="btn flip-camera"><font-awesome-icon icon="sync" /></button>
      <button
        :class="'btn flex-center ' + buttonsClasses"
        @click.prevent="capture"
        v-if="showVideo"
      >
        {{ captureBtnContent }}
        <font-awesome-icon style="color: red" icon="camera" />
      </button>
      <div class="controls" v-else>
        <button :class="'btn ' + buttonsClasses" @click.prevent="cancel">
          {{ cancelBtnContent }}
        </button>
        <button :class="'btn ' + buttonsClasses" @click.prevent="upload">
          {{ uploadBtnContent }}
        </button>
      </div>
    </div>
  </section>
</template>
<style scoped>
video,
canvas {
  width: 400px;
}

@media only screen and (max-width: 600px) {
  video,
  canvas {
    width: 100%;
  }
}
.controls button {
  margin: 0 5px;
}
button.btn {
  border: 2px solid #000;
  border-radius: 5px;
  padding: 5px;
  background: #fff;
  color: #000;
  margin-top: 10px;
}
video {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
.btn.flip-camera{
  margin-right: 10px;
}
</style>
<script>
import Loader from "./Loader.vue";

export default {
  name: "PhotoCapture",
  components: {
    Loader,
  },
  props: {
    hideBtns: {
      type: Boolean,
      isRequired: false,
      default: false,
    },
    styling: {
      type: Object,
      isRequired: false,
    },
    value: {
      default: null,
    },
    hideButtons: {
      type: Boolean,
      default: false,
    },
    buttonsClasses: {
      type: String,
      default: "",
    },
    captureBtnContent: {
      default: "Capture",
    },
    cancelBtnContent: {
      default: "Cancel",
    },
    uploadBtnContent: {
      default: "Upload",
    },
  },
  data() {
    return {
      showVideo: true,
      picture: null,
      isValid: true,
      isUploading: false,
      cameraFacing: "user",
      videoInput: null
    };
  },
  mounted() {
    this.videoPlayer = this.$refs.player;
    this.canvasElement = this.$refs.canvas;
    this.streamUserMediaVideo();
    this.countVideoInput();
  },
  methods: {
    streamUserMediaVideo() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }
      const supports = navigator.mediaDevices.getSupportedConstraints();
      let constraints = {
        video: true
      }
      if( supports['facingMode'] === true ) {
        constraints.video = { facingMode: this.cameraFacing }
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => (this.videoPlayer.srcObject = stream))
        .catch(() => {
          this.isValid = false;
        });
    },
    capture() {
      this.showVideo = false;
      this.canvasElement.width = this.videoPlayer.videoWidth;
      this.canvasElement.height = this.videoPlayer.videoHeight;
      var context = this.canvasElement.getContext("2d");
      context.translate(this.canvasElement.width, 0);
      context.scale(-1, 1);
      context.drawImage(this.$refs.player, 0, 0);
      this.stopVideoStream();
      this.picture = this.$refs.canvas.toDataURL();
    },
    upload() {
      var a = document.createElement("a");
      a.href = this.picture;
      a.download = new Date().toISOString() + "." + "png";
      a.click();
      //console.log(this.picture);
    },
    cancel() {
      this.showVideo = true;
      this.streamUserMediaVideo();
    },
    stopVideoStream() {
      if (!(this.$refs.player && this.$refs.player.srcObject)) return;
      this.$refs.player.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    },
    countVideoInput() {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter((device)=> {
            return device.kind === 'videoinput'
          })
          this.videoInput = videoDevices.length
        })
        .catch((e) => console.log(e));
    },
    changeCameraFacing(){
      this.stopVideoStream();
      this.cameraFacing = this.cameraFacing === "user" ? "environment" : "user";
      this.streamUserMediaVideo();
    },
  },
  beforeDestroy() {
    if (this.videoPlayer.srcObject) {
      this.videoPlayer.srcObject.getTracks().forEach(function (track) {
        track.stop();
      });
    }
  },
};
</script>
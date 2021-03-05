<template>
  <section class="video-cap-container" v-if="isValid">
    <div v-show="!isUploading" class="stream-container">
      <video
        ref="videoRec"
        v-show="!showRecordedPlayer"
        class="camera"
        muted
        loop
        autoplay
      />
      <video ref="videoRecorded" v-show="showRecordedPlayer" playsinline />
      <div class="video-actions-wrapper">
        <template v-if="!isFinished">
          <button v-if="!isRecording" @click="changeCameraFacing" class="btn flip-camera"><font-awesome-icon  icon="sync" /></button>
          <button v-if="!isRecording" @click="record" class="btn flex-center">
            {{ recordBtnContent }} <font-awesome-icon style="color: red" icon="record-vinyl" />
          </button>
          <button v-else @click="stop" class="btn btn-rec">
            <font-awesome-icon style="color: red" icon="stop-circle" />
            <p>Recording...</p>
          </button>
        </template>
      </div>
    </div>

    <Loader v-show="isUploading" />
    <div class="controls" v-if="isFinished && !isUploading">
      <button type="button" class="btn" @click.prevent="resetVideo">
        {{ cancelBtnContent }}
      </button>
      <button type="button" class="btn" @click.prevent="upload">
        {{ uploadBtnContent }}
      </button>
      <button type="button" class="btn" @click.prevent="playRecorded">
        <font-awesome-icon icon="play" />
      </button>
    </div>
    <h1 class="error-video">{{ errText }}</h1>
  </section>
</template>

<script>
import Loader from "./Loader.vue";
export default {
  name: "VideoCapture",
  props: {
    recordBtnContent: {
      default: "Record",
    },
    cancelBtnContent: {
      default: "Cancel",
    },
    uploadBtnContent: {
      default: "Upload",
    },
  },
  components: {
    Loader,
  },
  data() {
    return {
      containerType: "video/webm",
      errText: null,
      isValid: true,
      isUploading: false,
      isRecording: false, // recording mode identifier
      isFinished: false, // finished recording - action buttons indicator
      recorder: null, // component wide MediaRecorder
      connection: null, // component wide WebSocket
      stream: null,
      recordedBlobs: null,
      recordedUrl: null,
      showRecordedPlayer: false,
      supportedType: null,
      cameraFacing: "user"
    }
  },
  mounted() {
    this.resetVideo();
  },
  methods: {
    // reset video display with media device media stream
    resetVideo() {
      console.log("top", this.cameraFacing);
      this.showRecordedPlayer = false;
      this.recorderBlobs = null;
      this.$refs.videoRecorded.src = null;
      this.$refs.videoRecorded.srcObject = null;
      this.isFinished = false;
      this.isRecording = false;
      this.isLoading = true;
      this.$refs.videoRec.muted = true;
      const supports = navigator.mediaDevices.getSupportedConstraints();
      let constraints = {
        audio: true,
      };
      if( supports['facingMode'] === true ) {
        console.log(supports['facingMode'])
        constraints['video'] = { facingMode: this.cameraFacing }
      }else{
        console.log(supports['facingMode'])
        constraints['video'] = true
      }
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
    },
    playRecorded() {
      this.showRecordedPlayer = true;
      this.$refs.videoRecorded.src = null;
      this.$refs.videoRecorded.srcObject = null;
      this.$refs.videoRecorded.src = window.URL.createObjectURL(this.recordedBlobs);
      this.$refs.videoRecorded.controls = true;
      this.$refs.videoRecorded.play();
    },
    // start recoording
    record() {
      this.recorder.start();
      this.isRecording = true;
    },
    // stop recording
    stop() {
      this.recorder.stop();
      this.isRecording = false;
      this.isFinished = true;
    },
    upload() {
      const blob = new Blob([this.recordedBlobs], { type: this.supportedType, bitsPerSecond:128000});
      const url = window.URL.createObjectURL(blob)
      
      let link = document.createElement('a');
      link.href = url;
      link.download = new Date().toISOString() + '.'+'mp4';
      link.innerHTML = link.download;
      link.click()

      console.log("blob", blob)
      console.log('url', url)
      //this.isUploading = true;
      // this.resetVideo();
    },
    // initialize MediaRecorder and video element source
    gotStream(mediaStream) {
      this.stream = mediaStream;
      if (typeof MediaRecorder.isTypeSupported == "function") {
        let options;
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
          options = { mimeType: "video/webm;codecs=vp9" };
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
          options = { mimeType: "video/webm;codecs=h264" };
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          options = { mimeType: "video/webm" };
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          //Safari 14.0.2 has an EXPERIMENTAL version of MediaRecorder enabled by default
          this.containerType = "video/mp4";
          options = { mimeType: "video/mp4" };
        }
        this.supportedType = options;
        this.recorder = new MediaRecorder(mediaStream, options);
      } else {
        this.recorder = new MediaRecorder(mediaStream);
      }
      
      this.recorder.ondataavailable = this.videoDataHandler;
      this.$refs.videoRec.src = null;
      this.$refs.videoRec.srcObject = mediaStream;
      this.toggleVideo();
    },
    videoDataHandler(event) {
      this.recordedBlobs = event.data;
    },
    // toggle video display
    toggleVideo() {
      this.$refs.videoRec.loop = !this.$refs.videoRec.loop;
    },
    changeCameraFacing(){
      this.cameraFacing = this.cameraFacing === "user" ? "environment" : "user";
      console.log(this.cameraFacing)
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: { facingMode: "environment"}
        })
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
    },
  },
  beforeDestroy() {
    this.stream.getTracks().forEach(function (track) {
      track.stop();
    });
  },
};
</script>
<style scoped>
.controls button {
  margin: 0 5px;
}
.video-cap-container {
  max-width: 100%;
}
video {
  width: 400px;
}

@media only screen and (max-width: 600px) {
  video {
    width: 100%;
  }
}
button.btn {
  border: 2px solid #000;
  border-radius: 5px;
  padding: 5px;
  background: #fff;
  color: #000;
   margin-top: 10px;
}
button.btn-rec{
  padding: 2px 5px;
  border: none;
  outline: none;
  font-size: 46px;
}
.video-actions-wrapper p{
  font-size: 14px;
  margin: 0px;
  padding: 5px 0 0 0;
}
video {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
.btn.flip-camera{
  margin-right: 10px;
}
</style>
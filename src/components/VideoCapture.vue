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
          <button v-if="!isRecording" @click="record" class="btn flex-center">
            {{ recordBtnContent }}
          </button>
          <button v-else @click="stop" class="btn">
            {{ stopBtnContent }}
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
        {{ playBtnContent }}
      </button>
    </div>
    <h1 class="error-video">{{ errText }}</h1>
  </section>
</template>

<script>
import ElementMixin from "../mixins/ElementMixin";
import Loader from "./Loader.vue";
export default {
  name: "VideoCapture",
  mixins: [ElementMixin],
  props: {
    recordBtnContent: {
      default: "Record",
    },
    stopBtnContent: {
      default: "◼",
    },
    playBtnContent: {
      default: "➤",
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
    };
  },
  mounted() {
    this.resetVideo();
  },
  methods: {
    // reset video display with media device media stream
    resetVideo() {
      this.showRecordedPlayer = false;
      this.recorderBlobs = null;
      this.$refs.videoRecorded.src = null;
      this.$refs.videoRecorded.srcObject = null;
      this.isFinished = false;
      this.isRecording = false;
      this.isLoading = true;
      this.$refs.videoRec.muted = true;
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
    },
    playRecorded() {
      this.showRecordedPlayer = true;
      const superBuffer = new Blob(this.recordedBlobs, {
        type: "video/webm",
      });
      this.$refs.videoRecorded.src = null;
      this.$refs.videoRecorded.srcObject = null;
      this.$refs.videoRecorded.src = window.URL.createObjectURL(superBuffer);
      this.$refs.videoRecorded.controls = true;
      this.$refs.videoRecorded.play();
    },
    // start recoording
    record() {
      this.recordedBlobs = [];
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
      this.isUploading = true;
      // this.resetVideo();
    },
    // initialize MediaRecorder and video element source
    gotStream(mediaStream) {
      this.stream = mediaStream;
      this.recorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm",
        audioBitsPerSecond: 128000,
      });
      this.recorder.ondataavailable = this.videoDataHandler;
      this.$refs.videoRec.src = null;
      this.$refs.videoRec.srcObject = mediaStream;
      this.toggleVideo();
    },
    videoDataHandler(event) {
      this.recordedBlobs.push(event.data);
    },
    // toggle video display
    toggleVideo() {
      this.$refs.videoRec.loop = !this.$refs.videoRec.loop;
    },
  },
  unmounted() {
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
}
</style>
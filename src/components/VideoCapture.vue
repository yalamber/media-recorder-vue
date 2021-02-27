<template>
  <section class="video-cap-container" v-if="isValid">
    <div v-show="!isUploading" class="stream-container">
      <video ref="videoRec" class="camera" muted loop controls autoplay />
      <div class="video-actions-wrapper">
        <template v-if="!isFinished">
          <button v-if="!isRecording" @click="record" class="btn flex-center">
            {{ recordBtnContent }}
          </button>
          <button v-else @click="stop" class="btn">
            <span style="font-size: 3em">{{ stopBtnContent }}</span>
          </button>
        </template>
      </div>
    </div>
    <Loader v-show="isUploading" />
    <div class="controls" v-if="isFinished && !isUploading">
      <button type="button" class="btn" @click.prevent="resetVideo">
        {{ cancelBtnContent }}
      </button>
      <button type="button" class="btn" @click.prevent="done">
        {{ doneBtnContent }}
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
    uploadUrl: {
      default: null,
    },
    recordBtnContent: {
      default: "Record",
    },
    stopBtnContent: {
      default: "◼",
    },
    cancelBtnContent: {
      default: "Cancel",
    },
    doneBtnContent: {
      default: "OK",
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
      videoUrl: null, // link to video - assigned when done writing video file
      stream: null,
      recordedBlobs: null,
    };
  },
  mounted() {
    this.resetVideo();
  },
  methods: {
    // reset video display with media device media stream
    resetVideo() {
      this.isFinished = false;
      this.isRecording = false;
      this.isLoading = true;
      this.$refs.videoRec.muted = true;
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true,
        })
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
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
    // reset video diaply and emit video file url
    done() {
      this.resetVideo();
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
      this.$refs.videoRec.controls = !this.$refs.videoRec.controls;
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
.video-cap-container {
  max-width: 100%;
}
video {
  width: 400px;
}
</style>
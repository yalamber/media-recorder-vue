<template>
  <section class="audio-cap-container" v-if="isValid">
    <div v-show="!isUploading" class="stream-container">
      <audio ref="audioRecorded" v-show="showRecordedPlayer" />
      <div class="audio-actions-wrapper">
        <template v-if="!isFinished">
          <button v-if="!isRecording" @click="record" class="btn flex-center">
            {{ recordBtnContent }}
            <font-awesome-icon style="color: red" icon="record-vinyl" />
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
      <button type="button" class="btn" @click.prevent="resetAudio">
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
  name: "AudioCapture",
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
    this.resetAudio();
  },
  methods: {
    resetAudio() {
      this.showRecordedPlayer = false;
      this.recorderBlobs = null;
      this.isFinished = false;
      this.isRecording = false;
      this.isLoading = true;
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(this.gotStream)
        .catch(() => (this.isValid = false));
    },
    playRecorded() {
      this.showRecordedPlayer = true;
      this.$refs.audioRecorded.src = null;
      this.$refs.audioRecorded.srcObject = null;
      this.$refs.audioRecorded.src = window.URL.createObjectURL(
        this.recordedBlobs
      );
      this.$refs.audioRecorded.controls = true;
      this.$refs.audioRecorded.play();
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
      let options;
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        this.containerType = "audio/ogg";
        options = { mimeType: "audio/ogg" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        this.containerType = "audio/mp4";
        options = { mimeType: "audio/mp4" };
      }
      const blob = new Blob([this.recordedBlobs], {
        type: options,
        bitsPerSecond: 128000,
      });
      const url = window.URL.createObjectURL(blob);

      let link = document.createElement("a");
      link.href = url;
      link.download = new Date().toISOString() + "." + "webm";
      link.innerHTML = link.download;
      link.click();

      console.log("blob", blob);
      console.log("url", url);
      //this.isUploading = true;
    },
    // initialize MediaRecorder and video element source
    gotStream(mediaStream) {
      this.stream = mediaStream;
      this.recorder = new MediaRecorder(mediaStream);
      this.recorder.ondataavailable = this.audioDataHandler;
    },
    audioDataHandler(event) {
      this.recordedBlobs = event.data;
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
button.btn {
  border: 2px solid #000;
  border-radius: 5px;
  padding: 5px;
  background: #fff;
  color: #000;
  margin-top: 10px;
}
button.btn-rec {
  padding: 2px 5px;
  border: none;
  outline: none;
  font-size: 46px;
}
.audio-actions-wrapper p {
  font-size: 14px;
  margin: 0px;
  padding: 5px 0 0 0;
}
</style>
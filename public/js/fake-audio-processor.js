// fake-audio-processor.js

// 偽のAudioWorkletProcessorを定義
class FakeAudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      for (let channel = 0; channel < output.length; channel++) {
        const outputChannel = output[channel];
        for (let i = 0; i < outputChannel.length; i++) {
          outputChannel[i] = 0; // 無音で埋める
        }
      }
      return true;
    }
  }
  
  // AudioWorkletProcessorを登録
  registerProcessor('fake-audio-processor', FakeAudioProcessor);
  
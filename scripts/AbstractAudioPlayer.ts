export class AbstractAudioPlayer {
  private readonly audioPlayer: HTMLAudioElement | null;

  public get paused(): boolean {
    return this.audioPlayer?.paused ?? false;
  }

  public play(v: string) {
    if (this.audioPlayer) {
      this.audioPlayer.src = v;
      this.audioPlayer.play().then(() => { /* no-op */ }, () => { /* no-op */ });
    }
  }

  public pause() {
    this.audioPlayer?.pause();
  }

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.audioPlayer = new Audio();
    } else {
      this.audioPlayer = null;
    }
  }
}

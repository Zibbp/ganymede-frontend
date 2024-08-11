interface Data {
  time: number;
  playing: boolean;
  paused: boolean;
}

class vodDataBus {
  data: Data;

  constructor() {
    this.data = {
      time: 0,
      playing: false,
      paused: true,
    };
  }

  setData(data: Data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}
export default new vodDataBus();

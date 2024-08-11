 // setup chapters if there are any
    if (vod.edges && vod.edges.chapters && vod.edges.chapters.length > 0) {
      const tmpChapters: string = convertToChapters(vod.edges.chapters)
      setChapters(tmpChapters)

      const foo = `[
        {
          "startTime" 0, "endTime": 5, "text": foo" }
        }
      ]`

      const track = new TextTrack({
        content: JSON.stringify(foo),
        kind: "chapters",
        type: "json",
        default: true,
      })

      player.current?.textTracks.add(track)
      console.log(tmpChapters)
    }


    const convertToChapters = (json: any): string => {
      const chapters: any[] = [];
    
      json.forEach((chapter: any) => {
        const startTime = formatTime(chapter.start || 0);
        const endTime = formatTime(chapter.end || 0);
        const text = chapter.title || "";
    
        chapters.push({ startTime, endTime, text });
      });
    
      return JSON.stringify(chapters);
    };
    
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${pad(hours)}:${pad(minutes)}`;
    };
    
    const pad = (num: number): string => {
      return num.toString().padStart(2, '0');
    };
    
    const padZero = (num: number): string => num.toString().padStart(2, '0');
    
    
    const content: VTTContent = {
      regions: [],
      cues: [
        { startTime: 0, endTime: 5, text: '...' },
        { startTime: 5, endTime: 10, text: '...' },
      ],
    };
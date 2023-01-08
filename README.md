# youtube transcripts

insert youtube video transcripts into your roam notes.


https://user-images.githubusercontent.com/1139703/211220555-1377fa77-6a02-46f1-9032-bd967190d50a.mp4


## usage

after installing this plugin, you can insert transcripts from a block in two ways:

- Command Palette (cmd + p) → Get Youtube Transcript
- Block Context Menu (right blick on a block) → plugins → Get Youtube Transcript

the active block needs to have a youtube url in it OR be blank and have a parent block with a youtube url.

transcript blocks will be inserted under a new block containing `transcript:`

each transcript block will have a timestamped link, and children block(s) with the transcript text.

## puncuation

some youtube captions have punctuation, some don't. if there is punctuation, we join the text with a space into one block. if there is no punctuation, each blurb that we get from the transcript is a separate block.

## how it works

this plugin currently uses [https://youtubetranscript.com/](https://youtubetranscript.com/) through a phonetonote proxy to get transcripts directly from youtube. this means only videos that have youtube transcripts will work. the plugin is keeping track of how successful it is at getting transcripts to determine if using an audio to text model (e.g. whisper) is worth it. this might come in a future version. this would also add (mediocre) punctuation to all transcripts.

## warning about syncing

this plugin creates lots of blocks, especially for long videos without punctuation. they are organized and mostly collapsed, so it doesn't cause clutter or jank, but you do need to be mindful of the red/yellow/green dot after getting a transcript. it will take some time for large captions to sync.

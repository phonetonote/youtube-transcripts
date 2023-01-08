# youtube transcripts

insert youtube video transcripts into your roam notes.

# usage

after installing this plugin, you can insert transcripts from a block _containing a youtube url_ in two ways:

- Command Palette (cmd + p) → Get Youtube Transcript
- Block Context Menu (right blick on a block) → plugins → Get Youtube Transcript

the transcript will be inserted as children, directly beneath the youtube url.

this plugin currently uses [https://youtubetranscript.com/](https://youtubetranscript.com/) through a phonetonote proxy to get transcripts directly from youtube. this means only videos that have youtube transcripts will work. the plugin is keeping track of how successful it is at getting transcripts to determine if using an audio to text model (e.g. whisper) is worth it. this might come in a future version.

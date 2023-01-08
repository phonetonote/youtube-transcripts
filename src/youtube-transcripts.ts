import getTextByBlockUid from "roamjs-components/queries/getTextByBlockUid";
import getParentUidByBlockUid from "roamjs-components/queries/getParentUidByBlockUid";
import createBlock from "roamjs-components/writes/createBlock";
import updateBlock from "roamjs-components/writes/updateBlock";

type CaptionData = {
  start: number;
  text_arr: string[];
  formatted_timestamp: string;
  link: string;
};

const MIN_PERIOD_PERCENTAGE = 0.3;
const UKNOWN_ERROR = "sorry, an unknown error occurred";
const GENERIC_ERROR_MESSAGE =
  "sorry, we couldn't get a transcript for that video. future versions of this extension will support more videos";
const NO_VIDEO_ERROR = "please select a block with a youtube url to get a transcript";
const GET_TRANSCRIPT_LABEL = "Get Youtube Transcript";
const PTN_ROOT = "https://app.phonetonote.com";
const BASE_HEADERS = { "Content-Type": "application/json" };
const LOADING_MESSAGE = "loading transcript...";

function extractYoutubeId(text: string): string | undefined {
  if (!text) return undefined;

  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?v=))([\w-]{11})/;
  const match = text.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return undefined;
  }
}

function getPossibleYoutubeId(targetUid: string): {
  possibleYoutubeId: string | undefined;
  isTextOnBlock: boolean;
} {
  let possibleYoutubeId = undefined;
  let isTextOnBlock = false;

  if (targetUid) {
    const textOnBlock = getTextByBlockUid(targetUid);
    possibleYoutubeId = extractYoutubeId(textOnBlock);

    if (possibleYoutubeId) {
      isTextOnBlock = true;
    }

    if (!possibleYoutubeId) {
      const parentUid = getParentUidByBlockUid(targetUid);
      const textOnParent = getTextByBlockUid(parentUid);
      possibleYoutubeId = extractYoutubeId(textOnParent);
    }
  }

  return { possibleYoutubeId, isTextOnBlock };
}

const tryToGenerateTranscript = async (blockUid: string) => {
  const { possibleYoutubeId, isTextOnBlock } = getPossibleYoutubeId(blockUid);
  if (possibleYoutubeId) {
    const uidToInsert = isTextOnBlock
      ? await createBlock({
          parentUid: blockUid,
          order: 0,
          node: { text: LOADING_MESSAGE },
        })
      : blockUid;

    if (!isTextOnBlock) {
      updateBlock({
        uid: blockUid,
        text: LOADING_MESSAGE,
      });
    }
    generateTranscript(possibleYoutubeId, uidToInsert);
  } else {
    alert(NO_VIDEO_ERROR);
  }
};

const generateTranscript = (youtubeId: string, uidToInsert: string) => {
  fetch(`${PTN_ROOT}/youtube-transcript/generate`, {
    method: "POST",
    body: JSON.stringify({ youtube_id: youtubeId }),
    headers: BASE_HEADERS,
  }).then((res) => {
    if (res.status.toString()[0] !== "2") {
      alert(UKNOWN_ERROR);
    } else {
      res.json().then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          insertCaptions(uidToInsert, data);
        }
      });
    }
  });
};

const insertCaptions = (uidToInsert: string, data: CaptionData[]) => {
  if (data && data.length > 0) {
    updateBlock({
      uid: uidToInsert,
      text: "captions:",
    });
    data.forEach(async (caption, index) => {
      const text = `[${caption.formatted_timestamp}](${caption.link})`;
      const timeBlock = await createBlock({
        parentUid: uidToInsert,
        order: index,
        node: { text, open: false },
      });

      const periodsInText: boolean =
        caption.text_arr.filter((text) => text.includes(".")).length / caption.text_arr.length >
        MIN_PERIOD_PERCENTAGE;

      if (periodsInText) {
        await createBlock({
          parentUid: timeBlock,
          order: 0,
          node: { text: caption.text_arr.join(" ") },
        });
      } else {
        caption.text_arr.forEach(async (text, innerIndex) => {
          await createBlock({
            parentUid: timeBlock,
            order: innerIndex,
            node: { text },
          });
        });
      }
    });
  } else {
    alert(GENERIC_ERROR_MESSAGE);
  }
};

export default {
  onload: () => {
    window.roamAlphaAPI.ui.blockContextMenu.addCommand({
      label: GET_TRANSCRIPT_LABEL,
      callback: (props) => {
        const { "block-uid": blockUid } = props;
        tryToGenerateTranscript(blockUid);
      },
    });

    window.roamAlphaAPI.ui.commandPalette.addCommand({
      label: GET_TRANSCRIPT_LABEL,
      callback: () => {
        const targetUid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
        tryToGenerateTranscript(targetUid);
      },
    });
  },
  onunload: () => {
    window.roamAlphaAPI.ui.blockContextMenu.removeCommand({ label: GET_TRANSCRIPT_LABEL });
    window.roamAlphaAPI.ui.commandPalette.removeCommand({ label: GET_TRANSCRIPT_LABEL });
  },
};

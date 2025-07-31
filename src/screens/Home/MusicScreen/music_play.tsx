import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import Slider from "@react-native-community/slider";
import Clipboard from "@react-native-clipboard/clipboard";

// 控制按钮图片资源
const img_last_song = require("../../../../assets/images/last_song.png");
const img_next_song = require("../../../../assets/images/next_song.png");
const img_play_btn = require("../../../../assets/images/music_play.png");
const img_pause_btn = require("../../../../assets/images/music_pause.png");
const img_edit_music_name = require("../../../../assets/images/edit_music_name.png");
const img_delete_music_name = require("../../../../assets/images/delete_music_name.png");
const img_music_reset = require("../../../../assets/images/music_reset.png");
const img_music_share = require("../../../../assets/images/music_share.png");
const img_music_back_btn = require("../../../../assets/images/music_back_btn.png");

const { width } = Dimensions.get("window");

const MusicPlayScreen = ({ navigation, route }: any) => {
  // 歌词和歌曲信息
  const data = {
    name: "Gladys - Hindi",
    tags: "Chill-Hop, Lofi，Hip hop",
    avatar: require("../../../../assets/images/avatar1.png"),
    // 带时间戳歌词
    lyrics: `[00:00] Chorus
[00:05] Oh, I’m chasing stars in the dark sky
[00:10] Bruised wings, but I won’t cry
[00:15] Every scar, a story to tell
[00:20] This journey, I won’t quell
[00:25] Verse 2
[00:30] City lights, a neon maze
[00:35] Lonely hearts in silent haze
[00:40] Whispers of a distant shore
[00:45] Call me forth, forevermore
[00:50] Chorus
[00:55] Oh, I’m chasing stars in the dark sky
[01:00] Bruised wings, but I won’t cry
[01:05] Every scar, a story to tell
[01:10] This journey, I won’t quell
[01:15] Verse 2
[01:20] City lights, a neon maze
[01:25] Lonely hearts in silent haze
[01:30] Whispers of a distant shore
[01:35] Call me forth, forevermore`,
  };

  // 歌词解析
  const lyricArr = React.useMemo(() => {
    return data.lyrics.split("\n").map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\]\s*(.*)$/);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        return {
          time: min * 60 + sec,
          text: match[3],
        };
      }
      return { time: 0, text: line };
    });
  }, [data.lyrics]);

  // 歌曲进度
  const [current, setCurrent] = useState("0:00");
  const [duration, setDuration] = useState("1:40"); // 100秒
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const lyricScrollRef = useRef<FlatList<any>>(null);

  // 删除弹窗
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // 分享弹窗
  const [showShareModal, setShowShareModal] = useState(false);

  // 秒数转换
  const timeToSec = (t: string) => {
    const [min, sec] = t.split(":").map(Number);
    return min * 60 + sec;
  };
  const secToTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // 进度条百分比
  const getProgress = () => {
    const cur = timeToSec(current);
    const dur = timeToSec(duration);
    if (!dur) return 0;
    return Math.min(cur / dur, 1);
  };

  // 模拟播放进度
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isSliding) {
      interval = setInterval(() => {
        setCurrent((prev) => {
          let curSec = timeToSec(prev);
          let durSec = timeToSec(duration);
          if (curSec < durSec) {
            return secToTime(curSec + 1);
          } else {
            setIsPlaying(false);
            return secToTime(durSec);
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isSliding, duration]);

  // 重置播放
  const handleReset = () => {
    setCurrent("0:00");
    setIsPlaying(false);
  };

  // 播放/暂停
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Image source={img_music_back_btn} style={styles.backIconImg} />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.avatarBox}>
          <Image source={data.avatar} style={styles.avatar} />
        </View>
        <View style={styles.infoMain}>
          <View style={styles.infoHeaderRow}>
            <Text
              style={styles.name}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {data.name}
            </Text>
            <View style={styles.nameIcons}>
              <TouchableOpacity>
                <Image source={img_edit_music_name} style={styles.infoIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
                <Image source={img_delete_music_name} style={styles.infoIcon} />
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={styles.tags}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {data.tags}
          </Text>
        </View>
        <View style={styles.infoSideIcons}>
          <TouchableOpacity onPress={handleReset}>
            <Image source={img_music_reset} style={styles.infoIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowShareModal(true)}>
            <Image source={img_music_share} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 歌词 */}
      <FlatList
        style={styles.lyricScroll}
        data={lyricArr}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => {
          const curSec = timeToSec(current);
          // 找到当前行
          let activeIdx = 0;
          for (let i = 0; i < lyricArr.length; i++) {
            if (curSec >= lyricArr[i].time) activeIdx = i;
          }
          const isActive = index === activeIdx;
          return (
            <Text
              style={[
                styles.lyrics,
                {
                  color: isActive ? "#fff" : "#888",
                  fontWeight: isActive ? "bold" : "normal",
                },
              ]}
            >
              {item.text}
            </Text>
          );
        }}
        getItemLayout={(_, idx) => ({
          length: 28,
          offset: 28 * idx,
          index: idx,
        })}
        ref={lyricScrollRef}
        onContentSizeChange={() => {
          // 自动滚动到当前行
          const curSec = timeToSec(current);
          let activeIdx = 0;
          for (let i = 0; i < lyricArr.length; i++) {
            if (curSec >= lyricArr[i].time) activeIdx = i;
          }
          lyricScrollRef.current?.scrollToOffset({
            offset: Math.max(0, 28 * (activeIdx - 2)),
            animated: true,
          });
        }}
      />

      {/* 播放进度条 */}
      <View style={styles.progressRow}>
        <Slider
          style={{ width: "100%", height: 24 }}
          minimumValue={0}
          maximumValue={timeToSec(duration)}
          value={timeToSec(current)}
          minimumTrackTintColor="#3cff8f"
          maximumTrackTintColor="#333"
          thumbTintColor="#3cff8f"
          onSlidingStart={() => setIsSliding(true)}
          onSlidingComplete={(value) => {
            setCurrent(secToTime(Math.round(value)));
            setIsSliding(false);
          }}
          onValueChange={(value) => setCurrent(secToTime(Math.round(value)))}
        />
        <View style={styles.progressTimeRow}>
          <Text style={styles.progressTime}>{current}</Text>
          <Text style={styles.progressTime}>{duration}</Text>
        </View>
      </View>

      {/* 播放控制 */}
      <View style={styles.controlRow}>
        <TouchableOpacity>
          <Image source={img_last_song} style={styles.controlImg} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Image
            source={isPlaying ? img_pause_btn : img_play_btn}
            style={styles.playImg}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={img_next_song} style={styles.controlImg} />
        </TouchableOpacity>
      </View>
    {/* 删除确认弹窗和模糊遮罩 */}
    <Modal
      visible={showDeleteModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        {/* 模糊/半透明遮罩 */}
        <Pressable style={styles.blurMask} onPress={() => setShowDeleteModal(false)} />
        {/* 底部弹窗 */}
        <View style={styles.bottomModal}>
          <Text style={styles.modalTitle}>Delet {data.name.split(" -")[0]}</Text>
          <View style={styles.modalBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.okBtn}
              onPress={() => {
                setShowDeleteModal(false);
                // TODO: 删除逻辑
              }}
            >
              <Text style={styles.okBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    {/* 分享弹窗 */}
    <Modal
      visible={showShareModal}
      animationType="fade"
      transparent
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.blurMask} onPress={() => setShowShareModal(false)} />
        <View style={styles.bottomModal}>
          <Text style={styles.modalTitle}>
            Share {data.name.split(" -")[0]}
          </Text>
          <Text style={styles.shareLink}>http://xxxxxxxxxxxxxx</Text>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => {
              Clipboard.setString("http://xxxxxxxxxxxxxx");
            }}
          >
            <Text style={styles.copyBtnText}>Copy link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  backIconImg: {
    width: 28,
    height: 28,
    // resizeMode: "contain",
  },
  infoCard: {
    backgroundColor: "#191919",
    borderRadius: 18,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#FFE89D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FFE89D",
  },
  infoMain: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    marginRight: 10,
  },
  infoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginRight: 8,
    flexShrink: 1,
    minWidth: 0,
  },
  nameIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    gap: 0,
  },
  tags: {
    color: "#bdbdbd",
    fontSize: 15,
    marginTop: 2,
    marginBottom: 0,
    flexShrink: 1,
    minWidth: 0,
  },
  infoSideIcons: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: 8,
    gap: 8,
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginVertical: 2,
    marginHorizontal: 2,
    resizeMode: "contain",
  },
  iconBtn: {
    color: "#fff",
    fontSize: 18,
    marginHorizontal: 4,
  },
  iconImg: {
    width: 22,
    height: 22,
    marginHorizontal: 4,
    resizeMode: "contain",
  },
  lyricScroll: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  lyrics: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  progressRow: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    width: "100%",
    marginBottom: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#3cff8f",
    borderRadius: 3,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTime: {
    color: "#fff",
    fontSize: 13,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    columnGap: 40,
    // gap: 40, // 若项目支持 gap 可启用
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 18,
  },
  // playBtn: {
  //   backgroundColor: '#3cff8f',
  // },
  playIcon: {
    color: "#111",
    fontSize: 28,
    fontWeight: "bold",
  },
  playImg: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  controlIcon: {
    color: "#fff",
    fontSize: 24,
  },
  controlImg: {
    width: 48,
    height: 48,
    // resizeMode: 'contain',
  },
  // ----------- modal styles below -----------
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  blurMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomModal: {
    backgroundColor: "#222",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
    marginRight: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  okBtn: {
    flex: 1,
    backgroundColor: "#3cff8f",
    borderRadius: 12,
    marginLeft: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  okBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
  },
  shareLink: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  copyBtn: {
    backgroundColor: "#3cff8f",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 0,
    width: "100%",
  },
  copyBtnText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MusicPlayScreen;

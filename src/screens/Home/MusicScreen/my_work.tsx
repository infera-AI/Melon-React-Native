import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';

const mockData = [
  {
    id: '1',
    name: 'Gladys - Hindi',
    tags: 'Chill-Hop, Lofi，Hip hop',
    price: '03:12',
    avatar: require('../../../../assets/images/avatar1.png'),
    playing: false,
  },
  {
    id: '2',
    name: 'Francisco - English',
    tags: 'Hip hop',
    price: '02:45',
    avatar: require('../../../../assets/images/avatar2.png'),
    playing: true,
  },
  {
    id: '3',
    name: 'Colleen - Arab',
    tags: 'Chill-Hop, Lofi',
    price: '04:01',
    avatar: require('../../../../assets/images/avatar3.png'),
    playing: false,
  },
  {
    id: '4',
    name: 'Kathryn - Japanese',
    tags: 'Chill-Hop, Lofi，Hip hop',
    price: '03:27',
    avatar: require('../../../../assets/images/avatar4.png'),
    playing: false,
  },
  {
    id: '5',
    name: 'Calvin - Hindi',
    tags: 'Lofi，Hip hop',
    price: '02:58',
    avatar: require('../../../../assets/images/avatar5.png'),
    playing: true,
  },
  {
    id: '6',
    name: 'Arlene - Gujarati',
    tags: 'Hip hop',
    price: '03:40',
    avatar: require('../../../../assets/images/avatar6.png'),
    playing: false,
  },
];

const MyWorkScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../../assets/images/music_back_btn.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Works</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search...."
          placeholderTextColor="#888"
        />
      </View>

      {/* List */}
      <FlatList
        data={mockData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => navigation.navigate('MusicPlay')}
          >
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemTags}>{item.tags}</Text>
            </View>
            {item.playing ? (
              <Image
                source={require('../../../../assets/images/play_wave.png')}
                style={styles.priceWave}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.price}>{item.price}</Text>
            )}
            <TouchableOpacity style={styles.playBtn}>
              <Image
                source={
                  item.playing
                    ? require('../../../../assets/images/pause_btn.png')
                    : require('../../../../assets/images/play_btn.png')
                }
                style={styles.playIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 28,
    height: 28,
    // tintColor: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  searchBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchInput: {
    color: '#fff',
    fontSize: 15,
    paddingVertical: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#333',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemTags: {
    color: '#aaa',
    fontSize: 13,
  },
  price: {
    color: '#85F380',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 22,
    height: 22,
    tintColor: '#85F380',
  },
  priceWave: {
    width: 40,
    height: 22,
    marginHorizontal: 10,
  },
});

export default MyWorkScreen;

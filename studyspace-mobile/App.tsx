import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Screen = 'login' | 'rooms' | 'detail' | 'success';

type Room = {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  available: boolean;
  equipment: string[];
  availableTime: string;
};

const rooms: Room[] = [
  {
    id: 'a101',
    name: 'A101',
    building: 'Gebäude A',
    floor: 'Etage 1',
    capacity: 6,
    available: true,
    equipment: ['Beamer', 'Whiteboard', 'Steckdosen', 'WLAN'],
    availableTime: 'Heute, 14:00 - 18:00 Uhr',
  },
  {
    id: 'b204',
    name: 'B204',
    building: 'Gebäude B',
    floor: 'Etage 2',
    capacity: 4,
    available: true,
    equipment: ['Monitor', 'Steckdosen', 'WLAN'],
    availableTime: 'Heute, 12:30 - 16:00 Uhr',
  },
  {
    id: 'c015',
    name: 'C015',
    building: 'Bibliothek',
    floor: 'Erdgeschoss',
    capacity: 8,
    available: true,
    equipment: ['Smartboard', 'Whiteboard', 'Gruppenarbeitstisch', 'WLAN'],
    availableTime: 'Heute, 15:00 - 20:00 Uhr',
  },
  {
    id: 'd310',
    name: 'D310',
    building: 'Gebäude D',
    floor: 'Etage 3',
    capacity: 10,
    available: false,
    equipment: ['Beamer', 'Lautsprecher', 'Whiteboard', 'WLAN'],
    availableTime: 'Belegt bis 17:30 Uhr',
  },
  {
    id: 'bib22',
    name: 'Bib-22',
    building: 'Bibliothek',
    floor: 'Etage 2',
    capacity: 2,
    available: true,
    equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN'],
    availableTime: 'Heute, 10:00 - 19:00 Uhr',
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const freeRoomCount = rooms.filter((room) => room.available).length;

  const showRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentScreen('detail');
  };

  const bookRoom = () => {
    if (!selectedRoom || !selectedRoom.available) {
      Alert.alert('Nicht verfügbar', 'Dieser Raum ist aktuell belegt.');
      return;
    }

    setBookedRoom(selectedRoom);
    setCurrentScreen('success');
  };

  const backToRooms = () => {
    setSelectedRoom(null);
    setCurrentScreen('rooms');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {currentScreen === 'login' && (
        <View style={styles.loginScreen}>
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.appTitle}>StudySpace</Text>
            <Text style={styles.subtitle}>
              Finde und buche freie Lernräume auf dem Campus
            </Text>
          </View>

          <View style={styles.formBlock}>
            <TextInput
              value={loginId}
              onChangeText={setLoginId}
              placeholder="Matrikelnummer oder E-Mail"
              placeholderTextColor="#8a94a6"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Passwort"
              placeholderTextColor="#8a94a6"
              style={styles.input}
              secureTextEntry
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => setCurrentScreen('rooms')}
            >
              <Text style={styles.primaryButtonText}>Einloggen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentScreen === 'rooms' && (
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.kicker}>Campus heute</Text>
            <Text style={styles.pageTitle}>Freie Lernräume</Text>
            <Text style={styles.helperText}>{freeRoomCount} Räume sind gerade frei</Text>
          </View>

          <View style={styles.roomList}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                activeOpacity={0.85}
                style={[styles.roomCard, !room.available && styles.occupiedCard]}
                onPress={() => showRoom(room)}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={[styles.roomName, !room.available && styles.mutedText]}>
                      {room.name}
                    </Text>
                    <Text style={styles.roomLocation}>
                      {room.building} · {room.floor}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, room.available ? styles.freeBadge : styles.occupiedBadge]}>
                    <Text style={[styles.statusText, room.available ? styles.freeText : styles.occupiedText]}>
                      {room.available ? 'Frei' : 'Belegt'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>{room.capacity} Plätze</Text>
                <View style={styles.chipRow}>
                  {room.equipment.slice(0, 3).map((item) => (
                    <View key={item} style={styles.smallChip}>
                      <Text style={styles.smallChipText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {currentScreen === 'detail' && selectedRoom && (
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={backToRooms}>
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>

          <View style={styles.detailHero}>
            <View style={[styles.statusBadge, selectedRoom.available ? styles.freeBadge : styles.occupiedBadge]}>
              <Text style={[styles.statusText, selectedRoom.available ? styles.freeText : styles.occupiedText]}>
                {selectedRoom.available ? 'Frei' : 'Belegt'}
              </Text>
            </View>
            <Text style={styles.detailTitle}>{selectedRoom.name}</Text>
            <Text style={styles.detailSubtitle}>
              {selectedRoom.building} · {selectedRoom.floor}
            </Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Kapazität</Text>
              <Text style={styles.infoValue}>{selectedRoom.capacity} Plätze</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Verfügbar</Text>
              <Text style={styles.infoValue}>{selectedRoom.availableTime}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ausstattung</Text>
            <View style={styles.detailChipRow}>
              {selectedRoom.equipment.map((item) => (
                <View key={item} style={styles.detailChip}>
                  <Text style={styles.detailChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.primaryButton, !selectedRoom.available && styles.disabledButton]}
            onPress={bookRoom}
          >
            <Text style={styles.primaryButtonText}>Raum buchen</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentScreen === 'success' && bookedRoom && (
        <View style={styles.successScreen}>
          <View style={styles.successMark}>
            <Text style={styles.successMarkText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Deine Buchung wurde bestätigt</Text>
          <Text style={styles.successSubtitle}>{bookedRoom.name} ist für dich reserviert.</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={backToRooms}>
            <Text style={styles.primaryButtonText}>Zurück zur Übersicht</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const colors = {
  navy: '#0b1f3a',
  navySoft: '#14345c',
  green: '#19a66a',
  greenSoft: '#e8f8f0',
  background: '#f4f7fb',
  card: '#ffffff',
  text: '#102033',
  muted: '#6b778c',
  border: '#e3e9f2',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginScreen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 42,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: colors.navy,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  appTitle: {
    color: colors.navy,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    maxWidth: 310,
    marginTop: 10,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  formBlock: {
    gap: 14,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.navy,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 34,
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    marginBottom: 6,
    color: colors.green,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pageTitle: {
    color: colors.navy,
    fontSize: 34,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 16,
  },
  roomList: {
    gap: 14,
  },
  roomCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    backgroundColor: colors.card,
    shadowColor: '#1b2a41',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  occupiedCard: {
    opacity: 0.58,
    shadowOpacity: 0.02,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  roomName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  mutedText: {
    color: '#4d5868',
  },
  roomLocation: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  freeBadge: {
    backgroundColor: colors.greenSoft,
  },
  occupiedBadge: {
    backgroundColor: '#edf0f5',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  freeText: {
    color: colors.green,
  },
  occupiedText: {
    color: '#748196',
  },
  cardMeta: {
    marginTop: 14,
    color: colors.navySoft,
    fontSize: 15,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  smallChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eef3f8',
  },
  smallChipText: {
    color: colors.navySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    backgroundColor: '#e8eef6',
  },
  backButtonText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  detailHero: {
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.navy,
  },
  detailTitle: {
    marginTop: 22,
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
  },
  detailSubtitle: {
    marginTop: 8,
    color: '#c8d5e5',
    fontSize: 17,
    fontWeight: '600',
  },
  infoGrid: {
    gap: 12,
    marginTop: 16,
  },
  infoBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    backgroundColor: colors.card,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  section: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    color: colors.navy,
    fontSize: 20,
    fontWeight: '800',
  },
  detailChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailChip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.greenSoft,
  },
  detailChipText: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
  },
  disabledButton: {
    backgroundColor: '#9aa6b8',
    shadowOpacity: 0,
  },
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successMark: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: colors.green,
  },
  successMarkText: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
  },
  successTitle: {
    color: colors.navy,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 37,
    textAlign: 'center',
  },
  successSubtitle: {
    marginTop: 12,
    marginBottom: 22,
    color: colors.muted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
});

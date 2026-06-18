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
type RoomStatus = 'free' | 'current' | 'full';

type Booking = {
  start: number;
  end: number;
};

type Room = {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  bookings: Booking[];
};

const OPEN_MINUTES = 8 * 60;
const CLOSE_MINUTES = 18 * 60;
const SLOT_MINUTES = 30;
const CURRENT_TIME_MINUTES = 10 * 60 + 30;
const durationOptions = [30, 60, 90, 120];

const initialRooms: Room[] = [
  {
    id: 'a101',
    name: 'A101',
    building: 'Gebäude A',
    floor: 'Etage 1',
    capacity: 6,
    equipment: ['Beamer', 'Whiteboard', 'Steckdosen', 'WLAN'],
    bookings: [
      { start: 10 * 60, end: 11 * 60 },
      { start: 15 * 60 + 30, end: 16 * 60 },
    ],
  },
  {
    id: 'b204',
    name: 'B204',
    building: 'Gebäude B',
    floor: 'Etage 2',
    capacity: 4,
    equipment: ['Monitor', 'Steckdosen', 'WLAN'],
    bookings: [],
  },
  {
    id: 'c015',
    name: 'C015',
    building: 'Bibliothek',
    floor: 'Erdgeschoss',
    capacity: 8,
    equipment: ['Smartboard', 'Whiteboard', 'Gruppenarbeitstisch', 'WLAN'],
    bookings: [
      { start: 9 * 60, end: 10 * 60 + 30 },
      { start: 13 * 60, end: 14 * 60 },
    ],
  },
  {
    id: 'd310',
    name: 'D310',
    building: 'Gebäude D',
    floor: 'Etage 3',
    capacity: 10,
    equipment: ['Beamer', 'Lautsprecher', 'Whiteboard', 'WLAN'],
    bookings: [{ start: OPEN_MINUTES, end: CLOSE_MINUTES }],
  },
  {
    id: 'bib22',
    name: 'Bib-22',
    building: 'Bibliothek',
    floor: 'Etage 2',
    capacity: 2,
    equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN'],
    bookings: [{ start: 12 * 60, end: 13 * 60 }],
  },
];

const slotStarts = Array.from(
  { length: (CLOSE_MINUTES - OPEN_MINUTES) / SLOT_MINUTES },
  (_, index) => OPEN_MINUTES + index * SLOT_MINUTES,
);

const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const formatDuration = (minutes: number) =>
  minutes < 60 ? '30 Min' : `${minutes / 60} Std${minutes > 60 ? '.' : ''}`;

const hasOverlap = (bookings: Booking[], start: number, end: number) =>
  bookings.some((booking) => start < booking.end && end > booking.start);

const getAvailableStarts = (room: Room, duration: number) =>
  slotStarts.filter(
    (start) =>
      start + duration <= CLOSE_MINUTES &&
      !hasOverlap(room.bookings, start, start + duration),
  );

const getRoomStatus = (room: Room): RoomStatus => {
  const isFull = slotStarts.every((start) =>
    hasOverlap(room.bookings, start, start + SLOT_MINUTES),
  );

  if (isFull) {
    return 'full';
  }

  if (hasOverlap(room.bookings, CURRENT_TIME_MINUTES, CURRENT_TIME_MINUTES + SLOT_MINUTES)) {
    return 'current';
  }

  return 'free';
};

const getNextAvailableText = (room: Room) => {
  const nextStart = getAvailableStarts(room, SLOT_MINUTES).find(
    (start) => start >= CURRENT_TIME_MINUTES,
  );

  if (nextStart) {
    return `Nächster Slot ${formatTime(nextStart)} Uhr`;
  }

  return 'Heute kein freier Slot mehr';
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [bookedSlot, setBookedSlot] = useState<Booking | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const availableStarts = selectedRoom
    ? getAvailableStarts(selectedRoom, selectedDuration)
    : [];
  const freeRoomCount = rooms.filter((room) => getRoomStatus(room) === 'free').length;

  const openRoom = (room: Room) => {
    const defaultDuration = 60;
    const firstStart = getAvailableStarts(room, defaultDuration)[0] ?? null;
    setSelectedRoomId(room.id);
    setSelectedDuration(defaultDuration);
    setSelectedStart(firstStart);
    setCurrentScreen('detail');
  };

  const changeDuration = (duration: number) => {
    if (!selectedRoom) {
      return;
    }

    const starts = getAvailableStarts(selectedRoom, duration);
    setSelectedDuration(duration);
    setSelectedStart(starts.includes(selectedStart ?? -1) ? selectedStart : starts[0] ?? null);
  };

  const bookRoom = () => {
    if (!selectedRoom || selectedStart === null) {
      Alert.alert('Slot auswählen', 'Bitte wähle zuerst einen verfügbaren Zeitslot.');
      return;
    }

    const booking = { start: selectedStart, end: selectedStart + selectedDuration };

    if (hasOverlap(selectedRoom.bookings, booking.start, booking.end)) {
      Alert.alert('Nicht verfügbar', 'Dieser Zeitraum ist bereits belegt.');
      return;
    }

    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === selectedRoom.id
          ? { ...room, bookings: [...room.bookings, booking] }
          : room,
      ),
    );
    setBookedRoom(selectedRoom);
    setBookedSlot(booking);
    setCurrentScreen('success');
  };

  const goToRooms = () => {
    setSelectedRoomId(null);
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
            <Text style={styles.kicker}>Campus heute · Jetzt {formatTime(CURRENT_TIME_MINUTES)} Uhr</Text>
            <Text style={styles.pageTitle}>Freie Lernräume</Text>
            <Text style={styles.helperText}>{freeRoomCount} Räume sind aktuell direkt frei</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendFree]} />
            <Text style={styles.legendText}>frei</Text>
            <View style={[styles.legendDot, styles.legendCurrent]} />
            <Text style={styles.legendText}>jetzt belegt</Text>
            <View style={[styles.legendDot, styles.legendFull]} />
            <Text style={styles.legendText}>ausgebucht</Text>
          </View>

          <View style={styles.roomList}>
            {rooms.map((room) => {
              const status = getRoomStatus(room);
              const statusLabel =
                status === 'free'
                  ? 'Frei'
                  : status === 'current'
                    ? 'Jetzt belegt'
                    : 'Heute ausgebucht';

              return (
                <TouchableOpacity
                  key={room.id}
                  activeOpacity={0.85}
                  style={[
                    styles.roomCard,
                    status === 'current' && styles.currentCard,
                    status === 'full' && styles.fullCard,
                  ]}
                  onPress={() => openRoom(room)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleBlock}>
                      <Text style={[styles.roomName, status !== 'free' && styles.mutedText]}>
                        {room.name}
                      </Text>
                      <Text style={styles.roomLocation}>
                        {room.building} · {room.floor}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        status === 'free' && styles.freeBadge,
                        status === 'current' && styles.currentBadge,
                        status === 'full' && styles.fullBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          status === 'free' && styles.freeText,
                          status === 'current' && styles.currentText,
                          status === 'full' && styles.fullText,
                        ]}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardMeta}>{room.capacity} Plätze · 30-Minuten-Slots</Text>
                  <Text style={styles.availabilityText}>{getNextAvailableText(room)}</Text>
                  <View style={styles.chipRow}>
                    {room.equipment.slice(0, 3).map((item) => (
                      <View key={item} style={styles.smallChip}>
                        <Text style={styles.smallChipText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {currentScreen === 'detail' && selectedRoom && (
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={goToRooms}>
            <Text style={styles.backButtonText}>Zurück</Text>
          </TouchableOpacity>

          <View style={styles.detailHero}>
            <View
              style={[
                styles.statusBadge,
                getRoomStatus(selectedRoom) === 'free' && styles.freeBadge,
                getRoomStatus(selectedRoom) === 'current' && styles.currentBadge,
                getRoomStatus(selectedRoom) === 'full' && styles.fullBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  getRoomStatus(selectedRoom) === 'free' && styles.freeText,
                  getRoomStatus(selectedRoom) === 'current' && styles.currentText,
                  getRoomStatus(selectedRoom) === 'full' && styles.fullText,
                ]}
              >
                {getRoomStatus(selectedRoom) === 'free'
                  ? 'Jetzt frei'
                  : getRoomStatus(selectedRoom) === 'current'
                    ? 'Jetzt belegt'
                    : 'Heute ausgebucht'}
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
              <Text style={styles.infoLabel}>Buchungsfenster</Text>
              <Text style={styles.infoValue}>08:00 - 18:00 Uhr</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dauer wählen</Text>
            <View style={styles.durationGrid}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  activeOpacity={0.85}
                  style={[
                    styles.durationOption,
                    selectedDuration === duration && styles.durationOptionActive,
                  ]}
                  onPress={() => changeDuration(duration)}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      selectedDuration === duration && styles.durationOptionTextActive,
                    ]}
                  >
                    {formatDuration(duration)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Startzeit</Text>
            {availableStarts.length === 0 ? (
              <View style={styles.emptySlots}>
                <Text style={styles.emptySlotsText}>
                  Für diese Dauer ist heute kein Slot mehr frei.
                </Text>
              </View>
            ) : (
              <View style={styles.slotGrid}>
                {availableStarts.map((start) => (
                  <TouchableOpacity
                    key={start}
                    activeOpacity={0.85}
                    style={[styles.slotChip, selectedStart === start && styles.slotChipActive]}
                    onPress={() => setSelectedStart(start)}
                  >
                    <Text
                      style={[
                        styles.slotChipText,
                        selectedStart === start && styles.slotChipTextActive,
                      ]}
                    >
                      {formatTime(start)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
            style={[styles.primaryButton, availableStarts.length === 0 && styles.disabledButton]}
            onPress={bookRoom}
          >
            <Text style={styles.primaryButtonText}>Raum buchen</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentScreen === 'success' && bookedRoom && bookedSlot && (
        <View style={styles.successScreen}>
          <View style={styles.successMark}>
            <Text style={styles.successMarkText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Deine Buchung wurde bestätigt</Text>
          <Text style={styles.successSubtitle}>
            {bookedRoom.name} ist von {formatTime(bookedSlot.start)} bis{' '}
            {formatTime(bookedSlot.end)} Uhr für dich reserviert.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={goToRooms}
          >
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
  amber: '#c98213',
  amberSoft: '#fff5df',
  red: '#b33a3a',
  redSoft: '#fdecec',
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
    marginBottom: 16,
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
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  legendFree: {
    backgroundColor: colors.green,
  },
  legendCurrent: {
    backgroundColor: colors.amber,
  },
  legendFull: {
    backgroundColor: colors.red,
  },
  legendText: {
    marginRight: 8,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
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
  currentCard: {
    borderColor: '#f0d59d',
    backgroundColor: '#fffaf0',
  },
  fullCard: {
    borderColor: '#f2c4c4',
    backgroundColor: '#fff6f6',
    opacity: 0.72,
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
  currentBadge: {
    backgroundColor: colors.amberSoft,
  },
  fullBadge: {
    backgroundColor: colors.redSoft,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  freeText: {
    color: colors.green,
  },
  currentText: {
    color: colors.amber,
  },
  fullText: {
    color: colors.red,
  },
  cardMeta: {
    marginTop: 14,
    color: colors.navySoft,
    fontSize: 15,
    fontWeight: '700',
  },
  availabilityText: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
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
  durationGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  durationOption: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  durationOptionActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  durationOptionText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  durationOptionTextActive: {
    color: '#ffffff',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotChip: {
    minWidth: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  slotChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  slotChipText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: '800',
  },
  slotChipTextActive: {
    color: '#ffffff',
  },
  emptySlots: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.redSoft,
  },
  emptySlotsText: {
    color: colors.red,
    fontSize: 14,
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

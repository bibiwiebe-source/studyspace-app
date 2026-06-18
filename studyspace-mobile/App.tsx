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

type BookingOptionId = 'morning' | 'afternoon' | 'fullDay';

type BookingOption = {
  id: BookingOptionId;
  title: string;
  subtitle: string;
  start: number;
  end: number;
};

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

const MORNING_START = 8 * 60;
const AFTERNOON_START = 13 * 60;
const DAY_END = 18 * 60;
const CURRENT_TIME_MINUTES = 10 * 60 + 30;

const bookingOptions: BookingOption[] = [
  {
    id: 'morning',
    title: 'Vormittag',
    subtitle: '08:00 - 13:00 Uhr',
    start: MORNING_START,
    end: AFTERNOON_START,
  },
  {
    id: 'afternoon',
    title: 'Nachmittag',
    subtitle: '13:00 - 18:00 Uhr',
    start: AFTERNOON_START,
    end: DAY_END,
  },
  {
    id: 'fullDay',
    title: 'Ganzer Tag',
    subtitle: '08:00 - 18:00 Uhr',
    start: MORNING_START,
    end: DAY_END,
  },
];

const initialRooms: Room[] = [
  {
    id: 'a101',
    name: 'A101',
    building: 'Gebäude A',
    floor: 'Etage 1',
    capacity: 6,
    equipment: ['Beamer', 'Whiteboard', 'Steckdosen', 'WLAN'],
    bookings: [{ start: MORNING_START, end: AFTERNOON_START }],
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
    bookings: [{ start: AFTERNOON_START, end: DAY_END }],
  },
  {
    id: 'd310',
    name: 'D310',
    building: 'Gebäude D',
    floor: 'Etage 3',
    capacity: 10,
    equipment: ['Beamer', 'Lautsprecher', 'Whiteboard', 'WLAN'],
    bookings: [{ start: MORNING_START, end: DAY_END }],
  },
  {
    id: 'bib22',
    name: 'Bib-22',
    building: 'Bibliothek',
    floor: 'Etage 2',
    capacity: 2,
    equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN'],
    bookings: [],
  },
];

const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const hasOverlap = (bookings: Booking[], start: number, end: number) =>
  bookings.some((booking) => start < booking.end && end > booking.start);

const isOptionAvailable = (room: Room, option: BookingOption) =>
  !hasOverlap(room.bookings, option.start, option.end);

const getAvailableOptions = (room: Room) =>
  bookingOptions.filter((option) => isOptionAvailable(room, option));

const getRoomStatus = (room: Room): RoomStatus => {
  const morningBooked = hasOverlap(room.bookings, MORNING_START, AFTERNOON_START);
  const afternoonBooked = hasOverlap(room.bookings, AFTERNOON_START, DAY_END);
  const currentBooked = hasOverlap(room.bookings, CURRENT_TIME_MINUTES, CURRENT_TIME_MINUTES + 1);

  if (morningBooked && afternoonBooked) {
    return 'full';
  }

  if (currentBooked) {
    return 'current';
  }

  return 'free';
};

const getAvailabilityText = (room: Room) => {
  const available = getAvailableOptions(room);

  if (available.length === 0) {
    return 'Heute vollständig ausgebucht';
  }

  if (available.length === 3) {
    return 'Vormittag, Nachmittag oder ganztags buchbar';
  }

  return `Noch buchbar: ${available.map((option) => option.title).join(', ')}`;
};

const findOptionByBooking = (booking: Booking | null) =>
  bookingOptions.find(
    (option) => booking && option.start === booking.start && option.end === booking.end,
  );

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<BookingOptionId | null>(null);
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [bookedSlot, setBookedSlot] = useState<Booking | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const selectedOption =
    bookingOptions.find((option) => option.id === selectedOptionId) ?? null;
  const availableOptions = selectedRoom ? getAvailableOptions(selectedRoom) : [];
  const freeRoomCount = rooms.filter((room) => getRoomStatus(room) === 'free').length;

  const openRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    setSelectedOptionId(getAvailableOptions(room)[0]?.id ?? null);
    setCurrentScreen('detail');
  };

  const bookRoom = () => {
    if (!selectedRoom || !selectedOption) {
      Alert.alert('Zeitraum auswählen', 'Bitte wähle zuerst einen freien Zeitraum.');
      return;
    }

    if (!isOptionAvailable(selectedRoom, selectedOption)) {
      Alert.alert('Nicht verfügbar', 'Dieser Zeitraum ist bereits belegt.');
      return;
    }

    const booking = { start: selectedOption.start, end: selectedOption.end };

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
    setSelectedOptionId(null);
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
            <Text style={styles.legendText}>gerade belegt</Text>
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
                    ? 'Gerade belegt'
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

                  <Text style={styles.cardMeta}>{room.capacity} Plätze · halb- oder ganztags</Text>
                  <Text style={styles.availabilityText}>{getAvailabilityText(room)}</Text>
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
                    ? 'Gerade belegt'
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
            <Text style={styles.sectionTitle}>Zeitraum wählen</Text>
            {availableOptions.length === 0 ? (
              <View style={styles.emptySlots}>
                <Text style={styles.emptySlotsText}>
                  Dieser Raum ist heute vollständig ausgebucht.
                </Text>
              </View>
            ) : (
              <View style={styles.optionList}>
                {bookingOptions.map((option) => {
                  const available = isOptionAvailable(selectedRoom, option);
                  const active = selectedOptionId === option.id;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={available ? 0.85 : 1}
                      disabled={!available}
                      style={[
                        styles.bookingOption,
                        active && styles.bookingOptionActive,
                        !available && styles.bookingOptionDisabled,
                      ]}
                      onPress={() => setSelectedOptionId(option.id)}
                    >
                      <View style={styles.optionTextBlock}>
                        <Text
                          style={[
                            styles.bookingOptionTitle,
                            active && styles.bookingOptionTitleActive,
                            !available && styles.bookingOptionTextDisabled,
                          ]}
                        >
                          {option.title}
                        </Text>
                        <Text
                          style={[
                            styles.bookingOptionSubtitle,
                            active && styles.bookingOptionSubtitleActive,
                            !available && styles.bookingOptionTextDisabled,
                          ]}
                        >
                          {option.subtitle}
                        </Text>
                      </View>
                      <View style={[styles.optionPill, active && styles.optionPillActive]}>
                        <Text
                          style={[
                            styles.optionPillText,
                            active && styles.optionPillTextActive,
                            !available && styles.bookingOptionTextDisabled,
                          ]}
                        >
                          {available ? 'frei' : 'belegt'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
            style={[styles.primaryButton, availableOptions.length === 0 && styles.disabledButton]}
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
            {bookedRoom.name} ist {findOptionByBooking(bookedSlot)?.title.toLowerCase()} von{' '}
            {formatTime(bookedSlot.start)} bis {formatTime(bookedSlot.end)} Uhr für dich reserviert.
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
  gray: '#64748b',
  graySoft: '#eef2f7',
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
    backgroundColor: colors.gray,
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
    borderColor: '#d7dee9',
    backgroundColor: '#f8fafc',
    opacity: 0.78,
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
    backgroundColor: colors.graySoft,
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
    color: colors.gray,
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
  optionList: {
    gap: 12,
  },
  bookingOption: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.card,
  },
  bookingOptionActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  bookingOptionDisabled: {
    backgroundColor: '#f1f5f9',
    opacity: 0.62,
  },
  optionTextBlock: {
    flex: 1,
  },
  bookingOptionTitle: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: '800',
  },
  bookingOptionSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  bookingOptionTitleActive: {
    color: colors.green,
  },
  bookingOptionSubtitleActive: {
    color: '#167a50',
  },
  bookingOptionTextDisabled: {
    color: '#8a94a6',
  },
  optionPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#eef3f8',
  },
  optionPillActive: {
    backgroundColor: colors.green,
  },
  optionPillText: {
    color: colors.navySoft,
    fontSize: 12,
    fontWeight: '800',
  },
  optionPillTextActive: {
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

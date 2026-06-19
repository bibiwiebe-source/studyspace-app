import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Screen = 'home' | 'login' | 'loading' | 'rooms' | 'detail' | 'success';
type Status = 'free' | 'current' | 'partial' | 'full';
type OptionId = 'morning' | 'afternoon' | 'fullDay';
type Booking = { start: number; end: number };
type Option = Booking & { id: OptionId; title: string; subtitle: string };
type Room = { id: string; name: string; building: string; floor: string; capacity: number; equipment: string[]; bookings: Booking[] };
type Workday = { key: string; label: string; shortLabel: string; dateText: string; isToday: boolean; index: number };

const MORNING_START = 8 * 60;
const AFTERNOON_START = 13 * 60;
const DAY_END = 18 * 60;
const NOW = 10 * 60 + 30;
const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

const options: Option[] = [
  { id: 'morning', title: 'Vormittag', subtitle: '08:00 - 13:00 Uhr', start: MORNING_START, end: AFTERNOON_START },
  { id: 'afternoon', title: 'Nachmittag', subtitle: '13:00 - 18:00 Uhr', start: AFTERNOON_START, end: DAY_END },
  { id: 'fullDay', title: 'Ganzer Tag', subtitle: '08:00 - 18:00 Uhr', start: MORNING_START, end: DAY_END },
];

const todayRooms: Room[] = [
  { id: 'a101', name: 'A101', building: 'Gebäude A', floor: 'Etage 1', capacity: 6, equipment: ['Beamer', 'Whiteboard', 'Steckdosen', 'WLAN', 'USB-C Dock', 'Tageslicht'], bookings: [{ start: MORNING_START, end: AFTERNOON_START }] },
  { id: 'b204', name: 'B204', building: 'Gebäude B', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Steckdosen', 'WLAN', 'HDMI', 'Ergostühle'], bookings: [] },
  { id: 'c015', name: 'C015', building: 'Bibliothek', floor: 'Erdgeschoss', capacity: 8, equipment: ['Smartboard', 'Whiteboard', 'Gruppenarbeitstisch', 'WLAN', 'Moderationskarten', 'Akustikpaneele'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
  { id: 'd310', name: 'D310', building: 'Gebäude D', floor: 'Etage 3', capacity: 10, equipment: ['Beamer', 'Lautsprecher', 'Whiteboard', 'WLAN', 'Videokonferenz-Set', 'Flipchart'], bookings: [{ start: MORNING_START, end: DAY_END }] },
  { id: 'bib22', name: 'Bib-22', building: 'Bibliothek', floor: 'Etage 2', capacity: 2, equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN', 'Leselampe', 'Sichtschutz'], bookings: [] },
  { id: 'e112', name: 'E112', building: 'Gebäude E', floor: 'Etage 1', capacity: 5, equipment: ['Whiteboard', 'WLAN', 'Steckdosen', 'Dokumentenkamera', 'Pinnwand'], bookings: [] },
  { id: 'f021', name: 'F021', building: 'Gebäude F', floor: 'Erdgeschoss', capacity: 12, equipment: ['Smartboard', 'Beamer', 'Lautsprecher', 'WLAN', 'Konferenztisch', 'Kamera'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
  { id: 'lab3', name: 'Lab-3', building: 'Medienlabor', floor: 'Etage 1', capacity: 6, equipment: ['Mac-Arbeitsplätze', 'Großbildschirm', 'WLAN', 'USB-C Dock', 'Audiointerface'], bookings: [{ start: MORNING_START, end: AFTERNOON_START }] },
  { id: 'bib05', name: 'Bib-05', building: 'Bibliothek', floor: 'Erdgeschoss', capacity: 3, equipment: ['Ruhiger Bereich', 'WLAN', 'Steckdosen', 'Schreibtischleuchte', 'Whiteboard mobil'], bookings: [] },
  { id: 'g404', name: 'G404', building: 'Gebäude G', floor: 'Etage 4', capacity: 14, equipment: ['Beamer', 'Smartboard', 'Whiteboard', 'WLAN', 'Hybrid-Meeting', 'Klimaanlage'], bookings: [{ start: MORNING_START, end: DAY_END }] },
  { id: 'a220', name: 'A220', building: 'Gebäude A', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'WLAN', 'Steckdosen', 'Glasboard', 'Telefonbox nah'], bookings: [] },
];

const futureRoomSets: Room[][] = [
  [
    { id: 'mx101', name: 'MX101', building: 'MakerSpace', floor: 'Etage 1', capacity: 6, equipment: ['3D-Drucker nah', 'Whiteboard', 'WLAN', 'Steckdosen', 'Projektor'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
    { id: 'h205', name: 'H205', building: 'Gebäude H', floor: 'Etage 2', capacity: 8, equipment: ['Smartboard', 'WLAN', 'USB-C Dock', 'Gruppentisch', 'Flipchart'], bookings: [] },
    { id: 'bib14', name: 'Bib-14', building: 'Bibliothek', floor: 'Etage 1', capacity: 4, equipment: ['Ruhiger Bereich', 'Steckdosen', 'Leselampen', 'WLAN'], bookings: [{ start: MORNING_START, end: AFTERNOON_START }] },
    { id: 'j030', name: 'J030', building: 'Gebäude J', floor: 'Erdgeschoss', capacity: 10, equipment: ['Beamer', 'Whiteboard', 'Lautsprecher', 'WLAN', 'Konferenztisch'], bookings: [{ start: MORNING_START, end: DAY_END }] },
  ],
  [
    { id: 'a303', name: 'A303', building: 'Gebäude A', floor: 'Etage 3', capacity: 5, equipment: ['Monitor', 'WLAN', 'Steckdosen', 'Glasboard', 'Tageslicht'], bookings: [] },
    { id: 'c102', name: 'C102', building: 'Gebäude C', floor: 'Etage 1', capacity: 7, equipment: ['Smartboard', 'Whiteboard', 'Moderationswand', 'WLAN'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
    { id: 'bib31', name: 'Bib-31', building: 'Bibliothek', floor: 'Etage 3', capacity: 2, equipment: ['Silent Zone', 'Steckdosen', 'Leselampe', 'WLAN'], bookings: [] },
    { id: 'f118', name: 'F118', building: 'Gebäude F', floor: 'Etage 1', capacity: 12, equipment: ['Beamer', 'Hybrid-Meeting', 'Kamera', 'WLAN', 'Akustikpaneele'], bookings: [{ start: MORNING_START, end: DAY_END }] },
  ],
  [
    { id: 'd022', name: 'D022', building: 'Gebäude D', floor: 'Erdgeschoss', capacity: 6, equipment: ['Whiteboard', 'WLAN', 'Pinnwand', 'Steckdosen', 'HDMI'], bookings: [{ start: MORNING_START, end: AFTERNOON_START }] },
    { id: 'g210', name: 'G210', building: 'Gebäude G', floor: 'Etage 2', capacity: 9, equipment: ['Smartboard', 'Lautsprecher', 'WLAN', 'Konferenztisch'], bookings: [] },
    { id: 'med2', name: 'Media-2', building: 'Medienlabor', floor: 'Etage 1', capacity: 4, equipment: ['Mac-Arbeitsplätze', 'Audiointerface', 'Großbildschirm', 'WLAN'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
    { id: 'bib07', name: 'Bib-07', building: 'Bibliothek', floor: 'Erdgeschoss', capacity: 3, equipment: ['Ruhiger Bereich', 'Schreibtischleuchte', 'Steckdosen', 'WLAN'], bookings: [] },
  ],
  [
    { id: 'k115', name: 'K115', building: 'Gebäude K', floor: 'Etage 1', capacity: 8, equipment: ['Beamer', 'Whiteboard', 'WLAN', 'Moderationskoffer'], bookings: [] },
    { id: 'l404', name: 'L404', building: 'Gebäude L', floor: 'Etage 4', capacity: 14, equipment: ['Smartboard', 'Hybrid-Meeting', 'Klimaanlage', 'WLAN'], bookings: [{ start: MORNING_START, end: DAY_END }] },
    { id: 'bib26', name: 'Bib-26', building: 'Bibliothek', floor: 'Etage 2', capacity: 2, equipment: ['Silent Zone', 'Sichtschutz', 'Steckdosen', 'WLAN'], bookings: [{ start: MORNING_START, end: AFTERNOON_START }] },
    { id: 'e009', name: 'E009', building: 'Gebäude E', floor: 'Erdgeschoss', capacity: 5, equipment: ['Monitor', 'USB-C Dock', 'Whiteboard', 'WLAN'], bookings: [] },
  ],
  [
    { id: 'b018', name: 'B018', building: 'Gebäude B', floor: 'Erdgeschoss', capacity: 6, equipment: ['Whiteboard', 'Steckdosen', 'WLAN', 'Flipchart'], bookings: [{ start: AFTERNOON_START, end: DAY_END }] },
    { id: 'c220', name: 'C220', building: 'Gebäude C', floor: 'Etage 2', capacity: 10, equipment: ['Smartboard', 'Gruppentisch', 'WLAN', 'Beamer'], bookings: [] },
    { id: 'bib40', name: 'Bib-40', building: 'Bibliothek', floor: 'Etage 4', capacity: 4, equipment: ['Panoramafenster', 'Leselampen', 'Steckdosen', 'WLAN'], bookings: [] },
    { id: 'lab7', name: 'Lab-7', building: 'Medienlabor', floor: 'Etage 2', capacity: 6, equipment: ['Schnittplätze', 'Großbildschirm', 'Audiointerface', 'WLAN'], bookings: [{ start: MORNING_START, end: DAY_END }] },
  ],
];

const time = (minutes: number) => `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
const overlaps = (bookings: Booking[], start: number, end: number) => bookings.some((booking) => start < booking.end && end > booking.start);
const cloneRooms = (rooms: Room[]) => rooms.map((room) => ({ ...room, equipment: [...room.equipment], bookings: [...room.bookings] }));
const availableOptions = (room: Room) => options.filter((option) => !overlaps(room.bookings, option.start, option.end));
const optionFor = (booking: Booking | null) => options.find((option) => booking?.start === option.start && booking.end === option.end);
const dateKey = (date: Date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

const roomStatus = (room: Room, isToday: boolean): Status => {
  const morning = overlaps(room.bookings, MORNING_START, AFTERNOON_START);
  const afternoon = overlaps(room.bookings, AFTERNOON_START, DAY_END);
  if (morning && afternoon) return 'full';
  if (isToday && overlaps(room.bookings, NOW, NOW + 1)) return 'current';
  if (morning || afternoon) return 'partial';
  return 'free';
};

const availabilityText = (room: Room, isToday: boolean) => {
  const available = availableOptions(room);
  if (available.length === 0) return isToday ? 'Heute vollständig ausgebucht' : 'An diesem Tag ausgebucht';
  if (available.length === 3) return 'Vormittag, Nachmittag oder ganztags buchbar';
  return `Noch buchbar: ${available.map((option) => option.title).join(', ')}`;
};

const buildWorkdays = (): Workday[] => {
  const days: Workday[] = [];
  const today = new Date();
  const cursor = new Date(today);
  let index = 0;
  while (days.length < 5) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const isToday = dateKey(cursor) === dateKey(today);
      days.push({
        key: dateKey(cursor),
        label: isToday ? 'Heute' : weekdays[day],
        shortLabel: weekdays[day],
        dateText: `${cursor.getDate().toString().padStart(2, '0')}.${(cursor.getMonth() + 1).toString().padStart(2, '0')}.`,
        isToday,
        index,
      });
      index += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const roomsForWorkday = (day: Workday) => cloneRooms(day.isToday ? todayRooms : futureRoomSets[day.index % futureRoomSets.length]);

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [workdays] = useState(buildWorkdays);
  const [selectedDayKey, setSelectedDayKey] = useState(() => buildWorkdays()[0].key);
  const [rooms, setRooms] = useState(() => cloneRooms(todayRooms));
  const [datePanelOpen, setDatePanelOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<OptionId | null>(null);
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [bookedSlot, setBookedSlot] = useState<Booking | null>(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const progress = useRef(new Animated.Value(0)).current;
  const bounces = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  const selectedDay = workdays.find((day) => day.key === selectedDayKey) ?? workdays[0];
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? null;
  const currentAvailableOptions = selectedRoom ? availableOptions(selectedRoom) : [];
  const freeRoomCount = rooms.filter((room) => roomStatus(room, selectedDay.isToday) === 'free').length;

  useEffect(() => {
    if (screen !== 'loading') return;
    progress.setValue(0);
    bounces.forEach((bounce) => bounce.setValue(0));
    const bounceLoop = Animated.loop(
      Animated.stagger(
        130,
        bounces.map((bounce) =>
          Animated.sequence([
            Animated.timing(bounce, { toValue: 1, duration: 330, useNativeDriver: true }),
            Animated.timing(bounce, { toValue: 0, duration: 330, useNativeDriver: true }),
          ]),
        ),
      ),
    );
    Animated.timing(progress, { toValue: 1, duration: 1850, useNativeDriver: false }).start();
    bounceLoop.start();
    const timer = setTimeout(() => {
      bounceLoop.stop();
      setScreen('rooms');
    }, 2100);
    return () => {
      bounceLoop.stop();
      clearTimeout(timer);
    };
  }, [bounces, progress, screen]);

  const selectWorkday = (day: Workday) => {
    setSelectedDayKey(day.key);
    setRooms(roomsForWorkday(day));
    setSelectedRoomId(null);
    setSelectedOptionId(null);
    setDatePanelOpen(false);
  };

  const openRoom = (room: Room) => {
    setSelectedRoomId(room.id);
    setSelectedOptionId(availableOptions(room)[0]?.id ?? null);
    setScreen('detail');
  };

  const bookRoom = () => {
    if (!selectedRoom || !selectedOption) {
      Alert.alert('Zeitraum auswählen', 'Bitte wähle zuerst einen freien Zeitraum.');
      return;
    }
    if (overlaps(selectedRoom.bookings, selectedOption.start, selectedOption.end)) {
      Alert.alert('Nicht verfügbar', 'Dieser Zeitraum ist bereits belegt.');
      return;
    }
    const booking = { start: selectedOption.start, end: selectedOption.end };
    setRooms((current) => current.map((room) => (room.id === selectedRoom.id ? { ...room, bookings: [...room.bookings, booking] } : room)));
    setBookedRoom(selectedRoom);
    setBookedSlot(booking);
    setScreen('success');
  };

  const goToRooms = () => {
    setSelectedRoomId(null);
    setSelectedOptionId(null);
    setScreen('rooms');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {screen === 'home' && (
        <View style={styles.homeScreen}>
          <View style={styles.center}>
            <StudyIcon />
            <Text style={styles.homeTitle}>StudySpace</Text>
            <Text style={styles.homeSubtitle}>Finde deinen freien Lernraum auf dem Campus.</Text>
            <TouchableOpacity style={[styles.primaryButton, styles.homeButton]} onPress={() => setScreen('login')}>
              <Text style={styles.primaryButtonText}>StudySpaces laden</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.homeFooter}>Entwickelt in Kooperation mit HSNR FB03</Text>
        </View>
      )}

      {screen === 'login' && (
        <View style={styles.loginScreen}>
          <View style={styles.brandBlock}>
            <StudyIcon small />
            <Text style={styles.appTitle}>StudySpace</Text>
            <Text style={styles.subtitle}>Finde und buche freie Lernräume auf dem Campus</Text>
          </View>
          <View style={styles.formBlock}>
            <TextInput value={loginId} onChangeText={setLoginId} placeholder="Matrikelnummer oder E-Mail" placeholderTextColor="#8a94a6" style={styles.input} autoCapitalize="none" keyboardType="email-address" />
            <TextInput value={password} onChangeText={setPassword} placeholder="Passwort" placeholderTextColor="#8a94a6" style={styles.input} secureTextEntry />
            <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('loading')}>
              <Text style={styles.primaryButtonText}>Einloggen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen === 'loading' && <LoadingScreen bounces={bounces} progress={progress} />}

      {screen === 'rooms' && (
        <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>{selectedDay.isToday ? `Campus heute · Jetzt ${time(NOW)} Uhr` : `Campus ${selectedDay.shortLabel}. ${selectedDay.dateText}`}</Text>
            <Text style={styles.pageTitle}>Freie Lernräume</Text>
            <Text style={styles.helperText}>{freeRoomCount} Räume sind {selectedDay.isToday ? 'aktuell direkt frei' : 'für diesen Tag komplett frei'}</Text>
          </View>
          <View style={styles.legendRow}>
            <LegendDot color={colors.green} label="frei" />
            <LegendDot color={colors.gray} label={selectedDay.isToday ? 'gerade belegt' : 'teilweise reserviert'} />
            <LegendDot color={colors.red} label="ausgebucht" />
          </View>
          <View style={styles.roomList}>
            {rooms.map((room) => {
              const status = roomStatus(room, selectedDay.isToday);
              const label = status === 'free' ? 'Frei' : status === 'current' ? 'Gerade belegt' : status === 'partial' ? 'Teilweise frei' : 'Ausgebucht';
              return (
                <TouchableOpacity key={room.id} activeOpacity={0.85} style={[styles.roomCard, (status === 'current' || status === 'partial') && styles.currentCard, status === 'full' && styles.fullCard]} onPress={() => openRoom(room)}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.cardTitleBlock}>
                      <Text style={[styles.roomName, status !== 'free' && styles.mutedText]}>{room.name}</Text>
                      <Text style={styles.roomLocation}>{room.building} · {room.floor}</Text>
                    </View>
                    <StatusBadge status={status} label={label} />
                  </View>
                  <Text style={styles.cardMeta}>{room.capacity} Plätze · halb- oder ganztags</Text>
                  <Text style={styles.availabilityText}>{availabilityText(room, selectedDay.isToday)}</Text>
                  <View style={styles.chipRow}>{room.equipment.slice(0, 3).map((item) => <Chip key={item} label={item} />)}</View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {screen === 'rooms' && (
        <>
          <TouchableOpacity style={styles.floatingCalendarButton} activeOpacity={0.88} onPress={() => setDatePanelOpen(true)}>
            <Text style={styles.floatingCalendarIcon}>▦</Text>
            <Text style={styles.floatingCalendarText}>Tage</Text>
          </TouchableOpacity>
          {datePanelOpen && (
            <View style={styles.panelOverlay}>
              <TouchableOpacity style={styles.panelBackdrop} activeOpacity={1} onPress={() => setDatePanelOpen(false)} />
              <View style={styles.datePanel}>
                <View style={styles.panelHeader}>
                  <View>
                    <Text style={styles.panelKicker}>Arbeitswoche</Text>
                    <Text style={styles.panelTitle}>Freie Tage wählen</Text>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDatePanelOpen(false)}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarGrid}>
                  {workdays.map((day) => {
                    const active = selectedDayKey === day.key;
                    const dayFreeRooms = roomsForWorkday(day).filter((room) => roomStatus(room, day.isToday) === 'free').length;
                    return (
                      <TouchableOpacity key={day.key} activeOpacity={0.86} style={[styles.dayTile, active && styles.dayTileActive]} onPress={() => selectWorkday(day)}>
                        <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day.label}</Text>
                        <Text style={[styles.dayDate, active && styles.dayDateActive]}>{day.dateText}</Text>
                        <Text style={[styles.dayMeta, active && styles.dayMetaActive]}>{dayFreeRooms} frei</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.campusFooter}>
                  <Text style={styles.campusLabel}>Aktueller Campus</Text>
                  <Text style={styles.campusValue}>HSNR Campus MG</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}

      {screen === 'detail' && selectedRoom && (
        <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={goToRooms}><Text style={styles.backButtonText}>Zurück</Text></TouchableOpacity>
          <View style={styles.detailHero}>
            <StatusBadge status={roomStatus(selectedRoom, selectedDay.isToday)} label={roomStatus(selectedRoom, selectedDay.isToday) === 'free' ? (selectedDay.isToday ? 'Jetzt frei' : 'Frei buchbar') : roomStatus(selectedRoom, selectedDay.isToday) === 'current' ? 'Gerade belegt' : roomStatus(selectedRoom, selectedDay.isToday) === 'partial' ? 'Teilweise frei' : 'Ausgebucht'} />
            <Text style={styles.detailTitle}>{selectedRoom.name}</Text>
            <Text style={styles.detailSubtitle}>{selectedRoom.building} · {selectedRoom.floor}</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoBox label="Kapazität" value={`${selectedRoom.capacity} Plätze`} />
            <InfoBox label="Buchungsfenster" value="08:00 - 18:00 Uhr" />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zeitraum wählen</Text>
            {currentAvailableOptions.length === 0 ? (
              <View style={styles.emptySlots}><Text style={styles.emptySlotsText}>Dieser Raum ist an diesem Tag vollständig ausgebucht.</Text></View>
            ) : (
              <View style={styles.optionList}>
                {options.map((option) => {
                  const available = !overlaps(selectedRoom.bookings, option.start, option.end);
                  const active = selectedOptionId === option.id;
                  return (
                    <TouchableOpacity key={option.id} disabled={!available} activeOpacity={available ? 0.85 : 1} style={[styles.bookingOption, active && styles.bookingOptionActive, !available && styles.bookingOptionDisabled]} onPress={() => setSelectedOptionId(option.id)}>
                      <View style={styles.optionTextBlock}>
                        <Text style={[styles.bookingOptionTitle, active && styles.bookingOptionTitleActive, !available && styles.disabledText]}>{option.title}</Text>
                        <Text style={[styles.bookingOptionSubtitle, active && styles.bookingOptionSubtitleActive, !available && styles.disabledText]}>{option.subtitle}</Text>
                      </View>
                      <View style={[styles.optionPill, active && styles.optionPillActive]}>
                        <Text style={[styles.optionPillText, active && styles.optionPillTextActive, !available && styles.disabledText]}>{available ? 'frei' : 'belegt'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ausstattung</Text>
            <View style={styles.detailChipRow}>{selectedRoom.equipment.map((item) => <Chip key={item} label={item} large />)}</View>
          </View>
          <TouchableOpacity style={[styles.primaryButton, currentAvailableOptions.length === 0 && styles.disabledButton]} onPress={bookRoom}>
            <Text style={styles.primaryButtonText}>Raum buchen</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {screen === 'success' && bookedRoom && bookedSlot && (
        <View style={styles.successScreen}>
          <View style={styles.successMark}><Text style={styles.successMarkText}>✓</Text></View>
          <Text style={styles.successTitle}>Deine Buchung wurde bestätigt</Text>
          <Text style={styles.successSubtitle}>{bookedRoom.name} ist {optionFor(bookedSlot)?.title.toLowerCase()} von {time(bookedSlot.start)} bis {time(bookedSlot.end)} Uhr für dich reserviert.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goToRooms}>
            <Text style={styles.primaryButtonText}>Zurück zur Übersicht</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function StudyIcon({ small }: { small?: boolean }) {
  return (
    <View style={[styles.studyIcon, small && styles.studyIconSmall]}>
      <View style={styles.iconBuilding}>
        <View style={styles.iconWindowRow}><View style={styles.iconWindow} /><View style={styles.iconWindow} /></View>
        <View style={styles.iconDoor} />
      </View>
      <View style={styles.iconBook}><View style={styles.iconBookLine} /><View style={styles.iconBookLineShort} /></View>
    </View>
  );
}

function LoadingScreen({ bounces, progress }: { bounces: Animated.Value[]; progress: Animated.Value }) {
  return (
    <View style={styles.loadingScreen}>
      <View style={styles.center}>
        <Text style={styles.loadingKicker}>Campusdaten werden vorbereitet</Text>
        <Text style={styles.loadingTitle}>StudySpaces laden</Text>
        <Text style={styles.loadingSubtitle}>Räume, Zeitfenster und Verfügbarkeit werden lokal geladen.</Text>
        <View style={styles.uniIconRail}>
          <UniIcon animation={bounces[0]} label="Bibliothek" type="book" />
          <UniIcon animation={bounces[1]} label="Lernen" type="pencil" featured />
          <UniIcon animation={bounces[2]} label="Räume" type="room" />
        </View>
        <View style={styles.bouncingDots}>
          {bounces.map((bounce, index) => (
            <Animated.View key={index} style={[styles.loadingDot, { opacity: bounce.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }]} />
          ))}
        </View>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] }) }]} />
        </View>
      </View>
    </View>
  );
}

function UniIcon({ animation, label, type, featured }: { animation: Animated.Value; label: string; type: 'book' | 'pencil' | 'room'; featured?: boolean }) {
  return (
    <Animated.View style={[styles.uniIconCard, featured && styles.uniIconCardFeatured, { transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, featured ? -16 : -12] }) }] }]}>
      {type === 'book' && <View style={styles.bookIcon}><View style={styles.bookPage} /><View style={styles.bookPage} /></View>}
      {type === 'pencil' && <View style={styles.pencilIcon}><View style={styles.pencilBody} /><View style={styles.pencilTip} /></View>}
      {type === 'room' && <View style={styles.roomIcon}><View style={styles.roomIconBoard} /><View style={styles.roomIconTable} /></View>}
      <Text style={[styles.uniIconLabel, featured && styles.uniIconLabelFeatured]}>{label}</Text>
    </Animated.View>
  );
}

function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <View style={[styles.statusBadge, status === 'free' && styles.freeBadge, (status === 'current' || status === 'partial') && styles.currentBadge, status === 'full' && styles.fullBadge]}>
      <Text style={[styles.statusText, status === 'free' && styles.freeText, (status === 'current' || status === 'partial') && styles.currentText, status === 'full' && styles.fullText]}>{label}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoBox}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function Chip({ label, large }: { label: string; large?: boolean }) {
  return <View style={large ? styles.detailChip : styles.smallChip}><Text style={large ? styles.detailChipText : styles.smallChipText}>{label}</Text></View>;
}

const colors = {
  navy: '#0b1f3a',
  navySoft: '#14345c',
  green: '#19a66a',
  greenSoft: '#e8f8f0',
  gray: '#64748b',
  graySoft: '#eef2f7',
  mint: '#dff8ec',
  red: '#b33a3a',
  redSoft: '#fdecec',
  background: '#f4f7fb',
  card: '#ffffff',
  text: '#102033',
  muted: '#6b778c',
  border: '#e3e9f2',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  homeScreen: { flex: 1, padding: 24, backgroundColor: colors.background },
  loginScreen: { flex: 1, justifyContent: 'center', padding: 24 },
  loadingScreen: { flex: 1, padding: 24, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  homeFooter: { alignSelf: 'flex-end', color: colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  studyIcon: { width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: colors.navy, shadowColor: colors.navy, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 6 },
  studyIconSmall: { transform: [{ scale: 0.78 }], marginBottom: 10 },
  iconBuilding: { width: 52, height: 58, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, backgroundColor: '#ffffff' },
  iconWindowRow: { flexDirection: 'row', gap: 7 },
  iconWindow: { width: 10, height: 10, borderRadius: 3, backgroundColor: colors.green },
  iconDoor: { width: 18, height: 24, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: colors.navy },
  iconBook: { position: 'absolute', right: 22, bottom: 20, width: 34, height: 22, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 5, backgroundColor: colors.green },
  iconBookLine: { height: 3, borderRadius: 99, marginBottom: 5, backgroundColor: '#ffffff' },
  iconBookLineShort: { width: 13, height: 3, borderRadius: 99, backgroundColor: '#ffffff' },
  homeTitle: { color: colors.navy, fontSize: 40, fontWeight: '900', letterSpacing: 0 },
  homeSubtitle: { maxWidth: 300, marginTop: 10, marginBottom: 34, color: colors.muted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  homeButton: { width: '100%', maxWidth: 320 },
  brandBlock: { alignItems: 'center', marginBottom: 42 },
  appTitle: { color: colors.navy, fontSize: 38, fontWeight: '800', letterSpacing: 0 },
  subtitle: { maxWidth: 310, marginTop: 10, color: colors.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  formBlock: { gap: 14 },
  input: { height: 56, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 18, backgroundColor: colors.card, color: colors.text, fontSize: 16 },
  primaryButton: { minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 18, backgroundColor: colors.navy, shadowColor: colors.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 14, elevation: 4 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  loadingKicker: { color: colors.green, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  loadingTitle: { marginTop: 10, color: colors.navy, fontSize: 34, fontWeight: '900', textAlign: 'center' },
  loadingSubtitle: { maxWidth: 310, marginTop: 10, color: colors.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  uniIconRail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 42, marginBottom: 34 },
  uniIconCard: { width: 92, minHeight: 108, borderRadius: 22, alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, shadowColor: '#1b2a41', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  uniIconCardFeatured: { backgroundColor: colors.mint, borderColor: '#b7efd3' },
  uniIconLabel: { marginTop: 10, color: colors.navySoft, fontSize: 12, fontWeight: '900' },
  uniIconLabelFeatured: { color: colors.green },
  bookIcon: { flexDirection: 'row', gap: 3 },
  bookPage: { width: 18, height: 30, borderRadius: 5, borderWidth: 2, borderColor: colors.green, backgroundColor: '#ffffff' },
  pencilIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-24deg' }] },
  pencilBody: { width: 12, height: 34, borderRadius: 6, backgroundColor: colors.green },
  pencilTip: { width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#ffffff', marginTop: -1 },
  roomIcon: { width: 42, height: 38, alignItems: 'center', justifyContent: 'center' },
  roomIconBoard: { width: 38, height: 20, borderRadius: 6, borderWidth: 2, borderColor: colors.green, backgroundColor: colors.greenSoft },
  roomIconTable: { width: 28, height: 7, borderRadius: 99, marginTop: 5, backgroundColor: colors.navy },
  bouncingDots: { flexDirection: 'row', gap: 10, height: 28, alignItems: 'flex-end', justifyContent: 'center' },
  loadingDot: { width: 11, height: 11, borderRadius: 99, backgroundColor: colors.green },
  loadingTrack: { width: '78%', maxWidth: 260, height: 9, borderRadius: 99, overflow: 'hidden', marginTop: 22, backgroundColor: '#dde6f1' },
  loadingFill: { height: 9, borderRadius: 99, backgroundColor: colors.green },
  scrollContent: { padding: 22, paddingBottom: 112 },
  header: { marginBottom: 16 },
  kicker: { marginBottom: 6, color: colors.green, fontSize: 14, fontWeight: '800', textTransform: 'uppercase' },
  pageTitle: { color: colors.navy, fontSize: 34, fontWeight: '800' },
  helperText: { marginTop: 8, color: colors.muted, fontSize: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  legendDot: { width: 10, height: 10, borderRadius: 99 },
  legendText: { marginRight: 8, color: colors.muted, fontSize: 13, fontWeight: '700' },
  roomList: { gap: 14 },
  roomCard: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, backgroundColor: colors.card, shadowColor: '#1b2a41', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  currentCard: { borderColor: '#d7dee9', backgroundColor: '#f8fafc', opacity: 0.78 },
  fullCard: { borderColor: '#f2c4c4', backgroundColor: '#fff6f6', opacity: 0.72 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  cardTitleBlock: { flex: 1 },
  roomName: { color: colors.text, fontSize: 24, fontWeight: '800' },
  mutedText: { color: '#4d5868' },
  roomLocation: { marginTop: 4, color: colors.muted, fontSize: 14 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  freeBadge: { backgroundColor: colors.greenSoft },
  currentBadge: { backgroundColor: colors.graySoft },
  fullBadge: { backgroundColor: colors.redSoft },
  statusText: { fontSize: 13, fontWeight: '800' },
  freeText: { color: colors.green },
  currentText: { color: colors.gray },
  fullText: { color: colors.red },
  cardMeta: { marginTop: 14, color: colors.navySoft, fontSize: 15, fontWeight: '700' },
  availabilityText: { marginTop: 6, color: colors.muted, fontSize: 14, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  smallChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eef3f8' },
  smallChipText: { color: colors.navySoft, fontSize: 12, fontWeight: '700' },
  backButton: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18, backgroundColor: '#e8eef6' },
  backButtonText: { color: colors.navy, fontSize: 14, fontWeight: '800' },
  detailHero: { borderRadius: 24, padding: 22, backgroundColor: colors.navy },
  detailTitle: { marginTop: 22, color: '#ffffff', fontSize: 42, fontWeight: '800' },
  detailSubtitle: { marginTop: 8, color: '#c8d5e5', fontSize: 17, fontWeight: '600' },
  infoGrid: { gap: 12, marginTop: 16 },
  infoBox: { borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, backgroundColor: colors.card },
  infoLabel: { color: colors.muted, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { marginTop: 8, color: colors.text, fontSize: 18, fontWeight: '800' },
  section: { marginTop: 24, marginBottom: 12 },
  sectionTitle: { marginBottom: 12, color: colors.navy, fontSize: 20, fontWeight: '800' },
  optionList: { gap: 12 },
  bookingOption: { minHeight: 76, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: colors.card },
  bookingOptionActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  bookingOptionDisabled: { backgroundColor: '#f1f5f9', opacity: 0.62 },
  optionTextBlock: { flex: 1 },
  bookingOptionTitle: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  bookingOptionSubtitle: { marginTop: 4, color: colors.muted, fontSize: 14, fontWeight: '700' },
  bookingOptionTitleActive: { color: colors.green },
  bookingOptionSubtitleActive: { color: '#167a50' },
  disabledText: { color: '#8a94a6' },
  optionPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#eef3f8' },
  optionPillActive: { backgroundColor: colors.green },
  optionPillText: { color: colors.navySoft, fontSize: 12, fontWeight: '800' },
  optionPillTextActive: { color: '#ffffff' },
  emptySlots: { borderRadius: 16, padding: 16, backgroundColor: colors.redSoft },
  emptySlotsText: { color: colors.red, fontSize: 14, fontWeight: '800' },
  detailChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailChip: { borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: colors.greenSoft },
  detailChipText: { color: colors.green, fontSize: 13, fontWeight: '800' },
  disabledButton: { backgroundColor: '#9aa6b8', shadowOpacity: 0 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successMark: { width: 86, height: 86, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: colors.green },
  successMarkText: { color: '#ffffff', fontSize: 42, fontWeight: '900' },
  successTitle: { color: colors.navy, fontSize: 30, fontWeight: '800', lineHeight: 37, textAlign: 'center' },
  successSubtitle: { marginTop: 12, marginBottom: 22, color: colors.muted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  floatingCalendarButton: { position: 'absolute', right: 20, bottom: 22, height: 58, borderRadius: 19, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, backgroundColor: colors.navy, shadowColor: colors.navy, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 8 },
  floatingCalendarIcon: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  floatingCalendarText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  panelOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  panelBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 31, 58, 0.22)' },
  datePanel: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 26, backgroundColor: colors.card, shadowColor: '#1b2a41', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.14, shadowRadius: 22, elevation: 12 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 },
  panelKicker: { color: colors.green, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  panelTitle: { marginTop: 4, color: colors.navy, fontSize: 24, fontWeight: '900' },
  closeButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef3f8' },
  closeButtonText: { color: colors.navy, fontSize: 28, fontWeight: '700', lineHeight: 30 },
  calendarGrid: { flexDirection: 'row', gap: 9 },
  dayTile: { flex: 1, minHeight: 96, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 6, backgroundColor: '#f8fafc' },
  dayTileActive: { borderColor: colors.green, backgroundColor: colors.green },
  dayLabel: { color: colors.navy, fontSize: 13, fontWeight: '900' },
  dayLabelActive: { color: '#ffffff' },
  dayDate: { marginTop: 5, color: colors.muted, fontSize: 12, fontWeight: '800' },
  dayDateActive: { color: '#eafff3' },
  dayMeta: { marginTop: 9, color: colors.green, fontSize: 11, fontWeight: '900' },
  dayMetaActive: { color: '#ffffff' },
  campusFooter: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, backgroundColor: '#f8fafc' },
  campusLabel: { color: colors.muted, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  campusValue: { marginTop: 4, color: colors.navy, fontSize: 17, fontWeight: '900' },
});
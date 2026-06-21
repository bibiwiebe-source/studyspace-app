import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewStyle } from 'react-native';

type Screen = 'home' | 'login' | 'loading' | 'rooms' | 'detail' | 'success' | 'profile' | 'profileData' | 'bookings' | 'campus';
type SlotId = 'morning' | 'afternoon' | 'day';
type Booking = { start: number; end: number };
type Room = { id: string; name: string; building: string; floor: string; capacity: number; equipment: string[]; bookings: Booking[] };
type Workday = { key: string; label: string; short: string; date: string; isToday: boolean; index: number };

const MORNING = 8 * 60;
const AFTERNOON = 13 * 60;
const END = 18 * 60;
const NOW = 10 * 60 + 30;
const week = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const slots = [
  { id: 'morning' as SlotId, title: 'Vormittag', subtitle: '08:00 - 13:00 Uhr', start: MORNING, end: AFTERNOON },
  { id: 'afternoon' as SlotId, title: 'Nachmittag', subtitle: '13:00 - 18:00 Uhr', start: AFTERNOON, end: END },
  { id: 'day' as SlotId, title: 'Ganzer Tag', subtitle: '08:00 - 18:00 Uhr', start: MORNING, end: END },
];

const todayRooms: Room[] = [
  { id: 'w101', name: 'W101', building: 'Gebäude W', floor: 'Etage 1', capacity: 6, equipment: ['Beamer', 'Whiteboard', 'Steckdosen', 'WLAN', 'USB-C Dock'], bookings: [{ start: MORNING, end: AFTERNOON }] },
  { id: 'w204', name: 'W204', building: 'Gebäude W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'Steckdosen', 'WLAN', 'HDMI', 'Ergostühle'], bookings: [] },
  { id: 'z015', name: 'Z015', building: 'Gebäude Z', floor: 'Erdgeschoss', capacity: 8, equipment: ['Sprachenzentrum', 'Whiteboard', 'Gruppentisch', 'WLAN', 'Akustikpaneele'], bookings: [{ start: AFTERNOON, end: END }] },
  { id: 'y110', name: 'Y1.10', building: 'Gebäude Y1', floor: 'Etage 1', capacity: 10, equipment: ['Beamer', 'Lautsprecher', 'Whiteboard', 'WLAN', 'Kamera'], bookings: [{ start: MORNING, end: END }] },
  { id: 'z022', name: 'Z022', building: 'Gebäude Z', floor: 'Etage 2', capacity: 2, equipment: ['Ruhiger Bereich', 'Steckdosen', 'WLAN', 'Leselampe'], bookings: [] },
  { id: 'w021', name: 'W021', building: 'Gebäude W', floor: 'Erdgeschoss', capacity: 12, equipment: ['Audimax nah', 'Beamer', 'WLAN', 'Konferenztisch'], bookings: [{ start: AFTERNOON, end: END }] },
  { id: 'y103', name: 'Y1.03', building: 'Gebäude Y1', floor: 'Etage 1', capacity: 6, equipment: ['Monitorwand', 'Whiteboard', 'WLAN', 'Audiointerface'], bookings: [{ start: MORNING, end: AFTERNOON }] },
  { id: 'z404', name: 'Z404', building: 'Gebäude Z', floor: 'Etage 4', capacity: 14, equipment: ['Sprachenzentrum', 'Whiteboard', 'WLAN', 'Hybrid-Meeting'], bookings: [{ start: MORNING, end: END }] },
  { id: 'w220', name: 'W220', building: 'Gebäude W', floor: 'Etage 2', capacity: 4, equipment: ['Monitor', 'WLAN', 'Steckdosen', 'Glasboard'], bookings: [] },
];

const futureSets: Room[][] = [
  [
    { id: 'y101', name: 'Y1.01', building: 'Gebäude Y1', floor: 'Etage 1', capacity: 6, equipment: ['MakerSpace nah', 'Whiteboard', 'WLAN'], bookings: [{ start: AFTERNOON, end: END }] },
    { id: 'w205', name: 'W205', building: 'Gebäude W', floor: 'Etage 2', capacity: 8, equipment: ['Smartboard', 'USB-C Dock', 'WLAN'], bookings: [] },
    { id: 'z030', name: 'Z030', building: 'Gebäude Z', floor: 'Erdgeschoss', capacity: 10, equipment: ['Beamer', 'Whiteboard', 'WLAN'], bookings: [{ start: MORNING, end: END }] },
  ],
  [
    { id: 'w303', name: 'W303', building: 'Gebäude W', floor: 'Etage 3', capacity: 5, equipment: ['Monitor', 'WLAN', 'Tageslicht'], bookings: [] },
    { id: 'w102', name: 'W102', building: 'Gebäude W', floor: 'Etage 1', capacity: 7, equipment: ['Smartboard', 'Whiteboard', 'WLAN'], bookings: [{ start: AFTERNOON, end: END }] },
    { id: 'z231', name: 'Z231', building: 'Gebäude Z', floor: 'Etage 2', capacity: 2, equipment: ['Silent Zone', 'Steckdosen', 'WLAN'], bookings: [] },
  ],
  [
    { id: 'y022', name: 'Y1.22', building: 'Gebäude Y1', floor: 'Erdgeschoss', capacity: 6, equipment: ['Whiteboard', 'Pinnwand', 'WLAN'], bookings: [{ start: MORNING, end: AFTERNOON }] },
    { id: 'w210', name: 'W210', building: 'Gebäude W', floor: 'Etage 2', capacity: 9, equipment: ['Smartboard', 'Lautsprecher', 'WLAN'], bookings: [] },
    { id: 'z202', name: 'Z202', building: 'Gebäude Z', floor: 'Etage 2', capacity: 4, equipment: ['Arbeitsplätze', 'Audiointerface', 'WLAN'], bookings: [{ start: AFTERNOON, end: END }] },
  ],
  [
    { id: 'y115', name: 'Y1.15', building: 'Gebäude Y1', floor: 'Etage 1', capacity: 8, equipment: ['Beamer', 'Whiteboard', 'WLAN'], bookings: [] },
    { id: 'w404', name: 'W404', building: 'Gebäude W', floor: 'Etage 4', capacity: 14, equipment: ['Smartboard', 'Hybrid-Meeting', 'WLAN'], bookings: [{ start: MORNING, end: END }] },
    { id: 'z009', name: 'Z009', building: 'Gebäude Z', floor: 'Erdgeschoss', capacity: 5, equipment: ['Monitor', 'USB-C Dock', 'WLAN'], bookings: [] },
  ],
  [
    { id: 'w018', name: 'W018', building: 'Gebäude W', floor: 'Erdgeschoss', capacity: 6, equipment: ['Whiteboard', 'Steckdosen', 'WLAN'], bookings: [{ start: AFTERNOON, end: END }] },
    { id: 'y220', name: 'Y1.20', building: 'Gebäude Y1', floor: 'Etage 2', capacity: 10, equipment: ['Smartboard', 'Gruppentisch', 'WLAN'], bookings: [] },
    { id: 'z340', name: 'Z340', building: 'Gebäude Z', floor: 'Etage 3', capacity: 4, equipment: ['Leselampen', 'Steckdosen', 'WLAN'], bookings: [] },
  ],
];

const profileRows = [
  ['Name', 'Mira'],
  ['Nachname', 'Schneider'],
  ['Matrikelnummer', '1124587'],
  ['Eingeschrieben in', 'BBW'],
  ['Campus / Fachbereich', 'HSNR Campus MG · Fachbereich 08'],
  ['Zugang', 'Bis Ende des Semesters aktiv'],
];

const profileBookings = [
  { room: 'W204', day: 'Heute', building: 'Gebäude W', slot: 'Nachmittag · 13:00 bis 18:00 Uhr' },
  { room: 'Z022', day: 'Mo, 22.06.', building: 'Gebäude Z', slot: 'Vormittag - 08:00 bis 13:00 Uhr' },
  { room: 'Y1.15', day: 'Di, 23.06.', building: 'Gebäude Y1', slot: 'Ganzer Tag · 08:00 bis 18:00 Uhr' },
  { room: 'Z202', day: 'Do, 25.06.', building: 'Gebäude Z', slot: 'Nachmittag · 13:00 bis 18:00 Uhr' },
];

const campusBuildings: { name: string; short: string; style: ViewStyle; entrance?: boolean }[] = [
  { name: 'Gebäude Y1', short: 'Y1', style: { left: '19%', top: '8%', width: '12%', height: 76 } },
  { name: 'Gebäude Y2', short: 'Y2', style: { left: '24%', top: '40%', width: '12%', height: 42 } },
  { name: 'Gebäude Z', short: 'Z', style: { right: '17%', top: '16%', width: '37%', height: 86 } },
  { name: 'Gebäude R', short: 'R', style: { left: '42%', top: '36%', width: '12%', height: 76 } },
  { name: 'Gebäude S', short: 'S', style: { left: '42%', top: '56%', width: '12%', height: 86 } },
  { name: 'Gebäude T', short: 'T', style: { left: '57%', top: '42%', width: '11%', height: 64 } },
  { name: 'Gebäude X', short: 'X', style: { left: '55%', top: '61%', width: '11%', height: 42 } },
  { name: 'Gebäude W', short: 'W', style: { right: '15%', bottom: '17%', width: '34%', height: 54 }, entrance: true },
  { name: 'Gebäude F', short: 'F', style: { left: '12%', bottom: '15%', width: '25%', height: 44 } },
];

const time = (minutes: number) => `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
const overlaps = (bookings: Booking[], start: number, end: number) => bookings.some((booking) => start < booking.end && end > booking.start);
const copyRooms = (rooms: Room[]) => rooms.map((room) => ({ ...room, bookings: [...room.bookings], equipment: [...room.equipment] }));
const keyFor = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const optionsFor = (room: Room) => slots.filter((slot) => !overlaps(room.bookings, slot.start, slot.end));

function buildWorkdays() {
  const today = new Date();
  const cursor = new Date(today);
  const days: Workday[] = [];
  let index = 0;
  while (days.length < 5) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const isToday = keyFor(cursor) === keyFor(today);
      days.push({
        key: keyFor(cursor),
        label: isToday ? 'Heute' : week[day],
        short: week[day],
        date: `${cursor.getDate().toString().padStart(2, '0')}.${(cursor.getMonth() + 1).toString().padStart(2, '0')}.`,
        isToday,
        index,
      });
      index += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function roomsFor(day: Workday) {
  return copyRooms(day.isToday ? todayRooms : futureSets[day.index % futureSets.length]);
}

function statusFor(room: Room, isToday: boolean) {
  const morning = overlaps(room.bookings, MORNING, AFTERNOON);
  const afternoon = overlaps(room.bookings, AFTERNOON, END);
  if (morning && afternoon) return 'full';
  if (isToday && overlaps(room.bookings, NOW, NOW + 1)) return 'current';
  if (morning || afternoon) return 'partial';
  return 'free';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [days] = useState(buildWorkdays);
  const [selectedDayKey, setSelectedDayKey] = useState(() => buildWorkdays()[0].key);
  const [rooms, setRooms] = useState(() => copyRooms(todayRooms));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>(null);
  const [showDays, setShowDays] = useState(false);
  const [bookedRoom, setBookedRoom] = useState<Room | null>(null);
  const [bookedSlot, setBookedSlot] = useState<Booking | null>(null);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const progress = useRef(new Animated.Value(0)).current;
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const selectedDay = days.find((day) => day.key === selectedDayKey) ?? days[0];
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? null;
  const availableSlots = selectedRoom ? optionsFor(selectedRoom) : [];
  const freeCount = rooms.filter((room) => statusFor(room, selectedDay.isToday) === 'free').length;
  const campusDay = days[0];
  const campusRooms = selectedDayKey === campusDay.key ? rooms : roomsFor(campusDay);

  useEffect(() => {
    if (screen !== 'loading') return;
    progress.setValue(0);
    dots.forEach((dot) => dot.setValue(0));
    const loop = Animated.loop(Animated.stagger(120, dots.map((dot) => Animated.sequence([
      Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]))));
    Animated.timing(progress, { toValue: 1, duration: 1800, useNativeDriver: false }).start();
    loop.start();
    const timer = setTimeout(() => {
      loop.stop();
      setScreen('rooms');
    }, 2100);
    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [dots, progress, screen]);

  const goRooms = () => {
    setSelectedRoomId(null);
    setSelectedSlot(null);
    setShowDays(false);
    setScreen('rooms');
  };

  const selectDay = (day: Workday) => {
    setSelectedDayKey(day.key);
    setRooms(roomsFor(day));
    setSelectedRoomId(null);
    setSelectedSlot(null);
    setShowDays(false);
  };

  const openRoom = (room: Room) => {
    const first = optionsFor(room)[0];
    setSelectedRoomId(room.id);
    setSelectedSlot(first?.id ?? null);
    setScreen('detail');
  };

  const bookRoom = () => {
    if (!selectedRoom || !selectedSlot) return;
    const slot = slots.find((item) => item.id === selectedSlot);
    if (!slot || overlaps(selectedRoom.bookings, slot.start, slot.end)) {
      Alert.alert('Nicht verfügbar', 'Dieser Zeitraum ist bereits belegt.');
      return;
    }
    const booking = { start: slot.start, end: slot.end };
    setRooms((current) => current.map((room) => room.id === selectedRoom.id ? { ...room, bookings: [...room.bookings, booking] } : room));
    setBookedRoom(selectedRoom);
    setBookedSlot(booking);
    setScreen('success');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {screen === 'home' && <Home onStart={() => setScreen('login')} />}
      {screen === 'login' && (
        <View style={styles.login}>
          <StudyIcon small />
          <Text style={styles.appTitle}>StudySpace</Text>
          <Text style={styles.sub}>Finde und buche freie Lernräume auf dem Campus</Text>
          <TextInput style={styles.input} placeholder="Matrikelnummer oder E-Mail" placeholderTextColor="#8a94a6" value={login} onChangeText={setLogin} />
          <TextInput style={styles.input} placeholder="Passwort" placeholderTextColor="#8a94a6" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.primary} onPress={() => setScreen('loading')}><Text style={styles.primaryText}>Einloggen</Text></TouchableOpacity>
        </View>
      )}
      {screen === 'loading' && <Loading dots={dots} progress={progress} />}
      {screen === 'rooms' && (
        <>
          <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
            <Text style={styles.kicker}>{selectedDay.isToday ? `Campus heute - Jetzt ${time(NOW)} Uhr` : `Campus ${selectedDay.short}. ${selectedDay.date}`}</Text>
            <Text style={styles.title}>Freie Lernräume</Text>
            <Text style={styles.sub}>{freeCount} Räume sind {selectedDay.isToday ? 'aktuell direkt frei' : 'für diesen Tag komplett frei'}</Text>
            <View style={styles.legend}><Legend color={c.green} text="frei" /><Legend color={c.gray} text={selectedDay.isToday ? 'gerade belegt' : 'teilweise reserviert'} /><Legend color={c.red} text="ausgebucht" /></View>
            {rooms.map((room) => {
              const status = statusFor(room, selectedDay.isToday);
              const label = status === 'free' ? 'Frei' : status === 'current' ? 'Gerade belegt' : status === 'partial' ? 'Teilweise frei' : 'Ausgebucht';
              return <RoomCard key={room.id} room={room} status={status} label={label} isToday={selectedDay.isToday} onPress={() => openRoom(room)} />;
            })}
          </ScrollView>
          <TouchableOpacity style={styles.profileBtn} onPress={() => setScreen('profile')}>
            <View style={styles.avatar}><Text style={styles.avatarText}>MS</Text></View><Text style={styles.profileBtnText}>Profil</Text>
          </TouchableOpacity>
          {!showDays && <TouchableOpacity style={styles.dayButton} onPress={() => setShowDays(true)}><Text style={styles.dayButtonIcon}>▦</Text><Text style={styles.dayButtonText}>Tage</Text></TouchableOpacity>}
          {showDays && <DayPanel days={days} selectedKey={selectedDayKey} onClose={() => setShowDays(false)} onPick={selectDay} />}
        </>
      )}
      {screen === 'detail' && selectedRoom && (
        <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
          <Back onPress={goRooms} />
          <View style={styles.hero}><Badge status={statusFor(selectedRoom, selectedDay.isToday)} label={selectedRoom.name} /><Text style={styles.heroTitle}>{selectedRoom.building}</Text><Text style={styles.heroSub}>{selectedRoom.floor} · {selectedRoom.capacity} Plätze</Text></View>
          <Text style={styles.sectionTitle}>Zeitraum wählen</Text>
          {availableSlots.length === 0 ? <Text style={styles.empty}>Dieser Raum ist an diesem Tag vollständig ausgebucht.</Text> : slots.map((slot) => {
            const free = !overlaps(selectedRoom.bookings, slot.start, slot.end);
            const active = selectedSlot === slot.id;
            return <TouchableOpacity key={slot.id} disabled={!free} style={[styles.slot, active && styles.slotActive, !free && styles.disabled]} onPress={() => setSelectedSlot(slot.id)}><View><Text style={styles.slotTitle}>{slot.title}</Text><Text style={styles.slotSub}>{slot.subtitle}</Text></View><Text style={styles.slotPill}>{free ? 'frei' : 'belegt'}</Text></TouchableOpacity>;
          })}
          <Text style={styles.sectionTitle}>Ausstattung</Text>
          <View style={styles.chips}>{selectedRoom.equipment.map((item) => <Chip key={item} text={item} />)}</View>
          <TouchableOpacity style={[styles.primary, availableSlots.length === 0 && styles.disabled]} onPress={bookRoom}><Text style={styles.primaryText}>Raum buchen</Text></TouchableOpacity>
        </ScrollView>
      )}
      {screen === 'success' && bookedRoom && bookedSlot && (
        <View style={styles.success}>
          <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
          <Text style={styles.successTitle}>Deine Buchung wurde bestätigt</Text>
          <Text style={styles.successText}>{bookedRoom.name} ist von {time(bookedSlot.start)} bis {time(bookedSlot.end)} Uhr für dich reserviert.</Text>
          <TouchableOpacity style={[styles.primary, styles.successButton]} onPress={goRooms}><Text style={styles.primaryText}>Zurück zur Übersicht</Text></TouchableOpacity>
        </View>
      )}
      {screen === 'profile' && <ProfileMenu onBack={goRooms} onData={() => setScreen('profileData')} onBookings={() => setScreen('bookings')} onCampus={() => setScreen('campus')} />}
      {screen === 'profileData' && <ProfileData onBack={() => setScreen('profile')} />}
      {screen === 'bookings' && <Bookings onBack={() => setScreen('profile')} />}
      {screen === 'campus' && <CampusView onBack={() => setScreen('profile')} day={campusDay} rooms={campusRooms} />}
    </SafeAreaView>
  );
}

function Home({ onStart }: { onStart: () => void }) {
  return <View style={styles.home}><View style={styles.center}><StudyIcon /><Text style={styles.homeTitle}>StudySpace</Text><Text style={styles.sub}>Finde deinen freien Lernraum auf dem Campus.</Text><TouchableOpacity style={styles.primary} onPress={onStart}><Text style={styles.primaryText}>StudySpaces laden</Text></TouchableOpacity></View><Text style={styles.footer}>Entwickelt in Kooperation mit HSNR FB03</Text></View>;
}

function StudyIcon({ small }: { small?: boolean }) {
  return <View style={[styles.icon, small && styles.iconSmall]}><View style={styles.iconBuilding}><View style={styles.windowRow}><View style={styles.window} /><View style={styles.window} /></View><View style={styles.door} /></View><View style={styles.book}><View style={styles.bookLine} /><View style={styles.bookLineShort} /></View></View>;
}

function Loading({ dots, progress }: { dots: Animated.Value[]; progress: Animated.Value }) {
  const items = [
    { label: 'Räume', icon: 'room' },
    { label: 'Ausstattung', icon: 'equipment' },
    { label: 'Lernen', icon: 'study' },
  ];
  return <View style={styles.loading}><Text style={styles.kicker}>Campusdaten werden vorbereitet</Text><Text style={styles.title}>StudySpaces laden</Text><Text style={styles.sub}>Räume, Zeitfenster und Verfügbarkeit werden lokal geladen.</Text><View style={styles.loadingIcons}>{items.map((item, index) => <Animated.View key={item.label} style={[styles.loadingCard, { transform: [{ translateY: dots[index].interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }] }]}><LoadingMiniIcon type={item.icon} /><Text style={styles.loadingIcon}>{item.label}</Text></Animated.View>)}</View><View style={styles.dotRow}>{dots.map((dot, index) => <Animated.View key={index} style={[styles.dot, { opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]} />)}</View><View style={styles.track}><Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['8%', '100%'] }) }]} /></View></View>;
}

function LoadingMiniIcon({ type }: { type: string }) {
  if (type === 'room') return <View style={styles.doorMini}><View style={styles.doorMiniKnob} /></View>;
  if (type === 'equipment') return <View style={styles.monitorMini}><View style={styles.monitorMiniStand} /></View>;
  return <View style={styles.bookMini}><View style={styles.bookMiniSpine} /></View>;
}

function RoomCard({ room, status, label, isToday, onPress }: { room: Room; status: string; label: string; isToday: boolean; onPress: () => void }) {
  const available = optionsFor(room);
  const text = available.length === 0 ? (isToday ? 'Heute ausgebucht' : 'An diesem Tag ausgebucht') : available.length === 3 ? 'Vormittag, Nachmittag oder ganztags buchbar' : `Noch buchbar: ${available.map((slot) => slot.title).join(', ')}`;
  return <TouchableOpacity style={[styles.card, status !== 'free' && styles.mutedCard, status === 'full' && styles.fullCard]} onPress={onPress}><View style={styles.row}><View style={styles.grow}><Text style={styles.roomName}>{room.name}</Text><Text style={styles.meta}>{room.building} · {room.floor}</Text></View><Badge status={status} label={label} /></View><Text style={styles.cardMeta}>{room.capacity} Plätze · halb- oder ganztags</Text><Text style={styles.meta}>{text}</Text><View style={styles.chips}>{room.equipment.slice(0, 3).map((item) => <Chip key={item} text={item} />)}</View></TouchableOpacity>;
}

function DayPanel({ days, selectedKey, onPick, onClose }: { days: Workday[]; selectedKey: string; onPick: (day: Workday) => void; onClose: () => void }) {
  return <View style={styles.overlay}><TouchableOpacity style={styles.backdrop} onPress={onClose} /><View style={styles.panel}><View style={styles.row}><View><Text style={styles.kicker}>Arbeitswoche</Text><Text style={styles.panelTitle}>Freie Tage wählen</Text></View><TouchableOpacity style={styles.close} onPress={onClose}><Text style={styles.closeText}>×</Text></TouchableOpacity></View><View style={styles.dayGrid}>{days.map((day) => { const active = selectedKey === day.key; const count = roomsFor(day).filter((room) => statusFor(room, day.isToday) === 'free').length; return <TouchableOpacity key={day.key} style={[styles.dayTile, active && styles.dayTileActive]} onPress={() => onPick(day)}><Text style={[styles.dayLabel, active && styles.white]}>{day.label}</Text><Text style={[styles.dayDate, active && styles.white]}>{day.date}</Text><Text style={[styles.dayCount, active && styles.white]}>{count} frei</Text></TouchableOpacity>; })}</View><View style={styles.campus}><Text style={styles.meta}>Aktueller Campus</Text><Text style={styles.campusText}>HSNR Campus MG</Text></View></View></View>;
}

function ProfileMenu({ onBack, onData, onBookings, onCampus }: { onBack: () => void; onData: () => void; onBookings: () => void; onCampus: () => void }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}><Back onPress={onBack} /><View style={styles.profileHero}><View style={styles.bigAvatar}><Text style={styles.bigAvatarText}>MS</Text></View><Text style={styles.heroTitle}>Mira Schneider</Text><Text style={styles.heroSub}>Studentin · BBW · HSNR Campus MG</Text></View><ProfileAction title="Profildaten" sub="Matrikelnummer, Campus und Zugang anzeigen" onPress={onData} /><ProfileAction title="Meine Buchungen" sub="Gebuchte Räume und Tage ansehen" onPress={onBookings} /><ProfileAction title="Mein Campus" sub="Campuskarte und freie Gebäude ansehen" onPress={onCampus} /></ScrollView>;
}

function ProfileAction({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  const icon = title === 'Profildaten' ? 'ID' : title === 'Mein Campus' ? 'MG' : 'BK';
  return <TouchableOpacity style={styles.profileAction} onPress={onPress}><Text style={styles.actionIcon}>{icon}</Text><View style={styles.grow}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.meta}>{sub}</Text></View><Text style={styles.arrow}>›</Text></TouchableOpacity>;
}

function ProfileData({ onBack }: { onBack: () => void }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}><Back onPress={onBack} /><Text style={styles.title}>Profildaten</Text><Text style={styles.sub}>Hier sind deine Profildaten. Wir bei StudySpace passen gut darauf auf.</Text>{profileRows.map(([label, value]) => <View style={styles.dataRow} key={label}><Text style={styles.dataLabel}>{label}</Text><Text style={styles.dataValue}>{value}</Text></View>)}<View style={styles.hint}><Text style={styles.actionTitle}>Hinweis zum Zugang</Text><Text style={styles.meta}>Der Zugang wird erweitert bei Verlängerung der Kooperation mit der Hochschule.</Text></View></ScrollView>;
}

function Bookings({ onBack }: { onBack: () => void }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}><Back onPress={onBack} /><Text style={styles.title}>Meine Buchungen</Text><Text style={styles.sub}>Hier sind deine Buchungen. Bitte nutze Räume verantwortungsvoll, damit alle Studis etwas davon haben.</Text>{profileBookings.map((booking) => <View style={styles.bookingCard} key={`${booking.room}-${booking.day}`}><Text style={styles.roomName}>{booking.room}</Text><Text style={styles.meta}>{booking.building}</Text><View style={styles.bookingDate}><Text style={styles.dayCount}>{booking.day}</Text><Text style={styles.cardMeta}>{booking.slot}</Text></View></View>)}</ScrollView>;
}

function CampusView({ onBack, day, rooms }: { onBack: () => void; day: Workday; rooms: Room[] }) {
  const openCampus = async () => {
    const url = 'https://www.google.com/maps/search/?api=1&query=Hochschule%20Niederrhein%20Campus%20M%C3%B6nchengladbach';
    const supported = await Linking.canOpenURL(url);
    if (supported) Linking.openURL(url);
    else Alert.alert('Adresse', 'HSNR Campus Mönchengladbach');
  };
  const hasFreeRoom = (building: string) => rooms.some((room) => room.building === building && optionsFor(room).length > 0);
  const freeBuildings = campusBuildings.filter((building) => hasFreeRoom(building.name)).length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Back onPress={onBack} />
        <Text style={styles.kicker}>{day.isToday ? 'Heute' : `${day.short}. ${day.date}`}</Text>
        <Text style={styles.title}>Mein Campus</Text>
        <Text style={styles.sub}>Der HSNR MG Campus auf einen Blick. Grün markierte Gebäude haben an diesem Tag freie Räume.</Text>
        <View style={styles.mapCard}>
          <View style={styles.neighborBlock} />
          <View style={styles.streetRight}><Text style={styles.streetTextVertical}>Theodor-Heuss-Str.</Text></View>
          <View style={styles.streetBottom}><Text style={styles.streetText}>Webschulstraße</Text></View>
          <View style={styles.audimaxLabel}><Text style={styles.tinyLabel}>Audimax</Text><Text style={styles.tinyStrong}>V1</Text><Text style={styles.tinyStrong}>V2</Text></View>
          <View style={styles.languageLabel}><Text style={styles.tinyLabel}>Sprachenzentrum</Text><Text style={styles.tinySmall}>4.OG</Text></View>
          <View style={styles.parkingZone}><Text style={styles.parkingText}>P</Text></View>
          <View style={styles.campusNode} />
          <View style={styles.walkwayTop} />
          <View style={styles.walkwayMid} />
          <View style={styles.walkwayBottom} />
          <View style={styles.walkwayVertical} />
          {campusBuildings.map((building) => {
            const available = hasFreeRoom(building.name);
            return (
              <View key={building.name} style={[styles.mapBuilding, building.style, available && styles.mapBuildingFree]}>
                <Text style={[styles.mapBuildingShort, available && styles.mapBuildingShortFree]}>{building.short}</Text>
                <Text style={[styles.mapBuildingName, available && styles.mapBuildingNameFree]}>{building.name}</Text>
                {building.entrance && <View style={styles.entrance}><Text style={styles.entranceText}>1</Text></View>}
              </View>
            );
          })}
        </View>
        <View style={styles.campusSummary}>
          <Text style={styles.actionTitle}>HSNR Campus MG</Text>
          <Text style={styles.meta}>{freeBuildings} Gebäude mit freien Lernräumen für {day.isToday ? 'heute' : `${day.short}. ${day.date}`}.</Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.mapButton} onPress={openCampus}><Text style={styles.mapButtonIcon}>↗</Text><Text style={styles.mapButtonText}>Maps</Text></TouchableOpacity>
    </View>
  );
}

function Back({ onPress }: { onPress: () => void }) {
  return <TouchableOpacity style={styles.back} onPress={onPress}><Text style={styles.backText}>Zurück</Text></TouchableOpacity>;
}

function Badge({ status, label }: { status: string; label: string }) {
  return <View style={[styles.badge, status === 'free' && styles.freeBadge, (status === 'current' || status === 'partial') && styles.grayBadge, status === 'full' && styles.redBadge]}><Text style={[styles.badgeText, status === 'free' && styles.greenText, status === 'full' && styles.redText]}>{label}</Text></View>;
}

function Chip({ text }: { text: string }) {
  return <View style={styles.chip}><Text style={styles.chipText}>{text}</Text></View>;
}

function Legend({ color, text }: { color: string; text: string }) {
  return <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{text}</Text></View>;
}

const c = { navy: '#0b1f3a', green: '#19a66a', red: '#b33a3a', gray: '#64748b', bg: '#f4f7fb', card: '#ffffff', text: '#102033', muted: '#6b778c', border: '#e3e9f2', greenSoft: '#e8f8f0', redSoft: '#fdecec', graySoft: '#eef2f7' };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  screen: { flex: 1 },
  scroll: { padding: 22, paddingBottom: 112 },
  home: { flex: 1, padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  login: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  footer: { alignSelf: 'flex-end', color: c.muted, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  icon: { width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: c.navy, shadowColor: c.navy, shadowOpacity: 0.2, shadowRadius: 18, elevation: 6 },
  iconSmall: { transform: [{ scale: 0.78 }], marginBottom: 10, alignSelf: 'center' },
  iconBuilding: { width: 52, height: 58, borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, backgroundColor: '#fff' },
  windowRow: { flexDirection: 'row', gap: 7 },
  window: { width: 10, height: 10, borderRadius: 3, backgroundColor: c.green },
  door: { width: 18, height: 24, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: c.navy },
  book: { position: 'absolute', right: 22, bottom: 20, width: 34, height: 22, borderRadius: 7, padding: 6, backgroundColor: c.green },
  bookLine: { height: 3, borderRadius: 99, marginBottom: 5, backgroundColor: '#fff' },
  bookLineShort: { width: 13, height: 3, borderRadius: 99, backgroundColor: '#fff' },
  homeTitle: { color: c.navy, fontSize: 40, fontWeight: '900' },
  appTitle: { color: c.navy, fontSize: 38, fontWeight: '900', textAlign: 'center' },
  title: { color: c.navy, fontSize: 34, fontWeight: '900' },
  sub: { marginTop: 8, marginBottom: 16, color: c.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  kicker: { marginBottom: 6, color: c.green, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  input: { width: '100%', height: 56, borderRadius: 16, borderWidth: 1, borderColor: c.border, paddingHorizontal: 18, marginBottom: 14, backgroundColor: c.card, color: c.text, fontSize: 16 },
  primary: { width: '100%', minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 18, backgroundColor: c.navy, shadowColor: c.navy, shadowOpacity: 0.16, shadowRadius: 14, elevation: 4 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingIcons: { flexDirection: 'row', gap: 12, marginTop: 36, marginBottom: 26 },
  loadingCard: { width: 88, height: 98, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: c.card, borderWidth: 1, borderColor: c.border },
  loadingSymbol: { color: c.navy, fontSize: 27, fontWeight: '900', marginBottom: 8 },
  loadingIcon: { color: c.green, fontSize: 14, fontWeight: '900' },
  doorMini: { width: 28, height: 34, borderRadius: 8, borderWidth: 2, borderColor: c.green, backgroundColor: c.greenSoft, marginBottom: 10, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 5 },
  doorMiniKnob: { width: 5, height: 5, borderRadius: 99, backgroundColor: c.navy },
  monitorMini: { width: 36, height: 27, borderRadius: 7, borderWidth: 2, borderColor: c.green, backgroundColor: '#fff', marginBottom: 10, alignItems: 'center', justifyContent: 'flex-end' },
  monitorMiniStand: { width: 18, height: 5, borderRadius: 99, marginBottom: -8, backgroundColor: c.navy },
  bookMini: { width: 34, height: 28, borderRadius: 7, borderWidth: 2, borderColor: c.green, backgroundColor: c.greenSoft, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  bookMiniSpine: { width: 2, height: 22, borderRadius: 99, backgroundColor: c.green },
  dotRow: { flexDirection: 'row', gap: 10, height: 20 },
  dot: { width: 11, height: 11, borderRadius: 99, backgroundColor: c.green },
  track: { width: '78%', maxWidth: 260, height: 9, borderRadius: 99, overflow: 'hidden', marginTop: 22, backgroundColor: '#dde6f1' },
  fill: { height: 9, borderRadius: 99, backgroundColor: c.green },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 99 },
  legendText: { color: c.muted, fontSize: 13, fontWeight: '700' },
  card: { borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 18, marginBottom: 14, backgroundColor: c.card, shadowColor: '#1b2a41', shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  mutedCard: { backgroundColor: '#f8fafc', opacity: 0.78 },
  fullCard: { backgroundColor: '#fff6f6', borderColor: '#f2c4c4' },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  grow: { flex: 1 },
  roomName: { color: c.text, fontSize: 24, fontWeight: '900' },
  meta: { marginTop: 4, color: c.muted, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  cardMeta: { marginTop: 10, color: '#14345c', fontSize: 15, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eef3f8' },
  chipText: { color: '#14345c', fontSize: 12, fontWeight: '800' },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: c.graySoft },
  freeBadge: { backgroundColor: c.greenSoft },
  grayBadge: { backgroundColor: c.graySoft },
  redBadge: { backgroundColor: c.redSoft },
  badgeText: { color: c.gray, fontSize: 12, fontWeight: '900' },
  greenText: { color: c.green },
  redText: { color: c.red },
  profileBtn: { position: 'absolute', right: 20, top: 18, height: 48, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 7, paddingRight: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, elevation: 7 },
  avatar: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.navy },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  profileBtnText: { color: c.navy, fontSize: 14, fontWeight: '900' },
  dayButton: { position: 'absolute', right: 20, bottom: 22, height: 58, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, backgroundColor: c.navy, elevation: 8 },
  dayButtonIcon: { color: '#fff', fontSize: 22, fontWeight: '900' },
  dayButtonText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 31, 58, 0.22)' },
  panel: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 26, backgroundColor: c.card },
  panelTitle: { color: c.navy, fontSize: 24, fontWeight: '900' },
  close: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef3f8' },
  closeText: { color: c.navy, fontSize: 24, fontWeight: '900' },
  dayGrid: { flexDirection: 'row', gap: 9, marginTop: 18 },
  dayTile: { flex: 1, minHeight: 96, borderRadius: 18, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', padding: 6, backgroundColor: '#f8fafc' },
  dayTileActive: { borderColor: c.green, backgroundColor: c.green },
  dayLabel: { color: c.navy, fontSize: 13, fontWeight: '900' },
  dayDate: { marginTop: 5, color: c.muted, fontSize: 12, fontWeight: '800' },
  dayCount: { marginTop: 9, color: c.green, fontSize: 12, fontWeight: '900' },
  white: { color: '#fff' },
  campus: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, backgroundColor: '#f8fafc' },
  campusText: { color: c.navy, fontSize: 17, fontWeight: '900' },
  back: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18, backgroundColor: '#e8eef6' },
  backText: { color: c.navy, fontSize: 14, fontWeight: '900' },
  hero: { borderRadius: 24, padding: 22, marginBottom: 20, backgroundColor: c.navy },
  heroTitle: { marginTop: 18, color: '#fff', fontSize: 30, fontWeight: '900' },
  heroSub: { marginTop: 8, color: '#c8d5e5', fontSize: 16, fontWeight: '700' },
  sectionTitle: { marginTop: 18, marginBottom: 12, color: c.navy, fontSize: 20, fontWeight: '900' },
  slot: { minHeight: 74, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.card },
  slotActive: { borderColor: c.green, backgroundColor: c.greenSoft },
  disabled: { opacity: 0.55 },
  slotTitle: { color: c.navy, fontSize: 18, fontWeight: '900' },
  slotSub: { marginTop: 4, color: c.muted, fontSize: 14, fontWeight: '700' },
  slotPill: { color: c.green, fontSize: 12, fontWeight: '900' },
  empty: { borderRadius: 16, padding: 16, color: c.red, fontSize: 14, fontWeight: '900', backgroundColor: c.redSoft },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  check: { width: 86, height: 86, borderRadius: 28, textAlign: 'center', textAlignVertical: 'center', lineHeight: 86, marginBottom: 24, color: '#fff', fontSize: 24, fontWeight: '900', backgroundColor: c.green },
  checkCircle: { width: 92, height: 92, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: c.green, shadowColor: c.green, shadowOpacity: 0.24, shadowRadius: 18, elevation: 7 },
  checkIcon: { color: '#fff', fontSize: 46, fontWeight: '900' },
  successTitle: { color: c.navy, fontSize: 30, fontWeight: '900', lineHeight: 37, textAlign: 'center' },
  successText: { marginTop: 12, marginBottom: 22, color: c.muted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  successButton: { maxWidth: 340 },
  profileHero: { borderRadius: 24, padding: 24, alignItems: 'center', backgroundColor: c.navy, marginBottom: 18 },
  bigAvatar: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: c.green },
  bigAvatarText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  profileAction: { minHeight: 92, borderRadius: 20, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 14, backgroundColor: c.card },
  actionIcon: { width: 42, height: 42, borderRadius: 14, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', lineHeight: 42, color: c.green, fontSize: 13, fontWeight: '900', backgroundColor: c.greenSoft },
  actionTitle: { color: c.navy, fontSize: 18, fontWeight: '900' },
  arrow: { color: c.green, fontSize: 30, fontWeight: '900' },
  dataRow: { borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, marginTop: 12, backgroundColor: c.card },
  dataLabel: { color: c.muted, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  dataValue: { marginTop: 7, color: c.navy, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  hint: { marginTop: 16, borderRadius: 18, padding: 16, backgroundColor: c.greenSoft },
  bookingCard: { borderRadius: 20, borderWidth: 1, borderColor: c.border, padding: 17, marginTop: 12, backgroundColor: c.card },
  bookingDate: { marginTop: 14, borderRadius: 14, padding: 12, backgroundColor: '#f8fafc' },
  mapCard: { height: 430, borderRadius: 26, borderWidth: 1, borderColor: c.border, overflow: 'hidden', marginTop: 8, backgroundColor: '#f6f8fb' },
  neighborBlock: { position: 'absolute', left: 0, top: 0, width: '22%', height: '100%', backgroundColor: '#f0f2f5' },
  streetBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#b8bec7' },
  streetRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#b8bec7' },
  streetText: { color: c.gray, fontSize: 11, fontWeight: '900' },
  streetTextVertical: { color: c.text, fontSize: 14, fontWeight: '900', transform: [{ rotate: '-90deg' }], width: 150, textAlign: 'center' },
  parkingZone: { position: 'absolute', right: '5%', top: '45%', width: '11%', height: '28%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef0f3' },
  parkingText: { color: '#a5acb8', fontSize: 44, fontWeight: '900' },
  campusNode: { position: 'absolute', left: '65%', top: '49%', width: 28, height: 28, borderRadius: 99, backgroundColor: '#b8bec7' },
  walkwayTop: { position: 'absolute', left: '31%', right: '14%', top: '27%', height: 8, borderRadius: 999, backgroundColor: '#b8bec7' },
  walkwayMid: { position: 'absolute', left: '29%', right: '17%', top: '51%', height: 8, borderRadius: 999, backgroundColor: '#b8bec7', transform: [{ rotate: '9deg' }] },
  walkwayBottom: { position: 'absolute', left: '10%', right: '5%', bottom: '12%', height: 8, borderRadius: 999, backgroundColor: '#b8bec7' },
  walkwayVertical: { position: 'absolute', top: '17%', bottom: '12%', left: '69%', width: 8, borderRadius: 999, backgroundColor: '#b8bec7' },
  audimaxLabel: { position: 'absolute', right: '17%', top: '42%', width: '17%', minHeight: 74, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#075b9f' },
  languageLabel: { position: 'absolute', right: '16%', top: '20%', width: '28%', minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#075b9f' },
  tinyLabel: { color: '#fff', fontSize: 10, fontWeight: '900', textAlign: 'center' },
  tinyStrong: { color: '#fff', fontSize: 21, fontWeight: '900', lineHeight: 23 },
  tinySmall: { color: '#fff', fontSize: 9, fontWeight: '800' },
  mapBuilding: { position: 'absolute', borderRadius: 9, borderWidth: 1, borderColor: '#0a4f8a', alignItems: 'center', justifyContent: 'center', padding: 5, backgroundColor: '#075b9f', shadowColor: '#1b2a41', shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  mapBuildingFree: { borderColor: c.green, backgroundColor: c.green },
  mapBuildingShort: { color: '#fff', fontSize: 17, fontWeight: '900' },
  mapBuildingShortFree: { color: '#fff' },
  mapBuildingName: { marginTop: 2, color: '#e7f1fb', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  mapBuildingNameFree: { color: '#fff' },
  entrance: { position: 'absolute', right: -8, top: -8, width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', backgroundColor: c.green },
  entranceText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  campusSummary: { marginTop: 16, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, backgroundColor: c.card },
  mapButton: { position: 'absolute', right: 20, bottom: 22, height: 58, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, backgroundColor: c.navy, elevation: 8 },
  mapButtonIcon: { color: '#fff', fontSize: 21, fontWeight: '900' },
  mapButtonText: { color: '#fff', fontSize: 14, fontWeight: '900' },
});
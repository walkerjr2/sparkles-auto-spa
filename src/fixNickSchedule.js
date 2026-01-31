// Fix Nick's schedule with correct custom time slots
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANlmHVJzqL1lnPOMgP5ZWfHV-v-4dFNcU",
  authDomain: "sparklesautospa-41f11.firebaseapp.com",
  projectId: "sparklesautospa-41f11",
  storageBucket: "sparklesautospa-41f11.firebasestorage.app",
  messagingSenderId: "679240185913",
  appId: "1:679240185913:web:fa7bef6c6f7e8b29ce2a8d",
  measurementId: "G-9NXR6XBKPQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixNickSchedule() {
  try {
    console.log('🔍 Finding Nick in workers collection...');
    
    const workersRef = collection(db, 'workers');
    const q = query(workersRef, where('name', '==', 'Nick'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Nick not found in workers collection');
      return;
    }
    
    const nickDoc = querySnapshot.docs[0];
    const nickId = nickDoc.id;
    const currentData = nickDoc.data();
    
    console.log('📋 Current Nick data:');
    console.log('   Name:', currentData.name);
    console.log('   Start:', currentData.start);
    console.log('   End:', currentData.end);
    console.log('   Custom Slots:', currentData.customSlots);
    console.log('   Interval:', currentData.interval);
    console.log('   Day Off:', currentData.dayOff);
    console.log('   Active:', currentData.active);
    
    // Nick's correct schedule - custom time slots
    const updatedData = {
      name: 'Nick',
      bio: currentData.bio || 'Expert detailer with 5 years of experience.',
      imageUrl: currentData.imageUrl || 'https://placehold.co/100x100/CCCCCC/666666?text=Nick',
      start: '07:00',  // Earliest slot (7:00 AM)
      end: '16:00',    // Latest slot (4:00 PM)
      interval: 90,    // 90 minutes between slots (1.5 hours)
      dayOff: 1,       // Monday off
      active: true,
      order: 1,
      lastSlotInclusive: false,
      overrides: null,
      customSlots: [
        '07:00',  // 7:00 AM
        '08:30',  // 8:30 AM
        '10:00',  // 10:00 AM
        '11:30',  // 11:30 AM
        '13:00',  // 1:00 PM
        '14:30',  // 2:30 PM
        '16:00'   // 4:00 PM
      ]
    };
    
    console.log('\n✏️ Updating Nick with correct schedule...');
    console.log('📅 New custom slots (24-hour format):', updatedData.customSlots);
    console.log('📅 New custom slots (12-hour format):');
    updatedData.customSlots.forEach(t => {
      const [h, m] = t.split(':').map(Number);
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      console.log(`   ${hour12}:${m.toString().padStart(2, '0')} ${ampm}`);
    });
    
    await updateDoc(doc(db, 'workers', nickId), updatedData);
    
    console.log('\n✅ Nick\'s schedule updated successfully!');
    console.log('🎉 Customers will now see these booking times for Nick:');
    console.log('   7:00 AM, 8:30 AM, 10:00 AM, 11:30 AM, 1:00 PM, 2:30 PM, 4:00 PM');
    console.log('\n💡 The booking form will update automatically via real-time listener!');
    
  } catch (error) {
    console.error('❌ Error updating Nick:', error);
    console.error('Error details:', error.message);
  }
}

console.log('🚀 Starting Nick schedule fix...\n');
fixNickSchedule()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

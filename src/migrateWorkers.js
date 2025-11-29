// Migration script to add workers to Firestore
// Run this once to populate the workers collection
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const workersData = [
  {
    name: 'Nick',
    bio: 'Expert detailer with 5 years of experience.',
    imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Nick',
    start: '06:30',
    end: '14:00',
    interval: 90,
    dayOff: 1, // Monday
    overrides: null,
    lastSlotInclusive: false,
    customSlots: ['06:30', '08:00', '09:30', '11:00', '12:30', '14:00'],
    active: true,
    order: 1
  },
  {
    name: 'Ricardo',
    bio: 'Passionate about cars and making them shine.',
    imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Ricardo',
    start: '06:30',
    end: '16:30',
    interval: 120,
    dayOff: 3, // Wednesday
    overrides: null,
    lastSlotInclusive: false,
    customSlots: ['06:30', '08:30', '10:30', '12:30', '14:30', '16:30'],
    active: true,
    order: 2
  },
  {
    name: 'Radcliffe',
    bio: 'Dedicated to delivering top-notch service.',
    imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Radcliffe',
    start: '06:30',
    end: '14:30',
    interval: 90,
    dayOff: 1, // Monday
    overrides: null,
    lastSlotInclusive: false,
    customSlots: ['06:30', '08:30', '10:00', '11:30', '13:00', '14:30'],
    active: true,
    order: 3
  }
];

export const migrateWorkers = async () => {
  try {
    console.log('Starting worker migration...');
    
    for (const worker of workersData) {
      const docRef = await addDoc(collection(db, 'workers'), worker);
      console.log(`Added worker ${worker.name} with ID: ${docRef.id}`);
    }
    
    console.log('Migration completed successfully!');
    return { success: true, message: 'Workers migrated successfully' };
  } catch (error) {
    console.error('Error migrating workers:', error);
    return { success: false, error: error.message };
  }
};

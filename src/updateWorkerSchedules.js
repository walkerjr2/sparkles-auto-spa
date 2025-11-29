// Script to update existing worker schedules
// Run this once to update Nick and Ricardo's schedules
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const updateWorkerSchedules = async () => {
  try {
    console.log('Updating worker schedules...');
    
    // Update Nick
    const nickQuery = query(collection(db, 'workers'), where('name', '==', 'Nick'));
    const nickSnapshot = await getDocs(nickQuery);
    
    if (!nickSnapshot.empty) {
      const nickDoc = nickSnapshot.docs[0];
      await updateDoc(doc(db, 'workers', nickDoc.id), {
        customSlots: ['06:30', '08:00', '09:30', '11:00', '12:30', '14:00'],
        overrides: null,
        lastSlotInclusive: false
      });
      console.log('✅ Nick updated: 6:30am, 8:00am, 9:30am, 11:00am, 12:30pm, 2:00pm');
    } else {
      console.log('❌ Nick not found');
    }
    
    // Update Ricardo
    const ricardoQuery = query(collection(db, 'workers'), where('name', '==', 'Ricardo'));
    const ricardoSnapshot = await getDocs(ricardoQuery);
    
    if (!ricardoSnapshot.empty) {
      const ricardoDoc = ricardoSnapshot.docs[0];
      await updateDoc(doc(db, 'workers', ricardoDoc.id), {
        customSlots: ['06:30', '08:30', '10:30', '12:30', '14:30', '16:30'],
        lastSlotInclusive: false
      });
      console.log('✅ Ricardo updated: 6:30am, 8:30am, 10:30am, 12:30pm, 2:30pm, 4:30pm');
    } else {
      console.log('❌ Ricardo not found');
    }
    
    console.log('✅ Worker schedules updated successfully!');
    return { success: true, message: 'Schedules updated' };
  } catch (error) {
    console.error('❌ Error updating schedules:', error);
    return { success: false, error: error.message };
  }
};

export default updateWorkerSchedules;

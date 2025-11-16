import React, { useContext, useState, useEffect, useCallback } from 'react';
import { StyleSheet, RefreshControl, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feed } from '../../components/Feed';
import { SessionContext } from '../../lib/SessionContext';
import { supabase } from '../../lib/supabase'

export default function FeedScreen() {
  const session = useContext(SessionContext);
  const [refreshCount, setRefreshCount] = useState(0);
  const [photoPath, setPhotoPath] = useState<string | undefined>(undefined)

  if (!session?.user) return null;


  useEffect(() => {
    const username = session.user.user_metadata?.username;
    if (!username) return;
    const { data: photoData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${username}.png`);
    setPhotoPath(photoData.publicUrl);
  }, [session.user]);

  const onRefresh = useCallback(() => {
    setRefreshCount(prev => prev + 1); // triggers Feed to refresh
    const username = session.user.user_metadata?.username;
    if (username) {
      const { data: photoData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`public/${username}.png`);
      setPhotoPath(photoData.publicUrl);
    }
  }, [session.user]);

  return (
      <ScrollView
        style={{ backgroundColor: '#0A0A0A',}}
        contentContainerStyle={{ paddingBottom: 40, alignItems: 'center'}}
      >
        <SafeAreaView style={styles.container}>
          <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', padding: 30}}>Feed</Text>
          <Feed 
            userId={session.user.id} 
            refreshTrigger={refreshCount} 
            onRefresh={onRefresh}
            avatarUrl={photoPath}
            username={session.user.user_metadata?.username}
            
          />
        </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '97.5%',
  },
  primary: {
    color: '#e11383'
  }

})
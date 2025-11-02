import React, { useContext, useState, useCallback } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feed } from '../../components/Feed';
import { SessionContext } from '../../lib/SessionContext';

export default function FeedScreen() {
  const session = useContext(SessionContext);
  const [refreshCount, setRefreshCount] = useState(0);

  if (!session?.user) return null;

  const onRefresh = useCallback(() => {
    setRefreshCount(prev => prev + 1); // triggers Feed to refresh
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Feed userId={session.user.id} refreshTrigger={refreshCount} onRefresh={onRefresh} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  avatar: {
  width: 100,
  height: 100,
  borderRadius: 70,
  borderWidth: 1,
  },
  statsContainer: {
    margin: 30,
    width: '95%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    padding: 10,
  },
  statsText: {
    fontSize: 18
  },
  bold: {
    fontWeight: 'bold'
  },
  notBold: {
    fontWeight: 'normal'
  },
  feedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
  },
  primary: {
    color: '#e11383'
  }

})
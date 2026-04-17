import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const [showManual, setShowManual] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();

  // Helper to extract tokens from a URL
  function extractTokens(url: string) {
    const parsed = Linking.parse(url);
    const params = parsed.queryParams || {};
    function getString(val: any): string | undefined {
      if (Array.isArray(val)) return val[0];
      if (typeof val === 'string') return val;
      return undefined;
    }
    return {
      access_token: getString(params.access_token),
      refresh_token: getString(params.refresh_token),
    };
  }

  useEffect(() => {
    let isMounted = true;
    async function handleInitial() {
      let params: any = route.params;
      if (!params) {
        const url = await Linking.getInitialURL();
        if (url) {
          params = extractTokens(url);
        } else {
          params = {};
        }
      }
      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error) {
          Alert.alert('Session error', error.message);
        } else if (isMounted) {
          setSessionSet(true);
        }
      } else {
        setShowManual(true);
      }
    }
    handleInitial();
    // Listen for incoming links
    const sub = Linking.addEventListener('url', async ({ url }) => {
      const { access_token, refresh_token } = extractTokens(url);
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          Alert.alert('Session error', error.message);
        } else if (isMounted) {
          setSessionSet(true);
          setShowManual(false);
        }
      }
    });
    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [route]);

  async function handleManualLink() {
    if (!manualLink) return;
    const { access_token, refresh_token } = extractTokens(manualLink);
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        Alert.alert('Session error', error.message);
      } else {
        setSessionSet(true);
        setShowManual(false);
      }
    } else {
      Alert.alert('Could not find tokens in the link.');
    }
  }

  async function handleReset() {
    if (!newPassword) {
      Alert.alert('Please enter a new password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Password updated! You can now sign in with your new password.');
      // @ts-ignore
      navigation.navigate('Auth');
    }
    setLoading(false);
  }

  if (!sessionSet) {
    if (showManual) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Paste the reset link from your email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste link here"
            value={manualLink}
            onChangeText={setManualLink}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.button} onPress={handleManualLink}>
            <Text style={styles.buttonText}>Submit Link</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Preparing reset...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Set New Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

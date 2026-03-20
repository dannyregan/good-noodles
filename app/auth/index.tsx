import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Alert, StyleSheet, View, AppState, TextInput, TouchableOpacity, Text } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';

// Auto-refresh Supabase session when app comes to foreground
AppState.addEventListener('change', (state) => {
  console.log('AppState changed to', state)
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { data: { session }, error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  async function resetPassword() {
    if (!email) {
      Alert.alert('Please enter your email address first.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      Alert.alert(error.message)
    } else {
      Alert.alert('Password reset email sent! Please check your inbox.')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="email@address.com"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={[styles.input, { paddingRight: 36 }]}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      {/* Reset Password Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={resetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Reset password</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    padding: 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})

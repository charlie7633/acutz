import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { CustomInput } from '../components/CustomInput';
import { AuthContext } from '../context/AuthContext';

export const AuthScreen = () => {
  const { login, register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [accountType, setAccountType] = useState('user');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in both email and password");
      return;
    }
    
    setLoading(true);
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
        Alert.alert("Success", "Account created!");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="cut" size={50} color={theme.colors.primary} />
        </View>
        <Text style={styles.appTitle}>Acutz</Text>
        <Text style={styles.appSubtitle}>Personalized Hair Care Management</Text>
      </View>

      <View style={styles.authTabs}>
        <TouchableOpacity
          style={[styles.authTab, authMode === 'login' && styles.authTabActive]}
          onPress={() => setAuthMode('login')}
        >
          <Text style={[styles.authTabText, authMode === 'login' && styles.authTabTextActive]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.authTab, authMode === 'signup' && styles.authTabActive]}
          onPress={() => setAuthMode('signup')}
        >
          <Text style={[styles.authTabText, authMode === 'signup' && styles.authTabTextActive]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Choose Account Type</Text>
      <View style={styles.accountTypeRow}>
        <TouchableOpacity
          style={[styles.accountCard, accountType === 'user' && styles.accountCardActive]}
          onPress={() => setAccountType('user')}
        >
          <Text style={[styles.accountCardText, accountType === 'user' && styles.accountCardTextActive]}>User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountCard, accountType === 'professional' && styles.accountCardActive]}
          onPress={() => setAccountType('professional')}
        >
          <Text style={[styles.accountCardText, accountType === 'professional' && styles.accountCardTextActive]}>Professional</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Email</Text>
      <CustomInput
        iconName="mail-outline"
        placeholder="hello@acutz.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Password</Text>
      <CustomInput
        iconName="lock-closed-outline"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 20 }}/>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
            <Text style={styles.primaryButtonText}>
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 60, paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.tappable, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: theme.colors.secondary },
  appSubtitle: { fontSize: 14, color: theme.colors.textMuted },
  authTabs: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 4, marginBottom: 24 },
  authTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: theme.borderRadius.xl },
  authTabActive: { backgroundColor: theme.colors.primary },
  authTabText: { color: theme.colors.textMuted, fontSize: 16, fontWeight: 'bold' },
  authTabTextActive: { color: theme.colors.text },
  sectionLabel: { color: theme.colors.secondary, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  accountTypeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  accountCard: { flex: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.surface, borderRadius: theme.borderRadius.l, paddingVertical: 15, alignItems: 'center', marginHorizontal: 5 },
  accountCardActive: { borderColor: theme.colors.primary },
  accountCardText: { color: theme.colors.textMuted, fontSize: 14, fontWeight: 'bold' },
  accountCardTextActive: { color: theme.colors.text },
  inputLabel: { color: theme.colors.secondary, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  buttonContainer: { marginTop: 10, width: '100%' },
  primaryButton: { backgroundColor: theme.colors.primary, paddingVertical: 15, borderRadius: theme.borderRadius.l, alignItems: 'center' },
  primaryButtonText: { color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
});
